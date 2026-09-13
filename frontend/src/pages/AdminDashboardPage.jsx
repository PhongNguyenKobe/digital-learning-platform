import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchAdminStats,
  fetchAdminPayments,
  fetchAdminReports,
  updateAdminReport,
  fetchAdminAllDocuments,
  updateAdminDocumentDetails,
  updateDocumentStatus,
  deleteAdminDocument,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUserDetails,
  deleteAdminUser,
  fetchAdminUniversities,
  createAdminUniversity,
  updateAdminUniversity,
  deleteAdminUniversity,
  fetchAdminFaculties,
  createAdminFaculty,
  updateAdminFaculty,
  deleteAdminFaculty,
  fetchAdminSubjects,
  createAdminSubject,
  updateAdminSubject,
  deleteAdminSubject,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  fetchAdminAuditLogs,
  purgeDeletedAdmin,
  fetchCurrentUser,
} from '../services/api'

import AdminSidebar from '../components/admin/AdminSidebar'
import AdminHeader from '../components/admin/AdminHeader'
import AdminMetrics from '../components/admin/AdminMetrics'
import OverviewTab from '../components/admin/tabs/OverviewTab'
import RiskQueueTab from '../components/admin/tabs/RiskQueueTab'
import DocumentsTab from '../components/admin/tabs/DocumentsTab'
import UsersTab from '../components/admin/tabs/UsersTab'
import CatalogsTab from '../components/admin/tabs/CatalogsTab'
import AuditLogsTab from '../components/admin/tabs/AuditLogsTab'
import SettingsTab from '../components/admin/tabs/SettingsTab'
import PaymentsTab from '../components/admin/tabs/PaymentsTab'

import EditDocumentModal from '../components/admin/modals/EditDocumentModal'
import EditUserModal from '../components/admin/modals/EditUserModal'
import CreateUserModal from '../components/admin/modals/CreateUserModal'
import CatalogModal from '../components/admin/modals/CatalogModal'

