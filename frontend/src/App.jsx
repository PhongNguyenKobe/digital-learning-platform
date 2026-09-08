import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ContributorDashboardPage from './pages/ContributorDashboardPage'
import DocumentDetailsPage from './pages/DocumentDetailsPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function ProtectedRoute({ children }) {
  return localStorage.getItem('hls_access_token') ? children : <Navigate replace to="/dang-nhap" />
}

function LibraryPage() {
  return <section className="placeholder-page"><span className="section-kicker">THƯ VIỆN CỦA TÔI</span><h1>Thư viện của tôi</h1><p>Danh sách tài liệu đã lưu sẽ được hiển thị tại đây.</p></section>
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
          <Route element={<LibraryPage />} path="/thu-vien" />
          <Route element={<DocumentDetailsPage />} path="/tai-lieu/:id" />
          <Route element={<ProtectedRoute><ContributorDashboardPage /></ProtectedRoute>} path="/dong-gop" />
          <Route element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} path="/quan-tri" />
          <Route element={<DocumentDetailsPage />} path="/documents/:id" />
          <Route element={<ProtectedRoute><ContributorDashboardPage /></ProtectedRoute>} path="/contributor" />
          <Route element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} path="/admin" />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App;