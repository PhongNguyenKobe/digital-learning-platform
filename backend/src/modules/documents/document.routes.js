const express = require('express');
const controller = require('./document.controller');
const { authenticate, optionalAuthenticate } = require('../../middlewares/auth');
const { uploadDocument } = require('../../middlewares/upload');

const router = express.Router();

router.get('/', controller.listDocuments);
router.get('/catalog/universities', controller.listUniversities);
router.get('/catalog/faculties', controller.listFaculties);
router.get('/catalog/subjects', controller.listSubjects);
router.get('/mine', authenticate, controller.listMyDocuments);
router.get('/mine/favorites', authenticate, controller.listMyFavorites);
router.get('/mine/downloads', authenticate, controller.listMyDownloads);
router.get('/:id', optionalAuthenticate, controller.getDocument);
router.post('/:id/unlock', authenticate, controller.unlockDocument);
router.post(
  '/',
  authenticate,
  uploadDocument,
  controller.createDocument,
);
router.patch('/:id', authenticate, controller.updateMyDocument);
router.delete('/:id', authenticate, controller.deleteMyDocument);

module.exports = router;