export default function AdminDashboardPage() {
  const navigate = useNavigate()

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview')

  // Notification Toast
  const [notice, setNotice] = useState(null)
  function showNotice(message, type = 'info') {
    setNotice({ message, type })
    setTimeout(() => setNotice(null), 5000)
  }

  // Admin Profile & Loading State
  const [currentUser, setCurrentUser] = useState(null)
  const canManageSystem = currentUser?.role === 'ADMIN'
  const [purging, setPurging] = useState(false)

  // Core Data States
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingRisk: 0,
    pendingReports: 0,
    totalUsers: 0,
    cleanRate: '99.8%',
    highTrustRate: '98.4%',
  })
  const [reports, setReports] = useState([])
  const [documents, setDocuments] = useState([])
  const [docSearch, setDocSearch] = useState('')
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')

  // Catalog States
  const [universities, setUniversities] = useState([])
  const [faculties, setFaculties] = useState([])
  const [subjects, setSubjects] = useState([])
  const [categories, setCategories] = useState([])

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([])
  const [payments, setPayments] = useState([])
  const [paymentSummary, setPaymentSummary] = useState({})
  const [paymentQuery, setPaymentQuery] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  // Modal State: { type: string, data?: any }
  const [modalState, setModalState] = useState(null)

  // Initial Load (Profile, Stats, Reports)
  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      try {
        const [meRes, statsRes, repRes] = await Promise.all([
          fetchCurrentUser().catch(() => null),
          fetchAdminStats().catch(() => null),
          fetchAdminReports({ limit: 50 }).catch(() => null),
        ])
        if (!cancelled) {
          if (meRes?.data) {
            setCurrentUser(meRes.data)
            if (meRes.data.role === 'MODERATOR') setActiveTab('risk_queue')
          }
          if (statsRes?.data) setStats(statsRes.data)
          if (repRes?.data) setReports(repRes.data)
        }
      } catch (err) {
        if (!cancelled) {
          showNotice(err.response?.data?.error?.message || 'Lỗi khi tải dữ liệu bảng điều khiển.', 'error')
        }
      }
    }
    loadInitial()
    return () => { cancelled = true }
  }, [])

  // Tab-Driven Data Fetching
  useEffect(() => {
    let cancelled = false
    async function loadTabData() {
      try {
        if (activeTab === 'documents') {
          const res = await fetchAdminAllDocuments({ limit: 100, query: docSearch || undefined })
          if (!cancelled && res.data) setDocuments(res.data)
        } else if (activeTab === 'users') {
          const res = await fetchAdminUsers({ limit: 100, query: userSearch || undefined })
          if (!cancelled && res.data) setUsers(res.data)
        } else if (['universities', 'faculties', 'subjects', 'categories'].includes(activeTab)) {
          const [uRes, fRes, sRes, cRes] = await Promise.all([
            fetchAdminUniversities({ limit: 100 }).catch(() => ({ data: [] })),
            fetchAdminFaculties({ limit: 100 }).catch(() => ({ data: [] })),
            fetchAdminSubjects({ limit: 100 }).catch(() => ({ data: [] })),
            fetchAdminCategories({ limit: 100 }).catch(() => ({ data: [] })),
          ])
          if (!cancelled) {
            setUniversities(uRes.data || [])
            setFaculties(fRes.data || [])
            setSubjects(sRes.data || [])
            setCategories(cRes.data || [])
          }
        } else if (activeTab === 'audit_logs') {
          const res = await fetchAdminAuditLogs({ limit: 60 }).catch(() => ({ data: [] }))
          if (!cancelled && res.data) setAuditLogs(res.data)
        } else if (activeTab === 'payments' && canManageSystem) {
          const res = await fetchAdminPayments({ limit: 100, q: paymentQuery || undefined, status: paymentStatus || undefined })
          if (!cancelled) {
            setPayments(res.data || [])
            setPaymentSummary(res.summary || {})
          }
        } else if (activeTab === 'overview') {
          const [sRes, rRes] = await Promise.all([
            fetchAdminStats().catch(() => null),
            fetchAdminReports({ limit: 20 }).catch(() => null),
          ])
          if (!cancelled) {
            if (sRes?.data) setStats(sRes.data)
            if (rRes?.data) setReports(rRes.data)
          }
        }
      } catch (err) {
        if (!cancelled) {
          showNotice(err.response?.data?.error?.message || 'Không thể tải dữ liệu.', 'error')
        }
      }
    }
    loadTabData()
    return () => { cancelled = true }
  }, [activeTab, docSearch, userSearch, paymentQuery, paymentStatus, canManageSystem])

  // --- ACTIONS: MODERATION ---
  async function handleResolveReport(id, resolution, note = '') {
    try {
      await updateAdminReport(id, {
        status: resolution === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED',
        resolutionNote: note || (resolution === 'DISMISSED' ? 'Báo cáo không có căn cứ.' : 'Đã thẩm định và xử lý.'),
      })
      setReports((prev) => prev.filter((r) => r.id !== id))
      showNotice('Đã cập nhật trạng thái báo cáo vi phạm.', 'success')
      fetchAdminStats().then((res) => res?.data && setStats(res.data))
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Không thể cập nhật báo cáo.', 'error')
    }
  }

  async function handleModerateDocument(docId, newStatus, reportId = null, reason = '') {
    try {
      await updateDocumentStatus(docId, {
        status: newStatus,
        note: reason || (newStatus === 'PUBLISHED' ? 'Học liệu hợp lệ, xuất bản chính thức.' : 'Thu hồi do vi phạm bản quyền / chính sách.'),
      })
      if (reportId) {
        await updateAdminReport(reportId, {
          status: 'RESOLVED',
          resolutionNote: `Tài liệu đã được chuyển sang trạng thái ${newStatus}.`,
        })
        setReports((prev) => prev.filter((r) => r.id !== reportId))
      }
      setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d)))
      showNotice(`Đã chuyển tài liệu sang trạng thái: ${newStatus}`, 'success')
      fetchAdminStats().then((res) => res?.data && setStats(res.data))
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Không thể cập nhật tài liệu.', 'error')
    }
  }

  // --- ACTIONS: DOCUMENTS ---
  async function handleDeleteDocument(docId) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa (lưu trữ) tài liệu này?')) return
    try {
      await deleteAdminDocument(docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      showNotice('Đã xóa mềm tài liệu thành công.', 'success')
      fetchAdminStats().then((res) => res?.data && setStats(res.data))
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Lỗi khi xóa tài liệu.', 'error')
    }
  }

  async function handleSaveDocumentDetails(updatedData) {
    try {
      await updateAdminDocumentDetails(modalState.data.id, updatedData)
      setDocuments((prev) => prev.map((d) => (d.id === modalState.data.id ? { ...d, ...updatedData } : d)))
      setModalState(null)
      showNotice('Đã cập nhật thông tin tài liệu thành công!', 'success')
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Lỗi khi cập nhật tài liệu.', 'error')
    }
  }

  // --- ACTIONS: USERS ---
  async function handleSaveUserDetails(updatedData) {
    try {
      await updateAdminUserDetails(modalState.data.id, updatedData)
      setUsers((prev) => prev.map((u) => (u.id === modalState.data.id ? { ...u, ...updatedData } : u)))
      setModalState(null)
      showNotice('Đã cập nhật tài khoản người dùng!', 'success')
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Lỗi khi cập nhật người dùng.', 'error')
    }
  }

  async function handleCreateUser(newData) {
    try {
      const res = await createAdminUser(newData)
      setUsers((prev) => [res.data, ...prev])
      setModalState(null)
      showNotice('Đã tạo người dùng mới thành công!', 'success')
      fetchAdminStats().then((sRes) => sRes?.data && setStats(sRes.data))
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Lỗi khi tạo người dùng mới.', 'error')
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Xác nhận tạm khóa/xóa tài khoản người dùng này?')) return
    try {
      await deleteAdminUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      showNotice('Đã xóa người dùng thành công.', 'success')
      fetchAdminStats().then((sRes) => sRes?.data && setStats(sRes.data))
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Lỗi khi xóa người dùng.', 'error')
    }
  }

  async function handleQuickGrantTrust(userId) {
    try {
      await updateAdminUserDetails(userId, { trustScore: 95 })
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, trustScore: 95 } : u)))
      showNotice('Đã cấp quyền Đại sứ học liệu (Trust Score 95)!', 'success')
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Không thể cấp quyền.', 'error')
    }
  }

  // --- ACTIONS: CATALOGS ---
  async function handleSaveCatalogItem(type, itemData, isEdit = false, id = null) {
    try {
      if (type === 'university') {
        const res = isEdit ? await updateAdminUniversity(id, itemData) : await createAdminUniversity(itemData)
        setUniversities((prev) => (isEdit ? prev.map((i) => (i.id === id ? res.data : i)) : [res.data, ...prev]))
      } else if (type === 'faculty') {
        const res = isEdit ? await updateAdminFaculty(id, itemData) : await createAdminFaculty(itemData)
        setFaculties((prev) => (isEdit ? prev.map((i) => (i.id === id ? res.data : i)) : [res.data, ...prev]))
      } else if (type === 'subject') {
        const res = isEdit ? await updateAdminSubject(id, itemData) : await createAdminSubject(itemData)
        setSubjects((prev) => (isEdit ? prev.map((i) => (i.id === id ? res.data : i)) : [res.data, ...prev]))
      } else if (type === 'category') {
        const res = isEdit ? await updateAdminCategory(id, itemData) : await createAdminCategory(itemData)
        setCategories((prev) => (isEdit ? prev.map((i) => (i.id === id ? res.data : i)) : [res.data, ...prev]))
      }
      setModalState(null)
      showNotice(`Đã lưu ${type} thành công!`, 'success')
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Lỗi khi lưu dữ liệu danh mục.', 'error')
    }
  }

  async function handleDeleteCatalogItem(type, id) {
    if (!window.confirm('Xác nhận xóa mục này? Hành động không thể hoàn tác.')) return
    try {
      if (type === 'university') {
        await deleteAdminUniversity(id)
        setUniversities((prev) => prev.filter((i) => i.id !== id))
      } else if (type === 'faculty') {
        await deleteAdminFaculty(id)
        setFaculties((prev) => prev.filter((i) => i.id !== id))
      } else if (type === 'subject') {
        await deleteAdminSubject(id)
        setSubjects((prev) => prev.filter((i) => i.id !== id))
      } else if (type === 'category') {
        await deleteAdminCategory(id)
        setCategories((prev) => prev.filter((i) => i.id !== id))
      }
      showNotice('Đã xóa mục danh mục thành công!', 'success')
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Không thể xóa danh mục.', 'error')
    }
  }

  // --- ACTIONS: PURGE ---
  async function handleTriggerPurge(retentionDays = 30) {
    if (!window.confirm(`Xác nhận dọn dẹp vĩnh viễn dữ liệu rác đã bị xóa quá ${retentionDays} ngày?`)) return
    setPurging(true)
    try {
      const res = await purgeDeletedAdmin(retentionDays)
      showNotice(res.message || 'Dọn dẹp dữ liệu rác thành công!', 'success')
      fetchAdminStats().then((sRes) => sRes?.data && setStats(sRes.data))
      if (activeTab === 'documents') {
        fetchAdminAllDocuments({ limit: 100 }).then((dRes) => dRes?.data && setDocuments(dRes.data))
      }
    } catch (err) {
      showNotice(err.response?.data?.error?.message || 'Không thể thực hiện purge rác.', 'error')
    } finally {
      setPurging(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('hls_access_token')
    localStorage.removeItem('hls_refresh_token')
    window.dispatchEvent(new Event('hls-auth-changed'))
    navigate('/dang-nhap')
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b]">
      {/* Toast Notice */}
      {notice && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl transition-all ${
            notice.type === 'error'
              ? 'bg-[#ba1a1a] text-white'
              : notice.type === 'success'
              ? 'bg-[#00563a] text-white'
              : 'bg-[#141b2b] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {notice.type === 'error' ? 'error' : notice.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span className="text-sm font-medium">{notice.message}</span>
          <button onClick={() => setNotice(null)} className="ml-2 text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Admin Layout */}
      <div className="mx-auto flex max-w-[85rem] flex-col gap-6 px-4 py-8 lg:flex-row lg:px-6">
        {/* Left Dark Navy Academic Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reportsCount={reports.length}
          currentUser={currentUser}
          onLogout={handleLogout}
          canManageSystem={canManageSystem}
        />

        {/* Right Content Workspace Area */}
        <section className="flex flex-1 flex-col gap-6 min-w-0">
          {/* Header */}
          <AdminHeader activeTab={activeTab} />

          {/* 4 Executive Metrics Cards */}
          <AdminMetrics
            stats={stats}
            pendingRiskCount={reports.length || stats.pendingRisk}
          />

          {/* Tab Content Switching */}
          {activeTab === 'overview' && (
            <OverviewTab
              reports={reports}
              onNavigateTab={(tab) => {
                if (tab === 'create_user_action') {
                  setActiveTab('users')
                  setModalState({ type: 'create_user' })
                } else {
                  setActiveTab(tab)
                }
              }}
              onModerateDocument={handleModerateDocument}
              onTriggerPurge={handleTriggerPurge}
              purging={purging}
            />
          )}

          {activeTab === 'risk_queue' && (
            <RiskQueueTab
              reports={reports}
              onModerateDocument={handleModerateDocument}
              onResolveReport={handleResolveReport}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              documents={documents}
              docSearch={docSearch}
              setDocSearch={setDocSearch}
              onModerateDocument={handleModerateDocument}
              onDeleteDocument={handleDeleteDocument}
              onOpenEditModal={(doc) => setModalState({ type: 'edit_doc', data: doc })}
              canManageSystem={canManageSystem}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={users}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              onOpenCreateUserModal={() => setModalState({ type: 'create_user' })}
              onOpenEditUserModal={(u) => setModalState({ type: 'edit_user', data: u })}
              onDeleteUser={handleDeleteUser}
              onQuickGrantTrust={handleQuickGrantTrust}
            />
          )}

          {['universities', 'faculties', 'subjects', 'categories'].includes(activeTab) && (
            <CatalogsTab
              activeTab={activeTab}
              universities={universities}
              faculties={faculties}
              subjects={subjects}
              categories={categories}
              onOpenCreateModal={(tab) => {
                const map = {
                  universities: 'create_university',
                  faculties: 'create_faculty',
                  subjects: 'create_subject',
                  categories: 'create_category',
                }
                setModalState({ type: map[tab] })
              }}
              onOpenEditModal={(type, item) => setModalState({ type: `edit_${type}`, data: item })}
              onDeleteCatalogItem={handleDeleteCatalogItem}
            />
          )}

          {activeTab === 'audit_logs' && <AuditLogsTab auditLogs={auditLogs} />}

          {activeTab === 'payments' && canManageSystem && <PaymentsTab payments={payments} summary={paymentSummary} query={paymentQuery} setQuery={setPaymentQuery} status={paymentStatus} setStatus={setPaymentStatus} />}

          {activeTab === 'settings' && (
            <SettingsTab onTriggerPurge={handleTriggerPurge} purging={purging} />
          )}
        </section>
      </div>

      {/* ================= MODALS ================= */}
      {modalState?.type === 'edit_doc' && (
        <EditDocumentModal
          doc={modalState.data}
          universities={universities}
          faculties={faculties}
          subjects={subjects}
          categories={categories}
          onClose={() => setModalState(null)}
          onSave={handleSaveDocumentDetails}
        />
      )}

      {modalState?.type === 'edit_user' && (
        <EditUserModal
          user={modalState.data}
          onClose={() => setModalState(null)}
          onSave={handleSaveUserDetails}
        />
      )}

      {modalState?.type === 'create_user' && (
        <CreateUserModal
          onClose={() => setModalState(null)}
          onSave={handleCreateUser}
        />
      )}

      {(modalState?.type?.startsWith('create_') || modalState?.type?.startsWith('edit_')) &&
        ['university', 'faculty', 'subject', 'category'].some((t) => modalState.type.includes(t)) && (
          <CatalogModal
            type={modalState.type.replace('create_', '').replace('edit_', '')}
            isEdit={modalState.type.startsWith('edit_')}
            data={modalState.data}
            universities={universities}
            faculties={faculties}
            onClose={() => setModalState(null)}
            onSave={(itemData) =>
              handleSaveCatalogItem(
                modalState.type.replace('create_', '').replace('edit_', ''),
                itemData,
                modalState.type.startsWith('edit_'),
                modalState.data?.id
              )
            }
          />
        )}
    </div>
  )
}
