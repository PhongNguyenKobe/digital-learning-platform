import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('hls_access_token')
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

export async function fetchDocuments(params) {
  const response = await api.get('/documents', { params })
  return response.data
}

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

export async function fetchDocument(id) {
  const response = await api.get(`/documents/${id}`)
  return response.data
}

export async function fetchMyDocuments(params) {
  const response = await api.get('/documents/mine', { params })
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

export async function uploadDocument(data, onUploadProgress) {
  const response = await api.post('/documents', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
  return response.data
}

export async function fetchAdminReports(params) {
  const response = await api.get('/admin/reports', { params })
  return response.data
}

export async function updateAdminReport(id, data) {
  const response = await api.patch(`/admin/reports/${id}`, data)
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

export default api
