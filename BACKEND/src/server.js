
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import connectDB from './config/db.js';
import { seed } from './utils/seed.js';

// =====================================
// ROUTE IMPORTS
// =====================================

import authRoutes from './routes/auth.js';
import tierRoutes from './routes/tiers.js';
import registrationRoutes from './routes/registrations.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/ContactRoutes.js';

// =====================================
// EXPRESS APP
// =====================================

const app = express();

// =====================================
// UPLOAD DIRECTORY
// =====================================

const uploadDir = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || 'private_uploads'
);

fs.mkdirSync(uploadDir, { recursive: true });

// =====================================
// SECURITY MIDDLEWARE
// =====================================

app.use(helmet());

// =====================================
// CORS CONFIGURATION
// =====================================

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.ADMIN_ORIGIN,
  'https://ignite-2k26-two.vercel.app'
]
  .filter(Boolean)
  .map(origin => origin.trim().replace(/\/+$/, ''));

console.log('=====================================');
console.log('RAIC API CORS CONFIGURATION');
console.log('Allowed origins:', allowedOrigins);
console.log('=====================================');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error('CORS BLOCKED ORIGIN:', normalizedOrigin);
      console.error('ALLOWED ORIGINS:', allowedOrigins);

      return callback(new Error('Origin not allowed by CORS'));
    },

    credentials: false
  })
);

// =====================================
// BODY PARSING
// =====================================

app.use(express.json({ limit: '1mb' }));

// =====================================
// API RATE LIMITING
// =====================================

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    max: 240,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// =====================================
// HEALTH CHECK
// =====================================

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'RAIC Hackathon API'
  });
});

// =====================================
// API ROUTES
// =====================================

// Authentication
app.use('/api/auth', authRoutes);

// Challenge tiers
app.use('/api/tiers', tierRoutes);

// Registrations
app.use('/api/registrations', registrationRoutes);

// Payments
app.use('/api/payments', paymentRoutes);

// Public contact form
app.use('/api/contact', contactRoutes);

// Admin panel
app.use('/api/admin', adminRoutes);

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err, _req, res, _next) => {
  console.error('API ERROR:', err);

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'A record with this value already exists.'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: err.message
    });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error.'
  });
});

// =====================================
// START SERVER
// =====================================

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required');
    }

    // Connect MongoDB
    await connectDB();

    // Seed initial admin/data
    await seed();

    // Start Express server
    const port = process.env.PORT || 5000;

    app.listen(port, '0.0.0.0', () => {
      console.log('=====================================');
      console.log('RAIC HACKATHON API STARTED');
      console.log(`Port: ${port}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('=====================================');
    });

  } catch (error) {
    console.error('SERVER STARTUP ERROR:', error);
    process.exit(1);
  }
};

start();
