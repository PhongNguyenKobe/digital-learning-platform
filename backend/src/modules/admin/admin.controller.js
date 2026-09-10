const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');
const httpError = require('../../utils/httpError');
const { purgeExpiredRecords } = require('../../services/purge.service');

const documentStatuses = new Set(['PUBLISHED', 'REJECTED', 'ARCHIVED', 'PENDING_REVIEW']);
const reportStatuses = new Set(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']);
const userRoles = new Set(['STUDENT', 'ADMIN']);
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

// 1. Thống kê tổng hợp Dashboard
const getStats = asyncHandler(async (req, res) => {
  const [
    totalDocuments,
    publishedDocuments,
    pendingDocuments,
    rejectedDocuments,
    archivedDocuments,
    flaggedDocuments,
    openReports,
    totalUsers,
    totalDownloadsAgg,
    totalViewsAgg,
  ] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    prisma.document.count({ where: { status: 'PENDING_REVIEW', deletedAt: null } }),
    prisma.document.count({ where: { status: 'REJECTED', deletedAt: null } }),
    prisma.document.count({ where: { deletedAt: { not: null } } }),
    prisma.document.count({ where: { deletedAt: null, reports: { some: { status: { in: ['OPEN', 'IN_REVIEW'] } } } } }),
    prisma.report.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
    prisma.user.count(),
    prisma.document.aggregate({ _sum: { downloadCount: true } }),
    prisma.document.aggregate({ _sum: { viewCount: true } }),
  ]);

  res.json({
    data: {
      totalDocuments,
      publishedDocuments,
      pendingDocuments,
      rejectedDocuments,
      archivedDocuments,
      flaggedDocuments,
      openReports,
      totalUsers,
      totalDownloads: totalDownloadsAgg._sum.downloadCount || 0,
      totalViews: totalViewsAgg._sum.viewCount || 0,
    },
  });
});

