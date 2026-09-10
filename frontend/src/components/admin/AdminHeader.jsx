export default function AdminHeader({ activeTab }) {
  const tabTitles = {
    overview: {
      breadcrumb: 'Tổng quan hệ thống',
      heading: 'Trung tâm Thẩm định & Giám sát Tự động',
    },
    risk_queue: {
      breadcrumb: 'Hàng đợi kiểm duyệt sau (Post-Moderation Queue)',
      heading: 'Hàng đợi Rủi ro & Báo cáo Vi phạm',
    },
    documents: {
      breadcrumb: 'Quản lý toàn bộ học liệu & xuất bản',
      heading: 'Quản trị Thư viện Tài liệu',
    },
    users: {
      breadcrumb: 'Quản trị người dùng & Uy tín học thuật',
      heading: 'Danh sách Thành viên & Chỉ số Uy tín',
    },
    universities: {
      breadcrumb: 'Danh mục Trường Đại học & Học viện',
      heading: 'Quản lý Danh mục Trường Đại học',
    },
    faculties: {
      breadcrumb: 'Khoa & Ngành đào tạo',
      heading: 'Quản lý Danh mục Khoa',
    },
    subjects: {
      breadcrumb: 'Môn học & Học phần khảo cứu',
      heading: 'Quản lý Danh mục Môn học',
    },
    categories: {
      breadcrumb: 'Danh mục phân loại học liệu',
      heading: 'Quản lý Danh mục Phân loại',
    },
    audit_logs: {
      breadcrumb: 'Nhật ký thanh tra hoạt động hệ thống',
      heading: 'Nhật ký Truy vết & Thanh tra Hệ thống',
    },
    settings: {
      breadcrumb: 'Cài đặt quy chế DMCA & Dọn dẹp dữ liệu',
      heading: 'Dọn dẹp Rác Tự động & Cấu hình DMCA',
    },
  }

  const current = tabTitles[activeTab] || tabTitles.overview

  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#757684]">
          <span>Bảng quản trị</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-bold text-[#00288e]">{current.breadcrumb}</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#141b2b] md:text-2xl">
          {current.heading}
        </h1>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-3 rounded-xl bg-[#f1f3ff] px-4 py-2.5">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00563a] opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00563a]" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#141b2b]">Cơ chế Xuất bản Lạc quan: ĐANG BẬT</span>
          <span className="text-[11px] text-[#444653]">Tài liệu lập tức khả dụng • AI lọc rủi ro 24/7</span>
        </div>
      </div>
    </div>
  )
}
