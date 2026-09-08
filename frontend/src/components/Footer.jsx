import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-[#c4c5d5]/30 bg-[#f1f3ff]">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div>
          <Link className="mb-4 flex items-center gap-2 text-[#00288e]" to="/">
            <img alt="Logo Học Liệu Số" className="h-7 w-auto object-contain" src="/hoc-lieu-so-logo.png" />
            <span className="text-lg font-bold">Học Liệu Số</span>
          </Link>
          <p className="max-w-xs text-[13px] leading-relaxed text-[#444653]">Hệ sinh thái lưu trữ, tìm kiếm và chia sẻ tài liệu học tập, giáo trình, đề thi chất lượng cao dành riêng cho sinh viên và giảng viên đại học toàn quốc.</p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#00563a]"><span className="text-lg">✓</span><span>Kiểm định chất lượng học thuật</span></div>
        </div>
        <div><h2 className="mb-4 text-base font-semibold text-[#141b2b]">Về Học Liệu Số</h2><div className="space-y-3 text-[13px] text-[#444653]"><a className="block hover:text-[#00288e]" href="#gioi-thieu">Giới thiệu nền tảng</a><a className="block hover:text-[#00288e]" href="#quy-che">Quy chế chia sẻ học liệu</a><a className="block hover:text-[#00288e]" href="#dieu-khoan">Điều khoản dịch vụ</a><a className="block hover:text-[#00288e]" href="#bao-mat">Chính sách bảo mật</a></div></div>
        <div><h2 className="mb-4 text-base font-semibold text-[#141b2b]">Dành cho cộng đồng</h2><div className="space-y-3 text-[13px] text-[#444653]"><Link className="block hover:text-[#00288e]" to="/dong-gop">Đóng góp tài liệu</Link><Link className="block hover:text-[#00288e]" to="/">Tìm kiếm học liệu</Link><a className="block hover:text-[#00288e]" href="mailto:support@hoclieuso.vn">Báo cáo nội dung</a><span className="mt-2 block text-[11px]">Miễn phí 100% dành cho sinh viên chia sẻ học liệu mở</span></div></div>
        <div><h2 className="mb-4 text-base font-semibold text-[#141b2b]">Kết nối với chúng tôi</h2><p className="text-[13px] leading-relaxed text-[#444653]">Cùng xây dựng cộng đồng học thuật minh bạch, hữu ích và đáng tin cậy.</p><a className="mt-3 block text-[13px] font-semibold text-[#00288e] hover:underline" href="mailto:support@hoclieuso.vn">support@hoclieuso.vn</a></div>
        </div>
      </div>
      <div className="border-t border-[#c4c5d5]/40"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[11px] text-[#444653] sm:flex-row sm:items-center sm:justify-between lg:px-6"><span>© {new Date().getFullYear()} Học Liệu Số. Đồ án tốt nghiệp.</span><span>Thiết kế cho giáo dục đại học Việt Nam.</span></div></div>
    </footer>
  )
}

export default Footer
