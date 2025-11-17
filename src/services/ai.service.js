import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function getAIReply(message) {
  if (!openai) {
    // Fallback during dev if no API key
    return 'AI is not configured. (Set OPENAI_API_KEY). Rough tip: quantify achievements and use action verbs.';
  }

  // Simple, safe completion; you can swap to responses API if you prefer
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an AI career coach. Be concise and practical.' },
      { role: 'user', content: message }
    ],
    temperature: 0.4,
    max_tokens: 300
  });

  return res.choices[0]?.message?.content?.trim() || 'No response.';
}
