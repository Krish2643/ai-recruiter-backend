import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  createApplication,
  listApplications,
  updateApplication,
  deleteApplication
} from '../controllers/application.controller.js';

const router = Router();

router.post('/', auth, createApplication);
router.get('/', auth, listApplications);
router.patch('/:id', auth, updateApplication);
router.delete('/:id', auth, deleteApplication);

export default router;
