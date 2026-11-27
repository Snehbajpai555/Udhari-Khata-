import { useEffect, useMemo, useState } from 'react'
import { BellRing, Download, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'
import MetricCard from '../Components/MetricCard'
import Toast from '../Components/Toast'
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client'

const money = (paise) => `₹ ${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const emptyForm = { name: '', phone: '', address: '', category: 'Regular', creditLimit: '', balance: '' }

const initials = (name) => name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [dialog, setDialog] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ledger, setLedger] = useState([])
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [toast, setToast] = useState('')

  const loadCustomers = async () => {
    setLoadError('')
    try {
      const result = await apiGet('/api/customers?limit=100')
      setCustomers(result.data)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    apiGet('/api/customers?limit=100')
      .then((result) => { if (active) setCustomers(result.data) })
      .catch((error) => { if (active) setLoadError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const filtered = useMemo(() => customers.filter((customer) =>
    (category === 'All' || customer.category === category) &&
    `${customer.name} ${customer.phone} ${customer.address}`.toLowerCase().includes(search.toLowerCase())
  ), [category, customers, search])

  const outstanding = customers.reduce((sum, customer) => sum + customer.outstandingPaise, 0)
  const overdue = customers.filter((customer) => customer.outstandingPaise >= 75000).length

  const openAdd = () => setDialog({ ...emptyForm })
  const openEdit = (customer) => setDialog({
    id: customer._id,
    ...customer,
    creditLimit: String(customer.creditLimitPaise / 100),
  })

  const saveParty = (event) => {
    event.preventDefault()
    void submitParty()
  }

  const submitParty = async () => {
    if (!dialog.name.trim()) return
    if (!/^(\+?91[\s-]?)?[6-9]\d{9}$/.test(dialog.phone.replace(/\s/g, ''))) {
      setToast('Enter a valid Indian mobile number.')
      return
    }

    const record = {
      name: dialog.name.trim(),
      phone: dialog.phone.trim(),
      address: dialog.address.trim(),
      category: dialog.category,
      creditLimitPaise: Math.round(Number(dialog.creditLimit || 0) * 100),
    }

    try {
      if (dialog.id) {
        await apiPatch(`/api/customers/${dialog.id}`, record)
        setToast('Customer details updated.')
      } else {
        record.openingBalancePaise = Math.round(Number(dialog.balance || 0) * 100)
        await apiPost('/api/customers', record)
        setToast('Customer added.')
      }
      setDialog(null)
      await loadCustomers()
    } catch (error) {
      setToast(error.message)
    }
  }

  const deleteCustomer = async (customer) => {
    if (!window.confirm(`Remove ${customer.name}? This cannot be undone.`)) return
    try {
      await apiDelete(`/api/customers/${customer._id}`)
      if (profile?._id === customer._id) setProfile(null)
      setToast('Customer removed.')
      await loadCustomers()
    } catch (error) {
      setToast(error.message)
    }
  }

  const openProfile = async (customer) => {
    setProfile(customer)
    setLedger([])
    setLedgerLoading(true)
    try {
      const result = await apiGet(`/api/customers/${customer._id}/ledger`)
      setLedger(result.data)
    } catch (error) {
      setToast(error.message)
    } finally {
      setLedgerLoading(false)
    }
  }

  const exportStatement = async (customer) => {
    try {
      const result = await apiGet(`/api/customers/${customer._id}/ledger`)
      const headings = ['Date', 'Reference', 'Type', 'Description', 'Amount (paise)']
      const data = result.data.map((entry) => [entry.transactionDate, entry.reference, entry.type, entry.description, entry.amountPaise])
      const csv = [headings, ...data].map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `${customer.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-statement.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setToast(error.message)
    }
  }

  return (
    <AppLayout title="Customers" subtitle="Customer balances and digital Khata records">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Customer Khata"
          title="Customers"
          description="Track balances, contacts and payment follow-ups."
          actions={<button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-[#172B4D] px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Add customer</button>}
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Customers" value={String(customers.length)} caption="Active customer accounts" icon={Users} />
          <MetricCard label="Total outstanding" value={money(outstanding)} caption="Amount owed to the shop" />
          <MetricCard label="High balances" value={String(overdue)} caption="Accounts needing follow-up" />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 lg:max-w-sm">
              <Search size={16} className="text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone or address" className="w-full text-sm outline-none" />
            </label>
            <div className="flex gap-2 overflow-x-auto">
              {['All', 'Regular', 'Retail', 'Wholesale'].map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${category === item ? 'bg-[#E9F5F3] text-[#159A8A]' : 'border border-slate-200 text-slate-600'}`}>{item}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">Loading customers…</div>
          ) : loadError ? (
            <div role="alert" className="px-6 py-12 text-center"><p className="font-semibold text-red-600">{loadError}</p><button type="button" onClick={loadCustomers} className="mt-3 text-sm font-bold text-[#159A8A]">Try again</button></div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Outstanding</th><th className="px-4 py-3">Last transaction</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((customer) => (
                    <tr key={customer._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4"><button type="button" onClick={() => openProfile(customer)} className="flex items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[#172B4D]">{initials(customer.name)}</span><span><span className="block font-bold text-[#172B4D]">{customer.name}</span><span className="mt-0.5 block max-w-48 truncate text-xs text-slate-400">{customer.address}</span></span></button></td>
                      <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{customer.category}</span></td>
                      <td className="px-4 py-4 text-slate-600">{customer.phone}</td>
                      <td className="px-4 py-4"><p className={`font-bold ${customer.outstandingPaise ? 'text-red-600' : 'text-green-700'}`}>{money(customer.outstandingPaise)}</p><p className="mt-0.5 text-xs text-slate-400">Limit {money(customer.creditLimitPaise)}</p></td>
                      <td className="px-4 py-4 text-slate-600">{customer.updatedAt?.slice(0, 10) || '—'}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => setToast(`Reminder prepared for ${customer.name}. Sending is not configured.`)} className="rounded-lg p-2 text-slate-500 hover:bg-[#E9F5F3] hover:text-[#159A8A]" aria-label={`Prepare reminder for ${customer.name}`}><BellRing size={16} /></button><button type="button" onClick={() => openEdit(customer)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Edit ${customer.name}`}><Pencil size={16} /></button><button type="button" onClick={() => exportStatement(customer)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Export statement for ${customer.name}`}><Download size={16} /></button><button type="button" onClick={() => deleteCustomer(customer)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${customer.name}`}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center"><p className="font-bold text-[#172B4D]">No customers found</p><button type="button" onClick={() => { setSearch(''); setCategory('All') }} className="mt-2 text-sm font-bold text-[#159A8A]">Clear filters</button></div>
          )}
        </section>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && setDialog(null)}>
          <form onSubmit={saveParty} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#172B4D]">{dialog.id ? 'Edit customer' : 'Add customer'}</h2><button type="button" onClick={() => setDialog(null)} className="rounded-lg p-2 text-slate-400"><X size={18} /></button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">Name<input required value={dialog.name} onChange={(event) => setDialog({ ...dialog, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Mobile number<input required value={dialog.phone} onChange={(event) => setDialog({ ...dialog, phone: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Category<select value={dialog.category} onChange={(event) => setDialog({ ...dialog, category: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option>Regular</option><option>Retail</option><option>Wholesale</option></select></label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">Address<textarea rows="2" value={dialog.address} onChange={(event) => setDialog({ ...dialog, address: event.target.value })} className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Credit limit<input type="number" min="0" step="0.01" value={dialog.creditLimit} onChange={(event) => setDialog({ ...dialog, creditLimit: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
              {!dialog.id && <label className="text-sm font-semibold text-slate-700">Opening balance<input type="number" min="0" step="0.01" value={dialog.balance || ''} onChange={(event) => setDialog({ ...dialog, balance: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>}
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Cancel</button><button type="submit" className="rounded-lg bg-[#172B4D] px-4 py-2 text-sm font-bold text-white">{dialog.id ? 'Save changes' : 'Add customer'}</button></div>
          </form>
        </div>
      )}

      {profile && (
        <div className="fixed inset-0 z-[85] flex justify-end bg-slate-950/30" onMouseDown={(event) => event.target === event.currentTarget && setProfile(null)}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E9F5F3] text-sm font-bold text-[#159A8A]">{initials(profile.name)}</span><div><h2 className="font-bold text-[#172B4D]">{profile.name}</h2><p className="mt-1 text-sm text-slate-500">{profile.category} customer</p></div></div><button type="button" onClick={() => setProfile(null)} className="rounded-lg p-2 text-slate-400"><X size={18} /></button></div>
            <div className="mt-6 rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Outstanding balance</p><p className="mt-2 text-2xl font-bold text-red-600">{money(profile.outstandingPaise)}</p><p className="mt-2 text-xs text-slate-500">Credit limit {money(profile.creditLimitPaise)}</p></div>
            <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-slate-400">Phone</dt><dd className="mt-1 font-semibold text-slate-700">{profile.phone}</dd></div><div><dt className="text-slate-400">Address</dt><dd className="mt-1 font-semibold text-slate-700">{profile.address || '—'}</dd></div></dl>
            <div className="mt-6 flex items-center justify-between"><h3 className="font-bold text-[#172B4D]">Khata ledger</h3><button type="button" onClick={() => exportStatement(profile)} className="text-xs font-bold text-[#159A8A]">Export CSV</button></div>
            {ledgerLoading ? <p className="mt-3 text-sm text-slate-500">Loading ledger…</p> : ledger.length ? <div className="mt-3 divide-y divide-slate-100">{ledger.map((entry) => <div key={entry._id} className="py-3"><div className="flex justify-between gap-3"><p className="font-semibold text-slate-700">{entry.type}</p><p className="font-bold text-[#172B4D]">{money(entry.amountPaise)}</p></div><p className="mt-1 text-xs text-slate-500">{entry.transactionDate?.slice(0, 10)} · {entry.reference}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No ledger activity yet.</p>}
            <button type="button" onClick={() => setToast(`Reminder prepared for ${profile.name}. Sending is not configured.`)} className="mt-5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700">Prepare payment reminder</button>
          </aside>
        </div>
      )}
      <Toast message={toast} />
    </AppLayout>
  )
}
