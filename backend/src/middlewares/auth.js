const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const env = require('../config/env');
const httpError = require('../utils/httpError');

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw httpError(401, 'Bạn cần đăng nhập để thực hiện thao tác này.');
    }

    const token = authorization.slice(7);
    const payload = jwt.verify(token, env.jwtAccessSecret);
    if (payload.type !== 'access') {
      throw httpError(401, 'Access token không hợp lệ.');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, username: true, fullName: true, role: true, status: true },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw httpError(401, 'Tài khoản không tồn tại hoặc đã bị khóa.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(httpError(401, 'Access token không hợp lệ hoặc đã hết hạn.'));
    }
    return next(error);
  }
}

function requireRoles(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, 'Bạn không có quyền thực hiện thao tác này.'));
    }
    return next();
  };
}

module.exports = { authenticate, requireRoles };
