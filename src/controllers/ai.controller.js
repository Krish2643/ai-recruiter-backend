import AIInteraction from '../models/AIInteraction.js';
import { getAIReply } from '../services/ai.service.js';
import { ok } from '../utils/responses.js';

export async function chat(req, res) {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'message required' });

  const reply = await getAIReply(message);

  await AIInteraction.create({
    user: req.user.id,
    userQuery: message,
    aiResponse: reply,
    inputMode: 'text',
    responseMode: 'text'
  });

  return ok(res, { reply });
}

// Voice endpoints would accept audio, run STT → OpenAI → TTS; omitted for brevity
