const express = require('express');
const controller = require('./admin.controller');
const { authenticate, requireRoles } = require('../../middlewares/auth');

const router = express.Router();
const adminOnly = requireRoles('ADMIN');
const moderationStaff = requireRoles('ADMIN', 'MODERATOR');

router.use(authenticate);

// Moderators can review documents, reports and comments. Every action is
// recorded by the controller in AuditLog for administrators to inspect.
router.get('/stats', moderationStaff, controller.getStats);
router.get('/reports', moderationStaff, controller.listReports);
router.patch('/reports/:id', moderationStaff, controller.updateReport);
router.get('/flagged-documents', moderationStaff, controller.listFlaggedDocuments);
router.get('/documents', moderationStaff, controller.listAllDocuments);
router.patch('/documents/:id/status', moderationStaff, controller.updateDocumentStatus);
router.patch('/comments/:id/status', moderationStaff, controller.updateCommentStatus);

// System administration remains exclusively with ADMIN.
router.patch('/documents/:id', adminOnly, controller.updateDocumentDetails);
router.delete('/documents/:id', adminOnly, controller.softDeleteDocument);
router.post('/documents/:id/restore', adminOnly, controller.restoreDocument);

router.get('/users', adminOnly, controller.listUsers);
router.post('/users', adminOnly, controller.createUser);
router.patch('/users/:id', adminOnly, controller.updateUserDetails);
router.patch('/users/:id/role', adminOnly, controller.updateUserRole);
router.patch('/users/:id/status', adminOnly, controller.updateUserStatus);
router.delete('/users/:id', adminOnly, controller.deleteUser);
router.get('/payments', adminOnly, controller.listPaymentsAdmin);

router.get('/catalog/universities', adminOnly, controller.listUniversitiesAdmin);
router.post('/catalog/universities', adminOnly, controller.createUniversity);
router.patch('/catalog/universities/:id', adminOnly, controller.updateUniversity);
router.delete('/catalog/universities/:id', adminOnly, controller.deleteUniversity);
router.get('/catalog/faculties', adminOnly, controller.listFacultiesAdmin);
router.post('/catalog/faculties', adminOnly, controller.createFaculty);
router.patch('/catalog/faculties/:id', adminOnly, controller.updateFaculty);
router.delete('/catalog/faculties/:id', adminOnly, controller.deleteFaculty);
router.get('/catalog/subjects', adminOnly, controller.listSubjectsAdmin);
router.post('/catalog/subjects', adminOnly, controller.createSubject);
router.patch('/catalog/subjects/:id', adminOnly, controller.updateSubject);
router.delete('/catalog/subjects/:id', adminOnly, controller.deleteSubject);
router.get('/catalog/categories', adminOnly, controller.listCategoriesAdmin);
router.post('/catalog/categories', adminOnly, controller.createCategory);
router.patch('/catalog/categories/:id', adminOnly, controller.updateCategory);
router.delete('/catalog/categories/:id', adminOnly, controller.deleteCategory);

router.get('/audit-logs', adminOnly, controller.listAuditLogs);
router.post('/purge-deleted', adminOnly, controller.triggerPurgeDeleted);

module.exports = router;
