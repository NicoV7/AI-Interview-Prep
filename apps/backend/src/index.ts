import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { aiRouter } from './routes/ai';
import { progressRouter } from './routes/progress';
import { roadmapRouter } from './routes/roadmap';
import { errorHandler } from './middleware/errorHandler';
import { cookieConfigMiddleware } from './middleware/cookieConfig';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(cookieConfigMiddleware);

app.use('/health', healthRouter);
app.use('/api/ai', aiRouter);
app.use('/api/v1/progress', progressRouter);
app.use('/api/v1/roadmap', roadmapRouter);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT} `);
  });
}

export { app };