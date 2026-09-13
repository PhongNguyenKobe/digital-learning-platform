const express = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const authenticationLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { message: 'Quá nhiều lần xác thực. Vui lòng thử lại sau 15 phút.' } } });

router.post('/register', authenticationLimiter, controller.register);
router.post('/login', authenticationLimiter, controller.login);
router.post('/refresh', authenticationLimiter, controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
router.patch('/password', authenticate, controller.changePassword);

module.exports = router;
