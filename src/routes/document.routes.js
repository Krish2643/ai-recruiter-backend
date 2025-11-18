import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  uploadDocument,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocumentStatus,
  downloadDocument
} from '../controllers/document.controller.js';

const router = Router();

// All routes require authentication
router.post('/', auth, upload.single('file'), uploadDocument);
router.get('/', auth, listDocuments);
router.get('/status', auth, getDocumentStatus);
router.get('/:id', auth, getDocument);
router.get('/:id/download', auth, downloadDocument);
router.put('/:id', auth, updateDocument);
router.delete('/:id', auth, deleteDocument);

export default router;

