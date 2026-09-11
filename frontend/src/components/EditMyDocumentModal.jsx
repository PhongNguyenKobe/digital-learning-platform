import { useState, useEffect } from 'react'
import { fetchUniversities, fetchFaculties, fetchSubjects } from '../services/api'

export default function EditMyDocumentModal({ doc, onClose, onSave }) {
  const [title, setTitle] = useState(doc.title || '')
  const [description, setDescription] = useState(doc.description || '')
  const [documentType, setDocumentType] = useState(doc.documentType || 'TEXTBOOK')
  const [visibility, setVisibility] = useState(doc.visibility || 'PUBLIC')
  const [academicYear, setAcademicYear] = useState(doc.academicYear || '')
  const [universityId, setUniversityId] = useState(doc.university?.id || doc.universityId || '')
  const [facultyId, setFacultyId] = useState(doc.faculty?.id || doc.facultyId || '')
  const [subjectId, setSubjectId] = useState(doc.subject?.id || doc.subjectId || '')
  const [isLocked, setIsLocked] = useState(Boolean(doc.isLocked))

  const [universities, setUniversities] = useState([])
  const [faculties, setFaculties] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadCatalog() {
      setLoading(true)
      try {
        const [uRes, fRes, sRes] = await Promise.all([
          fetchUniversities().catch(() => ({ data: [] })),
          fetchFaculties().catch(() => ({ data: [] })),
          fetchSubjects().catch(() => ({ data: [] })),
        ])
        if (!cancelled) {
          setUniversities(uRes.data || [])
          setFaculties(fRes.data || [])
          setSubjects(sRes.data || [])
        }
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadCatalog()
    return () => { cancelled = true }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Tiêu đề tài liệu không được để trống.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        documentType,
        visibility,
        isLocked,
        academicYear: academicYear.trim() || undefined,
        universityId: universityId || null,
        facultyId: facultyId || null,
        subjectId: subjectId || null,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Không thể lưu thay đổi.')
    } finally {
      setSaving(false)
    }
  }

  const documentTypeOptions = [
    { value: 'TEXTBOOK', label: 'Bài giảng & Giáo trình chuẩn' },
    { value: 'EXAM', label: 'Đề thi & Đáp án chính thức' },
    { value: 'LECTURE_NOTE', label: 'Slide bài giảng / Tóm tắt buổi học' },
    { value: 'SUMMARY', label: 'Đề cương & Tóm tắt ôn thi' },
    { value: 'THESIS', label: 'Đồ án tốt nghiệp / Luận văn' },
    { value: 'ASSIGNMENT', label: 'Bài tập lớn & Báo cáo thực hành' },
    { value: 'OTHER', label: 'Học liệu khác' },
  ]

  const visibilityOptions = [
    { value: 'PUBLIC', label: 'Công khai (Miễn phí cho cộng đồng)' },
    { value: 'UNLISTED', label: 'Không liệt kê (Chỉ ai có link mới xem được)' },
    { value: 'PRIVATE', label: 'Riêng tư (Chỉ mình bạn xem)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00288e]">edit_document</span>
            <h3 className="text-base font-bold text-[#141b2b]">Chỉnh sửa Thông tin Tài liệu</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="rounded-xl bg-[#ffdad6] p-3 text-xs font-semibold text-[#ba1a1a]">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block font-bold text-[#141b2b]">
              Tiêu đề tài liệu <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Giáo trình Cơ sở dữ liệu nâng cao..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-3.5 text-xs text-[#141b2b] outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-bold text-[#141b2b]">Phân loại học liệu</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
              >
                {documentTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-bold text-[#141b2b]">Chế độ hiển thị</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
              >
                {visibilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block font-bold text-[#141b2b]">Trường Đại học</label>
              <select
                value={universityId}
                onChange={(e) => {
                  setUniversityId(e.target.value)
                  setFacultyId('')
                  setSubjectId('')
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
              >
                <option value="">-- Chọn trường --</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.shortName || u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-bold text-[#141b2b]">Khoa / Viện</label>
              <select
                value={facultyId}
                onChange={(e) => {
                  setFacultyId(e.target.value)
                  setSubjectId('')
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
              >
                <option value="">-- Chọn khoa --</option>
                {faculties
                  .filter((f) => !universityId || f.universityId === universityId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-bold text-[#141b2b]">Học phần / Môn</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 px-2.5 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
              >
                <option value="">-- Chọn môn --</option>
                {subjects
                  .filter((s) => !facultyId || s.facultyId === facultyId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-bold text-[#141b2b]">Tóm tắt nội dung & Mô tả</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả nội dung học liệu, giáo trình của thầy cô nào, đề thi kỳ nào..."
              className="w-full rounded-xl border border-slate-200 bg-[#f1f3ff]/60 p-3 text-xs text-[#141b2b] outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
            />
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00288e] focus:ring-[#00288e]"
              />
              <div>
                <span className="block text-xs font-bold text-[#141b2b]">
                  Khóa tài liệu này (Yêu cầu mở khóa)
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Tài liệu bị khóa sẽ làm mờ trang đọc thử trực tuyến và yêu cầu người xem dùng 1 Credit hoặc gói Học liệu số Pass để tải file.
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 font-bold text-[#444653] hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#00288e] px-5 py-2.5 font-bold text-white shadow-sm hover:bg-[#1e40af] transition disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
