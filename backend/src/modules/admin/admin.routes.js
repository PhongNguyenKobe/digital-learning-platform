const express = require('express');
const controller = require('./admin.controller');
const { authenticate, requireRoles } = require('../../middlewares/auth');

const router = express.Router();
const moderationRoles = requireRoles('MODERATOR', 'ADMIN');
const adminOnly = requireRoles('ADMIN');

router.use(authenticate, moderationRoles);
router.get('/reports', controller.listReports);
router.get('/flagged-documents', controller.listFlaggedDocuments);
router.patch('/documents/:id/status', controller.updateDocumentStatus);
router.patch('/reports/:id', controller.updateReport);
router.patch('/comments/:id/status', controller.updateCommentStatus);
router.get('/users', controller.listUsers);
router.patch('/users/:id/role', adminOnly, controller.updateUserRole);
router.patch('/users/:id/status', adminOnly, controller.updateUserStatus);

module.exports = router;
