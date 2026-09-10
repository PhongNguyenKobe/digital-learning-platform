const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const asyncHandler = require('../../utils/asyncHandler');
const httpError = require('../../utils/httpError');
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  refreshTokenExpiry,
} = require('../../utils/tokens');

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  avatarUrl: true,
  bio: true,
  role: true,
  status: true,
  universityId: true,
  facultyId: true,
  university: { select: { name: true, shortName: true } },
  faculty: { select: { name: true } },
};

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw httpError(400, 'Mật khẩu phải có ít nhất 8 ký tự.');
  }
}

function validateCredentials(body) {
  const email = normalizeEmail(body.email);
  const password = body.password;
  if (!email || !email.includes('@')) {
    throw httpError(400, 'Email không hợp lệ.');
  }
  validatePassword(password);
  return { email, password };
}

async function issueTokens(user) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
    },
  });
  return { accessToken, refreshToken };
}

const register = asyncHandler(async (req, res) => {
  const { email, password } = validateCredentials(req.body);
  const fullName = String(req.body.fullName || '').trim();
  const username = req.body.username ? String(req.body.username).trim() : undefined;
  if (!fullName) {
    throw httpError(400, 'Họ và tên là bắt buộc.');
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(username ? [{ username }] : [])] },
    select: { id: true },
  });
  if (existingUser) {
    throw httpError(409, 'Email hoặc username đã được sử dụng.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      username,
      universityId: req.body.universityId || undefined,
      facultyId: req.body.facultyId || undefined,
    },
    select: publicUserSelect,
  });
  const tokens = await issueTokens(user);

  res.status(201).json({ data: { user, ...tokens } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = validateCredentials(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, 'Email hoặc mật khẩu không chính xác.');
  }
  if (user.status !== 'ACTIVE') {
    throw httpError(403, 'Tài khoản không hoạt động.');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const tokens = await issueTokens(user);
  const safeUser = await prisma.user.findUnique({ where: { id: user.id }, select: publicUserSelect });
  res.json({ data: { user: safeUser, ...tokens } });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    throw httpError(400, 'refreshToken là bắt buộc.');
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (error) {
    throw httpError(401, 'Refresh token không hợp lệ hoặc đã hết hạn.');
  }
  if (payload.type !== 'refresh') {
    throw httpError(401, 'Refresh token không hợp lệ.');
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashToken(refreshToken), userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  if (!storedToken || storedToken.user.status !== 'ACTIVE') {
    throw httpError(401, 'Refresh token đã bị thu hồi hoặc hết hạn.');
  }

  await prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revokedAt: new Date() } });
  const tokens = await issueTokens(storedToken.user);
  res.json({ data: tokens });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { userId: req.user.id, tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: publicUserSelect });
  res.json({ data: user });
});

const changePassword = asyncHandler(async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  validatePassword(newPassword);
  if (!currentPassword || typeof currentPassword !== 'string') {
    throw httpError(400, 'Vui lòng nhập mật khẩu hiện tại.');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { passwordHash: true } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw httpError(401, 'Mật khẩu hiện tại không chính xác.');
  }
  if (currentPassword === newPassword) {
    throw httpError(400, 'Mật khẩu mới cần khác mật khẩu hiện tại.');
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } }),
    prisma.refreshToken.updateMany({ where: { userId: req.user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  res.json({ data: { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại trên các thiết bị khác.' } });
});

module.exports = { register, login, refresh, logout, me, changePassword };
