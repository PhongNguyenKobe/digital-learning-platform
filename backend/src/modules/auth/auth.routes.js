const express = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
router.patch('/password', authenticate, controller.changePassword);
router.post('/upgrade-premium', authenticate, controller.upgradePremium);

module.exports = router;