// 2. Danh sách báo cáo
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
        document: { select: { id: true, title: true, slug: true, status: true, fileFormat: true, pageCount: true, uploader: { select: { id: true, fullName: true, email: true } } } },
        comment: { select: { id: true, content: true, status: true, documentId: true, author: { select: { id: true, fullName: true } } } },
      },
    }),
    prisma.report.count({ where }),
  ]);
  res.json({ data: serialize(reports), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// 3. Danh sách tài liệu bị gắn cờ rủi ro (Risk Queue)
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
      uploader: { select: { id: true, fullName: true, email: true, username: true } },
      university: { select: { id: true, name: true, shortName: true } },
      faculty: { select: { id: true, name: true } },
      reports: { where: { status: { in: ['OPEN', 'IN_REVIEW'] } }, orderBy: { createdAt: 'desc' }, include: { reporter: { select: { id: true, fullName: true } } } },
    },
  });
  const total = await prisma.document.count({ where: { deletedAt: null, reports: { some: { status: { in: ['OPEN', 'IN_REVIEW'] } } } } });
  res.json({ data: serialize(documents), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// 4. Danh sách toàn bộ tài liệu (Document Management)
const listAllDocuments = asyncHandler(async (req, res) => {
  const page = pageValue(req.query.page, 1, 100000);
  const limit = pageValue(req.query.limit, 20, 100);
  const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
  const documentType = req.query.documentType ? String(req.query.documentType).toUpperCase() : undefined;
  const q = req.query.q ? String(req.query.q).trim() : undefined;
  const isDeleted = req.query.isDeleted === 'true';

  const where = {
    ...(isDeleted ? { deletedAt: { not: null } } : status === 'ARCHIVED' ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(status && status !== 'ALL' && status !== 'ARCHIVED' ? { status } : {}),
    ...(documentType ? { documentType } : {}),
    ...(req.query.universityId ? { universityId: req.query.universityId } : {}),
    ...(q ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { originalFileName: { contains: q, mode: 'insensitive' } },
        { uploader: { fullName: { contains: q, mode: 'insensitive' } } },
      ]
    } : {}),
  };

  const [documents, total] = await prisma.$transaction([
    prisma.document.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, fullName: true, email: true, username: true } },
        university: { select: { id: true, name: true, shortName: true } },
        faculty: { select: { id: true, name: true } },
        subject: { select: { id: true, code: true, name: true } },
        _count: { select: { reports: true, comments: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);

  res.json({ data: serialize(documents), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// 5. Cập nhật chi tiết tài liệu (Admin Edit)
const updateDocumentDetails = asyncHandler(async (req, res) => {
  const document = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu.');

  const { title, documentType, description, universityId, facultyId, subjectId, visibility, isVerified, status } = req.body;

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.document.update({
      where: { id: document.id },
      data: {
        ...(title ? { title: String(title).trim() } : {}),
        ...(documentType ? { documentType: String(documentType).toUpperCase() } : {}),
        ...(description !== undefined ? { description: String(description || '') } : {}),
        ...(universityId !== undefined ? { universityId: universityId || null } : {}),
        ...(facultyId !== undefined ? { facultyId: facultyId || null } : {}),
        ...(subjectId !== undefined ? { subjectId: subjectId || null } : {}),
        ...(visibility ? { visibility: String(visibility).toUpperCase() } : {}),
        ...(isVerified !== undefined ? { isVerified: Boolean(isVerified) } : {}),
        ...(status && documentStatuses.has(status.toUpperCase()) ? { status: status.toUpperCase() } : {}),
      },
    });
    await writeAudit(tx, req.user.id, 'UPDATE_DETAILS', 'DOCUMENT', document.id, req.body);
    return saved;
  });

  res.json({ data: serialize(updated) });
});

// 6. Cập nhật trạng thái duyệt tài liệu (PUBLISHED, REJECTED, v.v.)
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

// 7. Xóa mềm & Khôi phục tài liệu
const softDeleteDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({ where: { id: req.params.id, deletedAt: null }, select: { id: true } });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu đang hoạt động.');
  await prisma.$transaction(async (tx) => {
    await tx.document.update({ where: { id: document.id }, data: { deletedAt: new Date(), status: 'ARCHIVED', visibility: 'PRIVATE' } });
    await writeAudit(tx, req.user.id, 'SOFT_DELETE', 'DOCUMENT', document.id, {});
  });
  res.json({ data: { id: document.id, message: 'Đã chuyển tài liệu vào thùng rác trong 30 ngày.' } });
});

const restoreDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({ where: { id: req.params.id, deletedAt: { not: null } }, select: { id: true } });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu trong thùng rác.');
  await prisma.$transaction(async (tx) => {
    await tx.document.update({ where: { id: document.id }, data: { deletedAt: null, status: 'PENDING_REVIEW', visibility: 'PUBLIC' } });
    await writeAudit(tx, req.user.id, 'RESTORE', 'DOCUMENT', document.id, {});
  });
  res.json({ data: { id: document.id, message: 'Đã khôi phục tài liệu và đưa vào hàng chờ duyệt.' } });
});

// 8. Cập nhật báo cáo & bình luận
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

