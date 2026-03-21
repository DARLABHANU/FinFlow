import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import ocrRoutes from './routes/ocrRoutes';
import categoryRoutes from './routes/categoryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Detailed Debug Logging Middleware
app.use((req, res, next) => {
  console.log(`\n--- Incoming ${req.method} Request to ${req.url} ---`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('[Request Data (Body)]:', JSON.stringify(req.body, null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('[Request Query]:', JSON.stringify(req.query, null, 2));
  }
  
  // To log response data, we hook into res.send
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`[Response Data] ${req.method} ${req.url}:`, data);
    return originalSend.apply(res, arguments as any);
  };

  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK' });
});

// Error Handling
app.use(errorHandler);

export default app;
