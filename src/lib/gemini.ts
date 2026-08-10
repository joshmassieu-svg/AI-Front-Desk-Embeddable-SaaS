import { WebsiteConfig, Message } from './types';

export async function generateGeminiChatStream(params: {
  website: WebsiteConfig;
  userQuery: string;
  history: Message[];
  knowledgeContext: string;
  onChunk: (chunk: string) => void;
}): Promise<{ fullResponse: string; shouldHandoff: boolean; degraded?: boolean }> {
  const { website, userQuery, history, knowledgeContext, onChunk } = params;

  // 1. Check for Human Handoff triggers
  const queryLower = userQuery.toLowerCase();
  const shouldHandoff = website.handoffEnabled && website.handoffTriggerWords.some(word => 
    queryLower.includes(word.toLowerCase())
  );

  if (shouldHandoff) {
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

  const systemInstruction = `${website.systemPrompt}

System Parameters:
- Bot Name: ${website.botName}
- Allowed Domains: ${website.allowedDomains.join(', ')}
- Temperature: ${website.temperature}
- Restricted Topics to NEVER discuss: ${website.restrictedTopics.join(', ')}

Knowledge Base Context (Use this context to answer accurately):
${knowledgeContext || 'No additional Knowledge Base articles found for this query.'}

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
    // Model IDs deprecate on a matter of months, not years (Gemini has shut
    // down or scheduled shutdown for 1.5, 2.0, and is mid-cycle on 2.5 as
    // of this writing) — hardcoding one guarantees a future outage. Default
    // is overridable via env var so a deprecation doesn't require a code
    // change, just an env var update + redeploy.
    const defaultModel = process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash';
    const proModel = process.env.GEMINI_CHAT_MODEL_PRO || 'gemini-3.6-flash';
    const modelName = website.model === 'gemini-1.5-pro' || website.model === 'gemini-2.5-pro' ? proModel : defaultModel;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: website.temperature,
        maxOutputTokens: website.maxTokens,
      }
    });

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
          console.warn(`Gemini rate limited (429), retrying in ${500 * Math.pow(2, attempt)}ms...`);
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
        }
      } catch (err) {
        console.error(`Gemini request failed (attempt ${attempt + 1}):`, err);
        response = null;
      }
    }

    if (response && !response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error(`Gemini API error ${response.status} (model: ${modelName}):`, errBody);
      if (response.status === 404) {
        console.error(
          `Model "${modelName}" was likely deprecated. Check ` +
          `https://ai.google.dev/gemini-api/docs/deprecations and set ` +
          `GEMINI_CHAT_MODEL / GEMINI_CHAT_MODEL_PRO to a current model.`
        );
      }
    }

    if (response && response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let sseBuffer = '';

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
          try {
            const json = JSON.parse(line.substring(6));
            const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (textChunk) {
              accumulated += textChunk;
              onChunk(textChunk);
            }
          } catch {
            // Ignore malformed frame — better to skip one chunk than crash
          }
        }
      }

      if (accumulated.trim()) {
        return { fullResponse: accumulated, shouldHandoff: false };
      }
    }
  }

  // 3. Honest degraded-mode message. Previously this silently dumped raw
  // knowledge-base text or fired hardcoded keyword-matched marketing copy
  // that was indistinguishable from a real AI answer — a visitor had no
  // way to tell they weren't getting a genuine response. Now we say so.
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
