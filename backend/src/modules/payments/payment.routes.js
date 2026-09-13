const express = require('express');
const controller = require('./payment.controller');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();
router.post('/vnpay/create', authenticate, controller.createVnpayPayment);
router.get('/vnpay/return', controller.vnpayReturn);
router.get('/vnpay/ipn', controller.vnpayIpn);

module.exports = router;
