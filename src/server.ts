import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDatabase from './config/database';
import config from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth.routes';
import goalRoutes from './routes/goal.routes';
import progressRoutes from './routes/progress.routes';
import insightRoutes from './routes/insight.routes';
import pdfRoutes from './routes/pdf.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Morgan logger - different formats for dev/production
if (config.nodeEnv === 'development') {
  app.use(morgan('dev')); // Colored, concise output for development
} else {
  app.use(morgan('combined')); // Apache-style logs for production
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Aivora API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/pdf', pdfRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║   🚀 Aivora API Server                       ║
║                                              ║
║   Environment: ${config.nodeEnv.padEnd(28)}  ║
║   Port: ${String(config.port).padEnd(34)}   ║
║   Database: Connected                        ║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
