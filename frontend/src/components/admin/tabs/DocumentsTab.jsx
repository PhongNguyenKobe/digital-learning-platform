import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function DocumentsTab({
  documents = [],
  docSearch = '',
  setDocSearch,
  onModerateDocument,
  onDeleteDocument,
  onOpenEditModal,
}) {
  const [docStatusFilter, setDocStatusFilter] = useState('ALL')
  const [docTypeFilter, setDocTypeFilter] = useState('ALL')

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesStatus = docStatusFilter === 'ALL' || doc.status === docStatusFilter
      const matchesType = docTypeFilter === 'ALL' || doc.fileType === docTypeFilter
      return matchesStatus && matchesType
    })
  }, [documents, docStatusFilter, docTypeFilter])

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#757684] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu theo tiêu đề, mô tả..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              className="w-full rounded-xl bg-[#f1f3ff] py-2 pl-9 pr-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#00288e]"
            />
          </div>
          <select
            value={docStatusFilter}
            onChange={(e) => setDocStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#141b2b] outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PUBLISHED">Công khai (PUBLISHED)</option>
            <option value="PENDING">Chờ duyệt (PENDING)</option>
            <option value="REJECTED">Đã từ chối (REJECTED)</option>
            <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
          </select>
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#141b2b] outline-none"
          >
            <option value="ALL">Tất cả định dạng</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="PPTX">PPTX</option>
          </select>
        </div>
        <div className="text-xs text-[#444653]">
          Hiển thị: <strong>{filteredDocuments.length}</strong> tài liệu
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#141b2b]">
          <thead>
            <tr className="bg-[#f1f3ff] text-[11px] font-bold uppercase tracking-wider text-[#444653]">
              <th className="rounded-l-lg p-3">Tài liệu & Định dạng</th>
              <th className="p-3">Trường & Chuyên ngành</th>
              <th className="p-3">Người đăng</th>
              <th className="p-3">Lượt xem / Tải</th>
              <th className="p-3">Trạng thái</th>
              <th className="rounded-r-lg p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#444653]">
                  Không tìm thấy tài liệu phù hợp.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#f1f3ff]/50">
                  <td className="p-3">
                    <div className="flex items-start gap-2.5">
                      {doc.thumbnailUrl ? (
                        <img
                          src={doc.thumbnailUrl}
                          alt="Thumb"
                          className="h-10 w-8 rounded object-cover shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-8 items-center justify-center rounded bg-[#e9edff] text-[10px] font-bold text-[#00288e] shrink-0">
                          {doc.fileType || 'DOC'}
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <Link
                          to={`/tai-lieu/${doc.id}`}
                          target="_blank"
                          className="font-bold text-[#141b2b] hover:text-[#00288e] line-clamp-1"
                        >
                          {doc.title}
                        </Link>
                        <span className="text-[10px] text-[#444653]">
                          {doc.fileType} • {(doc.fileSize / 1024 / 1024).toFixed(1)} MB • {doc.pageCount || 0} trang
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#141b2b]">{doc.university?.name || 'N/A'}</span>
                      <span className="text-[10px] text-[#444653]">
                        {doc.faculty?.name || 'N/A'} • {doc.subject?.name || ''}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#141b2b]">{doc.uploader?.fullName || 'Thành viên'}</span>
                      <span className="text-[10px] text-[#444653]">{doc.uploader?.email || ''}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#141b2b]">{doc.viewCount || 0} xem</span>
                      <span className="text-[10px] text-[#444653]">{doc.downloadCount || 0} tải về</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        doc.status === 'PUBLISHED'
                          ? 'bg-[#d9f7ed] text-[#00563a]'
                          : doc.status === 'REJECTED'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEditModal(doc)}
                        className="rounded bg-[#f1f3ff] p-1.5 text-[#00288e] hover:bg-[#e1e8fd] transition"
                        title="Chỉnh sửa chi tiết tài liệu"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      {doc.status === 'PUBLISHED' ? (
                        <button
                          onClick={() => onModerateDocument(doc.id, 'REJECTED')}
                          className="rounded bg-[#ffdad6] p-1.5 text-[#ba1a1a] hover:bg-red-200 transition"
                          title="Gỡ bỏ tài liệu (Thu hồi)"
                        >
                          <span className="material-symbols-outlined text-[16px]">block</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onModerateDocument(doc.id, 'PUBLISHED')}
                          className="rounded bg-[#d9f7ed] p-1.5 text-[#00563a] hover:bg-green-200 transition"
                          title="Duyệt xuất bản công khai"
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-700 transition"
                        title="Xóa tài liệu (Soft delete)"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
