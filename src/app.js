import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors'; // for async errors

import { notFound, errorHandler } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import applicationRoutes from './routes/application.routes.js';
import documentRoutes from './routes/document.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import progressRoutes from './routes/progress.routes.js';
import aiRoutes from './routes/ai.routes.js'; 
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health
app.get('/v1/health', (req, res) => res.json({ ok: true, ts: new Date() }));

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/job-applications', applicationRoutes);
app.use('/v1/documents', documentRoutes);
app.use('/v1/dashboard', dashboardRoutes);
app.use('/v1/progress', progressRoutes);
app.use('/v1/ai-assistant', aiRoutes);
app.use('/v1/admin', adminRoutes);

// 404 + Error
app.use(notFound);
app.use(errorHandler);

export default app;
