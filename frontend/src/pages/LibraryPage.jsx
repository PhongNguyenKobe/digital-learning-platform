import { useEffect, useState } from 'react'
import { changePassword, fetchCurrentUser } from '../services/api'

function LibraryPage() {
  const [user, setUser] = useState(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCurrentUser().then((response) => setUser(response.data)).catch(() => setError('Không thể tải thông tin tài khoản. Vui lòng đăng nhập lại.'))
  }, [])

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submitPassword(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (form.newPassword.length < 8) return setError('Mật khẩu mới cần có ít nhất 8 ký tự.')
    if (form.newPassword !== form.confirmPassword) return setError('Xác nhận mật khẩu mới chưa khớp.')
    setSaving(true)
    try {
      const response = await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setNotice(response.data.message)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordOpen(false)
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const initials = (user?.fullName || 'SV').split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
  const school = user?.university ? `${user.university.name}${user.university.shortName ? ` - ${user.university.shortName}` : ''}` : 'Chưa cập nhật trường'

  return (
    <section className="placeholder-page library-page">
      <span className="section-kicker">THƯ VIỆN CỦA TÔI</span>
      <h1>Thư viện của tôi</h1>
      <p>Danh sách tài liệu đã lưu sẽ được hiển thị tại đây.</p>

      <section className="account-panel" aria-label="Tài khoản của tôi">
        <button aria-expanded={accountOpen} className="account-summary" onClick={() => setAccountOpen((current) => !current)} type="button">
          <span className="account-initials">{initials}</span>
          <span className="account-summary-copy"><strong>{user?.fullName || 'Đang tải thông tin...'}</strong><small>{user?.email || 'Tài khoản học tập của bạn'}</small></span>
          <span className="account-chevron" aria-hidden="true">{accountOpen ? '⌃' : '⌄'}</span>
        </button>
        {accountOpen && <div className="account-details">
          <dl>
            <div><dt>Email</dt><dd>{user?.email || '—'}</dd></div>
            <div><dt>Tên đăng nhập</dt><dd>{user?.username ? `@${user.username}` : 'Chưa thiết lập'}</dd></div>
            <div><dt>Trường</dt><dd>{school}</dd></div>
            <div><dt>Khoa / Viện</dt><dd>{user?.faculty?.name || 'Chưa cập nhật'}</dd></div>
          </dl>
          <div className="account-security">
            <div><strong>Bảo mật tài khoản</strong><p>Đổi mật khẩu định kỳ để bảo vệ tài liệu và thông tin học tập của bạn.</p></div>
            <button className="account-action" onClick={() => setPasswordOpen((current) => !current)} type="button">{passwordOpen ? 'Đóng' : 'Đổi mật khẩu'}</button>
          </div>
          {passwordOpen && <form className="password-form" onSubmit={submitPassword}>
            <label>Mật khẩu hiện tại<input name="currentPassword" onChange={updateForm} required type="password" value={form.currentPassword} /></label>
            <label>Mật khẩu mới<input minLength="8" name="newPassword" onChange={updateForm} required type="password" value={form.newPassword} /></label>
            <label>Xác nhận mật khẩu mới<input minLength="8" name="confirmPassword" onChange={updateForm} required type="password" value={form.confirmPassword} /></label>
            <button disabled={saving} type="submit">{saving ? 'Đang cập nhật...' : 'Lưu mật khẩu mới'}</button>
          </form>}
          {error && <p className="account-message account-error" role="alert">{error}</p>}
          {notice && <p className="account-message account-success">✓ {notice}</p>}
        </div>}
      </section>
    </section>
  )
}

export default LibraryPage
