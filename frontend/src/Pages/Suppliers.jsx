import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Truck } from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'
import MetricCard from '../Components/MetricCard'
import { apiGet, apiPost } from '../api/client'

const money = (paise) => `₹ ${(paise / 100).toLocaleString('en-IN')}`

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const loadSuppliers = async () => {
    setLoadError('')
    try {
      const result = await apiGet('/api/suppliers?limit=100')
      setSuppliers(result.data)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    apiGet('/api/suppliers?limit=100')
      .then((result) => { if (active) setSuppliers(result.data) })
      .catch((error) => { if (active) setLoadError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const filtered = useMemo(
    () => suppliers.filter((supplier) =>
      `${supplier.name} ${supplier.contact} ${supplier.phone}`.toLowerCase().includes(search.toLowerCase())
    ),
    [search, suppliers],
  )

  const addSupplier = (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    void apiPost('/api/suppliers', { name: name.trim(), phone: phone.trim() })
      .then(async () => {
        setName('')
        setPhone('')
        setOpen(false)
        await loadSuppliers()
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setSaving(false))
  }

  return (
    <AppLayout title="Suppliers" subtitle="Purchases, supplier payments and outstanding dues">
      <div className="space-y-6">
        <PageHeader eyebrow="Purchasing" title="Suppliers" description="Manage supplier accounts and payments." actions={<button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#172B4D] px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Add supplier</button>} />
        <section className="grid gap-4 sm:grid-cols-3"><MetricCard label="Suppliers" value={String(suppliers.length)} caption="Active accounts" icon={Truck} /><MetricCard label="Total purchases" value={money(suppliers.reduce((sum, item) => sum + item.purchases, 0))} caption="Recorded" /><MetricCard label="Outstanding" value={money(suppliers.reduce((sum, item) => sum + item.balance, 0))} caption="Amount payable" /></section>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-200 p-4"><label className="flex max-w-sm items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search suppliers" className="w-full text-sm outline-none" /></label></div>{loading ? <p className="px-6 py-16 text-center text-sm text-slate-500">Loading suppliers…</p> : loadError ? <div role="alert" className="px-6 py-12 text-center"><p className="font-semibold text-red-600">{loadError}</p><button type="button" onClick={loadSuppliers} className="mt-3 text-sm font-bold text-[#159A8A]">Try again</button></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Supplier</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Purchases</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Outstanding</th><th className="px-4 py-3">Last purchase</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((supplier) => <tr key={supplier._id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-bold text-[#172B4D]">{supplier.name}</p><p className="mt-0.5 text-xs text-slate-400">{supplier.email || '—'}</p></td><td className="px-4 py-4 text-slate-600">{supplier.phone || '—'}</td><td className="px-4 py-4">—</td><td className="px-4 py-4">—</td><td className={`px-4 py-4 font-bold ${supplier.outstandingPaise ? 'text-red-600' : 'text-green-700'}`}>{money(supplier.outstandingPaise)}</td><td className="px-4 py-4 text-slate-600">—</td></tr>)}</tbody></table></div>}</section>
        {open && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={addSupplier} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-bold text-[#172B4D]">Add supplier</h2><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Supplier name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="block text-sm font-semibold">Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-[#172B4D] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Add supplier'}</button></div></form></div>}
      </div>
    </AppLayout>
  )
}
