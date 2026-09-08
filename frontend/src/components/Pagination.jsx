function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1)
  return (
    <nav className="pagination" aria-label="Phân trang tài liệu">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} type="button">←</button>
      {pages.map((item) => <button className={item === page ? 'current' : ''} key={item} onClick={() => onChange(item)} type="button">{item}</button>)}
      {totalPages > 5 && <span>…</span>}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)} type="button">→</button>
    </nav>
  )
}

export default Pagination
