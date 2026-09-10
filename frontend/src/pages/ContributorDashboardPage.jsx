import { useEffect, useMemo, useState } from 'react'
import { fetchFaculties, fetchMyDocuments, fetchSubjects, fetchUniversities, uploadDocument } from '../services/api'
import { extractPdfCover } from '../utils/pdfThumbnail'

const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '')
const currentAcademicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
const initialForm = { title: '', documentType: 'TEXTBOOK', universityId: '', universityQuery: '', facultyId: '', facultyQuery: '', subjectId: '', subjectQuery: '', academicYear: currentAcademicYear, visibility: 'PUBLIC', description: '', tags: '' }

function ContributorDashboardPage() {
  const [documents, setDocuments] = useState([])
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [thumbnailBlob, setThumbnailBlob] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [pageCount, setPageCount] = useState(null)
  const [extractingCover, setExtractingCover] = useState(false)
  const [progress, setProgress] = useState(0)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const [universities, setUniversities] = useState([])
  const [faculties, setFaculties] = useState([])
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    Promise.all([fetchUniversities(), fetchFaculties(), fetchSubjects()]).then(([universityResponse, facultyResponse, subjectResponse]) => {
      setUniversities(universityResponse.data || [])
      setFaculties(facultyResponse.data || [])
      setSubjects(subjectResponse.data || [])
    }).catch(() => setNotice('Không thể tải danh sách trường, khoa và môn học.'))
    fetchMyDocuments({ limit: 20 }).then((response) => setDocuments(response.data || [])).catch((error) => setNotice(error.response?.data?.error?.message || 'Không thể tải danh sách tài liệu.')).finally(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => ({
    downloads: documents.reduce((sum, item) => sum + Number(item.downloadCount || 0), 0),
    published: documents.filter((item) => item.status === 'PUBLISHED').length,
    processing: documents.filter((item) => item.processingStatus !== 'COMPLETED').length,
  }), [documents])

  function changeField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }
  function selectCatalogField(name, item) { const label = item.shortName ? `${item.shortName} - ${item.name}` : item.code ? `${item.code} - ${item.name}` : item.name; setForm((current) => ({ ...current, [`${name}Query`]: label, [`${name}Id`]: item.id, ...(name === 'university' ? { facultyId: '', facultyQuery: '', subjectId: '', subjectQuery: '' } : {}), ...(name === 'faculty' ? { subjectId: '', subjectQuery: '' } : {}) })) }
  function typeCatalogField(name, value) { setForm((current) => ({ ...current, [`${name}Query`]: value, [`${name}Id`]: '' })) }

  async function selectFile(event) {
    const selected = event.target.files?.[0] || null
    setFile(selected)
    setProgress(0)
    setNotice('')
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
      setThumbnailPreview('')
    }
    setThumbnailBlob(null)
    setPageCount(null)

    if (selected && (selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf'))) {
      setExtractingCover(true)
      try {
        const { thumbnailBlob: blob, pageCount: count, previewUrl } = await extractPdfCover(selected)
        if (blob) setThumbnailBlob(blob)
        if (previewUrl) setThumbnailPreview(previewUrl)
        if (count) setPageCount(count)
      } catch (err) {
        console.warn('Lỗi trích xuất ảnh bìa PDF:', err)
      } finally {
        setExtractingCover(false)
      }
    }
  }

  function clearForm() {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setForm(initialForm)
    setFile(null)
    setThumbnailBlob(null)
    setThumbnailPreview('')
    setPageCount(null)
    setExtractingCover(false)
    setProgress(0)
    setNotice('')
    setAccepted(false)
  }

  async function submit(event) {
    event.preventDefault()
    if (!file) { setNotice('Vui lòng chọn tệp tin tải lên.'); return }
    if (!form.universityId || !form.facultyId) { setNotice('Vui lòng chọn Trường Đại học và Khoa / Viện từ dropdown.'); return }
    if (!accepted) { setNotice('Vui lòng xác nhận tuân thủ chính sách bản quyền.'); return }
    const data = new FormData()
    Object.entries(form).filter(([key]) => !key.endsWith('Query')).forEach(([key, value]) => { if (value) data.append(key, value) })
    data.append('file', file)
    if (thumbnailBlob) {
      data.append('thumbnail', thumbnailBlob, 'thumbnail.jpg')
    }
    if (pageCount) {
      data.append('pageCount', String(pageCount))
    }
    setProgress(0); setNotice('Đang tải file lên...')
    try {
      const response = await uploadDocument(data, (eventProgress) => setProgress(Math.round((eventProgress.loaded * 100) / (eventProgress.total || 1))))
      setDocuments((current) => [response.data, ...current])
      setNotice('Tải lên thành công. Hệ thống đã lưu trữ tài liệu cùng ảnh bìa trang 1.')
      clearForm()
    } catch (error) {
      setNotice(error.response?.data?.error?.message || 'Không thể tải tài liệu lên.')
    }
  }

  return <div className="min-h-screen bg-[#f9f9ff]"><div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 lg:px-6 lg:py-10">
    <section><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><span className="rounded-full bg-[#dde1ff] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00288e]">Bảng quản trị tác giả</span><span className="text-[#c4c5d5]">/</span><span className="text-xs text-[#444653]">Học kỳ 2 - 2024-2025</span></div><h1 className="mt-3 text-3xl font-bold tracking-tight text-[#141b2b]">Quản lý tài liệu đã tải lên</h1><p className="mt-2 text-sm text-[#444653]">Theo dõi lượt xem, tải xuống, chỉ số trích dẫn và trạng thái phân loại tự động qua AI.</p></div><a className="rounded-lg bg-[#00288e] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#1e40af]" href="#upload">⊕ Tải lên tài liệu mới</a></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Tổng tài liệu" value={documents.length} note="Đã phủ nhiều chuyên ngành" icon="▤" /><Metric label="Lượt tải về" value={metrics.downloads.toLocaleString('vi-VN')} note="Tổng lượt tải cộng đồng" icon="⇩" /><Metric label="Đã xuất bản" value={metrics.published} note="Đang hiển thị công khai" icon="✓" green /><Metric label="Tài liệu xử lý AI" value={metrics.processing} note="Đang phân tích OCR" icon="✦" /></div>
    </section>
    <section className="overflow-hidden rounded-xl bg-white shadow-md" id="upload"><div className="flex flex-col justify-between gap-3 bg-[#f1f3ff] px-5 py-4 md:flex-row md:items-center lg:px-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#00288e] text-white">☁</span><div><h2 className="font-bold text-[#141b2b]">Quy trình Tải lên &amp; Khai báo Học liệu Chuẩn hóa</h2><p className="text-xs text-[#444653]">Đóng góp cho cộng đồng học thuật Việt Nam qua 3 bước tự động hóa thông minh</p></div></div><span className="rounded-full bg-[#6ffbbe]/60 px-3 py-1 text-[10px] font-bold text-[#00563a]">✓ Tự động trích xuất trang bìa</span></div>
      <form className="flex flex-col gap-6 p-5 lg:p-7" onSubmit={submit}><div className="grid gap-2 md:grid-cols-3"><Step number="✓" label="Bước 1: Hoàn tất" title="Chọn tệp tin tải lên" done /><Step number="2" label="Bước 2: Đang thực hiện" title="Thông tin & Gắn thẻ môn học" active /><Step number="3" label="Bước 3: Bước tiếp theo" title="Kiểm tra AI & Xuất bản" /></div>
        <label className="block cursor-pointer rounded-xl bg-[#f1f3ff] p-4 transition-colors hover:bg-[#e9edff]/70"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[#dce2f7] text-2xl text-[#00288e]">▣</span><span><strong className="block text-sm text-[#141b2b]">{file ? file.name : 'Chọn tệp tin học liệu để bắt đầu'}</strong><small className="mt-1 block text-xs text-[#444653]">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ${progress || 0}% đã tải` : 'Kéo thả file hoặc chọn từ máy tính · tối đa 50MB'}</small></span></div><span className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#00288e] shadow-sm">⇄ {file ? 'Đổi tệp tin' : 'Chọn file'}</span></div><input accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" className="sr-only" id="contributor-file" onChange={selectFile} required={!file} type="file" /></label>

        {extractingCover && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/80 px-4 py-3 text-xs text-[#00288e]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#00288e] border-t-transparent" />
            <span>Đang đọc file PDF và tự động trích xuất trang 1 làm ảnh bìa thumbnail...</span>
          </div>
        )}

        {thumbnailPreview && (
          <div className="flex items-center gap-4 rounded-xl border border-emerald-300/80 bg-emerald-50/70 p-3.5 shadow-xs">
            <img
              alt="Xem trước trang bìa"
              className="h-24 w-18 shrink-0 rounded-md border border-emerald-300 object-cover object-top shadow-sm"
              src={thumbnailPreview}
            />
            <div className="min-w-0 flex-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#00563a]">
                <span>✓</span>
                <span>Đã tự động trích xuất trang bìa (trang 1)</span>
              </div>
              <p className="mt-1 text-[#444653]">
                Trang đầu tiên này sẽ được dùng làm ảnh thumbnail đại diện cho tài liệu.
                {pageCount ? ` Nhận diện tự động: ${pageCount} trang.` : ''}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-12"><Field className="md:col-span-12" label="Tiêu đề tài liệu học thuật" name="title" onChange={changeField} placeholder="Ví dụ: Giáo trình Cơ sở dữ liệu nâng cao - Bài giảng & Đề thi 2024" required value={form.title} /><CatalogInput className="md:col-span-6" label="Trường Đại học đào tạo" name="university" items={universities} onSelect={(item) => selectCatalogField('university', item)} onType={(value) => typeCatalogField('university', value)} required value={form.universityQuery} /><CatalogInput className="md:col-span-3" label="Khoa / Viện phụ trách" name="faculty" items={faculties.filter((item) => !form.universityId || item.universityId === form.universityId)} onSelect={(item) => selectCatalogField('faculty', item)} onType={(value) => typeCatalogField('faculty', value)} required value={form.facultyQuery} /><CatalogInput className="md:col-span-3" label="Mã học phần / Môn học" name="subject" items={subjects.filter((item) => !form.facultyId || item.facultyId === form.facultyId)} onSelect={(item) => selectCatalogField('subject', item)} onType={(value) => typeCatalogField('subject', value)} value={form.subjectQuery} /><SelectField className="md:col-span-6" label="Phân loại học liệu" name="documentType" onChange={changeField} value={form.documentType} options={['TEXTBOOK: Bài giảng & Giáo trình chuẩn', 'EXAM: Đề thi & Đáp án', 'LECTURE_NOTE: Slide bài giảng', 'SUMMARY: Tóm tắt ôn tập', 'THESIS: Đồ án / Luận văn', 'ASSIGNMENT: Bài tập lớn']} /><Field className="md:col-span-3" label="Học kỳ / Năm xuất bản" name="academicYear" onChange={changeField} placeholder={currentAcademicYear} value={form.academicYear} /><SelectField className="md:col-span-3" label="Chế độ chia sẻ" name="visibility" onChange={changeField} value={form.visibility} options={['PUBLIC: Công khai miễn phí', 'UNLISTED: Không liệt kê', 'PRIVATE: Riêng tư']} /><label className="md:col-span-12"><span className="mb-2 flex justify-between text-xs font-semibold text-[#141b2b]"><span>Tóm tắt nội dung &amp; Mục tiêu chính</span><span className="font-normal text-[#444653]">Tối đa 5000 ký tự</span></span><textarea className="h-28 w-full rounded-lg bg-[#f1f3ff] px-4 py-3 text-sm text-[#141b2b] outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]" name="description" onChange={changeField} placeholder="Mô tả nội dung chính, đối tượng sử dụng, mục tiêu học tập..." value={form.description} /></label><Field className="md:col-span-12" label="Thẻ từ khóa học thuật (Tags)" name="tags" onChange={changeField} placeholder="Nhập các thẻ, phân cách bằng Enter hoặc dấu phẩy" value={form.tags} /></div>
        {progress > 0 && <div><div className="mb-1 flex justify-between text-xs text-[#444653]"><span>Tiến trình tải lên</span><b>{progress}%</b></div><div className="h-2 overflow-hidden rounded-full bg-[#dce2f7]"><div className="h-full bg-[#0058be] transition-all" style={{ width: `${progress}%` }} /></div></div>}
        <label className="flex items-start gap-2 rounded-lg bg-[#f1f3ff] p-3 text-xs leading-5 text-[#444653]"><input checked={accepted} className="mt-1 accent-[#00288e]" onChange={(event) => setAccepted(event.target.checked)} type="checkbox" />Tôi xác nhận tài liệu này tuân thủ <a className="font-semibold text-[#00288e]" href="#policy">Chính sách Bản quyền &amp; Liêm chính Học thuật</a> của Học Liệu Số.</label><div className="flex flex-col justify-between gap-4 border-t border-[#c4c5d5]/30 pt-5 sm:flex-row sm:items-center"><span className="text-sm text-[#00563a]">{notice}</span><div className="flex gap-3"><button className="rounded-lg border border-[#c4c5d5] px-4 py-2 text-sm font-semibold text-[#141b2b]" onClick={clearForm} type="button">Hủy bỏ phiên tải lên</button><button className="rounded-lg bg-[#00288e] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e40af]" type="submit">☁ Xuất bản ngay</button></div></div>
      </form></section>
    <DocumentTable apiOrigin={apiOrigin} documents={documents} loading={loading} />
    <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#00288e] px-6 py-6 text-white shadow-md md:flex-row md:items-center"><div><span className="text-xs font-bold uppercase tracking-widest text-[#b8c4ff]">Chính sách Thưởng Tác Giả &amp; Vinh Danh Học Liệu 2025</span><p className="mt-2 max-w-2xl text-xs leading-5 text-[#d8e2ff]">Mỗi tài liệu chất lượng được kiểm duyệt thành công giúp bạn nhận điểm tín nhiệm và mở khóa quyền lợi cộng đồng.</p></div><button className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#00288e]" type="button">Xem bảng vinh danh</button></div>
  </div></div>
}

function Step({ active, done, label, number, title }) { return <div className={`flex items-center gap-3 rounded-lg p-3 ${active ? 'bg-[#dde1ff]/60' : done ? 'bg-[#f1f3ff]' : 'bg-[#f1f3ff]/60'}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${active ? 'bg-[#00288e] text-white' : done ? 'bg-[#00563a] text-white' : 'bg-[#dce2f7] text-[#444653]'}`}>{number}</span><span><small className={`block text-[10px] font-bold uppercase tracking-wider ${active ? 'text-[#00288e]' : done ? 'text-[#00563a]' : 'text-[#444653]'}`}>{label}</small><strong className="block text-xs text-[#141b2b]">{title}</strong></span></div> }
function Field({ className = '', label, name, onChange, placeholder, required, value }) { return <label className={className}><span className="mb-2 block text-xs font-semibold text-[#141b2b]">{label}{required && <b className="ml-1 text-[#ba1a1a]">*</b>}</span><input className="h-10.5 w-full rounded-lg bg-[#f1f3ff] px-3 text-sm text-[#141b2b] outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]" name={name} onChange={onChange} placeholder={placeholder} required={required} value={value} /></label> }
function CatalogInput({ className = '', items, label, onSelect, onType, required, value }) {
  const [open, setOpen] = useState(false)
  const filteredItems = items.filter((item) => { const text = `${item.shortName || ''} ${item.code || ''} ${item.name}`.toLowerCase(); return text.includes(value.toLowerCase()) })
  function select(item) { setOpen(false); onSelect(item) }
  return <label className={`relative block ${className}`}><span className="mb-2 block text-xs font-semibold text-[#141b2b]">{label}{required && <b className="ml-1 text-[#ba1a1a]">*</b>}</span><div className="relative"><input autoComplete="off" className={`h-10.5 w-full rounded-lg bg-[#f1f3ff] px-3 pr-10 text-sm text-[#141b2b] outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e] ${required && !value ? 'ring-1 ring-[#f59e0b]' : ''}`} onBlur={() => setTimeout(() => setOpen(false), 150)} onChange={(event) => { onType(event.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Gõ hoặc bấm để chọn" value={value} /><button aria-label={`Mở danh sách ${label}`} className="absolute right-2 top-2 text-[#444653]" onClick={() => setOpen((current) => !current)} type="button">⌄</button></div>{open && <div className="absolute left-0 right-0 top-16.5 z-30 max-h-56 overflow-y-auto rounded-lg border border-[#c4c5d5] bg-white p-1 shadow-xl">{filteredItems.length ? filteredItems.map((item) => <button className="block w-full rounded px-3 py-2 text-left text-xs text-[#141b2b] hover:bg-[#e9edff]" key={item.id} onMouseDown={() => select(item)} type="button">{item.shortName ? `${item.shortName} - ${item.name}` : item.code ? `${item.code} - ${item.name}` : item.name}</button>) : <p className="px-3 py-2 text-xs text-[#757684]">Không tìm thấy dữ liệu phù hợp.</p>}</div>}</label>
}
function SelectField({ className = '', label, name, onChange, options, value }) { return <label className={className}><span className="mb-2 block text-xs font-semibold text-[#141b2b]">{label}</span><select className="h-10.5 w-full rounded-lg bg-[#f1f3ff] px-3 text-sm text-[#141b2b] outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]" name={name} onChange={onChange} value={value}>{options.map((item) => { const [optionValue, optionLabel] = item.split(': '); return <option key={optionValue} value={optionValue}>{optionLabel}</option> })}</select></label> }
function Metric({ green, icon, label, note, value }) { return <div className="rounded-xl bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-xs font-semibold text-[#444653]"><span>{label}</span><span className={`grid h-10 w-10 place-items-center rounded-lg bg-[#f1f3ff] text-xl ${green ? 'text-[#00563a]' : 'text-[#00288e]'}`}>{icon}</span></div><div className="mt-5 text-2xl font-bold text-[#141b2b]">{value}</div><p className="mt-2 text-[11px] text-[#444653]">{note}</p></div> }
function DocumentTable({ apiOrigin, documents, loading }) {
  return <section><div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><h2 className="text-xl font-bold text-[#141b2b]">Danh sách học liệu của tôi</h2><p className="mt-1 text-xs text-[#444653]">Quản lý trực quan, theo dõi kiểm duyệt và cập nhật phiên bản mới cho tài liệu</p></div><div className="flex gap-1 rounded-lg bg-[#f1f3ff] p-1 text-[11px]"><span className="rounded bg-white px-3 py-2 font-bold text-[#00288e] shadow-sm">Tất cả ({documents.length})</span><span className="px-3 py-2 text-[#444653]">Đã xuất bản</span><span className="px-3 py-2 text-[#444653]">Chờ xử lý AI</span></div></div><div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full min-w-195 border-collapse text-left text-xs"><thead className="bg-[#f1f3ff] text-[10px] uppercase tracking-wider text-[#444653]"><tr><th className="p-4">Tên tài liệu &amp; Mã tệp</th><th className="p-4">Trường &amp; Chuyên ngành</th><th className="p-4">Trạng thái phát hành</th><th className="p-4">Lượt xem / Tải</th><th className="p-4">Thời gian tải</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-[#e9edff]">{loading && <tr><td className="p-6 text-center text-[#444653]" colSpan="6">Đang tải dữ liệu...</td></tr>}{!loading && documents.map((item) => <tr className="hover:bg-[#f1f3ff]/50" key={item.id}><td className="p-4"><div className="flex items-center gap-3">{item.thumbnailUrl ? (<img alt="" className="h-12 w-9 shrink-0 rounded border border-[#c4c5d5]/60 object-cover object-top shadow-xs" src={item.thumbnailUrl.startsWith('http') ? item.thumbnailUrl : `${apiOrigin}${item.thumbnailUrl}`} />) : (<span className="grid h-11 w-9 shrink-0 place-items-center rounded bg-[#dce2f7] text-lg text-[#00288e]">▤</span>)}<span><strong className="block max-w-xs truncate text-sm text-[#141b2b]">{item.title}</strong><small className="text-[10px] text-[#444653]">HLS-{item.id.slice(-6)} · {item.fileFormat} · {item.pageCount || '--'} trang</small></span></div></td><td className="p-4"><strong className="block text-[#00288e]">{item.university?.shortName || item.university?.name || 'Chưa cập nhật'}</strong><span className="text-[10px] text-[#444653]">{item.subject?.code || 'Chưa gắn môn'}</span></td><td className="p-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === 'PUBLISHED' ? 'bg-[#d9f7ed] text-[#00563a]' : 'bg-[#fffbeb] text-[#92400e]'}`}>{item.status === 'PUBLISHED' ? 'Đã xuất bản' : item.status === 'PENDING_REVIEW' ? 'Chờ kiểm duyệt' : item.status}</span></td><td className="p-4"><strong>{item.viewCount || 0} / {item.downloadCount || 0}</strong><small className="block text-[10px] text-[#444653]">★ {Number(item.ratingAverage || 0).toFixed(1)}</small></td><td className="p-4 text-[10px] text-[#444653]">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td><td className="p-4 text-right text-[#00288e]">✎ ◉ ⋮</td></tr>)}{!loading && documents.length === 0 && <tr><td className="p-8 text-center text-[#444653]" colSpan="6">Bạn chưa có tài liệu. Hãy tải lên tài liệu đầu tiên.</td></tr>}</tbody></table></div></section>
}

export default ContributorDashboardPage
