const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const httpError = require('../utils/httpError');

const uploadDirectory = path.resolve(process.cwd(), env.uploadDir || 'uploads');
const thumbnailDirectory = path.join(uploadDirectory, 'thumbnails');
fs.mkdirSync(uploadDirectory, { recursive: true });
fs.mkdirSync(thumbnailDirectory, { recursive: true });

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
    next();
  });
}

module.exports = {
  uploadDocument,
  uploadDirectory,
  thumbnailDirectory,
};
