import { useState } from 'react'

export default function CatalogModal({
  type,
  isEdit,
  data,
  universities = [],
  faculties = [],
  onClose,
  onSave,
}) {
  const [name, setName] = useState(data?.name || '')
  const [code, setCode] = useState(data?.code || '')
  const [slug, setSlug] = useState(data?.slug || '')
  const [description, setDescription] = useState(data?.description || '')
  const [universityId, setUniversityId] = useState(data?.universityId || '')
  const [facultyId, setFacultyId] = useState(data?.facultyId || '')

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { name }
    if (code) payload.code = code
    if (slug) payload.slug = slug
    if (description) payload.description = description
    if (type === 'faculty' && universityId) payload.universityId = universityId
    if (type === 'subject') {
      if (universityId) payload.universityId = universityId
      if (facultyId) payload.facultyId = facultyId
    }
    onSave(payload)
  }

  const typeLabels = {
    university: 'Trường Đại học',
    faculty: 'Khoa / Viện',
    subject: 'Môn học / Học phần',
    category: 'Danh mục Học liệu',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-bold text-[#141b2b]">
            {isEdit ? 'Chỉnh sửa' : 'Thêm mới'} {typeLabels[type] || 'Danh mục'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="mb-1 block font-bold text-[#141b2b]">Tên {typeLabels[type]}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#00288e]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-[#141b2b]">Mã định danh (Code / Slug)</label>
            <input
              type="text"
              value={code || slug}
              onChange={(e) => {
                setCode(e.target.value)
                setSlug(e.target.value)
              }}
              placeholder="VD: NEU, FIT, IT3040..."
              className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#00288e]"
            />
          </div>

          {(type === 'faculty' || type === 'subject') && (
            <div>
              <label className="mb-1 block font-bold text-[#141b2b]">Trường Đại học</label>
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
              >
                <option value="">-- Chọn trường --</option>
                {universities?.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}

          {type === 'subject' && (
            <div>
              <label className="mb-1 block font-bold text-[#141b2b]">Khoa trực thuộc</label>
              <select
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
              >
                <option value="">-- Chọn khoa --</option>
                {faculties?.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {type === 'category' && (
            <div>
              <label className="mb-1 block font-bold text-[#141b2b]">Mô tả danh mục</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
              />
            </div>
          )}

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
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
