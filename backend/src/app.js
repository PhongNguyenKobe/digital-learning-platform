const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const prisma = require('./config/prisma');
const authRoutes = require('./modules/auth/auth.routes');
const documentRoutes = require('./modules/documents/document.routes');
const interactionRoutes = require('./modules/interactions/interaction.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const errorHandler = require('./middlewares/errorHandler');
const { thumbnailDirectory } = require('./middlewares/upload');

const app = express();

function isAllowedOrigin(origin) {
  if (!origin || env.corsOrigins.includes(origin)) return true;
  if (!env.allowNgrokOrigins) return false;
  return /^https:\/\/[a-z0-9-]+\.(ngrok-free\.app|ngrok-free\.dev|ngrok\.io|ngrok\.app)$/i.test(origin);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    const error = new Error('Origin không được phép truy cập API.');
    error.statusCode = 403;
    return callback(error);
  },
  credentials: false,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads/thumbnails', express.static(thumbnailDirectory, { maxAge: '7d', immutable: true }));

app.get('/health', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', interactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Không tìm thấy endpoint.' } });
});
app.use(errorHandler);

module.exports = app;
