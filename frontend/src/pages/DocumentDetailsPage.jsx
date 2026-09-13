import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createComment,
  fetchComments,
  fetchCurrentUser,
  fetchDocument,
  rateDocument,
  reportDocument,
  toggleFavorite,
  unlockDocument,
} from '../services/api'
import PremiumModal from '../components/PremiumModal'

import { apiOrigin } from '../services/apiOrigin'

function DocumentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [score, setScore] = useState(0)
  const [review, setReview] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('INCORRECT_INFORMATION')
  const [reportDescription, setReportDescription] = useState('')
  const [reporting, setReporting] = useState(false)

  const token = localStorage.getItem('hls_access_token')

  useEffect(() => {
    let cancelled = false
    const promises = [fetchDocument(id), fetchComments(id)]
    if (token) promises.push(fetchCurrentUser().catch(() => null))

    Promise.all(promises)
      .then(([documentResponse, commentResponse, userResponse]) => {
        if (cancelled) return
        setDocument(documentResponse.data)
        setComments(commentResponse.data || [])
        if (userResponse?.data) setCurrentUser(userResponse.data)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.response?.data?.error?.message || 'Không thể tải chi tiết tài liệu.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, token])

  const fileUrl = useMemo(() => {
    if (!document) return ''
    const params = document.isLocked && token ? `?previewToken=${encodeURIComponent(token)}` : ''
    return `${apiOrigin}/api/documents/${id}/content${params}`
  }, [document, id, token])

  async function submitComment(event) {
    event.preventDefault()
    if (!comment.trim()) return
    try {
      const response = await createComment(id, { content: comment.trim() })
      setComments((current) => [response.data, ...current])
      setComment('')
      setNotice('Bình luận đã được đăng.')
    } catch (requestError) {
      setNotice(requestError.response?.data?.error?.message || 'Bạn cần đăng nhập để bình luận.')
    }
  }

  async function submitRating() {
    if (!score) return
    try {
      await rateDocument(id, { score, review })
      setDocument((current) => ({
        ...current,
        ratingAverage: score,
        ratingCount: Number(current.ratingCount || 0) + 1,
      }))
      setNotice('Cảm ơn đánh giá của bạn.')
    } catch (requestError) {
      setNotice(requestError.response?.data?.error?.message || 'Bạn cần đăng nhập để đánh giá.')
    }
  }

  async function changeFavorite() {
    try {
      await toggleFavorite(id, !favorite)
      setFavorite((current) => !current)
      setNotice(favorite ? 'Đã bỏ khỏi thư viện.' : 'Đã lưu vào thư viện của tôi.')
    } catch (requestError) {
      setNotice(requestError.response?.data?.error?.message || 'Bạn cần đăng nhập để lưu tài liệu.')
    }
  }

  async function submitReport(event) {
    event.preventDefault()
    if (!token) {
      navigate(`/dang-nhap?redirect=/tai-lieu/${id}`)
      return
    }
    setReporting(true)
    try {
      await reportDocument(id, { reason: reportReason, description: reportDescription.trim() })
      setReportOpen(false)
      setReportDescription('')
      setNotice('Báo cáo đã được gửi đến hàng đợi kiểm duyệt. Cảm ơn bạn đã góp phần giữ kho học liệu an toàn.')
    } catch (requestError) {
      setNotice(requestError.response?.data?.error?.message || 'Không thể gửi báo cáo. Vui lòng thử lại.')
    } finally {
      setReporting(false)
    }
  }

  async function handleUnlock() {
    if (!token) {
      navigate(`/dang-nhap?redirect=/tai-lieu/${id}`)
      return
    }
    setUnlocking(true)
    setError('')
    try {
      const res = await unlockDocument(id)
      setDocument((prev) => ({ ...prev, canViewFull: true, isUnlocked: true }))
      if (res.data?.remainingCredits !== undefined && currentUser) {
        setCurrentUser((prev) => ({ ...prev, downloadCredits: res.data.remainingCredits }))
      }
      setNotice(res.data?.message || 'Mở khóa tài liệu thành công!')
      window.dispatchEvent(new Event('hls-auth-changed'))
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Không thể mở khóa tài liệu.'
      setNotice(msg)
    } finally {
      setUnlocking(false)
    }
  }

  async function downloadFile() {
    if (!token) {
      navigate(`/dang-nhap?redirect=/tai-lieu/${id}`)
      return
    }
    // Nếu tài liệu bị khóa và chưa mở khóa
    if (document?.isLocked && !document?.canViewFull) {
      await handleUnlock()
      return
    }

    try {
      const response = await fetch(`${apiOrigin}/api/documents/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || 'Không thể tải file.')
      }
      const blob = await response.blob()
      const link = window.document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = document.originalFileName || 'hoc-lieu'
      link.click()
      URL.revokeObjectURL(link.href)
      setNotice('Tải xuống tài liệu thành công!')
      window.dispatchEvent(new Event('hls-auth-changed'))
    } catch (err) {
      setNotice(err.message || 'Không thể tải file. Hãy kiểm tra số credit hoặc file đã có trên storage.')
    }
  }

  function handlePremiumSuccess(updatedUser) {
    setCurrentUser(updatedUser)
    setDocument((prev) => ({ ...prev, canViewFull: true, isUnlocked: true }))
    setNotice('Chúc mừng bạn đã kích hoạt gói VIP! Toàn bộ học liệu đã được mở khóa.')
    window.dispatchEvent(new Event('hls-auth-changed'))
  }

  if (loading) return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-slate-500">Đang mở tài liệu...</div>
  if (error || !document) return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-red-700">{error || 'Không tìm thấy tài liệu.'}</div>

  const isLockedForUser = Boolean(document.isLocked && !document.canViewFull)

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <nav className="mb-5 text-xs text-slate-500">
          <Link className="hover:text-blue-700" to="/">Trang chủ</Link>
          <span className="mx-2">›</span>
          {document.university?.shortName || 'Học liệu'}
          <span className="mx-2">›</span>
          <span className="text-slate-900">{document.title}</span>
        </nav>

        {/* Tags & Badges */}
        <div className="mb-7 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#e9edff] px-3 py-1 text-xs font-bold text-blue-800">
            {document.university?.name || 'Học Liệu Số'}
          </span>
          {document.isVerified && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              ✓ Đã xác thực chất lượng
            </span>
          )}
          {document.isLocked ? (
            <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1">
              Tài liệu Mở khóa (Locked)
            </span>
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
              Miễn phí hoàn toàn (Free)
            </span>
          )}
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            {document.academicYear || 'Tài liệu học tập'}
          </span>
        </div>

        {/* Title */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{document.title}</h1>
          <div className="flex shrink-0 gap-4 text-sm text-slate-500">
            <span className="font-bold text-blue-800">
              ★ {Number(document.ratingAverage || 0).toFixed(1)} ({document.ratingCount || 0})
            </span>
            <span>◉ {document.viewCount || 0}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section className="space-y-6">
            {/* Khối Tóm tắt nội dung & Mục tiêu chính */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  Tóm tắt nội dung &amp; Mục tiêu chính
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {document.documentType || 'Tài liệu'}
                </span>
              </div>

              {document.description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{document.description}</p>
              ) : (
                <p className="text-sm italic text-slate-400">
                  Tác giả chưa cung cấp tóm tắt chi tiết cho học liệu này. Bạn có thể xem trước nội dung trực tiếp ở khung đọc bên dưới.
                </p>
              )}

              {Array.isArray(document.tags) && document.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-slate-400">Từ khóa:</span>
                  {document.tags.map((item, idx) => {
                    const tagName = item.tag?.name || item.name || item
                    return (
                      <span
                        key={item.id || idx}
                        className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        #{tagName}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Khung đọc tài liệu trực tuyến (Có hiệu ứng mờ khi Locked) */}
            <div>
              <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-semibold text-slate-700">
                  Đọc online · {document.pageCount || '--'} trang
                  {isLockedForUser && <span className="ml-2 text-xs font-normal text-amber-600">(Xem thử 1 trang)</span>}
                </span>
                <div className="flex items-center gap-2">
                  {isLockedForUser && (
                    <button
                      className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-amber-600 shadow-xs"
                      disabled={unlocking}
                      onClick={handleUnlock}
                      type="button"
                    >
                      {unlocking ? 'Đang mở khóa...' : 'Mở khóa (1 Credit)'}
                    </button>
                  )}
                  <button
                    className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                    onClick={downloadFile}
                    type="button"
                  >
                    ⇩ {isLockedForUser ? 'Mở khóa để tải' : 'Tải xuống'}
                  </button>
                  <button
                    className="rounded-lg border border-slate-200 px-3 py-2 text-lg text-slate-600 transition hover:border-slate-300"
                    onClick={changeFavorite}
                    title="Yêu thích"
                    type="button"
                  >
                    {favorite ? '♥' : '♡'}
                  </button>
                </div>
              </div>

              {isLockedForUser ? (
                /* CHẾ ĐỘ XEM THỬ TRANG 1 & KHÓA TỪ TRANG 2 */
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-2.5 text-xs text-amber-900 shadow-2xs">
                    <span className="font-semibold">
                      Bản xem trước miễn phí: Trang 1 / {document.pageCount || '--'}
                    </span>
                    <span className="text-[11px] font-medium text-amber-800">
                      Mở khóa để đọc trọn vẹn và tải file gốc
                    </span>
                  </div>

                  {/* KHUNG HIỂN THỊ TRANG 1 RÕ NÉT */}
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <PageOnePreview
                      apiOrigin={apiOrigin}
                      thumbnailUrl={document.thumbnailUrl}
                      fileUrl={`${apiOrigin}/api/documents/${id}/preview`}
                      title={document.title}
                    />
                  </div>

                  {/* KHUNG TRANG 2 BỊ LÀM MỜ VÀ ĐÈ OVERLAY KHÓA */}
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm min-h-105">
                    {/* Giả lập các trang tiếp theo bị làm mờ */}
                    <div className="pointer-events-none select-none p-8 filter blur-md opacity-25 space-y-4">
                      <div className="h-6 w-3/4 rounded bg-slate-400" />
                      <div className="h-4 w-full rounded bg-slate-300" />
                      <div className="h-4 w-5/6 rounded bg-slate-300" />
                      <div className="h-4 w-4/5 rounded bg-slate-300" />
                      <div className="h-36 w-full rounded bg-slate-200" />
                      <div className="h-4 w-full rounded bg-slate-300" />
                      <div className="h-4 w-11/12 rounded bg-slate-300" />
                      <div className="h-4 w-3/4 rounded bg-slate-300" />
                    </div>

                    {/* Hộp thoại kêu gọi mở khóa */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-linear-to-b from-slate-900/60 via-slate-900/85 to-slate-900/95 p-6 text-center text-white backdrop-blur-[1px]">
                      <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-slate-900/85 p-6 shadow-2xl backdrop-blur-md sm:p-7">
                        <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                          Nội dung tài liệu đã bị khóa
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                          Bạn vừa xem xong trang 1 miễn phí. Mở khóa để xem toàn bộ {document.pageCount ? `${document.pageCount} trang` : ''} sắc nét và tải file gốc về máy.
                        </p>

                        {/* Hiển thị số Credit hiện tại */}
                        <div className="my-4 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs">
                          {token ? (
                            <div className="flex items-center justify-between px-2">
                              <span className="text-slate-300">Lượt tải của bạn:</span>
                              <span className="font-bold text-amber-300">
                                {currentUser?.downloadCredits ?? 0} Credits
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300">
                              Đăng ký tài khoản mới được tặng ngay <strong>2 lượt tải miễn phí</strong>.
                            </span>
                          )}
                        </div>

                        {/* Các lựa chọn mở khóa (Không có icon 📤) */}
                        <div className="space-y-2.5 text-left">
                          {token && (currentUser?.downloadCredits ?? 0) > 0 ? (
                            <button
                              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-amber-400 disabled:opacity-50 text-center block"
                              disabled={unlocking}
                              onClick={handleUnlock}
                              type="button"
                            >
                              {unlocking ? 'Đang mở khóa...' : 'Dùng 1 Credit để mở khóa ngay'}
                            </button>
                          ) : (
                            <Link
                              className="flex w-full items-center justify-center rounded-xl bg-[#00288e] py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#002070] text-center"
                              to={token ? `/dong-gop?targetUnlockId=${id}` : `/dang-nhap?redirect=/tai-lieu/${id}`}
                            >
                              <span>
                                {token
                                  ? 'Đăng tải tài liệu của bạn để mở khóa (Give-to-Get)'
                                  : 'Đăng nhập để nhận 2 Credit miễn phí'}
                              </span>
                            </Link>
                          )}

                          <button
                            className="flex w-full items-center justify-center rounded-xl border border-amber-300/40 bg-amber-400/10 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/20"
                            onClick={() => setPremiumModalOpen(true)}
                            type="button"
                          >
                            <span>Nâng cấp Học liệu số Pass (Tải không giới hạn, không cần upload)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ ĐỌC TRỌN VẸN CHO TÀI LIỆU MIỄN PHÍ HOẶC ĐÃ MỞ KHÓA */
                <div className="relative min-h-150 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  {fileUrl && document.fileFormat === 'PDF' ? (
                    <iframe className="h-190 w-full rounded-lg" src={fileUrl} title={document.title} />
                  ) : (
                    <div className="flex h-150 flex-col items-center justify-center text-center">
                      <div className="mb-4 text-7xl text-blue-200">▤</div>
                      <h2 className="text-xl font-bold text-slate-800">{document.originalFileName}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Định dạng {document.fileFormat}. Hãy tải file về để mở bằng ứng dụng tương thích.
                      </p>
                      <button
                        className="mt-5 rounded-lg bg-blue-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        onClick={downloadFile}
                        type="button"
                      >
                        Tải file về máy
                      </button>
                    </div>
                  )}
                </div>
              )}
              </div>

            {/* Khối Bình luận */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Bình luận ({comments.length})</h2>
              <form className="flex gap-3" onSubmit={submitComment}>
                <textarea
                  className="min-h-12 flex-1 resize-y rounded-lg bg-slate-50 px-4 py-3 text-sm outline-none ring-blue-600 focus:ring-2"
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Chia sẻ nhận xét của bạn..."
                  value={comment}
                />
                <button className="self-end rounded-lg bg-blue-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700" type="submit">
                  Gửi
                </button>
              </form>
              <div className="mt-5 space-y-4">
                {comments.map((item) => (
                  <div className="border-t border-slate-100 pt-4" key={item.id}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-xs text-blue-800">
                        {(item.author?.fullName || 'SV').slice(0, 2).toUpperCase()}
                      </span>
                      {item.author?.fullName || 'Người dùng'}
                      <span className="ml-auto text-xs font-normal text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="mt-2 pl-9 text-sm leading-6 text-slate-600">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Thông tin tài liệu</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Môn học</dt>
                  <dd className="text-right font-semibold text-slate-800">{document.subject?.code} · {document.subject?.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Khoa</dt>
                  <dd className="text-right font-semibold text-slate-800">{document.faculty?.name || 'Chưa cập nhật'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Định dạng</dt>
                  <dd className="font-semibold text-blue-800">{document.fileFormat}</dd>
                </div>
                {document.fileSizeBytes && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Kích thước</dt>
                    <dd className="font-semibold text-slate-800">
                      {document.fileSizeBytes > 1024 * 1024
                        ? `${(Number(document.fileSizeBytes) / (1024 * 1024)).toFixed(1)} MB`
                        : `${Math.round(Number(document.fileSizeBytes) / 1024)} KB`}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Lượt tải</dt>
                  <dd className="font-semibold text-slate-800">{document.downloadCount}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Quyền truy cập</dt>
                  <dd className="font-semibold">
                    {document.isLocked ? (
                      <span className="text-amber-700">Yêu cầu mở khóa</span>
                    ) : (
                      <span className="text-emerald-700">Miễn phí</span>
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Người đóng góp</p>
                <p className="mt-2 font-bold text-slate-900">{document.uploader?.fullName}</p>
                <p className="text-xs text-slate-500">{document.uploader?.username || 'Contributor'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-slate-900">Đánh giá tài liệu</h2>
              <div className="mb-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((item) => (
                  <button
                    className={`text-2xl ${item <= score ? 'text-amber-500' : 'text-slate-300'}`}
                    key={item}
                    onClick={() => setScore(item)}
                    type="button"
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="h-20 w-full resize-none rounded-lg bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                onChange={(event) => setReview(event.target.value)}
                placeholder="Viết nhận xét (không bắt buộc)"
                value={review}
              />
              <button className="mt-3 w-full rounded-lg bg-blue-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700" onClick={submitRating} type="button">
                Gửi đánh giá
              </button>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">Phát hiện vấn đề?</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">Báo cáo vi phạm bản quyền, nội dung sai hoặc tệp lỗi để kiểm duyệt viên xử lý.</p>
              <button className="mt-3 w-full cursor-pointer rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100" onClick={() => setReportOpen(true)} type="button">
                Báo cáo tài liệu
              </button>
            </div>
            {notice && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{notice}</div>}
          </aside>
        </div>
      </div>

      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        onSuccess={handlePremiumSuccess}
        userCredits={currentUser?.downloadCredits ?? 0}
      />

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onSubmit={submitReport}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Báo cáo tài liệu</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">Báo cáo sẽ được gửi riêng đến kiểm duyệt viên.</p>
              </div>
              <button className="cursor-pointer rounded-md p-1 text-xl text-slate-400 hover:bg-slate-100" onClick={() => setReportOpen(false)} type="button" aria-label="Đóng">×</button>
            </div>
            <label className="mt-5 block text-sm font-semibold text-slate-700">Lý do</label>
            <select className="mt-1 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-600" value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
              <option value="COPYRIGHT">Vi phạm bản quyền</option>
              <option value="INAPPROPRIATE">Nội dung không phù hợp</option>
              <option value="INCORRECT_INFORMATION">Thông tin không chính xác</option>
              <option value="SPAM">Spam / quảng cáo</option>
              <option value="BROKEN_FILE">Tệp hỏng hoặc không tải được</option>
              <option value="OTHER">Lý do khác</option>
            </select>
            <label className="mt-4 block text-sm font-semibold text-slate-700">Mô tả <span className="font-normal text-slate-400">(không bắt buộc)</span></label>
            <textarea className="mt-1 min-h-28 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-600" maxLength="5000" value={reportDescription} onChange={(event) => setReportDescription(event.target.value)} placeholder="Nêu rõ vị trí, lý do hoặc thông tin giúp kiểm duyệt viên xác minh..." />
            <div className="mt-5 flex justify-end gap-3">
              <button className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100" onClick={() => setReportOpen(false)} type="button">Hủy</button>
              <button className="cursor-pointer rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-800 disabled:cursor-wait disabled:opacity-60" disabled={reporting} type="submit">{reporting ? 'Đang gửi...' : 'Gửi báo cáo'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function PageOnePreview({ apiOrigin, thumbnailUrl, fileUrl, title }) {
  const canvasRef = useRef(null)
  const thumbnailSrc = thumbnailUrl
    ? (thumbnailUrl.startsWith('http') ? thumbnailUrl : `${apiOrigin}${thumbnailUrl}`)
    : ''
  const [thumbnailAvailable, setThumbnailAvailable] = useState(Boolean(thumbnailSrc))
  const [loadingPdf, setLoadingPdf] = useState(!thumbnailSrc && Boolean(fileUrl))
  const [hasRendered, setHasRendered] = useState(false)

  useEffect(() => {
    if (thumbnailAvailable || !fileUrl) return

    let cancelled = false
    async function renderPage1() {
      try {
        setLoadingPdf(true)
        const pdfjsLib = await import('pdfjs-dist')
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
          ).toString()
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`
        }

        const loadingTask = pdfjsLib.getDocument({ url: fileUrl })
        const pdfDoc = await loadingTask.promise
        const page = await pdfDoc.getPage(1)
        if (cancelled) return

        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        const defaultViewport = page.getViewport({ scale: 1.0 })
        const targetWidth = Math.min(800, window.innerWidth - 64)
        const scale = Math.max(1.0, Math.min(2.0, targetWidth / defaultViewport.width))
        const viewport = page.getViewport({ scale })

        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)

        await page.render({ canvasContext: context, viewport }).promise
        if (!cancelled) {
          setHasRendered(true)
          setLoadingPdf(false)
        }
      } catch (err) {
        console.warn('Lỗi khi render trang 1 bằng PDF.js:', err)
        if (!cancelled) setLoadingPdf(false)
      }
    }

    renderPage1()
    return () => {
      cancelled = true
    }
  }, [fileUrl, thumbnailAvailable])

  if (thumbnailAvailable) {
    return (
      <div className="flex justify-center bg-slate-100 p-2 sm:p-4">
        <img
          src={thumbnailSrc}
          alt={title || 'Trang 1 xem thử'}
          className="w-full max-w-2xl h-auto rounded-lg shadow-md border border-slate-200 object-contain block bg-white"
          onError={() => setThumbnailAvailable(false)}
        />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-120 w-full flex-col items-center justify-center bg-slate-100 p-2 sm:p-4">
      {loadingPdf && (
        <div className="flex flex-col items-center gap-2 py-16 text-slate-500 text-xs">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Đang tải trang 1 xem thử...</span>
        </div>
      )}
      <div className={`w-full max-w-2xl rounded-lg shadow-md border border-slate-200 overflow-hidden bg-white ${hasRendered ? 'block' : 'hidden'}`}>
        <canvas ref={canvasRef} className="w-full h-auto block" />
      </div>
      {!hasRendered && !loadingPdf && (
        <div className="w-full max-w-2xl h-150 rounded-lg shadow-md border border-slate-200 overflow-hidden bg-white">
          <iframe
            className="w-full h-full pointer-events-none"
            src={`${fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0`}
            title="Trang 1 xem thử"
          />
        </div>
      )}
    </div>
  )
}

export default DocumentDetailsPage
