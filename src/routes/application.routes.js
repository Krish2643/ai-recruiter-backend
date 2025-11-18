import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  bulkDeleteApplications
} from '../controllers/application.controller.js';

const router = Router();

// All routes require authentication
router.post('/', auth, createApplication);
router.get('/', auth, listApplications);
router.get('/:id', auth, getApplication);
router.put('/:id', auth, updateApplication); // Changed from PATCH to PUT to match frontend
router.delete('/:id', auth, deleteApplication);
router.delete('/bulk', auth, bulkDeleteApplications);

export default router;
