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

function AdminRoute({ children }) {
  const [state, setState] = useState(() => (localStorage.getItem('hls_access_token') ? 'loading' : 'guest'))
  useEffect(() => {
    if (!localStorage.getItem('hls_access_token')) return undefined
    fetchCurrentUser().then((response) => setState(response.data.role === 'ADMIN' ? 'allowed' : 'forbidden')).catch(() => setState('guest'))
    return undefined
  }, [])
  if (state === 'loading') return <div className="state-panel">Đang kiểm tra quyền truy cập...</div>
  if (state === 'guest') return <Navigate replace to="/dang-nhap" />
  return state === 'allowed' ? children : <Navigate replace to="/" />
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
          <Route element={<AdminRoute><AdminDashboardPage /></AdminRoute>} path="/quan-tri" />
          <Route element={<DocumentDetailsPage />} path="/documents/:id" />
          <Route element={<ProtectedRoute><ContributorDashboardPage /></ProtectedRoute>} path="/contributor" />
          <Route element={<AdminRoute><AdminDashboardPage /></AdminRoute>} path="/admin" />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App;
