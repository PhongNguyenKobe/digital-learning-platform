import { Link } from 'react-router-dom'

import { apiOrigin } from '../services/apiOrigin'

function DocumentCard({ document }) {
  const thumbSrc = document.thumbnailUrl
    ? (document.thumbnailUrl.startsWith('http') ? document.thumbnailUrl : `${apiOrigin}${document.thumbnailUrl}`)
    : null

  return (
    <article className="document-card">
      <div className="document-cover" data-format={document.fileFormat}>
        {thumbSrc ? (
          <img
            alt={document.title}
            className="document-cover-img"
            loading="lazy"
            src={thumbSrc}
          />
        ) : (
          <span className="cover-symbol">{document.fileFormat === 'PPTX' ? '▤' : document.fileFormat === 'DOCX' ? '▥' : '▦'}</span>
        )}
        <span className="format-badge">{document.fileFormat}</span>
        <div className="cover-footer">
          <span>{document.fileFormat} • {document.pageCount || '--'} trang</span>
          <span className="approved-mark">✓ Đã kiểm duyệt</span>
        </div>
        <button className="bookmark-button" title="Lưu tài liệu" type="button">♡</button>
      </div>
      <div className="document-content">
        <div className="university-pill">{document.university?.shortName || document.university?.name || 'Đa trường'}</div>
        <Link className="document-title" to={`/tai-lieu/${document.id}`}>{document.title}</Link>
        <div className="document-context"><span>Mã HP: {document.subject?.code || 'Chưa cập nhật'}</span><span>•</span><span>{document.academicYear || '2024 - 2025'}</span></div>
        <div className="author-row"><span className="author-avatar">{(document.uploader?.fullName || 'HL').slice(0, 2).toUpperCase()}</span><span><strong>{document.uploader?.fullName || 'Cộng đồng'}</strong><small>{document.faculty?.name || 'Học liệu sinh viên'}</small></span></div>
        <div className="document-footer"><span className="rating">★ <b>{Number(document.ratingAverage || 0).toFixed(1)}</b> <small>({document.ratingCount || 0})</small></span><span className="download-count">⇩ {document.downloadCount || 0}</span></div>
      </div>
    </article>
  )
}

export default DocumentCard
