const dotenv = require('dotenv');

dotenv.config();

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
};
