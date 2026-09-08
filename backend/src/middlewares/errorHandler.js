const multer = require('multer');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';
  if (error instanceof multer.MulterError) {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'File vượt quá giới hạn 50MB.' : error.message;
  }

  if (statusCode >= 500) {
    console.error(error);
    message = 'Đã xảy ra lỗi máy chủ.';
  }

  res.status(statusCode).json({ error: { message, ...(error.details ? { details: error.details } : {}) } });
}

module.exports = errorHandler;
