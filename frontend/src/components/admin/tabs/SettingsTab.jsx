export default function SettingsTab({ onTriggerPurge, purging = false }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-[#ba1a1a]">tune</span>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[#141b2b]">
              Cấu hình Tự động Dọn dẹp Dữ liệu Rác (DMCA Data Retention)
            </h2>
            <p className="text-xs text-[#444653]">
              Thiết lập chính sách tự động xóa vĩnh viễn các tài liệu và tài khoản đã bị xóa mềm.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-xl bg-[#f1f3ff] p-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <strong className="block text-sm text-[#141b2b]">Tự động chạy hàng ngày (Cron Job)</strong>
              <span className="text-[#444653]">
                Lịch trình tự động: <strong>02:00 sáng mỗi ngày</strong> (UTC).
              </span>
            </div>
            <span className="rounded-full bg-[#d9f7ed] px-3 py-1 font-bold text-[#00563a]">
              ĐANG HOẠT ĐỘNG
            </span>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <strong className="block text-sm text-[#141b2b]">Chính sách lưu vết an toàn</strong>
            <p className="mt-1 text-[#444653]">
              Tất cả tài liệu bị gỡ hoặc đánh dấu xóa (isDeleted = true) sẽ được bảo lưu trong thời gian{' '}
              <strong>30 ngày</strong> trước khi bị xóa vĩnh viễn khỏi ổ cứng lưu trữ nhằm phục vụ khiếu nại
              DMCA hoặc khôi phục sự cố.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-[#ffdad6]/40 p-5">
          <div className="flex items-center gap-2 font-bold text-[#ba1a1a]">
            <span className="material-symbols-outlined">delete_sweep</span>
            Kích hoạt Dọn dẹp Rác Ngay Lập Tức (Manual Purge)
          </div>
          <p className="text-xs text-[#93000a]">
            Thao tác này sẽ quét toàn bộ cơ sở dữ liệu và ổ cứng máy chủ để loại bỏ hoàn toàn các tệp tin đã xóa
            quá thời hạn lưu giữ.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => onTriggerPurge(30)}
              disabled={purging}
              className="rounded-xl bg-[#ba1a1a] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#93000a] transition disabled:opacity-50"
            >
              {purging ? 'Đang thực hiện dọn dẹp...' : '🗑 Bắt đầu Dọn dẹp Dữ liệu (> 30 ngày)'}
            </button>
            <button
              onClick={() => onTriggerPurge(7)}
              disabled={purging}
              className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-xs font-bold text-[#ba1a1a] hover:bg-red-50 transition"
            >
              Dọn dẹp nhanh (&gt; 7 ngày)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
