const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const { initCronJobs } = require('./jobs/cron');
const { initDocumentProcessor } = require('./services/documentProcessing.service');

const server = app.listen(env.port, () => {
  console.log(`Học Liệu Số API đang chạy tại http://localhost:${env.port}`);
  initCronJobs();
  initDocumentProcessor();
});

server.on('error', (error) => {
  console.error('KhÃ´ng thá»ƒ khởi động HTTP server:', error);
  if (error.code === 'EADDRINUSE') process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Lỗi không được xử lý của backend:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Promise rejection không được xử lý của backend:', reason);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
