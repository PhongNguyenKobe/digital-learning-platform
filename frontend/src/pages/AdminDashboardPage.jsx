import { useEffect, useState } from 'react'
import { fetchAdminReports, fetchAdminUsers, updateAdminReport, updateDocumentStatus } from '../services/api'

function AdminDashboardPage() {
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [notice, setNotice] = useState('')

  async function load() {
    try { const [reportResponse, userResponse] = await Promise.all([fetchAdminReports({ limit: 50 }), fetchAdminUsers({ limit: 8 })]); setReports(reportResponse.data || []); setUsers(userResponse.data || []) } catch (error) { setNotice(error.response?.data?.error?.message || 'Bạn cần đăng nhập bằng tài khoản Moderator/Admin.') }
  }
  useEffect(() => {
    let cancelled = false
    async function initialLoad() {
      try {
        const [reportResponse, userResponse] = await Promise.all([fetchAdminReports({ limit: 50 }), fetchAdminUsers({ limit: 8 })])
        if (!cancelled) { setReports(reportResponse.data || []); setUsers(userResponse.data || []) }
      } catch (error) {
        if (!cancelled) setNotice(error.response?.data?.error?.message || 'Bạn cần đăng nhập bằng tài khoản Moderator/Admin.')
      }
    }
    initialLoad()
    return () => { cancelled = true }
  }, [])

  async function resolveReport(id, status) { try { await updateAdminReport(id, { status, resolutionNote: status === 'RESOLVED' ? 'Đã kiểm tra và xử lý.' : 'Report đã được đóng.' }); setReports((current) => current.filter((item) => item.id !== id)); setNotice('Đã cập nhật report.') } catch (error) { setNotice(error.response?.data?.error?.message || 'Không thể cập nhật report.') } }
  async function moderateDocument(id, status) { try { await updateDocumentStatus(id, { status, note: status === 'PUBLISHED' ? 'Đã kiểm duyệt nội dung.' : 'Tài liệu cần được chỉnh sửa hoặc gỡ bỏ.' }); setNotice(`Đã chuyển tài liệu sang ${status}.`); load() } catch (error) { setNotice(error.response?.data?.error?.message || 'Không thể cập nhật tài liệu.') } }

  return <div className="min-h-screen bg-[#f9f9ff]"><div className="mx-auto max-w-7xl space-y-8 px-6 py-10 lg:px-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="rounded-full bg-[#dde1ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-800">Admin console</span><h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Trung tâm kiểm duyệt</h1><p className="mt-2 text-sm text-slate-500">Theo dõi báo cáo, nội dung cần xử lý và thành viên trong hệ thống.</p></div><button className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700" onClick={load} type="button">↻ Làm mới dữ liệu</button></div>{notice && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{notice}</div>}
    <div className="grid gap-4 sm:grid-cols-3"><Metric label="Report đang mở" value={reports.length} /><Metric label="Người dùng" value={users.length} /><Metric label="Cần ưu tiên" value={reports.filter((item) => item.reason === 'COPYRIGHT' || item.reason === 'INAPPROPRIATE').length} /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]"><section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Hàng đợi báo cáo</h2><p className="mt-1 text-xs text-slate-500">Các báo cáo OPEN và IN_REVIEW cần xử lý.</p></div><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">{reports.length} đang chờ</span></div><div className="divide-y divide-slate-100">{reports.map((item) => <article className="p-5" key={item.id}><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-700">{item.reason}</span><span className="text-xs text-slate-400">{item.status}</span></div><h3 className="mt-2 font-bold text-slate-900">{item.document?.title || 'Báo cáo bình luận'}</h3><p className="mt-1 text-sm text-slate-500">{item.description || 'Không có mô tả bổ sung.'}</p><p className="mt-2 text-xs text-slate-400">Người báo cáo: {item.reporter?.fullName}</p></div><div className="flex shrink-0 gap-2 self-start"><button className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white" onClick={() => resolveReport(item.id, 'RESOLVED')} type="button">Xử lý</button><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600" onClick={() => resolveReport(item.id, 'DISMISSED')} type="button">Bỏ qua</button></div></div>{item.document && <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3"><button className="rounded-md bg-blue-800 px-3 py-2 text-xs font-bold text-white" onClick={() => moderateDocument(item.document.id, 'PUBLISHED')} type="button">Duyệt tài liệu</button><button className="rounded-md bg-red-700 px-3 py-2 text-xs font-bold text-white" onClick={() => moderateDocument(item.document.id, 'REJECTED')} type="button">Từ chối</button></div>}</article>)}{reports.length === 0 && <div className="p-10 text-center text-sm text-slate-500">Không có report cần xử lý.</div>}</div></section>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Quản lý người dùng</h2><p className="mt-1 text-xs text-slate-500">Danh sách thành viên mới nhất.</p></div><div className="divide-y divide-slate-100">{users.map((user) => <div className="flex items-center justify-between gap-3 p-4" key={user.id}><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{user.fullName}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div><div className="text-right"><span className="block text-[10px] font-bold text-blue-800">{user.role}</span><span className={`text-[10px] font-semibold ${user.status === 'ACTIVE' ? 'text-emerald-700' : 'text-red-700'}`}>{user.status}</span></div></div>)}</div></section></div></div></div>
}

function Metric({ label, value }) { return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><strong className="mt-3 block text-3xl font-bold text-slate-900">{value}</strong></div> }

export default AdminDashboardPage
