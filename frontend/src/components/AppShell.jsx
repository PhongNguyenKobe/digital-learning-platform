import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Footer from './Footer'
import PremiumModal from './PremiumModal'
import { fetchCurrentUser } from '../services/api'

function AppShell({ children }) {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('hls_access_token'))
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [premiumOpen, setPremiumOpen] = useState(false)

  useEffect(() => {
    function syncAuth() {
      const token = localStorage.getItem('hls_access_token')
      setAccessToken(token)
      if (token) {
        fetchCurrentUser()
          .then((res) => setUser(res.data))
          .catch(() => {})
      } else {
        setUser(null)
      }
    }

    syncAuth()
    window.addEventListener('storage', syncAuth)
    window.addEventListener('hls-auth-changed', syncAuth)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('hls-auth-changed', syncAuth)
    }
  }, [accessToken])

  const uploadPath = accessToken ? '/dong-gop' : '/dang-nhap'

  function logout() {
    localStorage.removeItem('hls_access_token')
    localStorage.removeItem('hls_refresh_token')
    localStorage.removeItem('hls_remember')
    setUser(null)
    setMenuOpen(false)
    window.dispatchEvent(new Event('hls-auth-changed'))
    navigate('/')
  }

  function handlePremiumSuccess(updatedUser) {
    setUser(updatedUser)
    window.dispatchEvent(new Event('hls-auth-changed'))
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/">
            <img alt="Logo Học Liệu Số" className="brand-logo" src="/hoc-lieu-so-logo.png" />
            <span>
              <strong>Học Liệu Số</strong>
              <small>Thư viện học thuật</small>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Điều hướng chính">
            <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to="/">Khám phá</NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to="/thu-vien">Thư viện của tôi</NavLink>
            <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={uploadPath}>Đóng góp</NavLink>
          </nav>
          <div className="header-actions">
            {accessToken && (
              <button
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition shadow-xs ${
                  user?.isPremium
                    ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'border border-blue-200 bg-blue-50 text-[#00288e] hover:bg-blue-100'
                }`}
                onClick={() => setPremiumOpen(true)}
                title="Quản lý lượt tải & Gói VIP Premium"
                type="button"
              >
                {user?.isPremium ? (
                  <span>VIP Premium</span>
                ) : (
                  <>
                    <span>{user?.downloadCredits ?? 2} Credits</span>
                    <span className="hidden text-[10px] text-blue-600 sm:inline">+Nạp/VIP</span>
                  </>
                )}
              </button>
            )}
            <button className="icon-button" title="Thông báo" type="button" aria-label="Thông báo">♢</button>
            {!accessToken && <Link className="header-login" to="/dang-nhap">Đăng nhập</Link>}
            <Link className="header-upload" to={uploadPath}>☁ Tải lên tài liệu</Link>
            {accessToken && <div className="profile-menu">
              <button className="avatar" onClick={() => setMenuOpen((current) => !current)} title="Tài khoản" type="button">
                {(user?.fullName || 'A').slice(0, 1).toUpperCase()}
              </button>
              {menuOpen && (
                <div className="profile-dropdown">
                  {user?.role === 'ADMIN' && <Link onClick={() => setMenuOpen(false)} to="/admin">Quản trị hệ thống</Link>}
                  {user?.role === 'MODERATOR' && <Link onClick={() => setMenuOpen(false)} to="/kiem-duyet">Bàn kiểm duyệt</Link>}
                  <strong>{user?.fullName || (accessToken ? 'Tài khoản của tôi' : 'Khách')}</strong>
                  {accessToken && (
                    <div className="mb-2 border-b border-slate-100 pb-2 text-xs text-slate-500">
                      <p>Số dư: <strong>{user?.isPremium ? 'VIP Không giới hạn' : `${user?.downloadCredits ?? 2} lượt tải`}</strong></p>
                    </div>
                  )}
                  {accessToken ? (
                    <>
                      <button className="text-left font-semibold text-[#00288e]" onClick={() => { setMenuOpen(false); setPremiumOpen(true) }} type="button">
                        Nâng cấp VIP
                      </button>
                      <button onClick={logout} type="button">Đăng xuất</button>
                    </>
                  ) : (
                    <Link onClick={() => setMenuOpen(false)} to="/dang-nhap">Đăng nhập</Link>
                  )}
                </div>
              )}
            </div>}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Footer />

      <PremiumModal
        isOpen={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onSuccess={handlePremiumSuccess}
        userCredits={user?.downloadCredits ?? 2}
      />
    </div>
  )
}

export default AppShell
