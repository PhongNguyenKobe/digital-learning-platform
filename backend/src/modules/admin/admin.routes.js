const express = require('express');
const controller = require('./admin.controller');
const { authenticate, requireRoles } = require('../../middlewares/auth');

const router = express.Router();
const adminOnly = requireRoles('ADMIN');

router.use(authenticate, adminOnly);

// 1. Thống kê & Tổng quan
router.get('/stats', controller.getStats);

// 2. Báo cáo & Hàng đợi rủi ro (Risk Queue)
router.get('/reports', controller.listReports);
router.patch('/reports/:id', controller.updateReport);
router.get('/flagged-documents', controller.listFlaggedDocuments);

// 3. Quản lý Tài liệu (Toàn diện)
router.get('/documents', controller.listAllDocuments);
router.patch('/documents/:id', controller.updateDocumentDetails);
router.patch('/documents/:id/status', controller.updateDocumentStatus);
router.delete('/documents/:id', controller.softDeleteDocument);
router.post('/documents/:id/restore', controller.restoreDocument);

// 4. Bình luận
router.patch('/comments/:id/status', controller.updateCommentStatus);

// 5. Quản lý Người dùng
router.get('/users', controller.listUsers);
router.post('/users', controller.createUser);
router.patch('/users/:id', controller.updateUserDetails);
router.patch('/users/:id/role', controller.updateUserRole);
router.patch('/users/:id/status', controller.updateUserStatus);
router.delete('/users/:id', controller.deleteUser);

// 6. Quản lý Danh mục & Đơn vị đào tạo (Catalogs)
router.get('/catalog/universities', controller.listUniversitiesAdmin);
router.post('/catalog/universities', controller.createUniversity);
router.patch('/catalog/universities/:id', controller.updateUniversity);
router.delete('/catalog/universities/:id', controller.deleteUniversity);

router.get('/catalog/faculties', controller.listFacultiesAdmin);
router.post('/catalog/faculties', controller.createFaculty);
router.patch('/catalog/faculties/:id', controller.updateFaculty);
router.delete('/catalog/faculties/:id', controller.deleteFaculty);

router.get('/catalog/subjects', controller.listSubjectsAdmin);
router.post('/catalog/subjects', controller.createSubject);
router.patch('/catalog/subjects/:id', controller.updateSubject);
router.delete('/catalog/subjects/:id', controller.deleteSubject);

router.get('/catalog/categories', controller.listCategoriesAdmin);
router.post('/catalog/categories', controller.createCategory);
router.patch('/catalog/categories/:id', controller.updateCategory);
router.delete('/catalog/categories/:id', controller.deleteCategory);

// 7. Nhật ký thanh tra & Bảo trì
router.get('/audit-logs', controller.listAuditLogs);
router.post('/purge-deleted', controller.triggerPurgeDeleted);

module.exports = router;
