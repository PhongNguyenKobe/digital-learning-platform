const documentTypes = [
  ['', 'Tất cả tài liệu'],
  ['EXAM', 'Đề thi & đáp án'],
  ['LECTURE_NOTE', 'Slide bài giảng'],
  ['SUMMARY', 'Tóm tắt ôn tập'],
  ['THESIS', 'Đồ án / luận văn'],
]

const trendingSearches = ['Cơ sở dữ liệu HUST', 'Lập trình hướng đối tượng UIT', 'Thiết kế kiến trúc UAH', 'Marketing UEH', 'Lập trình căn bản Cần Thơ']

function SearchHero({ documentType, onDocumentTypeChange, onQueryChange, onSubmit, query, onTrendingSearch }) {
  return (
    <section className="search-hero">
      <div className="hero-decor hero-decor-top" />
      <div className="hero-decor hero-decor-bottom" />
      <div className="hero-copy">
        <span className="eyebrow"><span className="status-dot">✓</span> Hệ sinh thái tri thức sinh viên đại học <i /> <small>Danh mục 2026</small></span>
        <h1>Khám phá học liệu, đề thi &amp; bài giảng từ <em>15+ trường đại học trong danh mục</em></h1>
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
        <div><span className="stat-icon">⌂</span><span><strong>15+</strong><small>Trường trong danh mục</small></span></div>
        <div><span className="stat-icon green">✓</span><span><strong>17+</strong><small>Khoa / Viện phụ trách</small></span></div>
        <div><span className="stat-icon blue">♧</span><span><strong>20+</strong><small>Mã học phần mẫu</small></span></div>
        <div><span className="stat-icon">◉</span><span><strong>2026</strong><small>Danh mục cập nhật</small></span></div>
      </div>
    </section>
  )
}

export default SearchHero
