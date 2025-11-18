import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  chat,
  getConversations,
  getConversationMessages,
  deleteConversation
} from '../controllers/ai.controller.js';

const router = Router();

// All routes require authentication
router.post('/chat', auth, chat);
router.get('/conversations', auth, getConversations);
router.get('/conversations/:conversationId/messages', auth, getConversationMessages);
router.delete('/conversations/:conversationId', auth, deleteConversation);

export default router;