// 9. Quản trị Người dùng (User Management)
const listUsers = asyncHandler(async (req, res) => {
  const page = pageValue(req.query.page, 1, 100000);
  const limit = pageValue(req.query.limit, 20, 100);
  const where = {
    ...(req.query.role ? { role: String(req.query.role).toUpperCase() } : {}),
    ...(req.query.status ? { status: String(req.query.status).toUpperCase() } : {}),
    ...(req.query.q ? { OR: [{ email: { contains: String(req.query.q), mode: 'insensitive' } }, { fullName: { contains: String(req.query.q), mode: 'insensitive' } }, { username: { contains: String(req.query.q), mode: 'insensitive' } }] } : {}),
  };
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, username: true, fullName: true, avatarUrl: true, role: true, status: true,
        createdAt: true, lastLoginAt: true, university: { select: { id: true, name: true, shortName: true } }, faculty: { select: { id: true, name: true } },
        _count: { select: { uploadedDocuments: true, comments: true, reports: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const createUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const fullName = String(req.body.fullName || '').trim();
  const password = req.body.password || 'MatKhau@123456';
  const role = String(req.body.role || 'STUDENT').toUpperCase();
  const status = String(req.body.status || 'ACTIVE').toUpperCase();

  if (!email || !email.includes('@')) throw httpError(400, 'Email không hợp lệ.');
  if (!fullName) throw httpError(400, 'Họ và tên là bắt buộc.');
  if (!userRoles.has(role)) throw httpError(400, 'Role không hợp lệ.');

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) throw httpError(409, 'Email này đã tồn tại trong hệ thống.');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      username: req.body.username ? String(req.body.username).trim() : undefined,
      passwordHash,
      role,
      status,
      universityId: req.body.universityId || undefined,
      facultyId: req.body.facultyId || undefined,
    },
    select: {
      id: true, email: true, fullName: true, username: true, role: true, status: true,
      university: { select: { id: true, name: true } },
      createdAt: true,
    },
  });

  await writeAudit(prisma, req.user.id, 'CREATE', 'USER', user.id, { email, role, status });
  res.status(201).json({ data: user });
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw httpError(404, 'Không tìm thấy người dùng.');

  const { fullName, email, role, status, universityId, facultyId } = req.body;
  if (role && !userRoles.has(role.toUpperCase())) throw httpError(400, 'Role không hợp lệ.');
  if (status && !userStatuses.has(status.toUpperCase())) throw httpError(400, 'Status không hợp lệ.');

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.user.update({
      where: { id: user.id },
      data: {
        ...(fullName ? { fullName: String(fullName).trim() } : {}),
        ...(email ? { email: String(email).trim().toLowerCase() } : {}),
        ...(role ? { role: role.toUpperCase() } : {}),
        ...(status ? { status: status.toUpperCase(), deletedAt: status === 'DELETED' ? new Date() : null } : {}),
        ...(universityId !== undefined ? { universityId: universityId || null } : {}),
        ...(facultyId !== undefined ? { facultyId: facultyId || null } : {}),
      },
      select: { id: true, email: true, fullName: true, role: true, status: true, universityId: true, facultyId: true },
    });
    if (status && status !== 'ACTIVE') {
      await tx.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    await writeAudit(tx, req.user.id, 'UPDATE', 'USER', user.id, req.body);
    return saved;
  });

  res.json({ data: updated });
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

const deleteUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw httpError(404, 'Không tìm thấy người dùng.');
  if (user.id === req.user.id) throw httpError(400, 'Không thể tự xóa tài khoản của chính mình.');

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { status: 'DELETED', deletedAt: new Date() } });
    await tx.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await writeAudit(tx, req.user.id, 'DELETE', 'USER', user.id, {});
  });

  res.json({ data: { id: user.id, message: 'Đã xóa tài khoản vào thùng rác.' } });
});

// 10. CRUD Trường học (Universities)
const listUniversitiesAdmin = asyncHandler(async (req, res) => {
  const q = req.query.q ? String(req.query.q).trim() : '';
  const universities = await prisma.university.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }, { shortName: { contains: q, mode: 'insensitive' } }] } : {},
    orderBy: { name: 'asc' },
    include: { _count: { select: { faculties: true, documents: true, users: true } } },
  });
  res.json({ data: universities });
});

const createUniversity = asyncHandler(async (req, res) => {
  const { name, code, shortName, website, logoUrl } = req.body;
  if (!name || !code) throw httpError(400, 'Tên trường và mã trường là bắt buộc.');
  const existing = await prisma.university.findUnique({ where: { code: String(code).trim().toUpperCase() } });
  if (existing) throw httpError(409, 'Mã trường này đã tồn tại.');

  const created = await prisma.university.create({
    data: {
      name: String(name).trim(),
      code: String(code).trim().toUpperCase(),
      shortName: shortName ? String(shortName).trim() : null,
      website: website ? String(website).trim() : null,
      logoUrl: logoUrl ? String(logoUrl).trim() : null,
    },
  });
  await writeAudit(prisma, req.user.id, 'CREATE', 'UNIVERSITY', created.id, req.body);
  res.status(201).json({ data: created });
});

