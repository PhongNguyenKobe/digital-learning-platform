const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function createAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, type: 'access', jti: crypto.randomUUID() },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenExpiresIn },
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh', jti: crypto.randomUUID() },
    env.jwtRefreshSecret,
    { expiresIn: `${env.refreshTokenExpiresInDays}d` },
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshTokenExpiry() {
  return new Date(Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000);
}

module.exports = { createAccessToken, createRefreshToken, hashToken, refreshTokenExpiry };
