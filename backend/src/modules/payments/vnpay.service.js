const crypto = require('crypto');
const env = require('../../config/env');
const httpError = require('../../utils/httpError');

const plans = {
  MONTH: { amount: 29000, months: 1, label: 'Premium 1 thang' },
  SEMESTER: { amount: 69000, months: 5, label: 'Premium 1 hoc ky' },
  YEAR: { amount: 129000, months: 12, label: 'Premium 1 nam' },
};

function getPlan(planId) {
  const plan = plans[String(planId || '').toUpperCase()];
  if (!plan) throw httpError(400, 'Gói Premium không hợp lệ.');
  return { id: String(planId).toUpperCase(), ...plan };
}

function formatVnpDate(date) {
  const local = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const value = (part) => String(part).padStart(2, '0');
  return `${local.getUTCFullYear()}${value(local.getUTCMonth() + 1)}${value(local.getUTCDate())}${value(local.getUTCHours())}${value(local.getUTCMinutes())}${value(local.getUTCSeconds())}`;
}

function encodeParams(params) {
  return Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key])).replace(/%20/g, '+')}`)
    .join('&');
}

function signParams(params) {
  if (!env.vnpTmnCode || !env.vnpHashSecret) throw httpError(503, 'VNPay chưa được cấu hình trên máy chủ.');
  return crypto.createHmac('sha512', env.vnpHashSecret).update(encodeParams(params), 'utf8').digest('hex');
}

function verifyParams(query) {
  const receivedHash = String(query.vnp_SecureHash || '');
  const params = { ...query };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;
  const expectedHash = signParams(params);
  if (!receivedHash || receivedHash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(receivedHash, 'utf8'), Buffer.from(expectedHash, 'utf8'));
}

function createPaymentUrl({ txnRef, amount, orderInfo, ipAddress, expiresAt }) {
  const now = new Date();
  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: env.vnpTmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: env.vnpReturnUrl,
    vnp_IpAddr: ipAddress || '127.0.0.1',
    vnp_CreateDate: formatVnpDate(now),
    vnp_ExpireDate: formatVnpDate(expiresAt),
  };
  const secureHash = signParams(params);
  return `${env.vnpUrl}?${encodeParams({ ...params, vnp_SecureHash: secureHash })}`;
}

module.exports = { getPlan, createPaymentUrl, verifyParams };
