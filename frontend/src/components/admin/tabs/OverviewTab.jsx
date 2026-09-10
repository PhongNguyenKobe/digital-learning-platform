import { Link } from 'react-router-dom'

export default function OverviewTab({
  reports = [],
  onNavigateTab,
  onModerateDocument,
  onTriggerPurge,
  purging = false,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Explanatory Banner */}
      <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm border border-[#dce2f7]">
        <span className="material-symbols-outlined mt-0.5 text-[28px] text-[#0058be]">speed</span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#00288e]">
              Quy trình Kiểm duyệt sau (Optimistic Post-Moderation)
            </span>
            <span className="rounded bg-[#d9f7ed] px-2 py-0.5 text-[10px] font-bold text-[#00563a]">
              Tự động phát hiện 24/7
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#444653]">
            Tất cả tài liệu được công khai tức thì ngay khi sinh viên tải lên để đảm bảo tính chia sẻ kịp thời mùa thi
            cử. Bảng dưới đây cô lập các trường hợp bị AI quét vi phạm hoặc bị cộng đồng khiếu nại bản quyền / thông tin
            nhạy cảm.
          </p>
        </div>
      </div>

      {/* Priority Risk Queue Preview */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
            <h2 className="text-base font-bold text-[#141b2b]">Hàng đợi Rủi ro Cần Xử Lý</h2>
          </div>
          <button
            onClick={() => onNavigateTab('risk_queue')}
            className="text-xs font-bold text-[#0058be] hover:underline"
          >
            Xem tất cả ({reports.length}) →
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#444653]">
            Hiện không có tài liệu nào nằm trong hàng đợi rủi ro!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#141b2b]">
              <thead>
                <tr className="bg-[#f1f3ff] text-[11px] font-bold uppercase tracking-wider text-[#444653]">
                  <th className="rounded-l-lg p-3">Tài liệu & Mã ID</th>
                  <th className="p-3">Người báo cáo / Đăng</th>
                  <th className="p-3">Nguyên nhân kích hoạt</th>
                  <th className="rounded-r-lg p-3 text-right">Quyết định xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-[#f1f3ff]/50">
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#ba1a1a]">DOC-{r.documentId?.slice(0, 6)}</span>
                        <Link
                          to={`/tai-lieu/${r.documentId}`}
                          target="_blank"
                          className="font-semibold hover:text-[#00288e] line-clamp-1"
                        >
                          {r.document?.title || 'Tài liệu #' + r.documentId}
                        </Link>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-[#141b2b]">
                        {r.user?.fullName || r.user?.email || 'Thành viên'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 rounded bg-[#ffdad6] px-2 py-0.5 text-[11px] font-semibold text-[#93000a]">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        {r.reason}: {r.details || 'Báo cáo vi phạm'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onModerateDocument(r.documentId, 'REJECTED', r.id)}
                          className="rounded bg-[#ba1a1a] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#93000a] transition"
                        >
                          Gỡ bỏ
                        </button>
                        <button
                          onClick={() => onModerateDocument(r.documentId, 'PUBLISHED', r.id)}
                          className="rounded bg-[#00563a] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#003d27] transition"
                        >
                          Hợp lệ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions & System Health */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="mb-3 text-sm font-bold text-[#141b2b]">Tác vụ Quản trị Nhanh</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('documents')}
              className="flex items-center gap-2 rounded-xl bg-[#f1f3ff] p-3 text-left hover:bg-[#e1e8fd] transition"
            >
              <span className="material-symbols-outlined text-[#00288e]">library_add</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#141b2b]">Quản lý Tài liệu</span>
                <span className="text-[10px] text-[#444653]">Thêm / Sửa / Khóa tệp</span>
              </div>
            </button>
            <button
              onClick={() => onNavigateTab('create_user_action')}
              className="flex items-center gap-2 rounded-xl bg-[#f1f3ff] p-3 text-left hover:bg-[#e1e8fd] transition"
            >
              <span className="material-symbols-outlined text-[#00563a]">person_add</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#141b2b]">Thêm Người dùng</span>
                <span className="text-[10px] text-[#444653]">Tạo tài khoản mới</span>
              </div>
            </button>
            <button
              onClick={() => onNavigateTab('universities')}
              className="flex items-center gap-2 rounded-xl bg-[#f1f3ff] p-3 text-left hover:bg-[#e1e8fd] transition"
            >
              <span className="material-symbols-outlined text-[#0058be]">school</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#141b2b]">Trường & Khoa</span>
                <span className="text-[10px] text-[#444653]">Cấu hình cây học thuật</span>
              </div>
            </button>
            <button
              onClick={() => onTriggerPurge(30)}
              disabled={purging}
              className="flex items-center gap-2 rounded-xl bg-[#ffdad6]/60 p-3 text-left hover:bg-[#ffdad6] transition disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[#ba1a1a]">delete_sweep</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#ba1a1a]">
                  {purging ? 'Đang dọn dẹp...' : 'Dọn dẹp rác (>30 ngày)'}
                </span>
                <span className="text-[10px] text-[#93000a]">Thanh trừng vĩnh viễn</span>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="mb-3 text-sm font-bold text-[#141b2b]">Trạng thái Động cơ Dịch vụ</h3>
          <div className="space-y-2.5 text-xs text-[#444653]">
            <div className="flex items-center justify-between rounded-lg bg-[#f1f3ff] p-2.5">
              <span className="font-medium">OCR Engine + Thumbnail Generator</span>
              <span className="rounded bg-[#d9f7ed] px-2 py-0.5 text-[10px] font-bold text-[#00563a]">
                Sẵn sàng (PDF.js / Sharp)
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#f1f3ff] p-2.5">
              <span className="font-medium">Cron Tự động Dọn dẹp Rác (02:00 AM)</span>
              <span className="rounded bg-[#d9f7ed] px-2 py-0.5 text-[10px] font-bold text-[#00563a]">
                Đang kích hoạt
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#f1f3ff] p-2.5">
              <span className="font-medium">Bảo mật DMCA Takedown SLA</span>
              <span className="rounded bg-[#e9edff] px-2 py-0.5 text-[10px] font-bold text-[#00288e]">
                Chuẩn &lt; 24 giờ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
