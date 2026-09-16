const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const httpError = require('../utils/httpError');

async function hasExpectedSignature(file, kind) {
  const handle = await fs.promises.open(file.path, 'r');
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const header = buffer.subarray(0, bytesRead);
    const startsWith = (...bytes) => bytes.every((byte, index) => header[index] === byte);
    if (kind === 'pdf') return header.toString('ascii', 0, 5) === '%PDF-';
    if (kind === 'ole') return startsWith(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1);
    if (kind === 'zip') return startsWith(0x50, 0x4b, 0x03, 0x04) || startsWith(0x50, 0x4b, 0x05, 0x06) || startsWith(0x50, 0x4b, 0x07, 0x08);
    if (kind === 'jpeg') return startsWith(0xff, 0xd8, 0xff);
    if (kind === 'png') return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    if (kind === 'webp') return header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';
    return false;
  } finally {
    await handle.close();
  }
}

async function validateFileSignature(file, isThumbnail = false) {
  if (!file) return;
  const typeToSignature = isThumbnail
    ? { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' }
    : {
      'application/pdf': 'pdf', 'application/msword': 'ole', 'application/vnd.ms-powerpoint': 'ole',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'zip',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'zip',
      'application/vnd.ms-excel': 'ole', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'zip', 'application/zip': 'zip',
    };
  if (!(await hasExpectedSignature(file, typeToSignature[file.mimetype]))) throw httpError(415, 'Nội dung file không khớp định dạng đã khai báo.');
}

const uploadDirectory = path.resolve(process.cwd(), env.uploadDir || 'uploads');
const thumbnailDirectory = path.join(uploadDirectory, 'thumbnails');
const previewDirectory = path.join(uploadDirectory, 'previews');
fs.mkdirSync(uploadDirectory, { recursive: true });
fs.mkdirSync(thumbnailDirectory, { recursive: true });
fs.mkdirSync(previewDirectory, { recursive: true });

const allowedDocumentTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]);

const allowedThumbnailTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (file.fieldname === 'thumbnail') {
      callback(null, thumbnailDirectory);
    } else {
      callback(null, uploadDirectory);
    }
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || (file.fieldname === 'thumbnail' ? '.jpg' : '');
    const prefix = file.fieldname === 'thumbnail' ? 'thumb-' : '';
    callback(null, `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const uploadHandler = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max cho tài liệu
  },
  fileFilter: (req, file, callback) => {
    if (file.fieldname === 'file') {
      if (!allowedDocumentTypes.has(file.mimetype)) {
        return callback(httpError(415, 'Định dạng tài liệu không được hỗ trợ.'));
      }
      return callback(null, true);
    }

    if (file.fieldname === 'thumbnail') {
      if (!allowedThumbnailTypes.has(file.mimetype)) {
        return callback(httpError(415, 'Định dạng ảnh thumbnail phải là JPEG, PNG hoặc WebP.'));
      }
      return callback(null, true);
    }

    return callback(httpError(400, `Trường upload không hợp lệ: ${file.fieldname}`));
  },
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

// Middleware wrapper để đảm bảo tương thích cả req.file và req.files
function uploadDocument(req, res, next) {
  uploadHandler(req, res, (err) => {
    if (err) return next(err);
    if (req.files?.file?.[0]) {
      req.file = req.files.file[0];
    }
    Promise.all([validateFileSignature(req.file), validateFileSignature(req.files?.thumbnail?.[0], true)])
      .then(() => next())
      .catch(async (validationError) => {
        await Promise.all([req.file?.path, req.files?.thumbnail?.[0]?.path].filter(Boolean).map((filePath) => fs.promises.unlink(filePath).catch(() => {})));
        next(validationError);
      });
  });
}

module.exports = {
  uploadDocument,
  uploadDirectory,
  thumbnailDirectory,
  previewDirectory,
};
