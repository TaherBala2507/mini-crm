import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { correlationId } from './middleware/correlationId';
import { generalLimiter } from './middleware/rateLimit';

// Import routes
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import noteRoutes from './routes/note.routes';
import analyticsRoutes from './routes/analytics.routes';
import userRoutes from './routes/user.routes';
import orgRoutes from './routes/org.routes';
import roleRoutes from './routes/role.routes';
import attachmentRoutes from './routes/attachment.routes';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Custom middleware
  app.use(correlationId);

  // Rate limiting
  app.use(generalLimiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use(`${config.apiPrefix}/auth`, authRoutes);
  app.use(`${config.apiPrefix}/leads`, leadRoutes);
  app.use(`${config.apiPrefix}/projects`, projectRoutes);
  app.use(`${config.apiPrefix}/tasks`, taskRoutes);
  app.use(`${config.apiPrefix}/notes`, noteRoutes);
  app.use(`${config.apiPrefix}/analytics`, analyticsRoutes);
  app.use(`${config.apiPrefix}/users`, userRoutes);
  app.use(`${config.apiPrefix}/org`, orgRoutes);
  app.use(`${config.apiPrefix}/roles`, roleRoutes);
  app.use(`${config.apiPrefix}/attachments`, attachmentRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};