import { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'
import MetricCard from '../Components/MetricCard'
import Toast from '../Components/Toast'
import { apiGet, apiPost } from '../api/client'

const money = (paise) => `₹ ${(paise / 100).toLocaleString('en-IN')}`
const localDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRange(period) {
  const end = new Date()
  const start = new Date(end)
  if (period === 'Week') start.setDate(end.getDate() - 6)
  if (period === 'Month') start.setDate(1)
  return { from: localDate(start), to: localDate(end) }
}

export default function Cashbook() {
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState({ receivedPaise: 0, paidPaise: 0, netMovementPaise: 0 })
  const [customers, setCustomers] = useState([])
  const [period, setPeriod] = useState('Today')
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('Received')
  const [account, setAccount] = useState('Cash')
  const [customerId, setCustomerId] = useState('')
  const [category, setCategory] = useState('General')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const loadData = async (selectedPeriod = period) => {
    setLoadError('')
    const range = getRange(selectedPeriod)
    try {
      const [cashbook, customerResult] = await Promise.all([
        apiGet(`/api/cashbook?from=${range.from}&to=${range.to}`),
        apiGet('/api/customers?limit=100'),
      ])
      setEntries(cashbook.data)
      setSummary(cashbook.summary)
      setCustomers(customerResult.data)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const range = getRange('Today')
    Promise.all([
      apiGet(`/api/cashbook?from=${range.from}&to=${range.to}`),
      apiGet('/api/customers?limit=100'),
    ])
      .then(([cashbook, customerResult]) => {
        if (!active) return
        setEntries(cashbook.data)
        setSummary(cashbook.summary)
        setCustomers(customerResult.data)
      })
      .catch((error) => { if (active) setLoadError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const addEntry = async (event) => {
    event.preventDefault()
    const amountPaise = Math.round(Number(amount) * 100)
    if (!description.trim() || amountPaise <= 0) {
      setToast('Enter a description and amount greater than zero.')
      return
    }
    if (type === 'Received' && !customerId) {
      setToast('Select the customer who made the payment.')
      return
    }
    setSaving(true)
    try {
      const body = type === 'Received'
        ? { customerId, amountPaise, paymentMethod: account, description: description.trim() }
        : { category: category.trim() || 'General', amountPaise, paymentMethod: account, description: description.trim() }
      await apiPost(type === 'Received' ? '/api/transactions/payment' : '/api/transactions/expense', body, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      })
      setDescription('')
      setAmount('')
      setOpen(false)
      setToast('Cashbook entry recorded.')
      await loadData()
    } catch (error) {
      setToast(error.message)
    } finally {
      setSaving(false)
    }
  }

  const displayedEntries = useMemo(() => entries, [entries])

  return (
    <AppLayout title="Cashbook" subtitle="Recorded cash, UPI and bank movements">
      <div className="space-y-6">
        <PageHeader eyebrow="Money movement" title="Cashbook" description="Daily view of transactions that move money." actions={<button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#172B4D] px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Add entry</button>} />
        <div className="flex w-fit rounded-lg border border-slate-200 bg-white p-1">{['Today', 'Week', 'Month'].map((item) => <button key={item} type="button" onClick={() => { setPeriod(item); setLoading(true); loadData(item) }} className={`rounded-md px-3 py-2 text-sm font-semibold ${period === item ? 'bg-[#E9F5F3] text-[#159A8A]' : 'text-slate-500'}`}>{item}</button>)}</div>
        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Opening balance" value="—" caption="Not configured" />
          <MetricCard label="Money received" value={money(summary.receivedPaise)} caption="Recorded inflows" icon={ArrowDownLeft} tone="teal" />
          <MetricCard label="Money paid" value={money(summary.paidPaise)} caption="Recorded outflows" icon={ArrowUpRight} tone="navy" />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-600">Net recorded movement</p><p className={`mt-1 text-2xl font-bold ${summary.netMovementPaise < 0 ? 'text-red-600' : 'text-[#172B4D]'}`}>{money(summary.netMovementPaise)}</p><p className="mt-1 text-xs text-slate-400">This is movement during the selected period, not an account balance.</p></section>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-[#172B4D]">Activity</h2></div>
          {loading ? <p className="px-6 py-16 text-center text-sm text-slate-500">Loading cashbook…</p> : loadError ? <div role="alert" className="px-6 py-12 text-center"><p className="font-semibold text-red-600">{loadError}</p><button type="button" onClick={() => loadData()} className="mt-3 text-sm font-bold text-[#159A8A]">Try again</button></div> : displayedEntries.length ? <div className="divide-y divide-slate-100">{displayedEntries.map((entry) => <div key={entry.id} className="flex items-center gap-3 px-5 py-4"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${entry.type === 'Received' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{entry.type === 'Received' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800">{entry.description}</p><p className="mt-0.5 text-xs text-slate-400">{entry.date?.slice(0, 10)} · {entry.account}{entry.party ? ` · ${entry.party}` : ''}</p></div><p className={`font-bold ${entry.type === 'Received' ? 'text-green-700' : 'text-red-600'}`}>{entry.type === 'Received' ? '+' : '−'} {money(entry.amountPaise)}</p></div>)}</div> : <p className="px-6 py-16 text-center text-sm text-slate-500">No cashbook activity for this period.</p>}
        </section>
        {open && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={addEntry} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-bold text-[#172B4D]">Add cashbook entry</h2><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option>Received</option><option>Paid</option></select></label>{type === 'Received' ? <label className="block text-sm font-semibold">Customer<select required value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option value="">Select customer</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}</select></label> : <label className="block text-sm font-semibold">Expense category<input required value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>}<label className="block text-sm font-semibold">Description<input required value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="block text-sm font-semibold">Amount<input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="block text-sm font-semibold">Account<select value={account} onChange={(event) => setAccount(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option>Cash</option><option>UPI</option><option>Bank</option><option>Cheque</option></select></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-[#172B4D] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save entry'}</button></div></form></div>}
      </div>
      <Toast message={toast} />
    </AppLayout>
  )
}
