import { useState } from 'react'

export default function EditUserModal({ user, onClose, onSave }) {
  const [fullName, setFullName] = useState(user.fullName || '')
  const [role, setRole] = useState(user.role || 'STUDENT')
  const [status, setStatus] = useState(user.status || 'ACTIVE')
  const [trustScore, setTrustScore] = useState(user.trustScore ?? 50)

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ fullName, role, status, trustScore: Number(trustScore) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-bold text-[#141b2b]">Chỉnh sửa Người dùng</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="mb-1 block font-bold text-[#141b2b]">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#00288e]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-[#141b2b]">Vai trò (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
              >
                <option value="STUDENT">STUDENT (Sinh viên)</option>
                <option value="MODERATOR">MODERATOR (Kiểm duyệt viên)</option>
                <option value="ADMIN">ADMIN (Quản trị viên)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-bold text-[#141b2b]">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 outline-none"
              >
                <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                <option value="SUSPENDED">SUSPENDED (Tạm khóa)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-bold text-[#141b2b]">
              Điểm Uy tín (Trust Score: 0 - 100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={trustScore}
              onChange={(e) => setTrustScore(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#00288e]"
              required
            />
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
