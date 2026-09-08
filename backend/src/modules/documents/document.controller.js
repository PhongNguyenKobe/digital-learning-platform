const fs = require('fs/promises');
const path = require('path');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const asyncHandler = require('../../utils/asyncHandler');
const httpError = require('../../utils/httpError');
const slugify = require('../../utils/slug');
const { processDocumentJob } = require('../../services/documentProcessing.service');

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
  if (!req.file) {
    throw httpError(400, 'File tài liệu là bắt buộc và phải gửi bằng field `file`.');
  }

  const title = String(req.body.title || '').trim();
  const documentType = String(req.body.documentType || '').trim().toUpperCase();
  if (!title || title.length > 180) {
    await fs.unlink(req.file.path).catch(() => {});
    throw httpError(400, 'Tiêu đề tài liệu là bắt buộc và tối đa 180 ký tự.');
  }
  if (!validDocumentTypes.has(documentType)) {
    await fs.unlink(req.file.path).catch(() => {});
    throw httpError(400, 'documentType không hợp lệ.');
  }

  const slug = await uniqueSlug(title);
  const status = env.publishImmediately ? 'PUBLISHED' : 'PENDING_REVIEW';
  const now = new Date();
  const fileFormat = mimeToFormat[req.file.mimetype] || 'OTHER';
  const metadata = parseOptionalJson(req.body.metadata, 'metadata');
  const fileUrl = `/uploads/${path.basename(req.file.path)}`;

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
          originalFileName: req.file.originalname,
          fileSizeBytes: BigInt(req.file.size),
          pageCount: req.body.pageCount ? Number.parseInt(req.body.pageCount, 10) : undefined,
          academicYear: req.body.academicYear || undefined,
          language: req.body.language || 'vi',
          status,
          visibility: req.body.visibility || 'PUBLIC',
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
          originalFileName: req.file.originalname,
          fileFormat,
          fileSizeBytes: BigInt(req.file.size),
          pageCount: document.pageCount,
          changeNote: 'Phiên bản đầu tiên.',
        },
      });
      if (req.body.categoryId) {
        await transaction.documentCategory.create({ data: { documentId: document.id, categoryId: req.body.categoryId } });
      }
      return { document, job };
    });

    processDocumentJob(result.job.id);
    res.status(201).json({ data: serialize({ ...result.document, processingJobId: result.job.id }) });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
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

module.exports = { createDocument, listDocuments };
