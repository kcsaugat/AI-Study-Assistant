import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import noteRoutes from './routes/notes';
import aiRoutes from './routes/ai';
import uploadRoutes from './routes/upload';
import gamificationRoutes from './routes/gamification';
import { errorHandler } from './middleware/errorHandler';
import fs from 'fs';
import path from 'path';
import { prisma } from './config/database';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT ?? 5000;

// We are now using a permanent PostgreSQL database, so no local file copying is needed.

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gamification', gamificationRoutes);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅  Backend running at http://localhost:${PORT}`);
});

export default app;
