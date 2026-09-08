import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  if (localStorage.getItem('hls_access_token')) return <Navigate replace to="/" />

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!email.trim() || password.length < 8) {
      setError('Vui lòng nhập email và mật khẩu tối thiểu 8 ký tự.')
      return
    }
    setLoading(true)
    try {
      const response = await loginUser({ email: email.trim(), password })
      localStorage.setItem('hls_access_token', response.data.accessToken)
      localStorage.setItem('hls_refresh_token', response.data.refreshToken)
      if (remember) localStorage.setItem('hls_remember', 'true')
      window.dispatchEvent(new Event('hls-auth-changed'))
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Email hoặc mật khẩu không chính xác.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9f9ff] py-10 lg:py-16">
      <div className="pointer-events-none absolute left-1/4 top-12 h-96 w-96 rounded-full bg-[#dde1ff]/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-[#d8e2ff]/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#dde1ff]/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#173bab] shadow-sm">⌂ Cổng xác thực sinh viên học viện &amp; đại học</span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#00288e] md:text-3xl">Tham gia cộng đồng tri thức Học Liệu Số</h1>
          <p className="mt-2 text-sm leading-6 text-[#444653]">Môi trường kết nối học thuật, chia sẻ giáo trình khảo cứu và đề thi có kiểm duyệt lớn nhất Việt Nam.</p>
        </div>
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl lg:grid-cols-12 lg:min-h-160">
          <section className="relative flex flex-col justify-between overflow-hidden bg-linear-to-br from-[#00288e] via-[#1e40af] to-[#0058be] p-6 text-white lg:col-span-5 lg:p-10">
            <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full border-32 border-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-lg bg-white p-1 shadow-md"><img alt="Logo Học Liệu Số" className="h-full w-full object-contain" src="/hoc-lieu-so-logo.png" /></div><div><strong className="block text-lg">Học Liệu Số</strong><span className="text-[11px] text-[#b8c4ff]">Tri thức số • Đại học mở</span></div></div>
              <div className="mt-9"><span className="text-xs font-semibold uppercase tracking-wider text-[#d8e2ff]">Quyền lợi thành viên</span><h2 className="mt-2 text-2xl font-bold leading-snug">Đồng hành cùng hành trình cử nhân và thạc sĩ</h2></div>
              <div className="mt-5 space-y-3"><Benefit icon="▤" title="500,000+ Học liệu số hoá" text="Giáo trình, slide bài giảng, tóm tắt lý thuyết độc quyền theo môn." /><Benefit icon="✓" title="Đề thi 80+ Trường Đại học" text="Đề thi chính thức kèm lời giải chi tiết từ ĐHQG, Bách Khoa, Kinh tế..." /><Benefit icon="♛" title="Điểm uy tín tác giả học thuật" text="Tải lên bài vở để tích điểm nhận suất học bổng công nghệ và chứng chỉ." /></div>
            </div>
            <div className="relative z-10 mt-8 flex items-center justify-between rounded-lg bg-white/10 p-3"><div><strong className="block text-lg">148,000+</strong><span className="text-[11px] text-[#b8c4ff]">Sinh viên đang truy cập</span></div><div className="flex -space-x-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d8e2ff] text-xs font-bold text-[#00288e] ring-2 ring-[#1e40af]">AN</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9f7ed] text-xs font-bold text-[#00563a] ring-2 ring-[#1e40af]">TL</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#fef3c7] text-xs font-bold text-[#92400e] ring-2 ring-[#1e40af]">+80</span></div></div>
          </section>
          <section className="flex flex-col justify-between bg-white p-6 lg:col-span-7 lg:p-10">
            <div><div className="mb-7 flex rounded-lg bg-[#f1f3ff] p-1"><button className="flex-1 rounded bg-white px-3 py-2 text-sm font-bold text-[#00288e] shadow-sm" type="button">⇥ Đăng nhập</button><Link className="flex-1 rounded px-3 py-2 text-center text-sm font-medium text-[#444653] hover:text-[#141b2b]" to="/dang-ky">♙ Đăng ký mới</Link></div>
              <button className="flex w-full items-center justify-between rounded-lg bg-[#f1f3ff] px-4 py-3 text-left text-sm text-[#141b2b] shadow-sm hover:bg-[#e9edff]" type="button"><span>⌂ &nbsp; Đăng nhập bằng Email sinh viên (.edu.vn)</span><span className="rounded-full bg-[#6ffbbe] px-2 py-1 text-[10px] font-semibold text-[#002113]">+20 điểm</span></button>
              <div className="relative my-6 flex items-center justify-center"><div className="h-px w-full bg-[#dce2f7]" /><span className="absolute bg-white px-3 text-[11px] text-[#444653]">hoặc sử dụng thông tin tài khoản</span></div>
              <form className="space-y-4" onSubmit={submit}><label className="block"><span className="mb-1 flex justify-between text-xs font-semibold text-[#141b2b]"><span>Email học thuật / Mã số sinh viên (MSSV)</span><small className="font-normal text-[#444653]">VD: 20210045 hoặc anh.nv@neu.edu.vn</small></span><div className="relative"><span className="absolute left-3 top-3 text-[#757684]">▣</span><input className="h-10.5 w-full rounded bg-[#f1f3ff]/60 px-10 text-sm outline-none shadow-sm focus:bg-white focus:ring-2 focus:ring-[#00288e]" onChange={(event) => setEmail(event.target.value)} placeholder="Nhập MSSV hoặc địa chỉ email" type="text" value={email} /></div></label><label className="block"><span className="mb-1 flex justify-between text-xs font-semibold text-[#141b2b]"><span>Mật khẩu truy cập</span><a className="font-medium text-[#0058be]" href="#quen-mat-khau">Quên mật khẩu?</a></span><div className="relative"><span className="absolute left-3 top-3 text-[#757684]">▣</span><input className="h-10.5 w-full rounded bg-[#f1f3ff]/60 px-10 pr-12 text-sm outline-none shadow-sm focus:bg-white focus:ring-2 focus:ring-[#00288e]" onChange={(event) => setPassword(event.target.value)} placeholder="Tối thiểu 8 ký tự bảo mật" type={showPassword ? 'text' : 'password'} value={password} /><button className="absolute right-3 top-2.5 text-lg text-[#757684]" onClick={() => setShowPassword((current) => !current)} type="button">{showPassword ? '◉' : '◌'}</button></div></label><div className="flex items-center justify-between pt-1"><label className="flex items-center gap-2 text-sm text-[#444653]"><input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" />Duy trì phiên đăng nhập (30 ngày)</label><span className="text-xs text-[#00563a]">✓ SSL 256-bit</span></div>{error && <div className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]" role="alert">{error}</div>}<button className="flex h-10 w-full items-center justify-center gap-2 rounded bg-[#1e40af] text-sm font-semibold text-white shadow-md transition hover:bg-[#00288e] disabled:cursor-wait disabled:opacity-70" disabled={loading} type="submit">{loading ? 'Đang xác thực...' : 'Đăng nhập vào kho tài liệu →'}</button></form>
            </div><div className="mt-8 border-t border-[#c4c5d5]/30 pt-4 text-center"><p className="text-xs leading-5 text-[#444653]">Bằng việc tiếp tục, bạn đồng ý với <a className="font-semibold text-[#0058be]" href="#quy-che">Quy chế chia sẻ học liệu</a>, <a className="font-semibold text-[#0058be]" href="#dmca">Tiêu chuẩn bản quyền DMCA</a> và <a className="font-semibold text-[#0058be]" href="#bao-mat">Chính sách bảo mật sinh viên</a>.</p><div className="mt-2 text-xs text-[#444653]">✓ Giáo dục phi lợi nhuận &nbsp; • &nbsp; ◈ Dữ liệu được mã hóa an toàn</div></div>
          </section>
        </div>
        <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-3"><HelpCard icon="?" title="Không nhớ mật khẩu trường?" text="Sử dụng OTP qua Email cá nhân hoặc liên hệ cố vấn học vụ." /><HelpCard icon="♛" title="Cơ chế tặng điểm uy tín" text="Mỗi đề thi đóng góp sau kiểm duyệt được cộng 50-100 điểm." /><HelpCard icon="✓" title="Tài khoản giảng viên & TA" text="Đăng ký định danh để nhận quyền biên tập môn học chuyên sâu." /></div>
      </div>
    </div>
  )
}

function Benefit({ icon, title, text }) { return <div className="flex items-start gap-3 rounded-lg bg-white/10 p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d8e2ff]/20 text-[#6ffbbe]">{icon}</span><span><strong className="block text-sm">{title}</strong><small className="mt-1 block text-xs leading-5 text-[#b8c4ff]">{text}</small></span></div> }
function HelpCard({ icon, title, text }) { return <div className="flex items-start gap-3 rounded-lg bg-[#f1f3ff] p-4 shadow-sm"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#dde1ff] text-lg text-[#00288e]">{icon}</span><span><strong className="block text-sm text-[#141b2b]">{title}</strong><small className="mt-1 block text-xs leading-5 text-[#444653]">{text}</small></span></div> }

export default LoginPage
