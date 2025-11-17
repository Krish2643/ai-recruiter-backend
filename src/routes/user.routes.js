import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getMe, updateMe } from '../controllers/profile.controller.js';
import { uploadDocument, listDocuments, deleteDocument } from '../controllers/document.controller.js';
import { getProgress } from '../controllers/application.controller.js';

const router = Router();

router.get('/me', auth, getMe);
router.patch('/me', auth, updateMe);

router.post('/upload', auth, upload.single('file'), uploadDocument);
router.get('/documents', auth, listDocuments);
router.delete('/documents/:id', auth, deleteDocument);

router.get('/progress', auth, getProgress); // candidate progress

export default router;
