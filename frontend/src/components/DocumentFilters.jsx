const documentTypes = [['', 'Tất cả tài liệu'], ['EXAM', 'Đề thi & Đáp án'], ['LECTURE_NOTE', 'Bài giảng & Slide'], ['SUMMARY', 'Tóm tắt ôn tập (Cheat Sheet)'], ['THESIS', 'Luận văn / Đồ án tốt nghiệp'], ['ASSIGNMENT', 'Bài tập lớn (Assignment)']]
const faculties = ['Công nghệ thông tin', 'Quản trị kinh doanh', 'Tài chính - Ngân hàng', 'Luật học & Pháp lý', 'Y - Dược học', 'Khoa học dữ liệu']

function DocumentFilters({ filters, onChange, onReset }) {
  return (
    <aside className="filters-panel">
      <div className="filter-heading">
        <div><span className="filter-icon">≡</span><h2>Bộ lọc học thuật</h2></div>
        <button type="button" onClick={onReset}>Đặt lại</button>
      </div>
      <fieldset className="filter-group"><legend>Trường Đại Học</legend><input className="filter-search" placeholder="⌕  Tìm trường..." /><label className="filter-check checked"><input checked readOnly type="checkbox" /><span>ĐH Bách Khoa HN</span><small>12.4k</small></label><label className="filter-check"><input type="checkbox" /><span>ĐHQG TP.HCM</span><small>18.1k</small></label><label className="filter-check"><input type="checkbox" /><span>ĐH Kinh Tế Quốc Dân</span><small>15.2k</small></label><label className="filter-check"><input type="checkbox" /><span>ĐH Ngoại Thương</span><small>9.8k</small></label><button className="see-more" type="button">Xem thêm 75 trường khác →</button></fieldset>
      <fieldset className="filter-group"><legend>Khoa &amp; Ngành học</legend>{faculties.map((item) => <label className="filter-check" key={item}><input type="checkbox" /><span>{item}</span></label>)}</fieldset>
      <fieldset className="filter-group"><legend>Loại tài liệu</legend>
        {documentTypes.map(([value, label]) => <label className="filter-check" key={value || 'all'}><input checked={filters.documentType === value} name="document-type" onChange={() => onChange('documentType', value)} type="radio" /><span>{label}</span></label>)}
      </fieldset>
      <fieldset className="filter-group"><legend>Định dạng tệp</legend><div className="format-pills"><button className="selected" type="button">PDF (Tất cả)</button><button type="button">DOCX</button><button type="button">PPTX</button></div></fieldset>
      <fieldset className="filter-group"><legend>Mức đánh giá</legend><label className="filter-check"><input type="checkbox" /><span>★ 4.5 sao trở lên</span></label><label className="filter-check"><input type="checkbox" /><span>☆ 4.0 sao trở lên</span></label></fieldset>
      <label className="filter-label sort-label" htmlFor="sort-by">Sắp xếp theo</label>
      <select id="sort-by" onChange={(event) => onChange('sortBy', event.target.value)} value={filters.sortBy}>
        <option value="createdAt">Mới cập nhật</option>
        <option value="downloadCount">Lượt tải nhiều nhất</option>
        <option value="ratingAverage">Đánh giá cao nhất</option>
        <option value="title">Tên tài liệu A-Z</option>
      </select>
    </aside>
  )
}

export default DocumentFilters
