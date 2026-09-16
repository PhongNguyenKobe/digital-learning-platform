const fs = require('fs/promises');
const path = require('path');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const asyncHandler = require('../../utils/asyncHandler');
const httpError = require('../../utils/httpError');
const slugify = require('../../utils/slug');
const { processDocumentJob } = require('../../services/documentProcessing.service');
const { watermarkThumbnail } = require('../../services/thumbnailWatermark.service');
const { watermarkPdf } = require('../../services/pdfWatermark.service');
const { createPdfCover } = require('../../services/pdfPreview.service');
const { canCreateOfficePreview, ensureOfficePdfPreview } = require('../../services/officePreview.service');
const { thumbnailDirectory, previewDirectory } = require('../../middlewares/upload');

const validDocumentTypes = new Set(['TEXTBOOK', 'EXAM', 'LECTURE_NOTE', 'SUMMARY', 'THESIS', 'RESEARCH_PAPER', 'ASSIGNMENT', 'OTHER']);
const validSortFields = new Set(['downloadCount', 'ratingAverage', 'createdAt', 'title']);
const mimeToFormat = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/zip': 'ZIP',
};

function currentAcademicYear() {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

function parsePositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function parseOptionalJson(value, fieldName) {
  if (!value) return undefined;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    throw httpError(400, `${fieldName} phải là JSON hợp lệ.`);
  }
}

function serialize(value) {
  return JSON.parse(JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? item.toString() : item)));
}

function sendOfficePreviewUnavailable(res) {
  return res.status(503).set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }).type('html').send(`<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>Chưa thể xem trước</title></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f8fafc;color:#334155;display:grid;min-height:100vh;place-items:center;padding:24px;box-sizing:border-box">
  <main style="max-width:480px;text-align:center;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(15,23,42,.08)">
    <h1 style="margin:0 0 12px;color:#00288e;font-size:20px">Chưa thể tạo bản xem trước</h1>
    <p style="margin:0;line-height:1.6">Máy chủ chưa có LibreOffice để chuyển đổi DOCX/PPTX sang PDF. Bạn vẫn có thể tải file gốc về để xem.</p>
  </main>
</body></html>`);
}

