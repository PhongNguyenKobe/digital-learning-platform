const fs = require('fs/promises');
const path = require('path');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const asyncHandler = require('../../utils/asyncHandler');
const httpError = require('../../utils/httpError');

const reportReasons = new Set(['COPYRIGHT', 'INAPPROPRIATE', 'INCORRECT_INFORMATION', 'SPAM', 'BROKEN_FILE', 'OTHER']);

function serialize(value) {
  return JSON.parse(JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? item.toString() : item)));
}

async function getPublishedDocument(documentId) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, deletedAt: null, status: 'PUBLISHED', visibility: 'PUBLIC' },
  });
  if (!document) throw httpError(404, 'Không tìm thấy tài liệu công khai.');
  return document;
}

async function getDocument(documentId) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document || document.deletedAt) throw httpError(404, 'Không tìm thấy tài liệu.');
  return document;
}

function parsePage(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

const createComment = asyncHandler(async (req, res) => {
  await getPublishedDocument(req.params.id);
  const content = String(req.body.content || '').trim();
  if (!content || content.length > 5000) {
    throw httpError(400, 'Nội dung bình luận bắt buộc và tối đa 5000 ký tự.');
  }

  const parentId = req.body.parentId || null;
  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, documentId: req.params.id, status: 'VISIBLE' },
      select: { id: true },
    });
    if (!parent) throw httpError(400, 'Bình luận cha không tồn tại trong tài liệu này.');
  }

  const comment = await prisma.$transaction(async (transaction) => {
    const created = await transaction.comment.create({
      data: { documentId: req.params.id, authorId: req.user.id, parentId, content, status: 'VISIBLE' },
      include: { author: { select: { id: true, fullName: true, username: true, avatarUrl: true } } },
    });
    await transaction.document.update({ where: { id: req.params.id }, data: { commentCount: { increment: 1 } } });
    return created;
  });

  res.status(201).json({ data: comment });
});

const listComments = asyncHandler(async (req, res) => {
  await getPublishedDocument(req.params.id);
  const page = parsePage(req.query.page, 1, 100000);
  const limit = parsePage(req.query.limit, 20, 100);
  const where = { documentId: req.params.id, status: 'VISIBLE', parentId: req.query.replies === 'false' ? null : undefined };
  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        replies: {
          where: { status: 'VISIBLE' },
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, fullName: true, username: true, avatarUrl: true } } },
        },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  res.json({ data: comments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const upsertRating = asyncHandler(async (req, res) => {
  await getPublishedDocument(req.params.id);
  const score = Number(req.body.score);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw httpError(400, 'score phải là số nguyên từ 1 đến 5.');
  }
  const review = req.body.review ? String(req.body.review).trim().slice(0, 5000) : null;

  const rating = await prisma.$transaction(async (transaction) => {
    const savedRating = await transaction.rating.upsert({
      where: { documentId_userId: { documentId: req.params.id, userId: req.user.id } },
      create: { documentId: req.params.id, userId: req.user.id, score, review },
      update: { score, review },
    });
    const aggregate = await transaction.rating.aggregate({
      where: { documentId: req.params.id },
      _avg: { score: true },
      _count: { _all: true },
    });
    await transaction.document.update({
      where: { id: req.params.id },
      data: { ratingAverage: aggregate._avg.score || 0, ratingCount: aggregate._count._all },
    });
    return savedRating;
  });

  res.status(200).json({ data: rating });
});

const addFavorite = asyncHandler(async (req, res) => {
  await getPublishedDocument(req.params.id);
  const favorite = await prisma.favorite.upsert({
    where: { documentId_userId: { documentId: req.params.id, userId: req.user.id } },
    create: { documentId: req.params.id, userId: req.user.id },
    update: {},
  });
  res.status(201).json({ data: favorite });
});

const removeFavorite = asyncHandler(async (req, res) => {
  await getDocument(req.params.id);
  await prisma.favorite.deleteMany({ where: { documentId: req.params.id, userId: req.user.id } });
  res.status(204).send();
});

const downloadDocument = asyncHandler(async (req, res) => {
  const document = await getPublishedDocument(req.params.id);
  const relativeFilePath = document.fileUrl.replace(/^\/+/, '').replace(/^uploads[\\/]/, '');
  const filePath = path.resolve(process.cwd(), env.uploadDir, path.basename(relativeFilePath));
  try {
    await fs.access(filePath);
  } catch (error) {
    throw httpError(404, 'File tài liệu chưa tồn tại trên storage.');
  }

  await prisma.$transaction([
    prisma.download.create({
      data: {
        documentId: document.id,
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || null,
      },
    }),
    prisma.document.update({ where: { id: document.id }, data: { downloadCount: { increment: 1 } } }),
  ]);
  return res.download(filePath, document.originalFileName);
});

async function createReport(req, res, target) {
  const reason = String(req.body.reason || '').toUpperCase();
  if (!reportReasons.has(reason)) throw httpError(400, 'reason không hợp lệ.');
  const description = req.body.description ? String(req.body.description).trim().slice(0, 5000) : null;
  const data = { reporterId: req.user.id, reason, description };

  if (target === 'document') {
    await getDocument(req.params.id);
    data.documentId = req.params.id;
  } else {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!comment) throw httpError(404, 'Không tìm thấy bình luận.');
    data.commentId = req.params.id;
  }

  const report = await prisma.report.create({ data });
  res.status(201).json({ data: report });
}

const reportDocument = asyncHandler((req, res) => createReport(req, res, 'document'));
const reportComment = asyncHandler((req, res) => createReport(req, res, 'comment'));

module.exports = {
  createComment,
  listComments,
  upsertRating,
  addFavorite,
  removeFavorite,
  downloadDocument,
  reportDocument,
  reportComment,
};
