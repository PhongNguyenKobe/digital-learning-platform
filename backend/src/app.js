const path = require('path');
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const prisma = require('./config/prisma');
const authRoutes = require('./modules/auth/auth.routes');
const documentRoutes = require('./modules/documents/document.routes');
const interactionRoutes = require('./modules/interactions/interaction.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploadDir)));

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

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Không tìm thấy endpoint.' } });
});
app.use(errorHandler);

module.exports = app;
