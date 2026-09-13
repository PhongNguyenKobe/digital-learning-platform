import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function RiskQueueTab({
  reports = [],
  onModerateDocument,
  onResolveReport,
}) {
  const [reportFilter, setReportFilter] = useState('ALL')

  const filteredReports = useMemo(() => {
    if (reportFilter === 'ALL') return reports
    return reports.filter((r) => r.reason === reportFilter)
  }, [reports, reportFilter])

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportFilter('ALL')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              reportFilter === 'ALL'
                ? 'bg-[#00288e] text-white shadow-sm'
                : 'bg-[#f1f3ff] text-[#141b2b] hover:bg-[#e1e8fd]'
            }`}
          >
            Tất cả rủi ro ({reports.length})
          </button>
          <button
            onClick={() => setReportFilter('COPYRIGHT')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              reportFilter === 'COPYRIGHT'
                ? 'bg-[#00288e] text-white shadow-sm'
                : 'bg-[#f1f3ff] text-[#141b2b] hover:bg-[#e1e8fd]'
            }`}
          >
            Bản quyền DMCA ({reports.filter((r) => r.reason === 'COPYRIGHT').length})
          </button>
          <button
            onClick={() => setReportFilter('INAPPROPRIATE')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              reportFilter === 'INAPPROPRIATE'
                ? 'bg-[#00288e] text-white shadow-sm'
                : 'bg-[#f1f3ff] text-[#141b2b] hover:bg-[#e1e8fd]'
            }`}
          >
            Nội dung không phù hợp ({reports.filter((r) => r.reason === 'INAPPROPRIATE').length})
          </button>
          <button
            onClick={() => setReportFilter('BROKEN_FILE')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              reportFilter === 'BROKEN_FILE'
                ? 'bg-[#00288e] text-white shadow-sm'
                : 'bg-[#f1f3ff] text-[#141b2b] hover:bg-[#e1e8fd]'
            }`}
          >
            Tệp lỗi ({reports.filter((r) => r.reason === 'BROKEN_FILE').length})
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#141b2b]">
          <thead>
            <tr className="bg-[#f1f3ff] text-[11px] font-bold uppercase tracking-wider text-[#444653]">
              <th className="rounded-l-lg p-3">Tài liệu & Mã ID</th>
              <th className="p-3">Người báo cáo / Email</th>
              <th className="p-3">Nguyên nhân kích hoạt rủi ro</th>
              <th className="p-3">Trạng thái</th>
              <th className="rounded-r-lg p-3 text-right">Quyết định xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-[#444653]">
                  Không có báo cáo nào khớp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredReports.map((item) => (
                <tr key={item.id} className="hover:bg-[#f1f3ff]/50">
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#ba1a1a]">DOC-{item.documentId?.slice(0, 6)}</span>
                      <Link
                        to={`/tai-lieu/${item.documentId}`}
                        target="_blank"
                        className="font-semibold hover:text-[#00288e] line-clamp-1"
                      >
                        {item.document?.title || 'Tài liệu #' + item.documentId}
                      </Link>
                      <span className="text-[11px] text-[#444653]">
                        {item.document?.university?.name || 'Đại học'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#141b2b]">{item.user?.fullName || 'Ẩn danh'}</span>
                      <span className="text-[11px] text-[#444653]">{item.user?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#ba1a1a]">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        {item.reason}
                      </span>
                      <p className="text-[11px] text-[#444653]">{item.details || 'Không có mô tả chi tiết.'}</p>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.status === 'PENDING'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : item.status === 'RESOLVED'
                          ? 'bg-[#d9f7ed] text-[#00563a]'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onModerateDocument(item.documentId, 'REJECTED', item.id, 'Vi phạm DMCA')}
                        className="flex items-center gap-1 rounded bg-[#ba1a1a] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#93000a] transition"
                        title="Gỡ bỏ tài liệu và đóng báo cáo"
                      >
                        <span className="material-symbols-outlined text-[14px]">block</span>
                        Gỡ bỏ
                      </button>
                      <button
                        onClick={() => onModerateDocument(item.documentId, 'PUBLISHED', item.id, 'Hợp lệ')}
                        className="flex items-center gap-1 rounded bg-[#00563a] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#003d27] transition"
                        title="Xác nhận tài liệu an toàn"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        An toàn
                      </button>
                      <button
                        onClick={() => onResolveReport(item.id, 'DISMISSED')}
                        className="rounded bg-[#f1f3ff] px-2 py-1 text-xs font-semibold text-[#444653] hover:bg-[#e1e8fd] transition"
                        title="Bỏ qua báo cáo này"
                      >
                        Bỏ qua
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
