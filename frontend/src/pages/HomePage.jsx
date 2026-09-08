import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DocumentCard from '../components/DocumentCard'
import DocumentFilters from '../components/DocumentFilters'
import Pagination from '../components/Pagination'
import SearchHero from '../components/SearchHero'
import { fetchDocuments } from '../services/api'

const initialFilters = { documentType: '', sortBy: 'createdAt' }

function HomePage() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ data: [], meta: { total: 0, totalPages: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadDocuments() {
      setLoading(true)
      setError('')
      try {
        const response = await fetchDocuments({
          page,
          limit: 6,
          q: submittedQuery || undefined,
          documentType: filters.documentType || undefined,
          sortBy: filters.sortBy,
          sortOrder: 'desc',
        })
        if (!cancelled) setResult(response)
      } catch (requestError) {
        if (!cancelled) setError(requestError.response?.data?.error?.message || 'Không thể tải học liệu. Hãy kiểm tra API backend.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadDocuments()
    return () => { cancelled = true }
  }, [filters, page, submittedQuery])

  function submitSearch(event) {
    event.preventDefault()
    setPage(1)
    setSubmittedQuery(query.trim())
  }

  function changeFilter(name, value) {
    setPage(1)
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function resetFilters() {
    setPage(1)
    setQuery('')
    setSubmittedQuery('')
    setFilters(initialFilters)
  }

  function chooseTrendingSearch(value) {
    setQuery(value)
    setSubmittedQuery(value)
    setPage(1)
  }

  return (
    <>
      <SearchHero documentType={filters.documentType} onDocumentTypeChange={(value) => changeFilter('documentType', value)} onQueryChange={setQuery} onSubmit={submitSearch} onTrendingSearch={chooseTrendingSearch} query={query} />
      <section className="catalog-section">
        <div className="catalog-layout">
          <DocumentFilters filters={filters} onChange={changeFilter} onReset={resetFilters} />
          <div className="results-column">
            <div className="results-toolbar"><div className="active-pills"><span>Đang lọc:</span>{submittedQuery && <button type="button" onClick={() => { setQuery(''); setSubmittedQuery(''); }}>⌕ {submittedQuery} ×</button>}{filters.documentType && <button type="button" onClick={() => changeFilter('documentType', '')}>{filters.documentType} ×</button>}<button className="clear-pills" type="button" onClick={resetFilters}>Xóa tất cả</button></div><span className="result-count">{result.meta.total || 0} tài liệu</span></div>
            {loading && <div className="state-panel"><span className="loading-orb" /> Đang tìm học liệu phù hợp...</div>}
            {!loading && error && <div className="state-panel error-state">{error}</div>}
            {!loading && !error && result.data.length === 0 && <div className="state-panel">Chưa tìm thấy tài liệu phù hợp. Thử một từ khóa khác nhé.</div>}
            {!loading && !error && result.data.length > 0 && <div className="document-grid">{result.data.map((document) => <DocumentCard document={document} key={document.id} />)}</div>}
            <Pagination onChange={setPage} page={page} totalPages={result.meta.totalPages || 0} />
          </div>
        </div>
      </section>
      <section className="mx-auto mb-16 mt-2 max-w-5xl overflow-hidden rounded-xl bg-linear-to-r from-[#00288e] via-[#1e40af] to-[#0058be] px-6 py-8 text-white shadow-lg lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><span className="text-xs font-semibold uppercase tracking-[.14em] text-[#b8c4ff]">Chia sẻ để nhận đặc quyền</span><h2 className="mt-2 text-2xl font-bold tracking-tight">Tải lên tài liệu, mở khóa kho tri thức.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#d8e2ff]">Đóng góp giáo trình, đề thi hoặc bài giảng của bạn để nhận điểm uy tín và giúp hàng nghìn sinh viên học tốt hơn.</p></div><Link className="shrink-0 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#00288e] shadow-md transition hover:bg-[#d8e2ff]" to={localStorage.getItem('hls_access_token') ? '/dong-gop' : '/dang-nhap'}>☁ Đăng tải ngay →</Link></div>
      </section>
    </>
  )
}

export default HomePage
