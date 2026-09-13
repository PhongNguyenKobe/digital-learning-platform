export default function AdminMetrics({ stats, pendingRiskCount = 0 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Tổng tài liệu công khai" icon="library_books" value={stats.totalDocuments?.toLocaleString('vi-VN') || '0'} detail={`${stats.publishedDocuments || 0} đã xuất bản`} tone="blue" />
      <MetricCard label="Hàng đợi rủi ro" icon="crisis_alert" value={String(pendingRiskCount).padStart(2, '0')} detail="Báo cáo mở, ưu tiên xử lý < 24 giờ" tone="red" />
      <MetricCard label="Tài liệu đã bị từ chối" icon="block" value={String(stats.rejectedDocuments || 0).padStart(2, '0')} detail="Không đạt yêu cầu kiểm duyệt" tone="amber" />
      <MetricCard label="Thành viên hệ thống" icon="groups" value={stats.totalUsers?.toLocaleString('vi-VN') || '0'} detail="Tài khoản đang được quản lý" tone="green" />
    </div>
  )
}

function MetricCard({ label, icon, value, detail, tone }) {
  const themes = {
    blue: { card: 'border-slate-100 bg-white text-[#00288e]', icon: 'bg-[#e9edff] text-[#00288e]' },
    red: { card: 'border-red-200 bg-[#ffdad6] text-[#93000a]', icon: 'bg-[#ba1a1a] text-white' },
    amber: { card: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'bg-amber-500 text-white' },
    green: { card: 'border-slate-100 bg-white text-[#00563a]', icon: 'bg-emerald-100 text-[#00563a]' },
  }
  const theme = themes[tone]
  return <div className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm ${theme.card}`}>
    <div className="flex items-center justify-between"><span className="text-xs font-semibold">{label}</span><span className={`material-symbols-outlined rounded-lg p-2 text-[20px] ${theme.icon}`}>{icon}</span></div>
    <div className="mt-3"><span className="text-2xl font-bold tracking-tight">{value}</span><p className="mt-1 text-[11px] font-semibold opacity-80">{detail}</p></div>
  </div>
}
