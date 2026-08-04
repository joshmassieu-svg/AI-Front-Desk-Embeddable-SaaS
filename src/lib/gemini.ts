import { WebsiteConfig, Message } from './types';

export async function generateGeminiChatStream(params: {
  website: WebsiteConfig;
  userQuery: string;
  history: Message[];
  knowledgeContext: string;
  onChunk: (chunk: string) => void;
}): Promise<{ fullResponse: string; shouldHandoff: boolean }> {
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
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

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
    try {
      // Use Gemini API REST endpoint with streaming
      const modelName = website.model === 'gemini-1.5-pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: website.temperature,
            maxOutputTokens: website.maxTokens,
          }
        })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          
          // Parse SSE data lines
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const json = JSON.parse(line.substring(6));
                const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (textChunk) {
                  accumulated += textChunk;
                  onChunk(textChunk);
                }
              } catch (e) {
                // Ignore chunk parse errors
              }
            }
          }
        }

        if (accumulated.trim()) {
          return { fullResponse: accumulated, shouldHandoff: false };
        }
      }
    } catch (err) {
      console.warn('Gemini API request error, falling back to dynamic AI response engine:', err);
    }
  }

  // 3. Fallback Dynamic Intelligent Response Generator (used when GEMINI_API_KEY is not set)
  let fallbackAnswer = '';

  if (queryLower.includes('pricing') || queryLower.includes('cost') || queryLower.includes('plan')) {
    fallbackAnswer = `Our platform offers flexible subscription plans tailored to your needs:\n\n` +
      `- **Starter Plan ($29/mo)**: 1 Website, 1,000 AI Conversations, standard widgets.\n` +
      `- **Pro Plan ($99/mo)**: 5 Websites, 10,000 AI Conversations, Live Human Handoff, Custom Branding.\n` +
      `- **Enterprise Plan ($299/mo)**: Unlimited Websites, Dedicated Support & SLAs.\n\n` +
      `Would you like me to connect you with sales or help you select a plan?`;
  } else if (queryLower.includes('embed') || queryLower.includes('script') || queryLower.includes('install') || queryLower.includes('how to')) {
    fallbackAnswer = `Installing the AI Assistant on any website takes less than 2 minutes!\n\n` +
      `1. Copy your unique 1-line script snippet from your dashboard.\n` +
      `2. Paste it directly before the closing \`</body>\` tag:\n\n` +
      `\`\`\`html\n<script src="https://platform.acme.com/widget.js" data-website-id="${website.id}" async></script>\n\`\`\`\n\n` +
      `The widget uses an isolated **Shadow DOM** to prevent any host website style conflicts.`;
  } else if (queryLower.includes('feature') || queryLower.includes('what can') || queryLower.includes('capabilities')) {
    fallbackAnswer = `Key capabilities of ${website.botName}:\n\n` +
      `- 🤖 **Streaming AI Responses**: Instant markdown, code blocks, and rich cards.\n` +
      `- 📚 **RAG Knowledge Base**: Auto-crawls websites and ingests PDFs, DOCX, TXT, and MD.\n` +
      `- 👤 **Live Support Handoff**: Connects visitors to human agents seamlessly.\n` +
      `- 🎯 **Lead Capture Forms**: Collect names, emails, phone numbers, and companies.\n` +
      `- 🎨 **Visual Customizer**: Match your brand colors, icons, and positioning.`;
  } else {
    fallbackAnswer = `Based on our documentation for ${website.name}:\n\n` +
      `Thank you for asking! ${website.botName} is configured to assist with website automation, live customer engagement, knowledge retrieval, and support handoffs.\n\n` +
      `If you have specific questions regarding implementation, feel free to ask or click below to submit your email for a demo!`;
  }

  // Stream fallback answer with natural typing speed
  let fullResponse = '';
  const chunkSize = 4;
  for (let i = 0; i < fallbackAnswer.length; i += chunkSize) {
    const chunk = fallbackAnswer.slice(i, i + chunkSize);
    fullResponse += chunk;
    onChunk(chunk);
    await new Promise(r => setTimeout(r, 15));
  }

  return { fullResponse, shouldHandoff: false };
}
