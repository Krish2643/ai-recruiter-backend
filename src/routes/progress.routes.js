import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getProgressKPIs,
  getProgressCharts,
  getProgressActivity
} from '../controllers/progress.controller.js';

const router = Router();

router.get('/kpis', auth, getProgressKPIs);
router.get('/charts', auth, getProgressCharts);
router.get('/activity', auth, getProgressActivity);

export default router;

