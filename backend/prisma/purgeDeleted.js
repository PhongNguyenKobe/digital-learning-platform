const prisma = require('../src/config/prisma');
const { purgeExpiredRecords } = require('../src/services/purge.service');

async function main() {
  const result = await purgeExpiredRecords({ retentionDays: 30 });
  console.log(`Đã purge ${result.purgedDocumentsCount} tài liệu và ${result.purgedUsersCount} tài khoản sau ${result.retentionDays} ngày.`);
}

main()
  .catch((error) => {
    console.error('Purge script gặp lỗi:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

