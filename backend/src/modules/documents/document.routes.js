const express = require('express');
const controller = require('./document.controller');
const { authenticate, optionalAuthenticate } = require('../../middlewares/auth');
const { uploadDocument } = require('../../middlewares/upload');

const router = express.Router();
const authLimiter = require('express-rate-limit')({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { message: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau.' } } });
const uploadLimiter = require('express-rate-limit')({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { message: 'Bạn đã vượt giới hạn 20 lượt tải lên mỗi giờ.' } } });

router.get('/', controller.listDocuments);
router.get('/catalog/universities', controller.listUniversities);
router.get('/catalog/faculties', controller.listFaculties);
router.get('/catalog/subjects', controller.listSubjects);
router.get('/mine', authenticate, controller.listMyDocuments);
router.get('/mine/favorites', authenticate, controller.listMyFavorites);
router.get('/mine/downloads', authenticate, controller.listMyDownloads);
router.get('/:id/preview', controller.previewDocument);
router.get('/:id/content', optionalAuthenticate, controller.streamDocumentContent);
router.get('/:id/preview-content', optionalAuthenticate, controller.streamOfficePreviewContent);
router.get('/:id', optionalAuthenticate, controller.getDocument);
router.post('/:id/unlock', authLimiter, authenticate, controller.unlockDocument);
router.post(
  '/',
  authenticate,
  uploadLimiter,
  uploadDocument,
  controller.createDocument,
);
router.patch('/:id', authenticate, controller.updateMyDocument);
router.delete('/:id', authenticate, controller.deleteMyDocument);

module.exports = router;
