import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Footer from './Footer'

function AppShell({ children }) {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('hls_access_token'))
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function syncAuth() { setAccessToken(localStorage.getItem('hls_access_token')) }
    window.addEventListener('storage', syncAuth)
    window.addEventListener('hls-auth-changed', syncAuth)
    return () => { window.removeEventListener('storage', syncAuth); window.removeEventListener('hls-auth-changed', syncAuth) }
  }, [])

  const uploadPath = accessToken ? '/dong-gop' : '/dang-nhap'

  function logout() {
    localStorage.removeItem('hls_access_token')
    localStorage.removeItem('hls_refresh_token')
    localStorage.removeItem('hls_remember')
    setMenuOpen(false)
    window.dispatchEvent(new Event('hls-auth-changed'))
    navigate('/')
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
            <button className="icon-button" title="Thông báo" type="button" aria-label="Thông báo">♢</button>
            {!accessToken && <Link className="header-login" to="/dang-nhap">Đăng nhập</Link>}
            <Link className="header-upload" to={uploadPath}>☁ Tải lên tài liệu</Link>
            <div className="profile-menu">
              <button className="avatar" onClick={() => setMenuOpen((current) => !current)} title="Tài khoản" type="button">A</button>
              {menuOpen && <div className="profile-dropdown"><strong>{accessToken ? 'Tài khoản của tôi' : 'Khách'}</strong>{accessToken ? <button onClick={logout} type="button">Đăng xuất</button> : <Link onClick={() => setMenuOpen(false)} to="/dang-nhap">Đăng nhập</Link>}</div>}
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default AppShell
