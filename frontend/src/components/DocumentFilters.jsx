import { useEffect, useMemo, useState } from 'react'
import { fetchFaculties, fetchUniversities } from '../services/api'

const documentTypes = [['', 'Tất cả tài liệu'], ['EXAM', 'Đề thi & Đáp án'], ['LECTURE_NOTE', 'Bài giảng & Slide'], ['SUMMARY', 'Tóm tắt ôn tập'], ['THESIS', 'Luận văn / Đồ án tốt nghiệp'], ['ASSIGNMENT', 'Bài tập lớn']]

function DocumentFilters({ filters, onChange, onReset }) {
  const [universityQuery, setUniversityQuery] = useState('')
  const [universities, setUniversities] = useState([])
  const [faculties, setFaculties] = useState([])
  const [showAllUniversities, setShowAllUniversities] = useState(false)

  useEffect(() => {
    fetchUniversities().then((response) => setUniversities(response.data)).catch(() => setUniversities([]))
  }, [])

  useEffect(() => {
    fetchFaculties(filters.universityId ? { universityId: filters.universityId } : {})
      .then((response) => setFaculties(response.data))
      .catch(() => setFaculties([]))
  }, [filters.universityId])

  const visibleUniversities = useMemo(() => {
    const keyword = universityQuery.trim().toLocaleLowerCase('vi-VN')
    const matching = keyword
      ? universities.filter((item) => `${item.name} ${item.shortName || ''} ${item.code}`.toLocaleLowerCase('vi-VN').includes(keyword))
      : universities
    return showAllUniversities || keyword ? matching : matching.slice(0, 6)
  }, [showAllUniversities, universities, universityQuery])

  function selectUniversity(university) {
    onChange('universityId', university.id)
    onChange('universityName', university.shortName || university.name)
  }

  function selectFaculty(faculty) {
    onChange('facultyId', faculty.id)
    onChange('facultyName', faculty.name)
  }

  return (
    <aside className="filters-panel">
      <div className="filter-heading">
        <div><span className="filter-icon">≡</span><h2>Bộ lọc học thuật</h2></div>
        <button type="button" onClick={onReset}>Đặt lại</button>
      </div>
      <fieldset className="filter-group">
        <legend>Trường đại học</legend>
        <input className="filter-search" onChange={(event) => setUniversityQuery(event.target.value)} placeholder="⌕  Tìm trường..." value={universityQuery} />
        <label className="filter-check"><input checked={!filters.universityId} name="university" onChange={() => { onChange('universityId', ''); onChange('universityName', '') }} type="radio" /><span>Tất cả trường</span></label>
        {visibleUniversities.map((item) => <label className="filter-check" key={item.id}><input checked={filters.universityId === item.id} name="university" onChange={() => selectUniversity(item)} type="radio" /><span title={item.name}>{item.shortName ? `${item.name} - ${item.shortName}` : item.name}</span></label>)}
        {!universityQuery && universities.length > 6 && <button className="see-more" onClick={() => setShowAllUniversities((current) => !current)} type="button">{showAllUniversities ? 'Thu gọn danh sách ↑' : `Xem thêm ${universities.length - 6} trường →`}</button>}
      </fieldset>
      <fieldset className="filter-group">
        <legend>{filters.universityId ? 'Khoa / Viện phụ trách' : 'Khoa / Viện phụ trách (chọn trường để thu hẹp)'}</legend>
        <label className="filter-check"><input checked={!filters.facultyId} name="faculty" onChange={() => { onChange('facultyId', ''); onChange('facultyName', '') }} type="radio" /><span>Tất cả khoa / viện</span></label>
        {faculties.map((item) => <label className="filter-check" key={item.id}><input checked={filters.facultyId === item.id} name="faculty" onChange={() => selectFaculty(item)} type="radio" /><span>{item.name}</span></label>)}
      </fieldset>
      <fieldset className="filter-group"><legend>Loại tài liệu</legend>
        {documentTypes.map(([value, label]) => <label className="filter-check" key={value || 'all'}><input checked={filters.documentType === value} name="document-type" onChange={() => onChange('documentType', value)} type="radio" /><span>{label}</span></label>)}
      </fieldset>
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
