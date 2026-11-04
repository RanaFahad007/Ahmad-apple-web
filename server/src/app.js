import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API running', data: null }));
app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

export default app;
