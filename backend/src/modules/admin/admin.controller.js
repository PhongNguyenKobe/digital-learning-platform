const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');
const httpError = require('../../utils/httpError');

const documentStatuses = new Set(['PUBLISHED', 'REJECTED', 'ARCHIVED', 'PENDING_REVIEW']);
const reportStatuses = new Set(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']);
const userRoles = new Set(['STUDENT', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN']);
const userStatuses = new Set(['ACTIVE', 'SUSPENDED', 'DELETED']);
const commentStatuses = new Set(['VISIBLE', 'HIDDEN', 'DELETED']);

function pageValue(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function serialize(value) {
  return JSON.parse(JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? item.toString() : item)));
}

async function writeAudit(transaction, userId, action, entityType, entityId, metadata) {
  await transaction.auditLog.create({ data: { userId, action, entityType, entityId, metadata } });
}

const listReports = asyncHandler(async (req, res) => {
  const page = pageValue(req.query.page, 1, 100000);
  const limit = pageValue(req.query.limit, 20, 100);
  const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
  if (status && !reportStatuses.has(status)) throw httpError(400, 'status report không hợp lệ.');

  const where = status ? { status } : { status: { in: ['OPEN', 'IN_REVIEW'] } };
  const [reports, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, email: true, fullName: true, username: true } },
        resolvedBy: { select: { id: true, fullName: true, username: true } },
        document: { select: { id: true, title: true, slug: true, status: true, uploader: { select: { id: true, fullName: true } } } },
        comment: { select: { id: true, content: true, status: true, documentId: true, author: { select: { id: true, fullName: true } } } },
      },
    }),
    prisma.report.count({ where }),
  ]);
  res.json({ data: serialize(reports), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const listFlaggedDocuments = asyncHandler(async (req, res) => {
  const page = pageValue(req.query.page, 1, 100000);
  const limit = pageValue(req.query.limit, 20, 100);
  const documents = await prisma.document.findMany({
    where: {
      deletedAt: null,
      reports: { some: { status: { in: ['OPEN', 'IN_REVIEW'] } } },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      uploader: { select: { id: true, fullName: true, email: true } },
      reports: { where: { status: { in: ['OPEN', 'IN_REVIEW'] } }, orderBy: { createdAt: 'desc' } },
    },
  });
  const total = await prisma.document.count({ where: { deletedAt: null, reports: { some: { status: { in: ['OPEN', 'IN_REVIEW'] } } } } });
  res.json({ data: serialize(documents), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const updateDocumentStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toUpperCase();
  if (!documentStatuses.has(status)) throw httpError(400, 'status tài liệu không hợp lệ.');
  const note = req.body.note ? String(req.body.note).trim().slice(0, 5000) : null;
  const document = await prisma.document.findUnique({ where: { id: req.params.id }, select: { id: true, title: true, uploaderId: true } });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu.');

  const decision = status === 'PUBLISHED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'CHANGES_REQUESTED';
  const updated = await prisma.$transaction(async (transaction) => {
    const saved = await transaction.document.update({
      where: { id: document.id },
      data: {
        status,
        isVerified: status === 'PUBLISHED',
        verifiedAt: status === 'PUBLISHED' ? new Date() : null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        rejectionReason: status === 'REJECTED' ? note : null,
      },
    });
    await transaction.documentReview.create({ data: { documentId: document.id, reviewerId: req.user.id, decision, note } });
    await transaction.notification.create({
      data: {
        recipientId: document.uploaderId,
        actorId: req.user.id,
        type: status === 'PUBLISHED' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
        title: status === 'PUBLISHED' ? 'Tài liệu đã được duyệt' : 'Tài liệu cần được xử lý',
        message: note || `Trạng thái tài liệu đã chuyển thành ${status}.`,
        documentId: document.id,
      },
    });
    await writeAudit(transaction, req.user.id, 'UPDATE_STATUS', 'DOCUMENT', document.id, { status, note });
    return saved;
  });
  res.json({ data: serialize(updated) });
});

const updateReport = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toUpperCase();
  if (!reportStatuses.has(status)) throw httpError(400, 'status report không hợp lệ.');
  const resolutionNote = req.body.resolutionNote ? String(req.body.resolutionNote).trim().slice(0, 5000) : null;
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) throw httpError(404, 'Không tìm thấy report.');

  const updated = await prisma.$transaction(async (transaction) => {
    const saved = await transaction.report.update({
      where: { id: report.id },
      data: {
        status,
        resolutionNote,
        resolvedById: ['RESOLVED', 'DISMISSED'].includes(status) ? req.user.id : null,
        resolvedAt: ['RESOLVED', 'DISMISSED'].includes(status) ? new Date() : null,
      },
    });
    await writeAudit(transaction, req.user.id, 'UPDATE_STATUS', 'REPORT', report.id, { status, resolutionNote });
    return saved;
  });
  res.json({ data: updated });
});

const updateCommentStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toUpperCase();
  if (!commentStatuses.has(status)) throw httpError(400, 'status bình luận không hợp lệ.');
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!comment) throw httpError(404, 'Không tìm thấy bình luận.');
  const updated = await prisma.$transaction(async (transaction) => {
    const saved = await transaction.comment.update({ where: { id: comment.id }, data: { status, deletedAt: status === 'DELETED' ? new Date() : null } });
    await writeAudit(transaction, req.user.id, 'UPDATE_STATUS', 'COMMENT', comment.id, { status });
    return saved;
  });
  res.json({ data: updated });
});

