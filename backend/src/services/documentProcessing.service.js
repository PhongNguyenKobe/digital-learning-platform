const prisma = require('../config/prisma');

function processDocumentJob(jobId) {
  setImmediate(async () => {
    let documentId;
    try {
      const job = await prisma.documentProcessingJob.findUnique({ where: { id: jobId } });
      if (!job) return;
      documentId = job.documentId;

      await prisma.documentProcessingJob.update({
        where: { id: job.id },
        data: { status: 'PROCESSING', scanStatus: 'PENDING', startedAt: new Date() },
      });
      await prisma.document.update({
        where: { id: job.documentId },
        data: { processingStatus: 'PROCESSING' },
      });

      await new Promise((resolve) => setTimeout(resolve, 250));
      const document = await prisma.document.findUnique({ where: { id: job.documentId } });
      if (!document) return;

      const extractedText = `Nội dung trích xuất tự động cho tài liệu: ${document.title}`;
      await prisma.$transaction([
        prisma.documentProcessingJob.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            scanStatus: 'CLEAN',
            extractedText,
            result: { provider: 'mock-processor', language: document.language, pages: document.pageCount },
            completedAt: new Date(),
          },
        }),
        prisma.document.update({
          where: { id: job.documentId },
          data: { processingStatus: 'COMPLETED', extractedText },
        }),
      ]);
    } catch (error) {
      console.error(`Document processing failed for job ${jobId}:`, error);
      await prisma.document.updateMany({
        where: { id: documentId },
        data: { processingStatus: 'FAILED', processingError: error.message },
      });
    }
  });
}

module.exports = { processDocumentJob };
