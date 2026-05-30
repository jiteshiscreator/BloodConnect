import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

/**
 * Initialize Socket.IO server with JWT authentication middleware.
 * @param {import('http').Server} httpServer
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── JWT Authentication Middleware ──────────────────────────
  // Runs before ANY event is processed. Rejects unauthenticated connections.
  io.use(async (socket, next) => {
    try {
      // Accept token from cookie OR Authorization header (for flexibility)
      const rawCookie = socket.handshake.headers.cookie || '';
      const cookieToken = rawCookie
        .split(';')
        .find((c) => c.trim().startsWith('accessToken='))
        ?.split('=')[1];

      const token =
        cookieToken ||
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required: no token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('_id role bloodType city isActive');

      if (!user || !user.isActive) {
        return next(new Error('Authentication required: user not found or inactive'));
      }

      // Attach verified user to socket for use in event handlers
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Authentication required: invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`🔌 Socket connected: ${socket.id} (user: ${user._id}, role: ${user.role})`);

    // ── Auto-join rooms based on VERIFIED server-side identity ──
    // Room membership is derived from the JWT-verified user object only.
    // No client-supplied userId is trusted for room assignment.

    // Every user joins their personal notification room
    socket.join(`user-${user._id}`);

    // Donors join their blood-type + city alert room
    if (user.role === 'donor' && user.bloodType && user.city) {
      const room = `blood-${user.bloodType}-${user.city.toLowerCase()}`;
      socket.join(room);
      console.log(`👥 Donor ${user._id} joined alert room: ${room}`);
    }

    // Hospital staff join their hospital room
    if (user.role === 'hospital') {
      socket.join(`hospital-${user._id}`);
    }

    // Blood bank admins join their bank room
    if (user.role === 'bloodbank_admin') {
      socket.join(`bloodbank-${user._id}`);
    }

    // ── Legacy room-join events (now no-ops) ──
    // Kept for backward-compatibility but ignored;
    // actual room membership is controlled exclusively by the server.
    socket.on('joinDonorRoom', () => { /* no-op: server auto-joins */ });
    socket.on('joinHospitalRoom', () => { /* no-op: server auto-joins */ });
    socket.on('joinUserRoom', () => { /* no-op: server auto-joins */ });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id} (user: ${user._id})`);
    });
  });

  return io;
};

/**
 * Get the existing Socket.IO instance.
 */
export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket first.');
  return io;
};
