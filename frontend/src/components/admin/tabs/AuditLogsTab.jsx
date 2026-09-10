export default function AuditLogsTab({ auditLogs = [] }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00288e]">history_edu</span>
          <h2 className="text-base font-bold text-[#141b2b]">Nhật ký Thanh tra Hoạt động (Audit Trail)</h2>
        </div>
        <span className="text-xs text-[#444653]">Lưu trữ phục vụ tuân thủ & bảo mật</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#141b2b]">
          <thead>
            <tr className="bg-[#f1f3ff] text-[11px] font-bold uppercase tracking-wider text-[#444653]">
              <th className="rounded-l-lg p-3">Thời điểm</th>
              <th className="p-3">Hành động</th>
              <th className="p-3">Đối tượng</th>
              <th className="p-3">Người thực hiện</th>
              <th className="rounded-r-lg p-3">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-[#444653]">
                  Chưa có nhật ký hoạt động nào được ghi nhận.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f1f3ff]/50">
                  <td className="p-3 whitespace-nowrap text-[#444653]">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-3 font-semibold text-[#00288e]">{log.action}</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {log.entityType}: {log.entityId}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-[#141b2b]">
                    {log.performedBy?.fullName || log.performedBy?.email || 'Hệ thống'}
                  </td>
                  <td className="p-3 text-[11px] text-[#444653]">
                    {log.details ? JSON.stringify(log.details) : '—'}
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
