import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import {
  listUsers,
  setUserStatus,
  listAllApplications,
  listAllDocuments,
  stats
} from '../controllers/admin.controller.js';

const router = Router();

router.use(auth, requireAdmin);

router.get('/users', listUsers);
router.patch('/users/:id/status', setUserStatus);
router.get('/applications', listAllApplications);
router.get('/documents', listAllDocuments);
router.get('/stats', stats);

export default router;
