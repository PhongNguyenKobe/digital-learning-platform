const fs = require('fs/promises');
const path = require('path');
const prisma = require('../config/prisma');
const env = require('../config/env');

async function removeStoredFile(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('/uploads/')) return;
  const filePath = path.resolve(process.cwd(), `.${fileUrl}`);
  const uploadsRoot = path.resolve(process.cwd(), env.uploadDir || 'uploads');
  if (filePath.startsWith(uploadsRoot)) {
    await fs.unlink(filePath).catch(() => {});
  }
}

async function purgeExpiredRecords({ retentionDays = 30 } = {}) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  // 1. Tìm các tài liệu đã xóa mềm vượt quá thời gian lưu trữ
  const documents = await prisma.document.findMany({
    where: {
      deletedAt: {
        lte: cutoff,
      },
    },
    select: {
      id: true,
      fileUrl: true,
      thumbnailUrl: true,
    },
  });

  // Xóa file vật lý trong storage và xóa bản ghi
  for (const document of documents) {
    await removeStoredFile(document.fileUrl);
    await removeStoredFile(document.thumbnailUrl);
    await prisma.document.delete({
      where: { id: document.id },
    }).catch((err) => {
      console.error(`[Purge] Không thể xóa document ${document.id}:`, err.message);
    });
  }

  // 2. Tìm các tài khoản người dùng đã xóa mềm quá hạn và không còn ràng buộc dữ liệu
  const users = await prisma.user.findMany({
    where: {
      status: 'DELETED',
      deletedAt: {
        lte: cutoff,
      },
      uploadedDocuments: { none: {} },
      comments: { none: {} },
      reports: { none: {} },
    },
    select: { id: true },
  });

  let deletedUsersCount = 0;
  if (users.length > 0) {
    const userResult = await prisma.user.deleteMany({
      where: {
        id: { in: users.map((user) => user.id) },
      },
    });
    deletedUsersCount = userResult.count;
  }

  return {
    purgedDocumentsCount: documents.length,
    purgedUsersCount: deletedUsersCount,
    retentionDays,
    cutoff,
  };
}

module.exports = {
  purgeExpiredRecords,
  removeStoredFile,
};
