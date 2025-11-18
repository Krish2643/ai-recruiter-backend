import { Router } from 'express';
import { login, register, getCurrentUser } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getCurrentUser);
// router.post('/google', ...) // future
export default router;