async function uniqueSlug(title) {
  const base = slugify(title) || `document-${Date.now()}`;
  let slug = base;
  let suffix = 1;
  while (await prisma.document.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

const createDocument = asyncHandler(async (req, res) => {
  const documentFile = req.file || req.files?.file?.[0];
  let thumbnailFile = req.files?.thumbnail?.[0];

  if (!documentFile) {
    throw httpError(400, 'File tài liệu là bắt buộc và phải gửi bằng field `file`.');
  }

  const title = String(req.body.title || '').trim();
  const documentType = String(req.body.documentType || '').trim().toUpperCase();
  if (!title || title.length > 180) {
    await fs.unlink(documentFile.path).catch(() => {});
    if (thumbnailFile?.path) await fs.unlink(thumbnailFile.path).catch(() => {});
    throw httpError(400, 'Tiêu đề tài liệu là bắt buộc và tối đa 180 ký tự.');
  }
  if (!validDocumentTypes.has(documentType)) {
    await fs.unlink(documentFile.path).catch(() => {});
    if (thumbnailFile?.path) await fs.unlink(thumbnailFile.path).catch(() => {});
    throw httpError(400, 'documentType không hợp lệ.');
  }
  if (!req.body.universityId || !req.body.facultyId) {
    await fs.unlink(documentFile.path).catch(() => {});
    if (thumbnailFile?.path) await fs.unlink(thumbnailFile.path).catch(() => {});
    throw httpError(400, 'Trường Đại học và Khoa / Viện phụ trách là bắt buộc.');
  }
  const [university, faculty] = await Promise.all([
    prisma.university.findFirst({ where: { id: req.body.universityId, isActive: true }, select: { id: true } }),
    prisma.faculty.findFirst({ where: { id: req.body.facultyId, isActive: true, universityId: req.body.universityId }, select: { id: true } }),
  ]);
  if (!university || !faculty) {
    await fs.unlink(documentFile.path).catch(() => {});
    if (thumbnailFile?.path) await fs.unlink(thumbnailFile.path).catch(() => {});
    throw httpError(400, 'Trường hoặc Khoa / Viện không hợp lệ. Vui lòng chọn từ danh sách.');
  }

  const slug = await uniqueSlug(title);
  const status = env.publishImmediately ? 'PUBLISHED' : 'PENDING_REVIEW';
  const now = new Date();
  const fileFormat = mimeToFormat[documentFile.mimetype] || 'OTHER';
  if (fileFormat === 'PDF') await watermarkPdf(documentFile.path, req.user.fullName);
  if (!thumbnailFile && fileFormat === 'PDF') thumbnailFile = await createPdfCover(documentFile.path, thumbnailDirectory);
  const metadata = parseOptionalJson(req.body.metadata, 'metadata');
  const fileUrl = `/uploads/${path.basename(documentFile.path)}`;
  if (thumbnailFile) thumbnailFile = await watermarkThumbnail(thumbnailFile, title);
  const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${path.basename(thumbnailFile.path)}` : null;

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const document = await transaction.document.create({
        data: {
          uploaderId: req.user.id,
          universityId: req.body.universityId || undefined,
          facultyId: req.body.facultyId || undefined,
          subjectId: req.body.subjectId || undefined,
          title,
          slug,
          description: req.body.description || undefined,
          documentType,
          fileFormat,
          fileUrl,
          thumbnailUrl,
          originalFileName: documentFile.originalname,
          fileSizeBytes: BigInt(documentFile.size),
          pageCount: req.body.pageCount ? Number.parseInt(req.body.pageCount, 10) : undefined,
          academicYear: req.body.academicYear || currentAcademicYear(),
          language: req.body.language || 'vi',
          status,
          visibility: req.body.visibility || 'PUBLIC',
          isLocked: req.body.isLocked === 'true' || req.body.isLocked === true,
          publishedAt: status === 'PUBLISHED' ? now : undefined,
          isVerified: false,
          processingStatus: 'QUEUED',
          metadata,
        },
      });
      const job = await transaction.documentProcessingJob.create({
        data: { documentId: document.id, requestedById: req.user.id, status: 'QUEUED', scanStatus: 'PENDING' },
      });
      await transaction.documentVersion.create({
        data: {
          documentId: document.id,
          createdById: req.user.id,
          versionNumber: 1,
          fileUrl,
          originalFileName: documentFile.originalname,
          fileFormat,
          fileSizeBytes: BigInt(documentFile.size),
          pageCount: document.pageCount,
          changeNote: 'Phiên bản đầu tiên.',
        },
      });
      if (req.body.categoryId) {
        await transaction.documentCategory.create({ data: { documentId: document.id, categoryId: req.body.categoryId } });
      }

      // Thưởng +2 credit cho uploader theo mô hình Give to Get của StuDocu
      const updatedUser = await transaction.user.update({
        where: { id: req.user.id },
        data: { downloadCredits: { increment: 2 } },
        select: { downloadCredits: true },
      });

      // Nếu người dùng upload để mở khóa một tài liệu mục tiêu
      const targetUnlockId = req.body.targetUnlockId || req.query.unlockTargetDocumentId;
      if (targetUnlockId) {
        await transaction.documentUnlock.upsert({
          where: { userId_documentId: { userId: req.user.id, documentId: targetUnlockId } },
          create: { userId: req.user.id, documentId: targetUnlockId, unlockType: 'UPLOAD' },
          update: {},
        });
      }

      return { document, job, newCredits: updatedUser.downloadCredits };
    });

    processDocumentJob(result.job.id);
    res.status(201).json({
      data: serialize({
        ...result.document,
        processingJobId: result.job.id,
        awardedCredits: 2,
        newCredits: result.newCredits,
      }),
    });
  } catch (error) {
    await fs.unlink(documentFile.path).catch(() => {});
    if (thumbnailFile?.path) {
      await fs.unlink(thumbnailFile.path).catch(() => {});
    }
    throw error;
  }
});


const listDocuments = asyncHandler(async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1, 100000);
  const limit = parsePositiveInt(req.query.limit, 20, 100);
  const skip = (page - 1) * limit;
  const sortBy = validSortFields.has(req.query.sortBy) ? req.query.sortBy : 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
  const where = {
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    deletedAt: null,
    ...(req.query.documentType ? { documentType: String(req.query.documentType).toUpperCase() } : {}),
    ...(req.query.subjectId ? { subjectId: req.query.subjectId } : {}),
    ...(req.query.universityId ? { universityId: req.query.universityId } : {}),
    ...(req.query.facultyId ? { facultyId: req.query.facultyId } : {}),
    ...(req.query.q ? { title: { contains: String(req.query.q).trim(), mode: 'insensitive' } } : {}),
  };

  const [documents, total] = await prisma.$transaction([
    prisma.document.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        documentType: true,
        fileFormat: true,
        thumbnailUrl: true,
        pageCount: true,
        academicYear: true,
        status: true,
        visibility: true,
        isLocked: true,
        downloadCount: true,
        viewCount: true,
        ratingAverage: true,
        ratingCount: true,
        createdAt: true,
        uploader: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        university: { select: { id: true, code: true, name: true, shortName: true } },
        faculty: { select: { id: true, name: true } },
        subject: { select: { id: true, code: true, name: true } },
        categories: { include: { category: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);

  res.json({ data: serialize(documents), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const listUniversities = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  const universities = await prisma.university.findMany({
    where: { isActive: true, ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { code: { contains: query, mode: 'insensitive' } }, { shortName: { contains: query, mode: 'insensitive' } }] } : {}) },
    orderBy: { name: 'asc' },
    select: { id: true, code: true, name: true, shortName: true },
  });
  res.json({ data: universities });
});

const listFaculties = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  const faculties = await prisma.faculty.findMany({
    where: { isActive: true, ...(req.query.universityId ? { universityId: req.query.universityId } : {}), ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { code: { contains: query, mode: 'insensitive' } }] } : {}) },
    orderBy: { name: 'asc' },
    select: { id: true, code: true, name: true, universityId: true },
  });
  res.json({ data: faculties });
});

const listSubjects = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  const subjects = await prisma.subject.findMany({
    where: { isActive: true, ...(req.query.facultyId ? { facultyId: req.query.facultyId } : {}), ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { code: { contains: query, mode: 'insensitive' } }] } : {}) },
    orderBy: { code: 'asc' },
    select: { id: true, code: true, name: true, facultyId: true },
  });
  res.json({ data: subjects });
});

const getDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: { id: req.params.id, deletedAt: null, status: 'PUBLISHED', visibility: 'PUBLIC' },
    include: {
      uploader: { select: { id: true, fullName: true, username: true, avatarUrl: true, bio: true } },
      university: { select: { id: true, code: true, name: true, shortName: true, logoUrl: true } },
      faculty: { select: { id: true, name: true } },
      subject: { select: { id: true, code: true, name: true, credits: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
    },
  });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu công khai.');

  let isUnlocked = !document.isLocked;
  let canViewFull = !document.isLocked;

  if (req.user) {
    if (req.user.role === 'ADMIN' || req.user.id === document.uploaderId) {
      isUnlocked = true;
      canViewFull = true;
    } else if (req.user.isPremium && (!req.user.premiumExpiresAt || new Date(req.user.premiumExpiresAt) > new Date())) {
      isUnlocked = true;
      canViewFull = true;
    } else if (document.isLocked) {
      const unlock = await prisma.documentUnlock.findUnique({
        where: { userId_documentId: { userId: req.user.id, documentId: document.id } },
      });
      if (unlock) {
        isUnlocked = true;
        canViewFull = true;
      }
    }
  }

  res.json({
    data: serialize({
      ...document,
      isUnlocked,
      canViewFull,
    }),
  });
});

const streamDocumentContent = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: { id: req.params.id, deletedAt: null, status: 'PUBLISHED', visibility: 'PUBLIC' },
    select: { id: true, fileUrl: true, originalFileName: true, fileFormat: true, isLocked: true, uploaderId: true },
  });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu công khai.');

  let canView = !document.isLocked;
  if (document.isLocked && req.user) {
    const isOwnerOrAdmin = req.user.role === 'ADMIN' || req.user.id === document.uploaderId;
    const hasPremium = req.user.isPremium && (!req.user.premiumExpiresAt || new Date(req.user.premiumExpiresAt) > new Date());
    const unlock = !isOwnerOrAdmin && !hasPremium
      ? await prisma.documentUnlock.findUnique({ where: { userId_documentId: { userId: req.user.id, documentId: document.id } } })
      : true;
    canView = Boolean(isOwnerOrAdmin || hasPremium || unlock);
  }
  if (!canView) throw httpError(403, 'Tài liệu này cần được mở khóa trước khi đọc toàn bộ.');

  const filePath = path.resolve(process.cwd(), env.uploadDir, path.basename(document.fileUrl));
  try { await fs.access(filePath); } catch { throw httpError(404, 'File tài liệu chưa tồn tại trên storage.'); }
  const mimeType = Object.entries(mimeToFormat).find(([, format]) => format === document.fileFormat)?.[0] || 'application/octet-stream';
  res.set({ 'Content-Type': mimeType, 'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(document.originalFileName)}`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': document.isLocked ? 'private, no-store' : 'private, max-age=300' });
  return res.sendFile(filePath);
});

const streamOfficePreviewContent = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: { id: req.params.id, deletedAt: null, status: 'PUBLISHED', visibility: 'PUBLIC' },
    select: { id: true, fileUrl: true, originalFileName: true, fileFormat: true, isLocked: true, uploaderId: true },
  });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu công khai.');
  if (!canCreateOfficePreview(document.fileFormat)) throw httpError(415, 'Định dạng này chưa hỗ trợ xem trước trực tuyến.');

  let canView = !document.isLocked;
  if (document.isLocked && req.user) {
    const isOwnerOrAdmin = req.user.role === 'ADMIN' || req.user.id === document.uploaderId;
    const hasPremium = req.user.isPremium && (!req.user.premiumExpiresAt || new Date(req.user.premiumExpiresAt) > new Date());
    const unlock = !isOwnerOrAdmin && !hasPremium
      ? await prisma.documentUnlock.findUnique({ where: { userId_documentId: { userId: req.user.id, documentId: document.id } } })
      : true;
    canView = Boolean(isOwnerOrAdmin || hasPremium || unlock);
  }
  if (!canView) throw httpError(403, 'Tài liệu này cần được mở khóa trước khi đọc toàn bộ.');

  const sourcePath = path.resolve(process.cwd(), env.uploadDir, path.basename(document.fileUrl));
  try { await fs.access(sourcePath); } catch { throw httpError(404, 'File tài liệu chưa tồn tại trên storage.'); }

  let previewPath;
  try {
    previewPath = await ensureOfficePdfPreview({ documentId: document.id, fileFormat: document.fileFormat, sourcePath, previewDirectory });
  } catch (error) {
    console.error('[Office preview] Conversion failed:', error.message);
    return sendOfficePreviewUnavailable(res);
  }
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(`${path.parse(document.originalFileName).name}.pdf`)}`,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': document.isLocked ? 'private, no-store' : 'private, max-age=300',
  });
  return res.sendFile(previewPath);
});

const previewDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({ where: { id: req.params.id, deletedAt: null, status: 'PUBLISHED', visibility: 'PUBLIC' }, select: { id: true, title: true, fileUrl: true, fileFormat: true, thumbnailUrl: true } });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu công khai.');
  let thumbnailUrl = document.thumbnailUrl;
  if (!thumbnailUrl && (document.fileFormat === 'PDF' || canCreateOfficePreview(document.fileFormat))) {
    const sourcePath = path.resolve(process.cwd(), env.uploadDir, path.basename(document.fileUrl));
    let previewSourcePath = sourcePath;
    if (canCreateOfficePreview(document.fileFormat)) {
      try {
        previewSourcePath = await ensureOfficePdfPreview({ documentId: document.id, fileFormat: document.fileFormat, sourcePath, previewDirectory });
      } catch (error) {
        console.error('[Office preview] Cover conversion failed:', error.message);
        return sendOfficePreviewUnavailable(res);
      }
    }
    const cover = await createPdfCover(previewSourcePath, thumbnailDirectory);
    if (cover) {
      const watermarked = await watermarkThumbnail(cover, document.title);
      thumbnailUrl = `/uploads/thumbnails/${watermarked.filename}`;
      await prisma.document.update({ where: { id: document.id }, data: { thumbnailUrl } });
    }
  }
  if (!thumbnailUrl) throw httpError(404, 'Chưa thể tạo bản xem trước cho định dạng này.');
  const previewPath = path.resolve(thumbnailDirectory, path.basename(thumbnailUrl));
  try { await fs.access(previewPath); } catch { throw httpError(404, 'Ảnh xem trước chưa tồn tại trên storage.'); }
  res.set({ 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=604800, immutable', 'X-Content-Type-Options': 'nosniff' });
  return res.sendFile(previewPath);
});

const unlockDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: { id: req.params.id, deletedAt: null, status: 'PUBLISHED' },
    select: { id: true, title: true, isLocked: true, uploaderId: true },
  });
  if (!document) throw httpError(404, 'Tài liệu không tồn tại hoặc chưa công khai.');

  if (!document.isLocked) {
    return res.json({ data: { message: 'Tài liệu này hoàn toàn miễn phí, không cần mở khóa.', unlocked: true } });
  }

  const existingUnlock = await prisma.documentUnlock.findUnique({
    where: { userId_documentId: { userId: req.user.id, documentId: document.id } },
  });
  if (existingUnlock) {
    return res.json({ data: { message: 'Bạn đã mở khóa tài liệu này trước đó.', unlocked: true } });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, role: true, downloadCredits: true, isPremium: true, premiumExpiresAt: true },
  });

  const hasActivePremium = user.isPremium && (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());
  if (user.role === 'ADMIN' || user.id === document.uploaderId || hasActivePremium) {
    await prisma.documentUnlock.create({
      data: { userId: req.user.id, documentId: document.id, unlockType: hasActivePremium ? 'PREMIUM' : 'ADMIN' },
    });
    return res.json({
      data: {
        message: 'Mở khóa thành công với đặc quyền tài khoản của bạn.',
        unlocked: true,
        remainingCredits: user.downloadCredits,
      },
    });
  }

  if (user.downloadCredits < 1) {
    throw httpError(403, 'Bạn đã hết lượt tải (0 Credit). Vui lòng đăng tải 1 tài liệu học tập mới (Give-to-Get) hoặc nâng cấp gói Premium VIP để mở khóa.');
  }

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: req.user.id },
      data: { downloadCredits: { decrement: 1 } },
      select: { downloadCredits: true },
    }),
    prisma.documentUnlock.create({
      data: { userId: req.user.id, documentId: document.id, unlockType: 'CREDIT' },
    }),
  ]);

  res.json({
    data: {
      message: 'Mở khóa tài liệu thành công!',
      unlocked: true,
      remainingCredits: updatedUser.downloadCredits,
    },
  });
});

const listMyDocuments = asyncHandler(async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1, 100000);
  const limit = parsePositiveInt(req.query.limit, 20, 100);
  const where = { uploaderId: req.user.id, deletedAt: null };
  const [documents, total] = await prisma.$transaction([
    prisma.document.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, documentType: true, fileFormat: true,
        thumbnailUrl: true, isLocked: true,
        status: true, processingStatus: true, pageCount: true, downloadCount: true,
        viewCount: true, ratingAverage: true, ratingCount: true, createdAt: true,
        publishedAt: true, rejectionReason: true,
        university: { select: { id: true, shortName: true, name: true } },
        subject: { select: { id: true, code: true, name: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);
  res.json({ data: serialize(documents), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const updateMyDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: { id: req.params.id, deletedAt: null },
  });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu.');
  if (document.uploaderId !== req.user.id && req.user.role !== 'ADMIN') {
    throw httpError(403, 'Bạn không có quyền chỉnh sửa tài liệu này.');
  }

  const {
    title,
    description,
    universityId,
    facultyId,
    subjectId,
    documentType,
    visibility,
    academicYear,
    categoryId,
    isLocked,
  } = req.body;

  const data = {};
  if (isLocked !== undefined) data.isLocked = Boolean(isLocked);
  if (title !== undefined) {
    const trimmed = String(title).trim();
    if (!trimmed) throw httpError(400, 'Tiêu đề không được để trống.');
    data.title = trimmed;
    if (trimmed !== document.title) {
      data.slug = await uniqueSlug(trimmed);
    }
  }
  if (description !== undefined) data.description = String(description).trim();
  if (academicYear !== undefined) data.academicYear = String(academicYear).trim();
  if (documentType !== undefined) {
    if (validDocumentTypes.has(documentType)) data.documentType = documentType;
  }
  if (visibility !== undefined) {
    if (['PUBLIC', 'UNLISTED', 'PRIVATE'].includes(visibility)) data.visibility = visibility;
  }
  if (universityId !== undefined) data.universityId = universityId || null;
  if (facultyId !== undefined) data.facultyId = facultyId || null;
  if (subjectId !== undefined) data.subjectId = subjectId || null;

  const updated = await prisma.document.update({
    where: { id: req.params.id },
    data,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      documentType: true,
      fileFormat: true,
      thumbnailUrl: true,
      status: true,
      processingStatus: true,
      visibility: true,
      academicYear: true,
      pageCount: true,
      downloadCount: true,
      viewCount: true,
      ratingAverage: true,
      ratingCount: true,
      createdAt: true,
      updatedAt: true,
      university: { select: { id: true, shortName: true, name: true } },
      faculty: { select: { id: true, name: true } },
      subject: { select: { id: true, code: true, name: true } },
    },
  });

  if (categoryId !== undefined) {
    await prisma.documentCategory.deleteMany({ where: { documentId: req.params.id } });
    if (categoryId) {
      await prisma.documentCategory.create({ data: { documentId: req.params.id, categoryId } });
    }
  }

  res.json({ data: serialize(updated), message: 'Cập nhật tài liệu thành công.' });
});

const deleteMyDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: { id: req.params.id, deletedAt: null },
  });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu.');
  if (document.uploaderId !== req.user.id && req.user.role !== 'ADMIN') {
    throw httpError(403, 'Bạn không có quyền xóa tài liệu này.');
  }

  await prisma.document.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date(), status: 'ARCHIVED' },
  });

  res.json({ message: 'Đã xóa tài liệu thành công.' });
});

const listMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id, document: { deletedAt: null } },
    orderBy: { createdAt: 'desc' },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          slug: true,
          documentType: true,
          fileFormat: true,
          thumbnailUrl: true,
          status: true,
          pageCount: true,
          downloadCount: true,
          viewCount: true,
          ratingAverage: true,
          ratingCount: true,
          createdAt: true,
          uploader: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          university: { select: { id: true, shortName: true, name: true } },
          subject: { select: { id: true, code: true, name: true } },
        },
      },
    },
  });
  const data = favorites.map((f) => ({
    ...f.document,
    favoritedAt: f.createdAt,
  }));
  res.json({ data: serialize(data) });
});

const listMyDownloads = asyncHandler(async (req, res) => {
  const downloads = await prisma.download.findMany({
    where: { userId: req.user.id, document: { deletedAt: null } },
    orderBy: { createdAt: 'desc' },
    distinct: ['documentId'],
    take: 50,
    include: {
      document: {
        select: {
          id: true,
          title: true,
          slug: true,
          documentType: true,
          fileFormat: true,
          thumbnailUrl: true,
          status: true,
          pageCount: true,
          downloadCount: true,
          viewCount: true,
          ratingAverage: true,
          ratingCount: true,
          createdAt: true,
          uploader: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          university: { select: { id: true, shortName: true, name: true } },
          subject: { select: { id: true, code: true, name: true } },
        },
      },
    },
  });
  const data = downloads.map((d) => ({
    ...d.document,
    downloadedAt: d.createdAt,
  }));
  res.json({ data: serialize(data) });
});

module.exports = {
  createDocument,
  listDocuments,
  getDocument,
  streamDocumentContent,
  streamOfficePreviewContent,
  previewDocument,
  unlockDocument,
  listMyDocuments,
  updateMyDocument,
  deleteMyDocument,
  listMyFavorites,
  listMyDownloads,
  listUniversities,
  listFaculties,
  listSubjects,
};
