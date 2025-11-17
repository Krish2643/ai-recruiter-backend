import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { chat } from '../controllers/ai.controller.js';

const router = Router();

router.post('/assistant', auth, chat);
// router.post('/voice', auth, voiceHandler) // future

export default router;
