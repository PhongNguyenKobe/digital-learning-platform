const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'development-access-secret-change-me'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'development-refresh-secret-change-me'),
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || 30),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  publishImmediately: process.env.PUBLISH_DOCUMENTS_IMMEDIATELY !== 'false',
  purgeCronSchedule: process.env.PURGE_CRON_SCHEDULE || '0 3 * * *',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((origin) => origin.trim()).filter(Boolean),
  allowNgrokOrigins: process.env.ALLOW_NGROK_ORIGINS === 'true',
  pdfTextCommand: process.env.PDF_TEXT_COMMAND || 'pdftotext',
  pdfImageCommand: process.env.PDF_IMAGE_COMMAND || 'pdftoppm',
  clamAvCommand: process.env.CLAMAV_COMMAND || 'clamscan',
  documentWorkerIntervalMs: Number(process.env.DOCUMENT_WORKER_INTERVAL_MS || 15000),
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  vnpTmnCode: process.env.VNP_TMNCODE || '',
  vnpHashSecret: process.env.VNP_HASH_SECRET || '',
  vnpUrl: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnpReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/api/payments/vnpay/return',
};
