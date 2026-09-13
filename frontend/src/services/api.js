import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('hls_access_token')
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// --- Auth & User APIs ---
export async function loginUser(credentials) {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export async function registerUser(data) {
  const response = await api.post('/auth/register', data)
  return response.data
}

export async function fetchCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data
}

export async function changePassword(data) {
  const response = await api.patch('/auth/password', data)
  return response.data
}

// --- Public / Student Documents APIs ---
export async function fetchDocuments(params) {
  const response = await api.get('/documents', { params })
  return response.data
}

export async function fetchDocument(id) {
  const response = await api.get(`/documents/${id}`)
  return response.data
}

export async function fetchMyDocuments(params) {
  const response = await api.get('/documents/mine', { params })
  return response.data
}

export async function uploadDocument(data, onUploadProgress) {
  const response = await api.post('/documents', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
  return response.data
}

export async function updateMyDocument(id, data) {
  const response = await api.patch(`/documents/${id}`, data)
  return response.data
}

export async function unlockDocument(id) {
  const response = await api.post(`/documents/${id}/unlock`)
  return response.data
}

export async function createVnpayPayment(plan) {
  const response = await api.post('/payments/vnpay/create', { plan })
  return response.data
}

export async function deleteMyDocument(id) {
  const response = await api.delete(`/documents/${id}`)
  return response.data
}

export async function fetchMyFavorites() {
  const response = await api.get('/documents/mine/favorites')
  return response.data
}

export async function fetchMyDownloads() {
  const response = await api.get('/documents/mine/downloads')
  return response.data
}

export async function fetchUniversities(query = '') {
  const response = await api.get('/documents/catalog/universities', { params: query ? { q: query } : {} })
  return response.data
}

export async function fetchFaculties(params = {}) {
  const response = await api.get('/documents/catalog/faculties', { params })
  return response.data
}

export async function fetchSubjects(params = {}) {
  const response = await api.get('/documents/catalog/subjects', { params })
  return response.data
}

// --- Interaction APIs ---
export async function fetchComments(id) {
  const response = await api.get(`/documents/${id}/comments`)
  return response.data
}

export async function createComment(id, data) {
  const response = await api.post(`/documents/${id}/comments`, data)
  return response.data
}

export async function rateDocument(id, data) {
  const response = await api.post(`/documents/${id}/ratings`, data)
  return response.data
}

export async function toggleFavorite(id, shouldFavorite) {
  const response = shouldFavorite ? await api.post(`/documents/${id}/favorite`) : await api.delete(`/documents/${id}/favorite`)
  return response.data
}

export async function reportDocument(id, data) {
  const response = await api.post(`/documents/${id}/reports`, data)
  return response.data
}

// ==========================================
// --- ADMIN MANAGEMENT & MODERATION APIS ---
// ==========================================
export async function fetchAdminStats() {
  const response = await api.get('/admin/stats')
  return response.data
}

export async function fetchAdminReports(params) {
  const response = await api.get('/admin/reports', { params })
  return response.data
}

export async function fetchAdminFlaggedDocuments(params) {
  const response = await api.get('/admin/flagged-documents', { params })
  return response.data
}

export async function updateAdminReport(id, data) {
  const response = await api.patch(`/admin/reports/${id}`, data)
  return response.data
}

export async function fetchAdminAllDocuments(params) {
  const response = await api.get('/admin/documents', { params })
  return response.data
}

export async function updateAdminDocumentDetails(id, data) {
  const response = await api.patch(`/admin/documents/${id}`, data)
  return response.data
}

export async function updateDocumentStatus(id, data) {
  const response = await api.patch(`/admin/documents/${id}/status`, data)
  return response.data
}

export async function deleteAdminDocument(id) {
  const response = await api.delete(`/admin/documents/${id}`)
  return response.data
}

export async function restoreAdminDocument(id) {
  const response = await api.post(`/admin/documents/${id}/restore`)
  return response.data
}

export async function fetchAdminUsers(params) {
  const response = await api.get('/admin/users', { params })
  return response.data
}

export async function createAdminUser(data) {
  const response = await api.post('/admin/users', data)
  return response.data
}

export async function updateAdminUserDetails(id, data) {
  const response = await api.patch(`/admin/users/${id}`, data)
  return response.data
}

export async function updateAdminUserRole(id, role) {
  const response = await api.patch(`/admin/users/${id}/role`, { role })
  return response.data
}

export async function updateAdminUserStatus(id, status) {
  const response = await api.patch(`/admin/users/${id}/status`, { status })
  return response.data
}

export async function deleteAdminUser(id) {
  const response = await api.delete(`/admin/users/${id}`)
  return response.data
}

// Catalogs Management
export async function fetchAdminUniversities(params) {
  const response = await api.get('/admin/catalog/universities', { params })
  return response.data
}

export async function createAdminUniversity(data) {
  const response = await api.post('/admin/catalog/universities', data)
  return response.data
}

export async function updateAdminUniversity(id, data) {
  const response = await api.patch(`/admin/catalog/universities/${id}`, data)
  return response.data
}

export async function deleteAdminUniversity(id) {
  const response = await api.delete(`/admin/catalog/universities/${id}`)
  return response.data
}

export async function fetchAdminFaculties(params) {
  const response = await api.get('/admin/catalog/faculties', { params })
  return response.data
}

export async function createAdminFaculty(data) {
  const response = await api.post('/admin/catalog/faculties', data)
  return response.data
}

export async function updateAdminFaculty(id, data) {
  const response = await api.patch(`/admin/catalog/faculties/${id}`, data)
  return response.data
}

export async function deleteAdminFaculty(id) {
  const response = await api.delete(`/admin/catalog/faculties/${id}`)
  return response.data
}

export async function fetchAdminSubjects(params) {
  const response = await api.get('/admin/catalog/subjects', { params })
  return response.data
}

export async function createAdminSubject(data) {
  const response = await api.post('/admin/catalog/subjects', data)
  return response.data
}

export async function updateAdminSubject(id, data) {
  const response = await api.patch(`/admin/catalog/subjects/${id}`, data)
  return response.data
}

export async function deleteAdminSubject(id) {
  const response = await api.delete(`/admin/catalog/subjects/${id}`)
  return response.data
}

export async function fetchAdminCategories(params) {
  const response = await api.get('/admin/catalog/categories', { params })
  return response.data
}

export async function createAdminCategory(data) {
  const response = await api.post('/admin/catalog/categories', data)
  return response.data
}

export async function updateAdminCategory(id, data) {
  const response = await api.patch(`/admin/catalog/categories/${id}`, data)
  return response.data
}

export async function deleteAdminCategory(id) {
  const response = await api.delete(`/admin/catalog/categories/${id}`)
  return response.data
}

export async function fetchAdminAuditLogs(params) {
  const response = await api.get('/admin/audit-logs', { params })
  return response.data
}

export async function purgeDeletedAdmin(retentionDays = 30) {
  const response = await api.post('/admin/purge-deleted', { retentionDays })
  return response.data
}

export default api
