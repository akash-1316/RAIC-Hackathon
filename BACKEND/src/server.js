
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import connectDB from './config/db.js';
import { seed } from './utils/seed.js';

import authRoutes from './routes/auth.js';
import tierRoutes from './routes/tiers.js';
import registrationRoutes from './routes/registrations.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/ContactRoutes.js';

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

const origins = [
  process.env.CLIENT_ORIGIN,
  process.env.ADMIN_ORIGIN
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) =>
      !origin || origins.includes(origin)
        ? cb(null, true)
        : cb(new Error('Origin not allowed by CORS')),
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

app.get('/api/health', (_q, res) => {
  res.json({
    ok: true,
    service: 'RAIC Hackathon API'
  });
});

// =====================================
// API ROUTES
// =====================================

// Authentication
app.use('/api/auth', authRoutes);

// Tiers
app.use('/api/tiers', tierRoutes);

// Registrations
app.use('/api/registrations', registrationRoutes);

// Payments
app.use('/api/payments', paymentRoutes);

// Public Contact Form
app.use('/api/contact', contactRoutes);

// Admin Panel
app.use('/api/admin', adminRoutes);

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err, _q, res, _n) => {
  console.error(err);

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

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.'
  });
});

// =====================================
// START SERVER
// =====================================

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  await connectDB();

  await seed();

  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`RAIC API listening on ${port}`);
  });
};

start().catch(error => {
  console.error(error);
  process.exit(1);
});
