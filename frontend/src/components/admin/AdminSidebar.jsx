export default function AdminSidebar({ activeTab, setActiveTab, reportsCount = 0, currentUser, onLogout }) {
  return (
    <aside className="flex w-full shrink-0 flex-col justify-between rounded-2xl bg-[#293040] p-5 text-[#edf0ff] shadow-2xl lg:w-72">
      <div className="flex flex-col gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00288e] text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">policy</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">Học Liệu Số</span>
              <span className="rounded bg-[#0058be] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                Admin
              </span>
            </div>
            <span className="text-xs text-[#b8c4ff]">Hệ thống Giám sát & Khảo thí</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1 pt-1">
          <NavItem
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon="dashboard"
            label="Tổng quan hệ thống"
          />
          <NavItem
            active={activeTab === 'risk_queue'}
            onClick={() => setActiveTab('risk_queue')}
            icon="warning"
            iconColor="text-[#ffdad6]"
            label="Hàng đợi Rủi ro"
            badge={reportsCount > 0 ? reportsCount : null}
            badgeColor="bg-[#ba1a1a]"
          />
          <NavItem
            active={activeTab === 'documents'}
            onClick={() => setActiveTab('documents')}
            icon="library_books"
            label="Quản lý Tài liệu"
          />
          <NavItem
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon="verified_user"
            iconColor="text-[#6ffbbe]"
            label="Người dùng & Uy tín"
          />

          <div className="my-2 border-t border-white/10" />

          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#b8c4ff]/60">
            Phân cấp học thuật
          </span>

          <NavItem
            active={activeTab === 'universities'}
            onClick={() => setActiveTab('universities')}
            icon="account_balance"
            label="Trường Đại học"
          />
          <NavItem
            active={activeTab === 'faculties'}
            onClick={() => setActiveTab('faculties')}
            icon="domain"
            label="Khoa & Bộ môn"
          />
          <NavItem
            active={activeTab === 'subjects'}
            onClick={() => setActiveTab('subjects')}
            icon="menu_book"
            label="Học phần môn học"
          />
          <NavItem
            active={activeTab === 'categories'}
            onClick={() => setActiveTab('categories')}
            icon="category"
            label="Danh mục học liệu"
          />

          <div className="my-2 border-t border-white/10" />

          <NavItem
            active={activeTab === 'audit_logs'}
            onClick={() => setActiveTab('audit_logs')}
            icon="history_edu"
            label="Nhật ký thanh tra"
          />
          <NavItem
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon="tune"
            label="Cài đặt & Dọn dẹp DMCA"
          />
        </nav>

        {/* Dynamic Rule Status Box */}
        <div className="mt-2 flex flex-col gap-1 rounded-xl bg-white/5 p-3 text-xs text-[#b8c4ff]">
          <div className="flex items-center gap-1.5 font-bold text-[#6ffbbe]">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Optimistic Rule v3.4</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#edf0ff]/70">
            Xuất bản 0s cho 99.2% học liệu đạt kiểm định sơ bộ OCR + Hash AI.
          </p>
        </div>
      </div>

      {/* Admin Profile & Logout */}
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#1e40af] text-center font-bold leading-9 text-white">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span>{currentUser?.fullName?.charAt(0) || 'A'}</span>
            )}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#6ffbbe] ring-2 ring-[#293040]" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-bold text-white">
              {currentUser?.fullName || 'Quản trị viên'}
            </span>
            <span className="truncate text-[11px] text-[#b8c4ff]">
              {currentUser?.role === 'ADMIN' ? 'Ban Quản trị Cấp cao' : 'Kiểm duyệt viên'}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg p-1.5 text-[#b8c4ff] hover:bg-white/10 hover:text-white transition"
          title="Đăng xuất"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>
    </aside>
  )
}

function NavItem({ active, onClick, icon, iconColor = '', label, badge = null, badgeColor = 'bg-[#ba1a1a]' }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
        active
          ? 'bg-white/15 text-white shadow-inner font-bold'
          : 'text-[#b8c4ff] hover:bg-white/10 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`material-symbols-outlined text-[19px] ${iconColor}`}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== null && (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  )
}
