const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const { initCronJobs } = require('./jobs/cron');

const server = app.listen(env.port, () => {
  console.log(`Học Liệu Số API đang chạy tại http://localhost:${env.port}`);
  initCronJobs();
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
