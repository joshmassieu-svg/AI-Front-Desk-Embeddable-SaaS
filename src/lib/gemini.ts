import { WebsiteConfig, Message } from './types';

export async function generateGeminiChatStream(params: {
  website: WebsiteConfig;
  userQuery: string;
  history: Message[];
  // Pre-retrieved knowledge base context from rag.ts (vector search over
  // crawled/embedded chunks). Replaces the previous approach of asking
  // Gemini to fetch the live domain itself via the url_context tool,
  // which had no connection to the indexed knowledge base and in
  // practice only ever saw whatever single page was named in the prompt.
  retrievedContext: string;
  onChunk: (chunk: string) => void;
}): Promise<{ fullResponse: string; shouldHandoff: boolean; degraded?: boolean }> {
  const { website, userQuery, history, retrievedContext, onChunk } = params;

  // 1. Check for Human Handoff triggers
  const queryLower = userQuery.toLowerCase();
  const shouldHandoff = website.handoffEnabled && website.handoffTriggerWords.some(word =>
    queryLower.includes(word.toLowerCase())
  );

  if (shouldHandoff) {
    console.log(`[gemini] handoff trigger matched for query: "${userQuery.slice(0, 80)}"`);
    const handoffText = "I understand you'd like to speak with a human support specialist! I have notified our team, and an agent will join this conversation shortly. Please feel free to share any details in the meantime.";

    // Simulate streaming the handoff response
    for (let i = 0; i < handoffText.length; i += 4) {
      onChunk(handoffText.slice(i, i + 4));
      await new Promise(r => setTimeout(r, 20));
    }
    return { fullResponse: handoffText, shouldHandoff: true };
  }

  // 2. Build Gemini API System & Context Prompt
  const rawApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  // Don't trust truthiness alone — a placeholder string is still truthy.
  const apiKey = rawApiKey && rawApiKey !== 'your_gemini_api_key_here' ? rawApiKey : null;
  if (!apiKey) {
    console.warn('[gemini] PAIN POINT: no valid GEMINI_API_KEY configured — falling straight to degraded mode');
  }

  const hasContext = retrievedContext.trim().length > 0;
  if (!hasContext) {
    console.warn(`[gemini] PAIN POINT: empty retrievedContext for query "${userQuery.slice(0, 80)}" — model has no knowledge base grounding for this answer`);
  }

  const systemInstruction = `${website.systemPrompt}

System Parameters:
- Bot Name: ${website.botName}
- Allowed Domains: ${website.allowedDomains.join(', ')}
- Restricted Topics to NEVER discuss: ${website.restrictedTopics.join(', ')}

Source of truth:
- Answer using ONLY the knowledge base excerpts provided below under
  "Knowledge Base Context". Do not use outside knowledge, prior training
  data, or guesses to fill in gaps.
- If the excerpts don't contain the answer, say plainly that you don't
  have that information rather than making something up.

Knowledge Base Context:
${hasContext ? retrievedContext : '(No relevant knowledge base content was found for this question.)'}

Instructions:
- Provide clear, engaging, and accurate markdown-formatted responses.
- If code is requested, format with proper triple backtick syntax.
- Keep responses under ${website.maxTokens} tokens.
- Maintain a helpful, courteous tone.`;

  // Format past history into standard conversation transcript
  const historyText = history
    .slice(-6)
    .map(m => `${m.sender.toUpperCase()}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${systemInstruction}\n\nRecent Conversation History:\n${historyText}\n\nVISITOR: ${userQuery}\n\n${website.botName.toUpperCase()}:`;

  if (apiKey) {
    // Model IDs deprecate on a matter of months, not years — hardcoding one
    // guarantees a future outage. Default is overridable via env var so a
    // deprecation doesn't require a code change, just an env var update +
    // redeploy.
    const defaultModel = process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash';
    const proModel = process.env.GEMINI_CHAT_MODEL_PRO || 'gemini-3.6-flash';
    const modelName = website.model === 'gemini-1.5-pro' || website.model === 'gemini-2.5-pro' ? proModel : defaultModel;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

    // PAIN POINT (fixed): temperature/top_p/top_k are deprecated as of the
    // Gemini 3.x line — the API currently silently ignores them (so the
    // dashboard's "temperature" slider was already a no-op) but is
    // documented to start hard-erroring on them in future model
    // generations. Dropped entirely rather than shipping a setting that
    // quietly does nothing.
    //
    // PAIN POINT (fixed): thinkingLevel defaults to "medium" on Gemini 3.x
    // models. Thinking tokens are drawn from the SAME maxOutputTokens
    // budget as the visible answer — with a low maxTokens setting (site
    // default is 512), thinking alone can consume the entire budget,
    // producing finishReason=MAX_TOKENS with zero visible text and no
    // error. This chat use case (short grounded Q&A, not multi-step
    // reasoning/coding) doesn't need medium/high thinking, so we pin it to
    // "low" — cuts thinking-token usage while leaving real budget for the
    // actual answer. Do not combine with thinkingBudget (400 error if both
    // are set).
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: website.maxTokens,
        thinkingConfig: {
          thinkingLevel: 'low',
        },
      }
    });

    console.log(`[gemini] calling model=${modelName} contextChars=${retrievedContext.length} historyTurns=${history.slice(-6).length}`);

    // Retry on 429 (rate limit) specifically — this is the failure mode
    // most likely to be transient and self-resolving within a second or
    // two. A bad/invalid key (403/400) won't be fixed by retrying, so we
    // don't waste time on those.
    let response: Response | null = null;
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });
        if (response.status !== 429) break;
        if (attempt < 2) {
          console.warn(`[gemini] PAIN POINT: rate limited (429), retrying in ${500 * Math.pow(2, attempt)}ms...`);
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
        }
      } catch (err) {
        console.error(`[gemini] PAIN POINT: request failed (attempt ${attempt + 1}):`, err);
        response = null;
      }
    }

    if (response && !response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error(`[gemini] PAIN POINT: API error ${response.status} (model: ${modelName}):`, errBody);
      if (response.status === 404) {
        console.error(
          `[gemini] Model "${modelName}" was likely deprecated. Check ` +
          `https://ai.google.dev/gemini-api/docs/deprecations and set ` +
          `GEMINI_CHAT_MODEL / GEMINI_CHAT_MODEL_PRO to a current model.`
        );
      }
      if (response.status === 400) {
        console.error('[gemini] 400 — check request body for deprecated/invalid params (see https://ai.google.dev/gemini-api/docs/latest-model#api-changes-and-parameter-updates)');
      }
    }

    if (response && response.ok) {
      console.log(`[gemini] streaming response headers — content-type=${response.headers.get('content-type')} content-length=${response.headers.get('content-length') || 'chunked/unknown'}`);
    }

    if (response && response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let sseBuffer = '';
      let lastFinishReason: string | undefined;
      let sawThoughtOnlyFrame = false;
      let promptFeedbackBlockReason: string | undefined;
      let frameCount = 0;
      let lastRawFrame: string | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });

        // Buffer partial SSE frames across reads instead of parsing each
        // read() call in isolation — a data: {...} payload can be split
        // across two network reads, and dropping the tail silently
        // corrupts the streamed response.
        const frames = sseBuffer.split('\n\n');
        sseBuffer = frames.pop() || '';

        for (const frame of frames) {
          const line = frame.split('\n').find(l => l.startsWith('data: '));
          if (!line) continue;
          frameCount++;
          try {
            const json = JSON.parse(line.substring(6));
            lastRawFrame = line.substring(6);

            if (json.promptFeedback?.blockReason) {
              promptFeedbackBlockReason = json.promptFeedback.blockReason;
            }

            const candidate = json.candidates?.[0];
            if (candidate?.finishReason) {
              lastFinishReason = candidate.finishReason;
            }

            // PAIN POINT (root cause of "completed but produced no text"):
            // Gemini 3.x "thinking" models can stream reasoning tokens as
            // separate parts flagged `thought: true` before the visible
            // answer part. Reading only parts[0] silently drops the real
            // answer if a thought part happens to come first, and — more
            // commonly — if maxOutputTokens is small, thinking can consume
            // the entire budget and finishReason comes back MAX_TOKENS
            // with zero visible text ever produced. We now scan all parts
            // and skip thought parts explicitly rather than assuming index 0.
            const parts = candidate?.content?.parts || [];
            let frameHadVisibleText = false;
            for (const part of parts) {
              if (part.thought) {
                sawThoughtOnlyFrame = true;
                continue;
              }
              if (part.text) {
                accumulated += part.text;
                onChunk(part.text);
                frameHadVisibleText = true;
              }
            }
            if (!frameHadVisibleText && parts.length > 0 && !parts.some((p: any) => p.thought)) {
              console.warn('[gemini] PAIN POINT: frame had parts but none contained visible text:', JSON.stringify(parts).slice(0, 300));
            }
          } catch (err) {
            // PAIN POINT: a partial/split SSE frame across reads is
            // expected sometimes — better to skip one chunk than crash
            // the whole stream, but worth knowing how often this fires.
            console.warn('[gemini] PAIN POINT: skipped malformed SSE frame from Gemini:', err);
          }
        }
      }

      // PAIN POINT diagnostic: if we never even got a usable frame (0
      // candidates, 0 finishReason, 0 blockReason across the WHOLE
      // stream) the raw frame content itself is the only way to see what
      // Gemini actually sent instead of continuing to guess.
      if (!accumulated.trim() && frameCount === 0) {
        console.error('[gemini] PAIN POINT: response.ok was true but the SSE stream contained zero "data:" frames at all — check for a proxy/edge issue stripping the body, or an unexpected content-type.');
      } else if (!accumulated.trim() && !lastFinishReason && !promptFeedbackBlockReason) {
        console.error(`[gemini] PAIN POINT: received ${frameCount} frame(s) but none had candidates/finishReason/blockReason. Last raw frame: ${lastRawFrame?.slice(0, 500)}`);
      }

      if (!accumulated.trim()) {
        console.error(
          `[gemini] PAIN POINT: empty response diagnostics — finishReason=${lastFinishReason || 'unknown'} ` +
          `blockReason=${promptFeedbackBlockReason || 'none'} sawThoughtParts=${sawThoughtOnlyFrame} ` +
          `frameCount=${frameCount} maxOutputTokens=${website.maxTokens}. ` +
          (lastFinishReason === 'MAX_TOKENS'
            ? 'Likely cause: thinking tokens consumed the entire maxOutputTokens budget before any visible answer text was produced — raise maxOutputTokens or lower the model\'s thinking level.'
            : lastFinishReason === 'SAFETY' || promptFeedbackBlockReason
            ? 'Likely cause: response was blocked by safety filtering.'
            : 'Unrecognized cause — check the raw finishReason above against https://ai.google.dev/api/generate-content#FinishReason')
        );
      }

      if (accumulated.trim()) {
        console.log(`[gemini] response complete — ${accumulated.length} chars`);
        return { fullResponse: accumulated, shouldHandoff: false };
      }

      // PAIN POINT (fixed): the streamGenerateContent + alt=sse path has
      // consistently returned zero usable SSE frames in production even
      // with a real 200 response and real content — something in this
      // deployment's fetch/stream handling of Gemini's SSE response isn't
      // working, and root-causing it further wasn't converging fast
      // enough to leave chat broken in the meantime. Falling back to a
      // plain (non-streaming) generateContent call: same request body,
      // no reader/SSE parsing, one JSON response back. It arrives as one
      // chunk instead of token-by-token, but it actually works. The
      // streaming path stays primary — this only fires when it produces
      // nothing.
      console.warn('[gemini] PAIN POINT: SSE streaming path produced no text — falling back to non-streaming generateContent call');
      try {
        const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const fallbackRes = await fetch(fallbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });
        if (!fallbackRes.ok) {
          const errBody = await fallbackRes.text().catch(() => '');
          console.error(`[gemini] PAIN POINT: non-streaming fallback also failed (${fallbackRes.status}):`, errBody);
        } else {
          const fallbackJson = await fallbackRes.json();
          const fallbackCandidate = fallbackJson.candidates?.[0];
          console.log(`[gemini] fallback finishReason=${fallbackCandidate?.finishReason || 'unknown'}`);
          const fallbackParts = fallbackCandidate?.content?.parts || [];
          const fallbackText = fallbackParts
            .filter((p: any) => !p.thought && p.text)
            .map((p: any) => p.text)
            .join('');
          if (fallbackText.trim()) {
            console.log(`[gemini] non-streaming fallback succeeded — ${fallbackText.length} chars`);
            // Simulate streaming so the widget's typing UI still animates.
            const chunkSize = 6;
            for (let i = 0; i < fallbackText.length; i += chunkSize) {
              onChunk(fallbackText.slice(i, i + chunkSize));
              await new Promise(r => setTimeout(r, 12));
            }
            return { fullResponse: fallbackText, shouldHandoff: false };
          }
          console.error(`[gemini] PAIN POINT: non-streaming fallback also returned no visible text. Raw candidate: ${JSON.stringify(fallbackCandidate).slice(0, 500)}`);
        }
      } catch (err) {
        console.error('[gemini] PAIN POINT: non-streaming fallback request threw:', err);
      }
      console.warn('[gemini] PAIN POINT: Gemini stream completed but produced no text — falling to degraded mode');
    }
  }

  // 3. Honest degraded-mode message. Previously this silently dumped raw
  // knowledge-base text or fired hardcoded keyword-matched marketing copy
  // that was indistinguishable from a real AI answer — a visitor had no
  // way to tell they weren't getting a genuine response. Now we say so.
  console.warn(`[gemini] PAIN POINT: entering degraded mode for query "${userQuery.slice(0, 80)}" (apiKeyPresent=${!!apiKey})`);
  const degradedMessage = apiKey
    ? `I'm having trouble generating a response right now — our AI service seems to be temporarily unavailable. Please try again in a moment, or leave your contact details and we'll follow up.`
    : `Our AI assistant isn't fully configured yet for this site. Please leave your contact details and a real person will follow up with you shortly.`;

  let fullResponse = '';
  const chunkSize = 4;
  for (let i = 0; i < degradedMessage.length; i += chunkSize) {
    const chunk = degradedMessage.slice(i, i + chunkSize);
    fullResponse += chunk;
    onChunk(chunk);
    await new Promise(r => setTimeout(r, 15));
  }

  return { fullResponse, shouldHandoff: false, degraded: true };
}
