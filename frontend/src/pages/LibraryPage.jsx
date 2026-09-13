import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  changePassword,
  fetchCurrentUser,
  fetchMyDocuments,
  fetchMyFavorites,
  fetchMyDownloads,
  updateMyDocument,
  deleteMyDocument,
  toggleFavorite,
} from '../services/api'
import EditMyDocumentModal from '../components/EditMyDocumentModal'

import { apiOrigin } from '../services/apiOrigin'

export default function LibraryPage() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('uploaded') // 'uploaded' | 'favorites' | 'downloads' | 'account'

  // Data states
  const [myDocuments, setMyDocuments] = useState([])
  const [favorites, setFavorites] = useState([])
  const [downloads, setDownloads] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  // Modal state
  const [editingDoc, setEditingDoc] = useState(null)
  const [notice, setNotice] = useState(null)

  function showNotice(message, type = 'success') {
    setNotice({ message, type })
    setTimeout(() => setNotice(null), 4000)
  }

  // Password change form
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordNotice, setPasswordNotice] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      setLoading(true)
      try {
        const [meRes, docsRes, favsRes, downsRes] = await Promise.all([
          fetchCurrentUser().catch(() => null),
          fetchMyDocuments({ limit: 100 }).catch(() => ({ data: [] })),
          fetchMyFavorites().catch(() => ({ data: [] })),
          fetchMyDownloads().catch(() => ({ data: [] })),
        ])
        if (!cancelled) {
          if (meRes?.data) setUser(meRes.data)
          if (docsRes?.data) setMyDocuments(docsRes.data)
          if (favsRes?.data) setFavorites(favsRes.data)
          if (downsRes?.data) setDownloads(downsRes.data)
        }
      } catch (err) {
        if (!cancelled) showNotice('Không thể tải thông tin thư viện.', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  // Portfolio metrics
  const metrics = useMemo(() => {
    const totalUploads = myDocuments.length
    const totalViews = myDocuments.reduce((sum, d) => sum + (d.viewCount || 0), 0)
    const totalDownloads = myDocuments.reduce((sum, d) => sum + (d.downloadCount || 0), 0)
    const trustScore = user?.trustScore ?? 80
    return { totalUploads, totalViews, totalDownloads, trustScore }
  }, [myDocuments, user])

  // Filtered uploaded docs
  const filteredUploaded = useMemo(() => {
    return myDocuments.filter((doc) => {
      const matchesSearch =
        !searchQuery.trim() ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.subject?.code && doc.subject.code.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [myDocuments, searchQuery, statusFilter])

  // Actions on uploaded docs
  async function handleSaveEdit(data) {
    if (!editingDoc) return
    const res = await updateMyDocument(editingDoc.id, data)
    setMyDocuments((prev) => prev.map((d) => (d.id === editingDoc.id ? { ...d, ...res.data } : d)))
    showNotice('Cập nhật tài liệu thành công!')
  }

  async function handleDeleteDocument(docId) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi thư viện?')) return
    try {
      await deleteMyDocument(docId)
      setMyDocuments((prev) => prev.filter((d) => d.id !== docId))
      showNotice('Đã xóa tài liệu thành công.')
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Lỗi khi xóa tài liệu.', 'error')
    }
  }

  async function handleRemoveFavorite(docId) {
    try {
      await toggleFavorite(docId, false)
      setFavorites((prev) => prev.filter((d) => d.id !== docId))
      showNotice('Đã bỏ lưu tài liệu khỏi mục yêu thích.')
    } catch (err) {
      showNotice('Không thể cập nhật danh sách yêu thích.', 'error')
    }
  }

  // Password submission
  async function submitPassword(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordNotice('')
    if (form.newPassword.length < 8) return setPasswordError('Mật khẩu mới cần ít nhất 8 ký tự.')
    if (form.newPassword !== form.confirmPassword) return setPasswordError('Mật khẩu xác nhận không khớp.')
    setSavingPassword(true)
    try {
      const res = await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setPasswordNotice(res.message || 'Đổi mật khẩu thành công!')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err.response?.data?.error?.message || 'Không thể đổi mật khẩu.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b]">
      {/* Global Toast Notice */}
      {notice && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl transition-all ${notice.type === 'error' ? 'bg-[#ba1a1a] text-white' : 'bg-[#00563a] text-white'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {notice.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="text-xs font-semibold">{notice.message}</span>
        </div>
      )}

      {/* Hero / Portfolio Banner */}
      <section className="border-b border-slate-200/80 bg-linear-to-b from-white to-[#f1f3ff]/50 pb-8 pt-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#00288e] to-[#0058be] text-xl font-bold text-white shadow-md">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  (user?.fullName || 'SV').slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[#141b2b]">
                    {user?.fullName || 'Thư viện Học thuật Cá nhân'}
                  </h1>
                  {metrics.trustScore >= 85 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#d9f7ed] px-2.5 py-0.5 text-[10px] font-bold text-[#00563a]">
                      <span className="material-symbols-outlined text-[13px]">stars</span>
                      Đại sứ Học liệu
                    </span>
                  )}
                </div>
                <span className="mt-0.5 text-xs text-[#444653]">
                  {user?.university?.name || 'Cộng đồng học liệu số Việt Nam'} • {user?.faculty?.name || 'Học viên'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dong-gop#upload"
                className="inline-flex items-center gap-2 rounded-xl bg-[#00288e] px-4 py-2.5 text-xs font-extrabold tracking-wide text-white antialiased shadow-md border border-white/10 transition-all hover:bg-[#1e40af] hover:border-white/30 hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px] text-white brightness-125">
                  cloud_upload
                </span>
                <span className="text-white">Tải lên tài liệu mới</span>
              </Link>
            </div>
          </div>

          {/* 4 Academic Portfolio Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Tài liệu đã đăng"
              value={metrics.totalUploads}
              icon="upload_file"
              color="text-[#00288e]"
              bg="bg-[#dde1ff]/60"
              subtext="Đóng góp cho cộng đồng"
            />
            <MetricCard
              label="Lượt xem nhận được"
              value={metrics.totalViews.toLocaleString('vi-VN')}
              icon="visibility"
              color="text-[#0058be]"
              bg="bg-[#d8e2ff]/60"
              subtext="Từ sinh viên toàn quốc"
            />
            <MetricCard
              label="Lượt tải cộng đồng"
              value={metrics.totalDownloads.toLocaleString('vi-VN')}
              icon="download"
              color="text-[#00563a]"
              bg="bg-[#d9f7ed]"
              subtext="Học liệu hữu ích"
            />
            <MetricCard
              label="Điểm Uy tín Tác giả"
              value={`${metrics.trustScore}/100`}
              icon="verified"
              color="text-[#00288e]"
              bg="bg-[#e9edff]"
              progress={metrics.trustScore}
              subtext={metrics.trustScore >= 85 ? 'Độ tín nhiệm xuất sắc' : 'Thành viên chuẩn'}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area with Tabs */}
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <nav className="flex items-center gap-2">
            <TabButton
              active={activeTab === 'uploaded'}
              onClick={() => setActiveTab('uploaded')}
              icon="folder_shared"
              label="Tài liệu đã đăng"
              badge={myDocuments.length}
            />
            <TabButton
              active={activeTab === 'favorites'}
              onClick={() => setActiveTab('favorites')}
              icon="bookmark"
              label="Tài liệu đã lưu"
              badge={favorites.length}
            />
            <TabButton
              active={activeTab === 'downloads'}
              onClick={() => setActiveTab('downloads')}
              icon="history"
              label="Lịch sử tải về"
              badge={downloads.length}
            />
            <TabButton
              active={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
              icon="manage_accounts"
              label="Hồ sơ & Bảo mật"
            />
          </nav>

          {/* Search & View Mode Toggle for Uploaded Tab */}
          {activeTab === 'uploaded' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#757684]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm tài liệu của bạn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:w-64 focus:ring-2 focus:ring-[#00288e] transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PUBLISHED">Đã xuất bản</option>
                <option value="PENDING_REVIEW">Chờ kiểm duyệt</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>

              <div className="flex items-center rounded-xl bg-slate-200/80 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-1.5 transition ${viewMode === 'grid' ? 'bg-white text-[#00288e] shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  title="Dạng lưới thẻ"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-lg p-1.5 transition ${viewMode === 'table' ? 'bg-white text-[#00288e] shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  title="Dạng bảng danh sách"
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: UPLOADED DOCUMENTS */}
        {/* ========================================================= */}
        {activeTab === 'uploaded' && (
          <div className="mt-6">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-500">Đang tải danh sách tài liệu...</div>
            ) : filteredUploaded.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f1f3ff] text-2xl text-[#00288e]">
                  <span className="material-symbols-outlined text-[32px]">upload_file</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#141b2b]">Bạn chưa có tài liệu nào</h3>
                <p className="mt-1 max-w-sm text-xs text-[#444653]">
                  Hãy chia sẻ giáo trình, slide bài giảng hoặc đề thi để nhận điểm tín nhiệm và hỗ trợ các bạn sinh
                  viên cùng trường.
                </p>
                <Link
                  to="/dong-gop#upload"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#00288e] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1e40af]"
                >
                  <span className="material-symbols-outlined text-[16px] text-white">cloud_upload</span>
                  <span className="text-white">Tải lên tài liệu ngay</span>
                </Link>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredUploaded.map((doc) => (
                  <article
                    key={doc.id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:shadow-md hover:border-slate-300"
                  >
                    <div>
                      {/* Thumbnail Header */}
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                        {doc.thumbnailUrl ? (
                          <img
                            src={
                              doc.thumbnailUrl.startsWith('http')
                                ? doc.thumbnailUrl
                                : `${apiOrigin}${doc.thumbnailUrl}`
                            }
                            alt=""
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-[#dde1ff]/40 text-3xl font-bold text-[#00288e]">
                            {doc.fileFormat || 'DOC'}
                          </div>
                        )}

                        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                          {doc.fileFormat} • {doc.pageCount || '--'} trang
                        </span>

                        <span
                          className={`absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs ${doc.status === 'PUBLISHED'
                            ? 'bg-[#d9f7ed]/90 text-[#00563a]'
                            : doc.status === 'PENDING_REVIEW'
                              ? 'bg-[#fffbeb]/90 text-[#92400e]'
                              : 'bg-[#ffdad6]/90 text-[#ba1a1a]'
                            }`}
                        >
                          {doc.status === 'PUBLISHED'
                            ? '✓ Đã duyệt'
                            : doc.status === 'PENDING_REVIEW'
                              ? 'Chờ duyệt'
                              : 'Từ chối'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <span className="text-[11px] font-semibold text-[#0058be]">
                          {doc.university?.shortName || doc.university?.name || 'Học viện'} •{' '}
                          {doc.subject?.code || 'Chuyên ngành'}
                        </span>
                        <h4 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[#141b2b]">
                          {doc.title}
                        </h4>

                        <div className="mt-3 flex items-center gap-4 text-xs text-[#757684]">
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            {doc.viewCount || 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">download</span>
                            {doc.downloadCount || 0}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#00563a] font-semibold">
                            ★ {Number(doc.ratingAverage || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 bg-[#f9f9ff] px-4 py-2.5">
                      <Link
                        to={`/tai-lieu/${doc.id}`}
                        className="text-xs font-bold text-[#00288e] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Xem</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingDoc(doc)}
                          className="rounded-lg bg-white p-1.5 text-[#0058be] shadow-xs hover:bg-[#e9edff] transition"
                          title="Chỉnh sửa tài liệu"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="rounded-lg bg-white p-1.5 text-slate-500 shadow-xs hover:bg-red-50 hover:text-red-600 transition"
                          title="Xóa tài liệu"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                <table className="w-full text-left text-xs text-[#141b2b]">
                  <thead className="bg-[#f1f3ff] text-[10px] font-bold uppercase tracking-wider text-[#444653]">
                    <tr>
                      <th className="p-4">Tài liệu & Định dạng</th>
                      <th className="p-4">Trường / Môn</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Lượt xem / Tải</th>
                      <th className="p-4">Thời gian</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUploaded.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f1f3ff]/40 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.thumbnailUrl ? (
                              <img
                                src={
                                  item.thumbnailUrl.startsWith('http')
                                    ? item.thumbnailUrl
                                    : `${apiOrigin}${item.thumbnailUrl}`
                                }
                                alt=""
                                className="h-11 w-8 rounded border border-slate-200 object-cover object-top shadow-xs shrink-0"
                              />
                            ) : (
                              <span className="grid h-11 w-8 shrink-0 place-items-center rounded bg-[#dde1ff] text-xs font-bold text-[#00288e]">
                                {item.fileFormat}
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/tai-lieu/${item.id}`}
                                className="font-bold text-[#141b2b] hover:text-[#00288e] line-clamp-1"
                              >
                                {item.title}
                              </Link>
                              <span className="text-[10px] text-[#757684]">
                                {item.fileFormat} • {item.pageCount || '--'} trang
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-[#0058be] block">
                            {item.university?.shortName || item.university?.name || 'Chưa cập nhật'}
                          </span>
                          <span className="text-[10px] text-[#757684]">{item.subject?.code || 'Chưa gắn môn'}</span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.status === 'PUBLISHED'
                              ? 'bg-[#d9f7ed] text-[#00563a]'
                              : item.status === 'PENDING_REVIEW'
                                ? 'bg-[#fffbeb] text-[#92400e]'
                                : 'bg-[#ffdad6] text-[#ba1a1a]'
                              }`}
                          >
                            {item.status === 'PUBLISHED' ? 'Đã xuất bản' : item.status}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-bold">{item.viewCount || 0}</span> xem •{' '}
                          <span className="font-bold">{item.downloadCount || 0}</span> tải
                        </td>
                        <td className="p-4 text-[11px] text-[#757684] whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/tai-lieu/${item.id}`}
                              className="rounded-lg bg-[#f1f3ff] p-1.5 text-[#00288e] hover:bg-[#e9edff] transition"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </Link>
                            <button
                              onClick={() => setEditingDoc(item)}
                              className="rounded-lg bg-[#f1f3ff] p-1.5 text-[#0058be] hover:bg-[#e9edff] transition"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(item.id)}
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                              title="Xóa tài liệu"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
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
        )}

        {/* ========================================================= */}
        {/* TAB 2: FAVORITES / BOOKMARKS */}
        {/* ========================================================= */}
        {activeTab === 'favorites' && (
          <div className="mt-6">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f1f3ff] text-2xl text-[#00288e]">
                  <span className="material-symbols-outlined text-[32px]">bookmark_border</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#141b2b]">Chưa có tài liệu nào được lưu</h3>
                <p className="mt-1 max-w-sm text-xs text-[#444653]">
                  Bấm vào biểu tượng bookmark ♡ trên bất kỳ tài liệu nào để lưu lại và ôn tập nhanh tại đây.
                </p>
                <Link
                  to="/"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#00288e] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1e40af] transition"
                >
                  Khám phá kho học liệu
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {favorites.map((doc) => (
                  <article
                    key={doc.id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:shadow-md"
                  >
                    <div>
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                        {doc.thumbnailUrl ? (
                          <img
                            src={
                              doc.thumbnailUrl.startsWith('http')
                                ? doc.thumbnailUrl
                                : `${apiOrigin}${doc.thumbnailUrl}`
                            }
                            alt=""
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-[#dde1ff]/40 text-3xl font-bold text-[#00288e]">
                            {doc.fileFormat || 'DOC'}
                          </div>
                        )}
                        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {doc.fileFormat} • {doc.pageCount || '--'} trang
                        </span>
                        <button
                          onClick={() => handleRemoveFavorite(doc.id)}
                          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#ba1a1a] shadow-sm hover:bg-white transition"
                          title="Bỏ lưu khỏi yêu thích"
                        >
                          <span className="material-symbols-outlined text-[18px]">bookmark_remove</span>
                        </button>
                      </div>

                      <div className="p-4">
                        <span className="text-[11px] font-semibold text-[#0058be]">
                          {doc.university?.shortName || doc.university?.name || 'Học viện'} •{' '}
                          {doc.subject?.code || 'Chuyên ngành'}
                        </span>
                        <h4 className="mt-1 line-clamp-2 text-sm font-bold text-[#141b2b]">
                          {doc.title}
                        </h4>
                        <div className="mt-3 flex items-center justify-between text-xs text-[#757684]">
                          <span>★ {Number(doc.ratingAverage || 0).toFixed(1)}</span>
                          <span>{doc.downloadCount || 0} lượt tải</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 bg-[#f9f9ff] p-3">
                      <Link
                        to={`/tai-lieu/${doc.id}`}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#00288e] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1e40af] transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        Đọc tài liệu ngay
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DOWNLOADS HISTORY */}
        {/* ========================================================= */}
        {activeTab === 'downloads' && (
          <div className="mt-6">
            {downloads.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f1f3ff] text-2xl text-[#00288e]">
                  <span className="material-symbols-outlined text-[32px]">download_for_offline</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#141b2b]">Chưa có lịch sử tải về</h3>
                <p className="mt-1 max-w-sm text-xs text-[#444653]">
                  Khi bạn tải tài liệu về máy, chúng sẽ được ghi nhận tại đây để bạn có thể tải lại bất cứ lúc nào.
                </p>
                <Link
                  to="/"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#00288e] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1e40af] transition"
                >
                  Khám phá tài liệu
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {downloads.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:shadow-md transition"
                  >
                    {doc.thumbnailUrl ? (
                      <img
                        src={
                          doc.thumbnailUrl.startsWith('http')
                            ? doc.thumbnailUrl
                            : `${apiOrigin}${doc.thumbnailUrl}`
                        }
                        alt=""
                        className="h-16 w-12 shrink-0 rounded-lg border border-slate-200 object-cover object-top shadow-xs"
                      />
                    ) : (
                      <div className="grid h-16 w-12 shrink-0 place-items-center rounded-lg bg-[#dde1ff] text-xs font-bold text-[#00288e]">
                        {doc.fileFormat}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 flex flex-col justify-between h-full">
                      <div>
                        <Link
                          to={`/tai-lieu/${doc.id}`}
                          className="font-bold text-xs text-[#141b2b] hover:text-[#00288e] line-clamp-2"
                        >
                          {doc.title}
                        </Link>
                        <span className="mt-1 block text-[11px] text-[#757684]">
                          {doc.university?.shortName || 'Trường'} • {doc.fileFormat}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-[10px] text-slate-400">
                          {doc.downloadedAt ? new Date(doc.downloadedAt).toLocaleDateString('vi-VN') : 'Đã tải'}
                        </span>
                        <Link
                          to={`/tai-lieu/${doc.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#00288e] hover:underline"
                        >
                          <span>Mở file</span>
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ACCOUNT & SECURITY */}
        {/* ========================================================= */}
        {activeTab === 'account' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Identity Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-[24px] text-[#00288e]">badge</span>
                <h3 className="text-base font-bold text-[#141b2b]">Hồ sơ Học thuật Sinh viên</h3>
              </div>

              <div className="mt-5 space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#757684]">Họ và tên:</span>
                  <strong className="text-[#141b2b]">{user?.fullName || '—'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#757684]">Email học thuật:</span>
                  <strong className="text-[#141b2b]">{user?.email || '—'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#757684]">Tên tài khoản:</span>
                  <strong className="text-[#141b2b]">@{user?.username || '—'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#757684]">Đơn vị Đào tạo:</span>
                  <strong className="text-[#00288e]">{user?.university?.name || 'Chưa cập nhật'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#757684]">Khoa / Viện:</span>
                  <strong className="text-[#141b2b]">{user?.faculty?.name || 'Chưa cập nhật'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[#757684]">Vai trò hệ thống:</span>
                  <span className="rounded-full bg-[#dde1ff] px-2 py-0.5 text-[10px] font-bold text-[#00288e]">
                    {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Sinh viên'}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-7">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-[24px] text-[#0058be]">lock_reset</span>
                <div>
                  <h3 className="text-base font-bold text-[#141b2b]">Đổi mật khẩu tài khoản</h3>
                  <p className="text-[11px] text-[#757684]">
                    Nên đặt mật khẩu từ 8 ký tự trở lên để bảo vệ tài khoản và học liệu.
                  </p>
                </div>
              </div>

              <form onSubmit={submitPassword} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-bold text-[#141b2b]">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    required
                    placeholder="Nhập mật khẩu đang dùng"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-bold text-[#141b2b]">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      required
                      minLength={8}
                      placeholder="Tối thiểu 8 ký tự"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-bold text-[#141b2b]">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      required
                      minLength={8}
                      placeholder="Nhập lại mật khẩu mới"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
                    />
                  </div>
                </div>

                {passwordError && (
                  <div className="rounded-xl bg-[#ffdad6] p-3 text-xs font-semibold text-[#ba1a1a]">
                    {passwordError}
                  </div>
                )}
                {passwordNotice && (
                  <div className="rounded-xl bg-[#d9f7ed] p-3 text-xs font-semibold text-[#00563a]">
                    ✓ {passwordNotice}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00288e] px-6 py-2.5 font-bold text-white shadow-sm hover:bg-[#1e40af] transition disabled:opacity-50"
                  >
                    {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Edit Document Modal */}
      {editingDoc && (
        <EditMyDocumentModal
          doc={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

function MetricCard({ label, value, icon, color, bg, subtext, progress = null }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#444653]">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${bg} ${color}`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </span>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold tracking-tight text-[#141b2b]">{value}</span>
        {progress !== null && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-[#00563a]" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
        <p className="mt-1 text-[11px] text-[#757684]">{subtext}</p>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label, badge = null }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${active
        ? 'bg-[#00288e] text-white shadow-sm font-bold'
        : 'bg-white text-[#444653] hover:bg-slate-100'
        }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <span>{label}</span>
      {badge !== null && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-[#dde1ff] text-[#00288e]'
            }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
