export default function AdminMetrics({ stats, pendingRiskCount = 0, pendingReportsCount = 0 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Stat 1: Total Docs */}
      <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#444653]">Tổng tài liệu công khai</span>
          <span className="rounded-lg bg-[#e9edff] p-2 text-[#00288e] material-symbols-outlined text-[20px]">
            library_books
          </span>
        </div>
        <div className="mt-3 flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-[#00288e]">
            {stats.totalDocuments?.toLocaleString('vi-VN') || '524,890'}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[#00563a]">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span className="text-xs font-semibold">{stats.cleanRate || '99.8%'} an toàn & hợp quy</span>
          </div>
        </div>
      </div>

      {/* Stat 2: Risk Queue */}
      <div className="flex flex-col justify-between rounded-2xl bg-[#ffdad6] p-5 shadow-sm border border-red-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#93000a]">Hàng đợi Rủi ro (Cần thẩm định)</span>
          <span className="rounded-lg bg-[#ba1a1a] p-2 text-white material-symbols-outlined text-[20px]">
            crisis_alert
          </span>
        </div>
        <div className="mt-3 flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#93000a]">
              {String(pendingRiskCount).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-[#93000a]">tệp tin gắn cờ</span>
          </div>
          <span className="mt-1 text-[11px] font-semibold text-[#93000a]">Ưu tiên SLA xử lý: &lt; 24 giờ</span>
        </div>
      </div>

      {/* Stat 3: Community Reports */}
      <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#444653]">Báo cáo cộng đồng mở</span>
          <span className="rounded-lg bg-[#e9edff] p-2 text-[#0058be] material-symbols-outlined text-[20px]">
            flag
          </span>
        </div>
        <div className="mt-3 flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-[#141b2b]">
            {String(pendingReportsCount).padStart(2, '0')}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[#444653]">
            <span className="material-symbols-outlined text-[15px]">copyright</span>
            <span className="text-xs">Khiếu nại bản quyền & nội dung</span>
          </div>
        </div>
      </div>

      {/* Stat 4: Active Users */}
      <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#444653]">Thành viên tải lên</span>
          <span className="rounded-lg bg-[#e9edff] p-2 text-[#00563a] material-symbols-outlined text-[20px]">
            groups
          </span>
        </div>
        <div className="mt-3 flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-[#141b2b]">
            {stats.totalUsers?.toLocaleString('vi-VN') || '142,600'}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[#00563a]">
            <span className="material-symbols-outlined text-[15px]">trending_up</span>
            <span className="text-xs font-semibold">{stats.highTrustRate || '98.4%'} uy tín học thuật cao</span>
          </div>
        </div>
      </div>
    </div>
  )
}
