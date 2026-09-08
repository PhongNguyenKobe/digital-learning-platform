const express = require('express');
const controller = require('./document.controller');
const { authenticate } = require('../../middlewares/auth');
const { uploadDocument } = require('../../middlewares/upload');

const router = express.Router();

router.get('/', controller.listDocuments);
router.get('/catalog/universities', controller.listUniversities);
router.get('/catalog/faculties', controller.listFaculties);
router.get('/catalog/subjects', controller.listSubjects);
router.get('/mine', authenticate, controller.listMyDocuments);
router.get('/:id', controller.getDocument);
router.post(
  '/',
  authenticate,
  uploadDocument,
  controller.createDocument,
);

module.exports = router;
