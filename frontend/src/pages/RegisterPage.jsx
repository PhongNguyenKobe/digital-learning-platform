import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  if (localStorage.getItem('hls_access_token')) return <Navigate replace to="/" />

  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự.'); return }
    if (form.password !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return }
    setLoading(true)
    try {
      const response = await registerUser({ fullName: form.fullName, email: form.email, username: form.username || undefined, password: form.password })
      localStorage.setItem('hls_access_token', response.data.accessToken)
      localStorage.setItem('hls_refresh_token', response.data.refreshToken)
      window.dispatchEvent(new Event('hls-auth-changed'))
      navigate('/', { replace: true })
    } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Không thể tạo tài khoản.') } finally { setLoading(false) }
  }

  return <div className="min-h-screen bg-[#f9f9ff] px-4 py-12"><div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-xl lg:p-10"><div className="mb-7 text-center"><img alt="Logo Học Liệu Số" className="mx-auto h-12 w-auto object-contain" src="/hoc-lieu-so-logo.png" /><h1 className="mt-4 text-2xl font-bold text-[#00288e]">Tạo tài khoản Học Liệu Số</h1><p className="mt-2 text-sm text-[#444653]">Tham gia cộng đồng chia sẻ học liệu đại học.</p></div><div className="mb-6 flex rounded-lg bg-[#f1f3ff] p-1"><Link className="flex-1 rounded px-3 py-2 text-center text-sm text-[#444653]" to="/dang-nhap">Đăng nhập</Link><span className="flex-1 rounded bg-white px-3 py-2 text-center text-sm font-bold text-[#00288e] shadow-sm">Đăng ký mới</span></div><form className="space-y-4" onSubmit={submit}><Field label="Họ và tên" name="fullName" onChange={change} placeholder="Nguyễn Văn An" required value={form.fullName} /><Field label="Email" name="email" onChange={change} placeholder="ban@edu.vn" required type="email" value={form.email} /><Field label="Username (không bắt buộc)" name="username" onChange={change} placeholder="nguyen.an" value={form.username} /><Field label="Mật khẩu" name="password" onChange={change} placeholder="Tối thiểu 8 ký tự" required type="password" value={form.password} /><Field label="Xác nhận mật khẩu" name="confirmPassword" onChange={change} placeholder="Nhập lại mật khẩu" required type="password" value={form.confirmPassword} />{error && <div className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]">{error}</div>}<button className="w-full rounded-lg bg-[#1e40af] px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#00288e] disabled:opacity-60" disabled={loading} type="submit">{loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản & nhận 20 điểm khởi tạo →'}</button></form></div></div>
}

function Field({ label, name, onChange, placeholder, required, type = 'text', value }) { return <label className="block"><span className="mb-1 block text-xs font-semibold text-[#141b2b]">{label}</span><input className="h-10.5 w-full rounded bg-[#f1f3ff]/60 px-3 text-sm outline-none shadow-sm focus:bg-white focus:ring-2 focus:ring-[#00288e]" name={name} onChange={onChange} placeholder={placeholder} required={required} type={type} value={value} /></label> }

export default RegisterPage
