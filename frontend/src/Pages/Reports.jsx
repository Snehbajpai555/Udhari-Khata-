import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'
import MetricCard from '../Components/MetricCard'
import { apiGet } from '../api/client'

const reportTypes = ['Daily sales', 'Monthly sales', 'Income and expenses', 'Customer outstanding', 'Supplier outstanding', 'Product performance', 'Inventory valuation']
const money = (paise) => `₹ ${(paise / 100).toLocaleString('en-IN')}`

export default function Reports() {
  const [report, setReport] = useState(reportTypes[0])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    apiGet(`/api/reports/summary${params.size ? `?${params}` : ''}`)
      .then((result) => { if (active) setSummary(result.data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [from, to])

  const exportReport = () => {
    if (!summary) return
    const headings = ['Metric', 'Value (paise)']
    const rows = [
      ['Report', report],
      ['From', from || 'All dates'],
      ['To', to || 'All dates'],
      ['Sales', summary.salesPaise],
      ['Customer credit added', summary.ledgerCreditPaise],
      ['Payments received', summary.receivedPaise],
      ['Expenses', summary.expensesPaise],
      ['Purchases', summary.purchasesPaise],
      ['Cost of goods sold', summary.cogsPaise],
      ['Gross profit', summary.grossProfitPaise],
      ['Customer outstanding', summary.customerOutstandingPaise],
      ['Supplier outstanding', summary.supplierOutstandingPaise],
      ['Inventory valuation', summary.inventoryValuationPaise],
    ]
    const csv = [headings, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'udhari-khata-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout title="Reports" subtitle="Business reports and financial analysis">
      <div className="space-y-6">
        <PageHeader eyebrow="Analytics" title="Reports" description="Review date-filtered totals from recorded shop activity." actions={<button type="button" onClick={exportReport} disabled={!summary} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40"><Download size={16} /> Export CSV</button>} />
        <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="px-2 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">Report type</p>
            {reportTypes.map((item) => <button key={item} type="button" onClick={() => setReport(item)} className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${report === item ? 'bg-[#E9F5F3] text-[#159A8A]' : 'text-slate-600 hover:bg-slate-50'}`}>{item}</button>)}
          </aside>
          <div className="space-y-4">
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="text-xs font-bold text-slate-500">From date<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700" /></label>
              <label className="text-xs font-bold text-slate-500">To date<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700" /></label>
              <button type="button" onClick={() => { setFrom(''); setTo('') }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">Clear</button>
            </div>
            {loading ? <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading report…</div> : error ? <div role="alert" className="rounded-xl border border-red-200 bg-white p-8 text-center"><p className="font-semibold text-red-600">{error}</p></div> : summary && <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard label="Sales" value={money(summary.salesPaise)} caption="Completed sales" />
                <MetricCard label="Payments received" value={money(summary.receivedPaise)} caption="Collected" />
                <MetricCard label="Expenses" value={money(summary.expensesPaise)} caption="Recorded expenses" />
                <MetricCard label="Cost of goods sold" value={money(summary.cogsPaise)} caption="Based on sale stock movements" />
                <MetricCard label="Gross profit" value={money(summary.grossProfitPaise)} caption="Sales minus cost of goods sold" />
                <MetricCard label="Customer outstanding" value={money(summary.customerOutstandingPaise)} caption={`${summary.customerCount} customer accounts`} />
                <MetricCard label="Supplier outstanding" value={money(summary.supplierOutstandingPaise)} caption={`${summary.supplierCount} supplier accounts`} />
                <MetricCard label="Inventory valuation" value={money(summary.inventoryValuationPaise)} caption="At purchase cost" />
                <MetricCard label="Customer credit added" value={money(summary.ledgerCreditPaise)} caption="Credit ledger entries" />
              </div>
              {report === 'Product performance' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-[#172B4D]">Low-stock products</h2></div>{summary.lowStockProducts.length ? summary.lowStockProducts.map((product) => <div key={product.id} className="flex justify-between border-b border-slate-100 px-5 py-3 text-sm"><span className="font-semibold text-slate-700">{product.name}</span><span className="text-red-600">{product.stock} / min {product.minimumStock}</span></div>) : <p className="p-5 text-sm text-slate-500">No low-stock products.</p>}</section>}
            </>}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
