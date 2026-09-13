export default function AdminSidebar({ activeTab, setActiveTab, reportsCount = 0, currentUser, onLogout, canManageSystem = false }) {
  return (
    <aside className="flex w-full shrink-0 flex-col justify-between rounded-2xl bg-[#293040] p-5 text-[#edf0ff] shadow-2xl lg:w-72">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00288e] text-white shadow-md"><span className="material-symbols-outlined text-[22px]">policy</span></div>
          <div><div className="flex items-center gap-2"><span className="text-base font-bold text-white">Học Liệu Số</span><span className="rounded bg-[#0058be] px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">{canManageSystem ? 'Admin' : 'Duyệt'}</span></div><span className="text-xs text-[#b8c4ff]">Hệ thống giám sát học liệu</span></div>
        </div>
        <nav className="flex flex-col gap-1 pt-1">
          {canManageSystem && <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="dashboard" label="Tổng quan hệ thống" />}
          <NavItem active={activeTab === 'risk_queue'} onClick={() => setActiveTab('risk_queue')} icon="warning" iconColor="text-[#ffdad6]" label="Hàng đợi rủi ro" badge={reportsCount || null} />
          <NavItem active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon="library_books" label="Kiểm duyệt tài liệu" />
          {canManageSystem && <>
            <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="verified_user" label="Người dùng" />
            <NavItem active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon="payments" label="Doanh thu & thanh toán" />
            <div className="my-2 border-t border-white/10" />
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#b8c4ff]/60">Phân cấp học thuật</span>
            <NavItem active={activeTab === 'universities'} onClick={() => setActiveTab('universities')} icon="account_balance" label="Trường đại học" />
            <NavItem active={activeTab === 'faculties'} onClick={() => setActiveTab('faculties')} icon="domain" label="Khoa & bộ môn" />
            <NavItem active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon="menu_book" label="Học phần môn học" />
            <NavItem active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon="category" label="Danh mục học liệu" />
            <div className="my-2 border-t border-white/10" />
            <NavItem active={activeTab === 'audit_logs'} onClick={() => setActiveTab('audit_logs')} icon="history_edu" label="Nhật ký thanh tra" />
            <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="tune" label="Cài đặt & dọn dẹp" />
          </>}
        </nav>
        <div className="rounded-xl bg-white/5 p-3 text-xs text-[#b8c4ff]">{canManageSystem ? 'Quản trị toàn hệ thống và nhật ký kiểm toán.' : 'Bạn chỉ có quyền xử lý báo cáo, bình luận và trạng thái tài liệu.'}</div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex min-w-0 items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#1e40af] font-bold text-white">{currentUser?.fullName?.charAt(0) || 'A'}</div><div className="min-w-0"><span className="block truncate text-xs font-bold text-white">{currentUser?.fullName || 'Đang tải...'}</span><span className="block truncate text-[11px] text-[#b8c4ff]">{canManageSystem ? 'Quản trị viên' : 'Kiểm duyệt viên'}</span></div></div>
        <button onClick={onLogout} className="cursor-pointer rounded-lg p-1.5 text-[#b8c4ff] hover:bg-white/10 hover:text-white" title="Đăng xuất"><span className="material-symbols-outlined text-[18px]">logout</span></button>
      </div>
    </aside>
  )
}

function NavItem({ active, onClick, icon, iconColor = '', label, badge = null }) {
  return <button onClick={onClick} className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${active ? 'bg-white/15 text-white shadow-inner' : 'text-[#b8c4ff] hover:bg-white/10 hover:text-white'}`}><span className="flex items-center gap-2.5"><span className={`material-symbols-outlined text-[19px] ${iconColor}`}>{icon}</span>{label}</span>{badge !== null && <span className="rounded-full bg-[#ba1a1a] px-2 py-0.5 text-[10px] font-bold text-white">{badge}</span>}</button>
}
