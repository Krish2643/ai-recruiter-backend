import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getMe, updateMe } from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', auth, getMe);
router.patch('/me', auth, updateMe);

export default router;
