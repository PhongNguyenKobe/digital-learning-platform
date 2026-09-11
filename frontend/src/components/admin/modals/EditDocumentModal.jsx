import { useState } from 'react'

export default function EditDocumentModal({
  doc,
  universities = [],
  faculties = [],
  subjects = [],
  categories = [],
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState(doc.title || '')
  const [description, setDescription] = useState(doc.description || '')
  const [status, setStatus] = useState(doc.status || 'PUBLISHED')
  const [universityId, setUniversityId] = useState(doc.universityId || '')
  const [facultyId, setFacultyId] = useState(doc.facultyId || '')
  const [subjectId, setSubjectId] = useState(doc.subjectId || '')
  const [categoryId, setCategoryId] = useState(doc.categoryId || '')
  const [isLocked, setIsLocked] = useState(Boolean(doc.isLocked))

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      title,
      description,
      status,
      isLocked,
      universityId: universityId || null,
      facultyId: facultyId || null,
      subjectId: subjectId || null,
      categoryId: categoryId || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-bold text-[#141b2b]">Chỉnh sửa Thông tin Tài liệu</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="mb-1 block font-bold text-[#141b2b]">Tiêu đề tài liệu</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#00288e]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-[#141b2b]">Mô tả tóm tắt</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#00288e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-[#141b2b]">Trạng thái xuất bản</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
              >
                <option value="PUBLISHED">PUBLISHED (Công khai)</option>
                <option value="PENDING">PENDING (Chờ duyệt)</option>
                <option value="REJECTED">REJECTED (Từ chối / Gỡ)</option>
                <option value="ARCHIVED">ARCHIVED (Lưu trữ)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-bold text-[#141b2b]">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <label className="flex items-center gap-2 font-bold text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="h-4 w-4 rounded text-[#00288e]"
              />
              <span>Khóa tài liệu (Cần Credit hoặc VIP để tải)</span>
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#00288e] px-4 py-2 font-bold text-white shadow-sm hover:bg-[#1e40af] transition"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
