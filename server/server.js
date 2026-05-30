import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { initCronJobs } from './services/cron.service.js';
import errorHandler from './middleware/error.middleware.js';

// ── Route imports ──
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import requestRoutes from './routes/request.routes.js';
import bloodBankRoutes from './routes/bloodbank.routes.js';
import donationRoutes from './routes/donation.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// ── App setup ──
const app = express();
const httpServer = http.createServer(app);

app.set('trust proxy', 1);

// ── Socket.IO ──
initSocket(httpServer);

// ── Security middleware ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Global rate limiter (100 req / 15 min per IP) ──
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
  })
);

// ── Body parsers ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🩸 Emergency Blood Connector API is running', timestamp: new Date() });
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/bloodbanks', bloodBankRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', notificationRoutes);

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler (must be last) ──
app.use(errorHandler);

// ── Start server ──
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  initCronJobs();

  httpServer.listen(PORT, () => {
    console.log(`\n🩸 Emergency Blood Connector`);
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 Socket.IO ready\n`);
  });
};

startServer();
