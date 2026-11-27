import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  Package,
  Plus,
  ReceiptText,
  WalletCards,
} from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import MetricCard from '../Components/MetricCard'
import { apiGet } from '../api/client'

const money = (paise) => `₹ ${(paise / 100).toLocaleString('en-IN')}`
const dateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const Dashboard = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('Today')
  const [summary, setSummary] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    let active = true
    const now = new Date()
    const from = period === 'Month'
      ? dateKey(new Date(now.getFullYear(), now.getMonth(), 1))
      : period === 'Week'
        ? dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6))
        : dateKey(now)
    const to = dateKey(now)
    Promise.all([
      apiGet(`/api/reports/summary?from=${from}&to=${to}`),
      apiGet('/api/transactions?limit=5'),
    ])
      .then(([report, transactions]) => {
        if (!active) return
        setSummary(report.data)
        setActivity(transactions.data)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [period])

  const quickActions = [
    { label: 'Add transaction', icon: WalletCards, path: '/transactions' },
    { label: 'Add customer', icon: Plus, path: '/customers' },
    { label: 'Receive payment', icon: ArrowDownLeft, path: '/transactions' },
    { label: 'Create bill', icon: ReceiptText, path: '/billing' },
  ]

  return (
    <AppLayout title="Overview" subtitle="A clear picture of your business today">
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-slate-500">{today}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#172B4D]">Business overview</h1>
            <p className="mt-1 text-sm text-slate-500">Here is what needs your attention today.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#172B4D] px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus size={16} /> Add transaction
          </button>
        </section>

        <section aria-label="Financial overview">
          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-[#172B4D]">Financial summary</h2>
              <p className="mt-1 text-xs text-slate-500">Totals from recorded shop activity for this period</p>
            </div>
            <div className="flex w-fit rounded-lg border border-slate-200 bg-white p-1">
              {['Today', 'Week', 'Month'].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={period === item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-md px-3 py-2 text-xs font-bold ${
                    period === item
                      ? 'bg-[#E9F5F3] text-[#159A8A]'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Sales" value={loading ? '…' : summary ? money(summary.salesPaise) : '—'} caption="Recorded completed sales" icon={ReceiptText} />
            <MetricCard label="Money received" value={loading ? '…' : summary ? money(summary.receivedPaise) : '—'} caption="Recorded payments" icon={ArrowDownLeft} />
            <MetricCard label="Customer credit" value={loading ? '…' : summary ? money(summary.customerOutstandingPaise) : '—'} caption="Outstanding balance" icon={WalletCards} />
            <MetricCard label="Expenses" value={loading ? '…' : summary ? money(summary.expensesPaise) : '—'} caption="Recorded expenses" icon={ArrowUpRight} />
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-[#172B4D]">Quick actions</h2>
                <p className="mt-1 text-xs text-slate-500">Common daily tasks</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className="flex min-h-24 flex-col items-start justify-between rounded-lg border border-slate-200 p-4 text-left transition hover:border-[#159A8A] hover:bg-[#F3FAF9]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E9F5F3] text-[#159A8A]">
                    <Icon size={17} />
                  </span>
                  <span className="mt-3 text-sm font-bold text-[#172B4D]">{label}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-[#172B4D]">Recent activity</h2>
                <p className="mt-1 text-xs text-slate-500">Latest recorded entries</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/transactions')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#159A8A]"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {activity.map((item) => {
                const isPayment = item.type === 'Payment Received'
                const party = item.customer?.name || item.supplier?.name || 'Shop'
                return <div key={item._id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isPayment
                      ? 'bg-[#E9F5F3] text-[#159A8A]'
                      : 'bg-slate-100 text-[#172B4D]'
                  }`}>
                    {party.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{party}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{item.type} · {item.paymentMethod}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold ${isPayment ? 'text-green-700' : 'text-slate-800'}`}>
                      {isPayment ? '+' : ''}{money(item.amountPaise)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{item.transactionDate?.slice(11, 16)}</p>
                  </div>
                </div>
              })}
              {!activity.length && !loading && <p className="px-5 py-10 text-center text-sm text-slate-500">No recent transactions.</p>}
            </div>
          </article>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-[#159A8A]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#172B4D]"><Package size={18} /></span>
            <span><span className="block text-sm font-bold text-[#172B4D]">Low-stock products</span><span className="mt-1 block text-xs text-slate-500">Review inventory levels</span></span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-red-300"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><CircleAlert size={18} /></span>
            <span><span className="block text-sm font-bold text-[#172B4D]">Outstanding payments</span><span className="mt-1 block text-xs text-slate-500">Review customer balances</span></span>
          </button>
        </section>
      </div>
    </AppLayout>
  )
}