const updateUniversity = asyncHandler(async (req, res) => {
  const { name, shortName, website, logoUrl, isActive } = req.body;
  const updated = await prisma.university.update({
    where: { id: req.params.id },
    data: {
      ...(name ? { name: String(name).trim() } : {}),
      ...(shortName !== undefined ? { shortName: shortName ? String(shortName).trim() : null } : {}),
      ...(website !== undefined ? { website: website ? String(website).trim() : null } : {}),
      ...(logoUrl !== undefined ? { logoUrl: logoUrl ? String(logoUrl).trim() : null } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    },
  });
  await writeAudit(prisma, req.user.id, 'UPDATE', 'UNIVERSITY', updated.id, req.body);
  res.json({ data: updated });
});

const deleteUniversity = asyncHandler(async (req, res) => {
  await prisma.university.delete({ where: { id: req.params.id } });
  await writeAudit(prisma, req.user.id, 'DELETE', 'UNIVERSITY', req.params.id, {});
  res.json({ data: { id: req.params.id, message: 'Đã xóa trường đại học thành công.' } });
});

// 11. CRUD Khoa / Viện (Faculties)
const listFacultiesAdmin = asyncHandler(async (req, res) => {
  const universityId = req.query.universityId;
  const faculties = await prisma.faculty.findMany({
    where: universityId ? { universityId } : {},
    orderBy: { name: 'asc' },
    include: {
      university: { select: { id: true, name: true, shortName: true } },
      _count: { select: { subjects: true, documents: true } },
    },
  });
  res.json({ data: faculties });
});

const createFaculty = asyncHandler(async (req, res) => {
  const { universityId, name, code } = req.body;
  if (!universityId || !name) throw httpError(400, 'Trường đại học và Tên khoa là bắt buộc.');
  const created = await prisma.faculty.create({
    data: {
      universityId,
      name: String(name).trim(),
      code: code ? String(code).trim().toUpperCase() : null,
    },
  });
  await writeAudit(prisma, req.user.id, 'CREATE', 'FACULTY', created.id, req.body);
  res.status(201).json({ data: created });
});

const updateFaculty = asyncHandler(async (req, res) => {
  const { name, code, isActive } = req.body;
  const updated = await prisma.faculty.update({
    where: { id: req.params.id },
    data: {
      ...(name ? { name: String(name).trim() } : {}),
      ...(code !== undefined ? { code: code ? String(code).trim().toUpperCase() : null } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    },
  });
  await writeAudit(prisma, req.user.id, 'UPDATE', 'FACULTY', updated.id, req.body);
  res.json({ data: updated });
});

const deleteFaculty = asyncHandler(async (req, res) => {
  await prisma.faculty.delete({ where: { id: req.params.id } });
  await writeAudit(prisma, req.user.id, 'DELETE', 'FACULTY', req.params.id, {});
  res.json({ data: { id: req.params.id, message: 'Đã xóa khoa/viện.' } });
});

// 12. CRUD Môn học (Subjects)
const listSubjectsAdmin = asyncHandler(async (req, res) => {
  const facultyId = req.query.facultyId;
  const q = req.query.q ? String(req.query.q).trim() : '';
  const subjects = await prisma.subject.findMany({
    where: {
      ...(facultyId ? { facultyId } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }] } : {}),
    },
    orderBy: { code: 'asc' },
    include: {
      faculty: { select: { id: true, name: true, university: { select: { id: true, shortName: true } } } },
      _count: { select: { documents: true } },
    },
  });
  res.json({ data: subjects });
});

const createSubject = asyncHandler(async (req, res) => {
  const { facultyId, code, name, credits, description } = req.body;
  if (!code || !name) throw httpError(400, 'Mã môn học và Tên môn học là bắt buộc.');
  const created = await prisma.subject.create({
    data: {
      facultyId: facultyId || null,
      code: String(code).trim().toUpperCase(),
      name: String(name).trim(),
      credits: credits ? Number.parseInt(credits, 10) : null,
      description: description ? String(description).trim() : null,
    },
  });
  await writeAudit(prisma, req.user.id, 'CREATE', 'SUBJECT', created.id, req.body);
  res.status(201).json({ data: created });
});

