import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { bookingsRouter } from './routes/bookings.routes';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './config/prisma';

dotenv.config();

const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env['PORT'] ?? 3000;
const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'http://localhost:4200';

app.use(helmet());
const corsOptions = { origin: FRONTEND_URL, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] };
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth',         authRouter);
app.use('/api/bookings', bookingsRouter);
app.use(errorHandler);

if (process.env['NODE_ENV'] !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Pillway API listening on http://localhost:${PORT}`);
  });

  async function shutdown(): Promise<void> {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
