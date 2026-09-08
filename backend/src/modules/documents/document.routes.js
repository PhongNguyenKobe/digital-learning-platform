const express = require('express');
const controller = require('./document.controller');
const { authenticate, requireRoles } = require('../../middlewares/auth');
const { uploadDocument } = require('../../middlewares/upload');

const router = express.Router();

router.get('/', controller.listDocuments);
router.post(
  '/',
  authenticate,
  requireRoles('CONTRIBUTOR', 'MODERATOR', 'ADMIN'),
  uploadDocument,
  controller.createDocument,
);

module.exports = router;
