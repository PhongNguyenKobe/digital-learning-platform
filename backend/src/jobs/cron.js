const cron = require('node-cron');
const env = require('../config/env');
const { purgeExpiredRecords } = require('../services/purge.service');

function initCronJobs() {
  const schedule = env.purgeCronSchedule || '0 3 * * *';

  if (!cron.validate(schedule)) {
    console.warn(`[Cron] Biểu thức cron không hợp lệ: "${schedule}". Sử dụng mặc định "0 3 * * *".`);
  }

  const validSchedule = cron.validate(schedule) ? schedule : '0 3 * * *';

  const task = cron.schedule(validSchedule, async () => {
    console.log(`[Cron] [${new Date().toISOString()}] Bắt đầu tự động dọn dẹp dữ liệu quá hạn lưu trữ...`);
    try {
      const result = await purgeExpiredRecords({ retentionDays: 30 });
      console.log(`[Cron] Dọn dẹp hoàn tất: Đã xóa ${result.purgedDocumentsCount} tài liệu và ${result.purgedUsersCount} tài khoản (sau ${result.retentionDays} ngày).`);
    } catch (error) {
      console.error('[Cron] Lỗi khi dọn dẹp dữ liệu tự động:', error);
    }
  });

  console.log(`[Cron] Đã kích hoạt lịch tự động dọn dẹp dữ liệu (db:purge-deleted) theo chu kỳ: "${validSchedule}"`);

  return { task };
}

module.exports = {
  initCronJobs,
};
