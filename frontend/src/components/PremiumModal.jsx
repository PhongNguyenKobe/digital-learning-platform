import { useState } from 'react'
import { upgradePremium } from '../services/api'

const plans = [
  {
    id: 'MONTH',
    title: 'Gói 1 Tháng',
    price: '29.000',
    unit: 'tháng',
    badge: 'Ôn thi cấp tốc',
    badgeColor: 'bg-slate-100 text-slate-700',
    description: 'Phù hợp cho mùa thi ngắn hạn, giải quyết đề cương gấp.',
  },
  {
    id: 'SEMESTER',
    title: 'Gói 1 Học kỳ',
    price: '69.000',
    unit: '5 tháng',
    badge: '⭐ Phổ biến nhất',
    badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300',
    isPopular: true,
    description: 'Tiết kiệm 55%, trọn vẹn cả học kỳ và kỳ thi cuối kỳ.',
  },
  {
    id: 'YEAR',
    title: 'Gói 1 Năm',
    price: '129.000',
    unit: 'năm',
    badge: 'Tiết kiệm nhất',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    description: 'Chỉ ~10.000đ/tháng, truy cập kho tài liệu số không giới hạn.',
  },
]

function PremiumModal({ isOpen, onClose, onSuccess, userCredits = 0 }) {
  const [selectedPlan, setSelectedPlan] = useState('SEMESTER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showQr, setShowQr] = useState(false)

  if (!isOpen) return null

  async function handleActivate() {
    setLoading(true)
    setError('')
    try {
      const res = await upgradePremium(selectedPlan)
      if (onSuccess) onSuccess(res.data?.user || res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Không thể nâng cấp gói. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const activePlanObj = plans.find((p) => p.id === selectedPlan)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-linear-to-r from-[#00288e] to-[#2942b0] px-6 py-6 text-white sm:px-8">
          <button
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-400 px-2.5 py-0.5 text-xs font-black text-[#00288e]">
              PREMIUM VIP
            </span>
            <span className="text-xs text-blue-200">Học liệu số Pass</span>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Nâng cấp Đặc quyền Không giới hạn</h2>
          <p className="mt-1 text-sm text-blue-100">
            Tải và xem tất cả tài liệu bị khóa, đề thi độc quyền mà không cần phải chờ đóng góp tài liệu.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Lợi ích */}
          <div className="mb-6 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-900">
              <span className="font-semibold">Mở khóa 100% file</span>
            </div>
            <div className="flex items-center justify-center rounded-lg bg-emerald-50 p-2 text-emerald-900">
              <span className="font-semibold">Tải không giới hạn</span>
            </div>
            <div className="flex items-center justify-center rounded-lg bg-amber-50 p-2 text-amber-900">
              <span className="font-semibold">+10 Credit thưởng</span>
            </div>
            <div className="flex items-center justify-center rounded-lg bg-purple-50 p-2 text-purple-900">
              <span className="font-semibold">Hỗ trợ 24/7</span>
            </div>
          </div>

          {/* Chọn gói */}
          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id
              return (
                <div
                  key={p.id}
                  className={`relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-[#00288e] bg-blue-50/40 shadow-md ring-2 ring-[#00288e]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  onClick={() => setSelectedPlan(p.id)}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                      <input
                        checked={isSelected}
                        className="h-4 w-4 text-[#00288e]"
                        name="plan"
                        onChange={() => setSelectedPlan(p.id)}
                        type="radio"
                      />
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900">{p.title}</h3>
                    <div className="mt-2">
                      <span className="text-xl font-black text-[#00288e]">{p.price}đ</span>
                      <span className="text-xs text-slate-500"> / {p.unit}</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{p.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

          {/* Tab chuyển đổi thanh toán QR demo */}
          {showQr ? (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-700">Quét mã QR để thanh toán gói {activePlanObj?.title} ({activePlanObj?.price}đ)</p>
              <div className="mx-auto my-3 flex h-36 w-36 items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-white shadow-inner">
                <div className="text-center">
                  <span className="text-3xl">📱</span>
                  <p className="mt-1 text-[11px] font-bold text-blue-800">VietQR / MoMo</p>
                  <p className="text-[9px] text-slate-400">DEMO SIMULATOR</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Sau khi quét mã, bấm <strong>"Xác nhận kích hoạt"</strong> bên dưới để hệ thống cấp quyền VIP ngay.
              </p>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="text-xs font-semibold text-slate-500 hover:text-blue-800 underline"
              onClick={() => setShowQr(!showQr)}
              type="button"
            >
              {showQr ? '← Ẩn mã QR' : '💳 Xem mã QR thanh toán chuyển khoản'}
            </button>
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                onClick={onClose}
                type="button"
              >
                Đóng
              </button>
              <button
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#00288e] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#002070] disabled:opacity-50"
                disabled={loading}
                onClick={handleActivate}
                type="button"
              >
                {loading ? 'Đang kích hoạt...' : `Kích hoạt ngay (${activePlanObj?.price}đ)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PremiumModal
