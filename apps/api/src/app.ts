import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/users/user.routes';
import { postRouter } from './modules/posts/post.routes';
import { mediaRouter } from './modules/media/media.routes';
import { searchRouter } from './modules/search/search.routes';
import { exportRouter } from './modules/exports/export.routes';
import { reportRouter } from './modules/reports/report.routes';
import { feedbackRouter } from './modules/feedback/feedback.routes';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || origin === config.corsOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(config.sessionSecret));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
      status: 'healthy',
      service: 'timbaktu-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      version: '1.0.0'
    });
  });

  // Root welcome
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'Welcome to Timbaktu API — Stories sound better here.',
      health: '/health',
      docs: '/api/v1'
    });
  });

  // REST API v1 Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/posts', postRouter);
  app.use('/api/v1/posts', exportRouter);
  app.use('/api/v1/posts', reportRouter);
  app.use('/api/v1/media', mediaRouter);
  app.use('/api/v1/search', searchRouter);
  app.use('/api/v1/feedback', feedbackRouter);

  // Centralized Error Handler (must be mounted after all routes)
  app.use(errorHandler);

  return app;
}
