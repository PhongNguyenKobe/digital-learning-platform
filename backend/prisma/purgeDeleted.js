const fs = require('fs/promises');
const path = require('path');
const prisma = require('../src/config/prisma');

const RETENTION_DAYS = 30;
const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

async function removeStoredFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  const filePath = path.resolve(process.cwd(), `.${fileUrl}`);
  const uploadsRoot = path.resolve(process.cwd(), 'uploads');
  if (filePath.startsWith(uploadsRoot)) await fs.unlink(filePath).catch(() => {});
}

async function main() {
  const documents = await prisma.document.findMany({ where: { deletedAt: { lte: cutoff } }, select: { id: true, fileUrl: true, thumbnailUrl: true } });
  for (const document of documents) {
    await removeStoredFile(document.fileUrl);
    await removeStoredFile(document.thumbnailUrl);
    await prisma.document.delete({ where: { id: document.id } });
  }
  const users = await prisma.user.findMany({ where: { status: 'DELETED', deletedAt: { lte: cutoff }, uploadedDocuments: { none: {} }, comments: { none: {} }, reports: { none: {} } }, select: { id: true } });
  await prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } });
  console.log(`Đã purge ${documents.length} tài liệu và ${users.length} tài khoản sau ${RETENTION_DAYS} ngày.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