const updateSubject = asyncHandler(async (req, res) => {
  const { code, name, credits, description, isActive } = req.body;
  const updated = await prisma.subject.update({
    where: { id: req.params.id },
    data: {
      ...(code ? { code: String(code).trim().toUpperCase() } : {}),
      ...(name ? { name: String(name).trim() } : {}),
      ...(credits !== undefined ? { credits: credits ? Number.parseInt(credits, 10) : null } : {}),
      ...(description !== undefined ? { description: description ? String(description).trim() : null } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    },
  });
  await writeAudit(prisma, req.user.id, 'UPDATE', 'SUBJECT', updated.id, req.body);
  res.json({ data: updated });
});

const deleteSubject = asyncHandler(async (req, res) => {
  await prisma.subject.delete({ where: { id: req.params.id } });
  await writeAudit(prisma, req.user.id, 'DELETE', 'SUBJECT', req.params.id, {});
  res.json({ data: { id: req.params.id, message: 'Đã xóa môn học.' } });
});

// 13. CRUD Danh mục (Categories)
const listCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { documents: true, children: true } },
    },
  });
  res.json({ data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, icon, parentId, sortOrder } = req.body;
  if (!name) throw httpError(400, 'Tên danh mục là bắt buộc.');
  const baseSlug = slug ? String(slug).trim() : name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const created = await prisma.category.create({
    data: {
      name: String(name).trim(),
      slug: baseSlug,
      description: description ? String(description).trim() : null,
      icon: icon ? String(icon).trim() : null,
      parentId: parentId || null,
      sortOrder: sortOrder ? Number.parseInt(sortOrder, 10) : 0,
    },
  });
  await writeAudit(prisma, req.user.id, 'CREATE', 'CATEGORY', created.id, req.body);
  res.status(201).json({ data: created });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, icon, parentId, sortOrder, isActive } = req.body;
  const updated = await prisma.category.update({
    where: { id: req.params.id },
    data: {
      ...(name ? { name: String(name).trim() } : {}),
      ...(slug ? { slug: String(slug).trim() } : {}),
      ...(description !== undefined ? { description: description ? String(description).trim() : null } : {}),
      ...(icon !== undefined ? { icon: icon ? String(icon).trim() : null } : {}),
      ...(parentId !== undefined ? { parentId: parentId || null } : {}),
      ...(sortOrder !== undefined ? { sortOrder: Number.parseInt(sortOrder, 10) } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    },
  });
  await writeAudit(prisma, req.user.id, 'UPDATE', 'CATEGORY', updated.id, req.body);
  res.json({ data: updated });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  await writeAudit(prisma, req.user.id, 'DELETE', 'CATEGORY', req.params.id, {});
  res.json({ data: { id: req.params.id, message: 'Đã xóa danh mục.' } });
});

// 14. Nhật ký thanh tra (Audit Logs)
const listAuditLogs = asyncHandler(async (req, res) => {
  const page = pageValue(req.query.page, 1, 100000);
  const limit = pageValue(req.query.limit, 30, 100);

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
    }),
    prisma.auditLog.count(),
  ]);

  res.json({ data: serialize(logs), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// 15. Dọn dẹp dữ liệu rác (Purge Trigger)
const triggerPurgeDeleted = asyncHandler(async (req, res) => {
  const retentionDays = Number.parseInt(req.body?.retentionDays || 30, 10);
  const result = await purgeExpiredRecords({ retentionDays: Number.isNaN(retentionDays) ? 30 : retentionDays });
  await writeAudit(prisma, req.user.id, 'PURGE_DELETED', 'SYSTEM', 'DATABASE', result);
  res.json({
    message: `Đã dọn dẹp thành công ${result.purgedDocumentsCount} tài liệu và ${result.purgedUsersCount} tài khoản quá hạn ${result.retentionDays} ngày.`,
    data: result,
  });
});

module.exports = {
  getStats,
  listReports,
  listFlaggedDocuments,
  listAllDocuments,
  updateDocumentDetails,
  updateDocumentStatus,
  softDeleteDocument,
  restoreDocument,
  updateReport,
  updateCommentStatus,
  listUsers,
  createUser,
  updateUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  listUniversitiesAdmin,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  listFacultiesAdmin,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  listSubjectsAdmin,
  createSubject,
  updateSubject,
  deleteSubject,
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  listAuditLogs,
  triggerPurgeDeleted,
};
