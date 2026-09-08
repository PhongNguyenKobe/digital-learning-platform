const express = require('express');
const controller = require('./interaction.controller');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

router.post('/documents/:id/comments', authenticate, controller.createComment);
router.get('/documents/:id/comments', controller.listComments);
router.post('/documents/:id/ratings', authenticate, controller.upsertRating);
router.post('/documents/:id/favorite', authenticate, controller.addFavorite);
router.delete('/documents/:id/favorite', authenticate, controller.removeFavorite);
router.get('/documents/:id/download', authenticate, controller.downloadDocument);
router.post('/documents/:id/reports', authenticate, controller.reportDocument);
router.post('/comments/:id/reports', authenticate, controller.reportComment);

module.exports = router;