const listUsers = asyncHandler(async (req, res) => {
  const page = pageValue(req.query.page, 1, 100000);
  const limit = pageValue(req.query.limit, 20, 100);
  const where = {
    ...(req.query.role ? { role: String(req.query.role).toUpperCase() } : {}),
    ...(req.query.status ? { status: String(req.query.status).toUpperCase() } : {}),
    ...(req.query.q ? { OR: [{ email: { contains: String(req.query.q), mode: 'insensitive' } }, { fullName: { contains: String(req.query.q), mode: 'insensitive' } }] } : {}),
  };
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, username: true, fullName: true, avatarUrl: true, role: true, status: true,
        createdAt: true, lastLoginAt: true, university: { select: { id: true, name: true } }, faculty: { select: { id: true, name: true } },
        _count: { select: { uploadedDocuments: true, comments: true, reports: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const role = String(req.body.role || '').toUpperCase();
  if (!userRoles.has(role)) throw httpError(400, 'role không hợp lệ.');
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!user) throw httpError(404, 'Không tìm thấy user.');
  const updated = await prisma.$transaction(async (transaction) => {
    const saved = await transaction.user.update({ where: { id: user.id }, data: { role } });
    await writeAudit(transaction, req.user.id, 'UPDATE_ROLE', 'USER', user.id, { role });
    return saved;
  });
  res.json({ data: { id: updated.id, role: updated.role } });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toUpperCase();
  if (!userStatuses.has(status)) throw httpError(400, 'status user không hợp lệ.');
  if (req.params.id === req.user.id && status !== 'ACTIVE') throw httpError(400, 'Không thể tự khóa hoặc xóa tài khoản đang đăng nhập.');
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!user) throw httpError(404, 'Không tìm thấy user.');
  const updated = await prisma.$transaction(async (transaction) => {
    const saved = await transaction.user.update({ where: { id: user.id }, data: { status, deletedAt: status === 'DELETED' ? new Date() : null } });
    if (status !== 'ACTIVE') {
      await transaction.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    await writeAudit(transaction, req.user.id, 'UPDATE_STATUS', 'USER', user.id, { status });
    return saved;
  });
  res.json({ data: { id: updated.id, status: updated.status } });
});

module.exports = {
  listReports,
  listFlaggedDocuments,
  updateDocumentStatus,
  updateReport,
  updateCommentStatus,
  listUsers,
  updateUserRole,
  updateUserStatus,
};
