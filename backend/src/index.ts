import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bookingsRouter } from './routes/bookings.routes';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './config/prisma';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] ?? 3000;
const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'http://localhost:4200';

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
