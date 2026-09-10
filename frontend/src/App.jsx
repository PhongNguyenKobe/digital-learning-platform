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
    fetchCurrentUser()
      .then((response) => setState(response.data.role === 'ADMIN' ? 'allowed' : 'forbidden'))
      .catch(() => setState('guest'))
    return undefined
  }, [])

  if (state === 'loading') {
    return <div className="state-panel text-sm text-slate-500 py-16 text-center">Đang kiểm tra quyền truy cập...</div>
  }

  if (state === 'guest') {
    return <Navigate replace to="/dang-nhap?redirect=/admin" />
  }

  if (state === 'forbidden') {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-[#c4c5d5]/40 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full grid place-items-center mx-auto text-2xl font-bold mb-4">
            ✕
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-sm text-slate-600 mb-6">
            Khu vực này yêu cầu tài khoản Quản trị viên (Admin). Tài khoản hiện tại của bạn không đủ quyền hạn.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('hls_access_token')
                localStorage.removeItem('hls_refresh_token')
                window.dispatchEvent(new Event('hls-auth-changed'))
                window.location.href = '/dang-nhap?redirect=/admin'
              }}
              className="w-full py-2.5 rounded-lg bg-[#00288e] text-white text-sm font-semibold hover:bg-[#1e40af] transition-colors"
            >
              Đăng nhập bằng tài khoản Admin
            </button>
            <a
              href="/"
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Quay lại Trang chủ
            </a>
          </div>
        </div>
      </div>
    )
  }

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
