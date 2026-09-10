import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createComment, fetchComments, fetchDocument, rateDocument, toggleFavorite } from '../services/api'

const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '')

function DocumentDetailsPage() {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [score, setScore] = useState(0)
  const [review, setReview] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchDocument(id), fetchComments(id)]).then(([documentResponse, commentResponse]) => {
      if (cancelled) return
      setDocument(documentResponse.data)
      setComments(commentResponse.data || [])
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.response?.data?.error?.message || 'Không thể tải chi tiết tài liệu.')
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const fileUrl = useMemo(() => document?.fileUrl ? `${apiOrigin}${document.fileUrl}` : '', [document])

  async function submitComment(event) {
    event.preventDefault()
    if (!comment.trim()) return
    try { const response = await createComment(id, { content: comment.trim() }); setComments((current) => [response.data, ...current]); setComment(''); setNotice('Bình luận đã được đăng.') } catch (requestError) { setNotice(requestError.response?.data?.error?.message || 'Bạn cần đăng nhập để bình luận.') }
  }

  async function submitRating() {
    if (!score) return
    try { await rateDocument(id, { score, review }); setDocument((current) => ({ ...current, ratingAverage: score, ratingCount: Number(current.ratingCount || 0) + 1 })); setNotice('Cảm ơn đánh giá của bạn.') } catch (requestError) { setNotice(requestError.response?.data?.error?.message || 'Bạn cần đăng nhập để đánh giá.') }
  }

  async function changeFavorite() {
    try { await toggleFavorite(id, !favorite); setFavorite((current) => !current); setNotice(favorite ? 'Đã bỏ khỏi thư viện.' : 'Đã lưu vào thư viện của tôi.') } catch (requestError) { setNotice(requestError.response?.data?.error?.message || 'Bạn cần đăng nhập để lưu tài liệu.') }
  }

  async function downloadFile() {
    const token = localStorage.getItem('hls_access_token')
    try { const response = await fetch(`${apiOrigin}/api/documents/${id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); if (!response.ok) throw new Error('download'); const blob = await response.blob(); const link = window.document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = document.originalFileName || 'hoc-lieu'; link.click(); URL.revokeObjectURL(link.href) } catch { setNotice('Không thể tải file. Hãy đăng nhập và kiểm tra file đã có trên storage.') }
  }

  if (loading) return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-slate-500">Đang mở tài liệu...</div>
  if (error || !document) return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-red-700">{error || 'Không tìm thấy tài liệu.'}</div>

  return (
    <div className="min-h-screen bg-[#f9f9ff]"><div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <nav className="mb-5 text-xs text-slate-500"><Link className="hover:text-blue-700" to="/">Trang chủ</Link><span className="mx-2">›</span>{document.university?.shortName || 'Học liệu'}<span className="mx-2">›</span><span className="text-slate-900">{document.title}</span></nav>
      <div className="mb-7 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e9edff] px-3 py-1 text-xs font-bold text-blue-800">{document.university?.name || 'Học Liệu Số'}</span>{document.isVerified && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">✓ Đã xác thực chất lượng</span>}<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">{document.academicYear || 'Tài liệu học tập'}</span></div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{document.title}</h1><div className="flex shrink-0 gap-4 text-sm text-slate-500"><span className="font-bold text-blue-800">★ {Number(document.ratingAverage || 0).toFixed(1)} ({document.ratingCount || 0})</span><span>◉ {document.viewCount || 0}</span></div></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"><section className="space-y-6">
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
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {document.description}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400">
              Tác giả chưa cung cấp tóm tắt chi tiết cho học liệu này. Bạn có thể xem trước nội dung trực tiếp ở khung đọc bên dưới.
            </p>
          )}

          {/* Tags từ khóa nếu có */}
          {Array.isArray(document.tags) && document.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-400">Từ khóa:</span>
              {document.tags.map((item, idx) => {
                const tagName = item.tag?.name || item.name || item;
                return (
                  <span
                    key={item.id || idx}
                    className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Khung đọc tài liệu trực tuyến */}
        <div>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-semibold text-slate-700">Đọc online · {document.pageCount || '--'} trang</span>
            <div className="flex gap-2">
              <button className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700" onClick={downloadFile} type="button">
                ⇩ Tải xuống
              </button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-lg text-slate-600 transition hover:border-slate-300" onClick={changeFavorite} title="Yêu thích" type="button">
                {favorite ? '♥' : '♡'}
              </button>
            </div>
          </div>

          <div className="flex min-h-150 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {fileUrl && document.fileFormat === 'PDF' ? (
              <iframe className="h-190 w-full rounded-lg" src={fileUrl} title={document.title} />
            ) : (
              <div className="max-w-md text-center">
                <div className="mb-4 text-7xl text-blue-200">▤</div>
                <h2 className="text-xl font-bold text-slate-800">{document.originalFileName}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Định dạng {document.fileFormat}. Hãy tải file về để mở bằng ứng dụng tương thích.</p>
                <button className="mt-5 rounded-lg bg-blue-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700" onClick={downloadFile} type="button">
                  Tải file về máy
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Khối Bình luận */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Bình luận ({comments.length})</h2>
          <form className="flex gap-3" onSubmit={submitComment}>
            <textarea className="min-h-12 flex-1 resize-y rounded-lg bg-slate-50 px-4 py-3 text-sm outline-none ring-blue-600 focus:ring-2" onChange={(event) => setComment(event.target.value)} placeholder="Chia sẻ nhận xét của bạn..." value={comment} />
            <button className="self-end rounded-lg bg-blue-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700" type="submit">Gửi</button>
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
          {notice && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{notice}</div>}
        </aside>
      </div>
    </div></div>
  )
}

export default DocumentDetailsPage
