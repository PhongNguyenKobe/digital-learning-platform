const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const prisma = require('../config/prisma');
const env = require('../config/env');

const execFileAsync = promisify(execFile);
let workerRunning = false;

function safeDocumentPath(fileUrl) {
  return path.resolve(process.cwd(), env.uploadDir, path.basename(fileUrl || ''));
}

async function scanWithClamAv(filePath) {
  try {
    await execFileAsync(env.clamAvCommand, ['--no-summary', filePath], { timeout: 120000, windowsHide: true });
    return { status: 'CLEAN', provider: env.clamAvCommand };
  } catch (error) {
    if (error.code === 1) return { status: 'INFECTED', provider: env.clamAvCommand, error: error.stderr || 'ClamAV phát hiện tệp nghi ngờ.' };
    return { status: 'FAILED', provider: env.clamAvCommand, error: error.code === 'ENOENT' ? 'ClamAV chưa được cài đặt trên máy chủ.' : error.message };
  }
}

async function extractPdfText(filePath, fileFormat) {
  if (fileFormat !== 'PDF') return { text: null, provider: 'not-applicable' };
  try {
    const { stdout } = await execFileAsync(env.pdfTextCommand, ['-layout', filePath, '-'], { timeout: 120000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
    return { text: stdout.trim() || null, provider: env.pdfTextCommand };
  } catch (error) {
    return { text: null, provider: env.pdfTextCommand, error: error.code === 'ENOENT' ? 'pdftotext chưa được cài đặt trên máy chủ.' : error.message };
  }
}

async function processDocumentJob(jobId) {
  let documentId;
  try {
    const claimed = await prisma.documentProcessingJob.updateMany({ where: { id: jobId, status: 'QUEUED' }, data: { status: 'PROCESSING', scanStatus: 'PENDING', startedAt: new Date() } });
    if (!claimed.count) return false;
    const job = await prisma.documentProcessingJob.findUnique({ where: { id: jobId }, include: { document: true } });
    if (!job?.document) return false;
    documentId = job.documentId;
    await prisma.document.update({ where: { id: documentId }, data: { processingStatus: 'PROCESSING' } });

    const filePath = safeDocumentPath(job.document.fileUrl);
    const [scan, extraction] = await Promise.all([scanWithClamAv(filePath), extractPdfText(filePath, job.document.fileFormat)]);
    const infected = scan.status === 'INFECTED';
    const processingStatus = infected ? 'FAILED' : 'COMPLETED';
    await prisma.$transaction([
      prisma.documentProcessingJob.update({ where: { id: job.id }, data: { status: processingStatus, scanStatus: scan.status, extractedText: extraction.text, result: { scan, extractionProvider: extraction.provider, extractionError: extraction.error || null }, errorMessage: infected ? scan.error : null, completedAt: new Date() } }),
      prisma.document.update({ where: { id: documentId }, data: infected ? { processingStatus, processingError: 'Tệp bị chặn do kiểm tra an toàn.', status: 'ARCHIVED', visibility: 'PRIVATE' } : { processingStatus, extractedText: extraction.text, processingError: extraction.error || null } }),
    ]);
    return true;
  } catch (error) {
    console.error(`Document processing failed for job ${jobId}:`, error);
    await prisma.documentProcessingJob.updateMany({ where: { id: jobId }, data: { status: 'FAILED', scanStatus: 'FAILED', errorMessage: error.message, completedAt: new Date() } });
    await prisma.document.updateMany({ where: { id: documentId }, data: { processingStatus: 'FAILED', processingError: error.message } });
    return false;
  }
}

async function processQueuedJobs() {
  if (workerRunning) return;
  workerRunning = true;
  try {
    const jobs = await prisma.documentProcessingJob.findMany({ where: { status: 'QUEUED' }, orderBy: { createdAt: 'asc' }, take: 3, select: { id: true } });
    for (const job of jobs) await processDocumentJob(job.id);
  } finally {
    workerRunning = false;
  }
}

function initDocumentProcessor() {
  processQueuedJobs().catch((error) => console.error('[Document worker] Không thể khôi phục hàng đợi:', error));
  const timer = setInterval(() => processQueuedJobs().catch((error) => console.error('[Document worker] Lỗi xử lý hàng đợi:', error)), env.documentWorkerIntervalMs);
  timer.unref();
  console.log(`[Document worker] Đã kích hoạt worker DB queue, chu kỳ ${env.documentWorkerIntervalMs}ms.`);
}

module.exports = { processDocumentJob, processQueuedJobs, initDocumentProcessor };
