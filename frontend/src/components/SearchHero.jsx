const documentTypes = [
  ['', 'Tất cả tài liệu'],
  ['EXAM', 'Đề thi & đáp án'],
  ['LECTURE_NOTE', 'Slide bài giảng'],
  ['SUMMARY', 'Tóm tắt ôn tập'],
  ['THESIS', 'Đồ án / luận văn'],
]

const trendingSearches = ['Kinh tế vi mô', 'Giải tích 1 Bách Khoa', 'Lập trình Python ĐHQG', 'Luật dân sự NEU', 'Dược lý học lâm sàng']

function SearchHero({ documentType, onDocumentTypeChange, onQueryChange, onSubmit, query, onTrendingSearch }) {
  return (
    <section className="search-hero">
      <div className="hero-decor hero-decor-top" />
      <div className="hero-decor hero-decor-bottom" />
      <div className="hero-copy">
        <span className="eyebrow"><span className="status-dot">✓</span> Hệ sinh thái tri thức sinh viên đại học số 1 Việt Nam <i /> <small>Niên khóa 2024 - 2025</small></span>
        <h1>Hơn <strong>500,000+</strong> tài liệu học tập, đề thi &amp; bài giảng chất lượng cao từ <em>80+ trường đại học</em></h1>
        <p>Cộng đồng học thuật mở giúp sinh viên đạt điểm A+, hoàn thành đồ án xuất sắc và nâng cao năng lực nghiên cứu khoa học chuyên sâu.</p>
      </div>
      <form className="hero-search" onSubmit={onSubmit}>
        <span className="search-icon">⌕</span>
        <input
          aria-label="Tìm kiếm học liệu"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Nhập tên môn học, mã học phần (vd: MAT1093), giáo trình hoặc trường..."
          value={query}
        />
        <select aria-label="Loại tài liệu" onChange={(event) => onDocumentTypeChange(event.target.value)} value={documentType}>
          {documentTypes.map(([value, label]) => <option key={value || 'all'} value={value}>{label}</option>)}
        </select>
        <button type="submit">Tìm kiếm</button>
      </form>
      <div className="trending-searches"><span className="trending-label">♨ Xu hướng:</span>{trendingSearches.map((item) => <button key={item} onClick={() => onTrendingSearch(item)} type="button">{item}</button>)}</div>
      <div className="hero-stats">
        <div><span className="stat-icon">⌂</span><span><strong>80+</strong><small>Trường Đại Học</small></span></div>
        <div><span className="stat-icon green">✓</span><span><strong>520k+</strong><small>Tài Liệu Xác Thực</small></span></div>
        <div><span className="stat-icon blue">♧</span><span><strong>1.2M+</strong><small>Sinh Viên Tin Dùng</small></span></div>
        <div><span className="stat-icon">◉</span><span><strong>100%</strong><small>Đọc Trước Miễn Phí</small></span></div>
      </div>
    </section>
  )
}

export default SearchHero
