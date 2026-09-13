import { Link, useSearchParams } from 'react-router-dom'

export default function VnpayReturnPage() {
  const [params] = useSearchParams()
  const success = params.get('status') === 'success'
  const message = params.get('message') || (success ? 'Thanh toán thành công.' : 'Thanh toán chưa hoàn tất.')

  return <div className="min-h-screen bg-[#f9f9ff] px-4 py-20">
    <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl ${success ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{success ? '✓' : '!'}</div>
      <h1 className="mt-5 text-xl font-bold text-slate-900">{success ? 'Premium đã được kích hoạt' : 'Thanh toán chưa hoàn tất'}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-center gap-3"><Link className="rounded-lg bg-[#00288e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#002070]" to="/thu-vien">Vào thư viện</Link><Link className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" to="/">Trang chủ</Link></div>
    </section>
  </div>
}
