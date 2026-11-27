import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, Download, Eye, Plus, Search, RotateCcw, X } from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'
import MetricCard from '../Components/MetricCard'
import Toast from '../Components/Toast'
import { apiGet, apiPost } from '../api/client'

const types = ['All', 'Credit Given', 'Payment Received', 'Cash Sale', 'Purchase', 'Expense', 'Supplier Payment', 'Reversal']
const methods = ['Cash', 'UPI', 'Bank', 'Cheque', 'Credit']
const money = (paise) => `₹ ${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const getBalance = (row) => Math.max(row.amountPaise - (row.amountPaidPaise || 0), 0)
const getStatus = (row) => row.status === 'Reversed' ? 'Reversed' : getBalance(row) === 0 ? 'Paid' : (row.amountPaidPaise || 0) > 0 ? 'Partial' : 'Unpaid'
const today = () => new Date().toISOString().slice(0, 10)

const toView = (row) => ({
  ...row,
  id: row._id,
  reference: row.reference,
  date: row.transactionDate?.slice(0, 10) || '',
  party: row.customer?.name || row.supplier?.name || 'Walk-in',
  amountPaise: row.amountPaise,
  amountPaidPaise: row.amountPaidPaise || 0,
})

export default function Transaction() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState([])
  const [customers, setCustomers] = useState([])
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState('All statuses')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [draft, setDraft] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const loadData = async () => {
    setLoadError('')
    try {
      const [transactionResult, customerResult] = await Promise.all([
        apiGet('/api/transactions?limit=100'),
        apiGet('/api/customers?limit=100'),
      ])
      setRows(transactionResult.data.map(toView))
      setCustomers(customerResult.data)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([
      apiGet('/api/transactions?limit=100'),
      apiGet('/api/customers?limit=100'),
    ])
      .then(([transactionResult, customerResult]) => {
        if (!active) return
        setRows(transactionResult.data.map(toView))
        setCustomers(customerResult.data)
      })
      .catch((error) => { if (active) setLoadError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => rows.filter((row) => {
    const matchesTab = tab === 'All' || row.type === tab
    const matchesStatus = status === 'All statuses' || getStatus(row) === status
    const matchesSearch = `${row.reference} ${row.party} ${row.description}`.toLowerCase().includes(search.toLowerCase())
    const matchesFrom = !from || row.date >= from
    const matchesTo = !to || row.date <= to
    return matchesTab && matchesStatus && matchesSearch && matchesFrom && matchesTo
  }).sort((a, b) => b.date.localeCompare(a.date)), [from, rows, search, status, tab, to])

  const summary = useMemo(() => rows.reduce((total, row) => {
    if (row.status !== 'Reversed') {
      if (['Cash Sale', 'Credit Given'].includes(row.type)) total.sales += row.amountPaise
      if (row.type === 'Payment Received') total.received += row.amountPaise
      if (row.type === 'Credit Given' || row.type === 'Cash Sale') total.due += getBalance(row)
    }
    return total
  }, { sales: 0, received: 0, due: 0 }), [rows])

  const openAdd = () => setDraft({
    type: 'Credit Given',
    customerId: '',
    date: today(),
    method: 'Credit',
    amount: '',
    description: '',
  })

  const save = async (event) => {
    event.preventDefault()
    if (!draft.customerId && draft.type !== 'Expense') {
      setToast('Choose a customer for this transaction.')
      return
    }
    const amountPaise = Math.round(Number(draft.amount) * 100)
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      setToast('Enter an amount greater than zero.')
      return
    }
    setSaving(true)
    try {
      const endpoint = draft.type === 'Credit Given'
        ? '/api/transactions/credit'
        : draft.type === 'Payment Received'
          ? '/api/transactions/payment'
          : '/api/transactions/expense'
      const body = draft.type === 'Expense'
        ? { category: 'General', amountPaise, paymentMethod: draft.method, description: draft.description }
        : {
            customerId: draft.customerId,
            amountPaise,
            paymentMethod: draft.type === 'Credit Given' ? 'Credit' : draft.method,
            description: draft.description,
            transactionDate: new Date(`${draft.date}T00:00:00.000Z`).toISOString(),
          }
      if (draft.type === 'Expense') body.expenseDate = new Date(`${draft.date}T00:00:00.000Z`).toISOString()
      await apiPost(endpoint, body, { headers: { 'Idempotency-Key': crypto.randomUUID() } })
      setDraft(null)
      setToast('Transaction recorded.')
      await loadData()
    } catch (error) {
      setToast(error.message)
    } finally {
      setSaving(false)
    }
  }

  const reverse = async (row) => {
    if (!window.confirm(`Reverse ${row.reference}? This will create a reversal record and update the ledger.`)) return
    try {
      await apiPost(`/api/transactions/${row.id}/reverse`, {})
      setSelected(null)
      setToast('Transaction reversed.')
      await loadData()
    } catch (error) {
      setToast(error.message)
    }
  }

  const exportCsv = () => {
    const headings = ['Reference', 'Date', 'Type', 'Party', 'Description', 'Amount paise', 'Paid paise', 'Balance paise', 'Status']
    const data = filtered.map((row) => [row.reference, row.date, row.type, row.party, row.description, row.amountPaise, row.amountPaidPaise, getBalance(row), getStatus(row)])
    const csv = [headings, ...data].map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'transactions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('All statuses')
    setFrom('')
    setTo('')
    setTab('All')
  }

  return (
    <AppLayout title="Transactions" subtitle="Sales, purchases, payments and expenses">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Financial ledger"
          title="Transactions"
          description="Review real shop activity and record customer credit, payments or expenses."
          actions={
            <>
              <button type="button" onClick={exportCsv} disabled={!filtered.length} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40"><Download size={16} /> Export CSV</button>
              <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-[#172B4D] px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Add transaction</button>
            </>
          }
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Recorded sales and credit" value={money(summary.sales)} caption="Completed shop transactions" />
          <MetricCard label="Payments received" value={money(summary.received)} caption="Recorded customer payments" />
          <MetricCard label="Outstanding credit" value={money(summary.due)} caption="From active ledger entries" />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:justify-between">
            <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 xl:max-w-sm"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, party or description" className="w-full text-sm outline-none" /></label>
            <div className="grid gap-2 sm:grid-cols-3">
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Payment status" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700"><option>All statuses</option><option>Paid</option><option>Partial</option><option>Unpaid</option><option>Reversed</option></select>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3"><CalendarDays size={15} className="text-slate-400" /><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="From date" className="w-full py-2 text-sm outline-none" /></label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3"><CalendarDays size={15} className="text-slate-400" /><input type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="To date" className="w-full py-2 text-sm outline-none" /></label>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 px-4 py-3">
            {types.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${tab === item ? 'bg-[#E9F5F3] text-[#159A8A]' : 'border border-slate-200 text-slate-600'}`}>{item}</button>)}
            {(search || status !== 'All statuses' || from || to || tab !== 'All') && <button type="button" onClick={clearFilters} className="shrink-0 px-2 text-xs font-bold text-slate-500">Clear</button>}
          </div>

          {loading ? <div className="px-6 py-16 text-center text-sm text-slate-500">Loading transactions…</div> : loadError ? (
            <div role="alert" className="px-6 py-12 text-center"><p className="font-semibold text-red-600">{loadError}</p><button type="button" onClick={loadData} className="mt-3 text-sm font-bold text-[#159A8A]">Try again</button></div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Reference</th><th className="px-4 py-3">Party</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4"><p className="font-bold text-[#172B4D]">{row.reference}</p><p className="mt-0.5 max-w-44 truncate text-xs text-slate-400">{row.description}</p></td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{row.party}</td>
                    <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{row.type}</span></td>
                    <td className="px-4 py-4 text-slate-600">{row.date}</td>
                    <td className="px-4 py-4 font-bold text-slate-800">{money(row.amountPaise)}</td>
                    <td className="px-4 py-4 text-green-700">{money(row.amountPaidPaise)}</td>
                    <td className="px-4 py-4 font-bold text-red-600">{money(getBalance(row))}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatus(row) === 'Paid' ? 'bg-green-50 text-green-700' : getStatus(row) === 'Reversed' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'}`}>{getStatus(row)}</span></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => setSelected(row)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`View ${row.reference}`}><Eye size={16} /></button>{row.status !== 'Reversed' && <button type="button" onClick={() => reverse(row)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={`Reverse ${row.reference}`}><RotateCcw size={16} /></button>}</div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <div className="px-6 py-16 text-center"><p className="font-bold text-[#172B4D]">No transactions found</p><button type="button" onClick={clearFilters} className="mt-2 text-sm font-bold text-[#159A8A]">Clear filters</button></div>}
        </section>
      </div>

      {draft && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && setDraft(null)}><form onSubmit={save} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#172B4D]">Add transaction</h2><button type="button" onClick={() => setDraft(null)} className="rounded-lg p-2 text-slate-400"><X size={18} /></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option>Credit Given</option><option>Payment Received</option><option>Expense</option></select></label>
          <label className="text-sm font-semibold text-slate-700">Date<input type="date" required value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
          {draft.type !== 'Expense' && <label className="sm:col-span-2 text-sm font-semibold text-slate-700">Customer<select required value={draft.customerId} onChange={(event) => setDraft({ ...draft, customerId: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option value="">Select customer</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name} · {customer.phone}</option>)}</select></label>}
          <label className="text-sm font-semibold text-slate-700">Amount<input required type="number" min="0.01" step="0.01" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
          <label className="text-sm font-semibold text-slate-700">Payment method<select value={draft.method} onChange={(event) => setDraft({ ...draft, method: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal">{methods.filter((method) => draft.type === 'Credit Given' || method !== 'Credit').map((method) => <option key={method}>{method}</option>)}</select></label>
          <label className="sm:col-span-2 text-sm font-semibold text-slate-700">Description<input required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setDraft(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-[#172B4D] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save transaction'}</button></div>
      </form></div>}

      {selected && <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><section className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Transaction details</p><h2 className="mt-1 text-lg font-bold text-[#172B4D]">{selected.reference}</h2></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400"><X size={18} /></button></div>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-400">Party</dt><dd className="mt-1 font-bold text-slate-700">{selected.party}</dd></div><div><dt className="text-slate-400">Type</dt><dd className="mt-1 font-bold text-slate-700">{selected.type}</dd></div><div><dt className="text-slate-400">Date</dt><dd className="mt-1 font-bold text-slate-700">{selected.date}</dd></div><div><dt className="text-slate-400">Payment method</dt><dd className="mt-1 font-bold text-slate-700">{selected.paymentMethod}</dd></div><div><dt className="text-slate-400">Total</dt><dd className="mt-1 font-bold text-slate-700">{money(selected.amountPaise)}</dd></div><div><dt className="text-slate-400">Balance</dt><dd className="mt-1 font-bold text-red-600">{money(getBalance(selected))}</dd></div></dl>
        <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{selected.description}</p>
        {selected.status !== 'Reversed' && <button type="button" onClick={() => reverse(selected)} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600"><RotateCcw size={15} /> Reverse transaction</button>}
      </section></div>}
      <Toast message={toast} />
    </AppLayout>
  )
}
