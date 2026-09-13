import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ContributorDashboardPage from './pages/ContributorDashboardPage'
import DocumentDetailsPage from './pages/DocumentDetailsPage'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { fetchCurrentUser } from './services/api'

function ProtectedRoute({ children }) {
  return localStorage.getItem('hls_access_token') ? children : <Navigate replace to="/dang-nhap" />
}

function RoleRoute({ children, allowedRoles, redirectPath }) {
  const [state, setState] = useState(() => (localStorage.getItem('hls_access_token') ? 'loading' : 'guest'))
  const allowedRoleKey = allowedRoles.join(',')

  useEffect(() => {
    if (!localStorage.getItem('hls_access_token')) return undefined
    fetchCurrentUser()
      .then((response) => setState(allowedRoleKey.split(',').includes(response.data.role) ? 'allowed' : 'forbidden'))
      .catch(() => setState('guest'))
    return undefined
  }, [allowedRoleKey, redirectPath])

  if (state === 'loading') return <div className="state-panel py-16 text-center text-sm text-slate-500">Đang kiểm tra quyền truy cập...</div>
  if (state === 'guest') return <Navigate replace to={`/dang-nhap?redirect=${redirectPath}`} />
  if (state === 'forbidden') return <Navigate replace to="/" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<LoginPage />} path="/dang-nhap" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/dang-ky" />
          <Route element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} path="/thu-vien" />
          <Route element={<DocumentDetailsPage />} path="/tai-lieu/:id" />
          <Route element={<ProtectedRoute><ContributorDashboardPage /></ProtectedRoute>} path="/dong-gop" />
          <Route element={<RoleRoute allowedRoles={['ADMIN']} redirectPath="/admin"><AdminDashboardPage /></RoleRoute>} path="/quan-tri" />
          <Route element={<RoleRoute allowedRoles={['ADMIN']} redirectPath="/admin"><AdminDashboardPage /></RoleRoute>} path="/admin" />
          <Route element={<RoleRoute allowedRoles={['ADMIN', 'MODERATOR']} redirectPath="/kiem-duyet"><AdminDashboardPage /></RoleRoute>} path="/kiem-duyet" />
          <Route element={<DocumentDetailsPage />} path="/documents/:id" />
          <Route element={<ProtectedRoute><ContributorDashboardPage /></ProtectedRoute>} path="/contributor" />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
