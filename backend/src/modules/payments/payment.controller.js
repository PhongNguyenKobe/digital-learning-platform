const crypto = require('crypto');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const asyncHandler = require('../../utils/asyncHandler');
const httpError = require('../../utils/httpError');
const { createPaymentUrl, getPlan, verifyParams } = require('./vnpay.service');

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || '127.0.0.1').split(',')[0].trim().replace('::ffff:', '');
}

function resultUrl(status, message) {
  return `${env.frontendUrl}/thanh-toan/vnpay-return?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`;
}

async function settlePayment(query) {
  if (!verifyParams(query)) return { code: '97', message: 'Invalid checksum', status: 'invalid' };
  if (query.vnp_TmnCode !== env.vnpTmnCode) return { code: '99', message: 'Invalid merchant', status: 'invalid' };

  const payment = await prisma.payment.findUnique({ where: { txnRef: String(query.vnp_TxnRef || '') } });
  if (!payment) return { code: '01', message: 'Order not found', status: 'not_found' };
  if (payment.status === 'PAID') return { code: '02', message: 'Order already confirmed', status: 'success', payment };
  if (payment.status !== 'PENDING') return { code: '02', message: 'Order already processed', status: 'failed', payment };
  if (payment.expiresAt < new Date()) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'EXPIRED', rawResponse: query } });
    return { code: '02', message: 'Order expired', status: 'failed', payment };
  }
  if (Number(query.vnp_Amount) !== payment.amount * 100) return { code: '04', message: 'Invalid amount', status: 'invalid', payment };

  const paid = query.vnp_ResponseCode === '00' && (!query.vnp_TransactionStatus || query.vnp_TransactionStatus === '00');
  if (!paid) {
    const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', responseCode: String(query.vnp_ResponseCode || ''), rawResponse: query } });
    return { code: '00', message: 'Confirm Success', status: 'failed', payment: updated };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const claimed = await tx.payment.updateMany({ where: { id: payment.id, status: 'PENDING' }, data: { status: 'PAID', responseCode: String(query.vnp_ResponseCode), vnpTransactionNo: query.vnp_TransactionNo ? String(query.vnp_TransactionNo) : null, bankCode: query.vnp_BankCode ? String(query.vnp_BankCode) : null, paidAt: new Date(), rawResponse: query } });
    if (!claimed.count) return tx.payment.findUnique({ where: { id: payment.id } });
    const startAt = payment.userId ? (await tx.user.findUnique({ where: { id: payment.userId }, select: { premiumExpiresAt: true } })).premiumExpiresAt : null;
    const expiresAt = startAt && startAt > new Date() ? new Date(startAt) : new Date();
    expiresAt.setMonth(expiresAt.getMonth() + getPlan(payment.plan).months);
    await tx.user.update({ where: { id: payment.userId }, data: { isPremium: true, premiumExpiresAt: expiresAt, downloadCredits: { increment: 10 } } });
    return tx.payment.findUnique({ where: { id: payment.id } });
  });
  return { code: '00', message: 'Confirm Success', status: 'success', payment: updated };
}

const createVnpayPayment = asyncHandler(async (req, res) => {
  const plan = getPlan(req.body.plan);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const txnRef = `HLS${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const payment = await prisma.payment.create({ data: { userId: req.user.id, txnRef, plan: plan.id, amount: plan.amount, expiresAt } });
  const paymentUrl = createPaymentUrl({ txnRef, amount: plan.amount, orderInfo: `${plan.label} - ${txnRef}`, ipAddress: clientIp(req), expiresAt });
  res.status(201).json({ data: { paymentUrl, txnRef: payment.txnRef, expiresAt: payment.expiresAt } });
});

const vnpayReturn = asyncHandler(async (req, res) => {
  const result = await settlePayment(req.query);
  const message = result.status === 'success' ? 'Thanh toán thành công. Premium đã được kích hoạt.' : 'Thanh toán chưa thành công hoặc đã bị hủy.';
  res.redirect(resultUrl(result.status, message));
});

const vnpayIpn = asyncHandler(async (req, res) => {
  const result = await settlePayment(req.query);
  res.json({ RspCode: result.code, Message: result.message });
});

module.exports = { createVnpayPayment, vnpayReturn, vnpayIpn };
