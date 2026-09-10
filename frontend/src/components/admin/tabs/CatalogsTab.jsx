export default function CatalogsTab({
  activeTab,
  universities = [],
  faculties = [],
  subjects = [],
  categories = [],
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteCatalogItem,
}) {
  const tabTitles = {
    universities: 'Quản lý Trường Đại học',
    faculties: 'Quản lý Khoa / Viện',
    subjects: 'Quản lý Môn học / Học phần',
    categories: 'Quản lý Danh mục Học liệu',
  }

  const tabIcons = {
    universities: 'account_balance',
    faculties: 'domain',
    subjects: 'menu_book',
    categories: 'category',
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00288e]">
            {tabIcons[activeTab] || 'category'}
          </span>
          <h2 className="text-base font-bold text-[#141b2b]">
            {tabTitles[activeTab] || 'Quản lý Danh mục'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenCreateModal(activeTab)}
            className="flex items-center gap-1.5 rounded-xl bg-[#00288e] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1e40af] transition"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Thêm mục mới
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#141b2b]">
          <thead>
            <tr className="bg-[#f1f3ff] text-[11px] font-bold uppercase tracking-wider text-[#444653]">
              <th className="rounded-l-lg p-3">Tên đối tượng</th>
              <th className="p-3">Mã định danh (Code)</th>
              <th className="p-3">Thuộc về / Liên kết</th>
              <th className="rounded-r-lg p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* UNIVERSITIES */}
            {activeTab === 'universities' &&
              universities.map((u) => (
                <tr key={u.id} className="hover:bg-[#f1f3ff]/50">
                  <td className="p-3 font-bold text-[#141b2b]">{u.name}</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                      {u.code || u.slug}
                    </span>
                  </td>
                  <td className="p-3 text-[#444653]">{u.faculties?.length || 0} khoa trực thuộc</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEditModal('university', u)}
                        className="rounded bg-[#f1f3ff] p-1.5 text-[#00288e] hover:bg-[#e1e8fd] transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteCatalogItem('university', u.id)}
                        className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-700 transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {/* FACULTIES */}
            {activeTab === 'faculties' &&
              faculties.map((f) => (
                <tr key={f.id} className="hover:bg-[#f1f3ff]/50">
                  <td className="p-3 font-bold text-[#141b2b]">{f.name}</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                      {f.code || f.slug}
                    </span>
                  </td>
                  <td className="p-3 text-[#444653]">{f.university?.name || 'Trường ĐH'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEditModal('faculty', f)}
                        className="rounded bg-[#f1f3ff] p-1.5 text-[#00288e] hover:bg-[#e1e8fd] transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteCatalogItem('faculty', f.id)}
                        className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-700 transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {/* SUBJECTS */}
            {activeTab === 'subjects' &&
              subjects.map((s) => (
                <tr key={s.id} className="hover:bg-[#f1f3ff]/50">
                  <td className="p-3 font-bold text-[#141b2b]">{s.name}</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                      {s.code || s.slug}
                    </span>
                  </td>
                  <td className="p-3 text-[#444653]">
                    {s.faculty?.name || 'Khoa'} • {s.university?.name || 'Trường'}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEditModal('subject', s)}
                        className="rounded bg-[#f1f3ff] p-1.5 text-[#00288e] hover:bg-[#e1e8fd] transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteCatalogItem('subject', s.id)}
                        className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-700 transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {/* CATEGORIES */}
            {activeTab === 'categories' &&
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-[#f1f3ff]/50">
                  <td className="p-3 font-bold text-[#141b2b]">{c.name}</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                      {c.slug}
                    </span>
                  </td>
                  <td className="p-3 text-[#444653]">{c.description || 'Không có mô tả'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEditModal('category', c)}
                        className="rounded bg-[#f1f3ff] p-1.5 text-[#00288e] hover:bg-[#e1e8fd] transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteCatalogItem('category', c.id)}
                        className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-700 transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
