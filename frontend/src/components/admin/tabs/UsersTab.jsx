import { useState, useMemo } from 'react'

export default function UsersTab({
  users = [],
  userSearch = '',
  setUserSearch,
  onOpenCreateUserModal,
  onOpenEditUserModal,
  onDeleteUser,
  onQuickGrantTrust,
}) {
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter
      return matchesRole
    })
  }, [users, userRoleFilter])

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <h2 className="text-base font-bold text-[#141b2b]">
            Quản trị Người dùng & Điểm Uy tín Học thuật (Trust Score)
          </h2>
          <p className="text-xs text-[#444653]">
            Tài khoản có Trust Score ≥ 85 được công nhận là{' '}
            <strong>Đại sứ Học liệu (Trusted Contributor)</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#757684] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo MSSV, Email, Họ tên..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full rounded-xl bg-[#f1f3ff] py-2 pl-9 pr-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
            />
          </div>
          <button
            onClick={onOpenCreateUserModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#00288e] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1e40af] transition"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Thêm Người dùng
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#141b2b]">
          <thead>
            <tr className="bg-[#f1f3ff] text-[11px] font-bold uppercase tracking-wider text-[#444653]">
              <th className="rounded-l-lg p-3">Họ tên & Tài khoản</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3">Trường / Đơn vị</th>
              <th className="p-3">Credits / VIP</th>
              <th className="p-3">Chỉ số Uy tín (Trust Score)</th>
              <th className="p-3">Trạng thái quyền</th>
              <th className="rounded-r-lg p-3 text-right">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-[#444653]">
                  Không có người dùng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const score = u.trustScore ?? 50
                const isHigh = score >= 85
                const isLow = score < 60
                return (
                  <tr key={u.id} className="hover:bg-[#f1f3ff]/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#e9edff] flex items-center justify-center font-bold text-[#00288e]">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            u.fullName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#141b2b]">{u.fullName}</span>
                          <span className="text-[11px] text-[#444653]">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-[#ba1a1a] text-white'
                            : u.role === 'MODERATOR'
                            ? 'bg-[#0058be] text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-[#141b2b]">{u.university?.name || 'Chưa cập nhật'}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#00288e]">{u.downloadCredits ?? 2} Credits</span>
                        {u.isPremium && (
                          <span className="rounded-full border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-800">
                            VIP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full ${
                              isHigh ? 'bg-[#00563a]' : isLow ? 'bg-[#ba1a1a]' : 'bg-[#0058be]'
                            }`}
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold ${
                            isHigh ? 'text-[#00563a]' : isLow ? 'text-[#ba1a1a]' : 'text-[#0058be]'
                          }`}
                        >
                          {score}/100
                        </span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {isHigh ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d9f7ed] px-2 py-0.5 text-[10px] font-bold text-[#00563a]">
                          <span className="material-symbols-outlined text-[13px]">stars</span>
                          Đại sứ học liệu
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold text-[#ba1a1a]">
                          Cảnh báo vi phạm
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#f1f3ff] px-2 py-0.5 text-[10px] font-semibold text-[#444653]">
                          Thành viên chuẩn
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isHigh && (
                          <button
                            onClick={() => onQuickGrantTrust(u.id)}
                            className="rounded bg-[#d9f7ed] px-2 py-1 text-[11px] font-bold text-[#00563a] hover:bg-green-200 transition"
                            title="Cấp quyền Trusted (Điểm 95)"
                          >
                            Cấp Trusted
                          </button>
                        )}
                        <button
                          onClick={() => onOpenEditUserModal(u)}
                          className="rounded bg-[#f1f3ff] p-1.5 text-[#00288e] hover:bg-[#e1e8fd] transition"
                          title="Chỉnh sửa quyền và thông tin"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-700 transition"
                          title="Khóa/Xóa tài khoản"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
