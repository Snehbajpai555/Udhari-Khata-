import { useEffect, useMemo, useState } from 'react'
import { Plus, Printer, Search } from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'
import MetricCard from '../Components/MetricCard'
import Toast from '../Components/Toast'
import { apiGet, apiPost } from '../api/client'

const money = (paise) => `₹ ${(paise / 100).toLocaleString('en-IN')}`

export default function Billing() {
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [draftOpen, setDraftOpen] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [payment, setPayment] = useState('UPI')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const loadData = async () => {
    setLoadError('')
    try {
      const [invoiceResult, customerResult, productResult] = await Promise.all([
        apiGet('/api/invoices?limit=100'),
        apiGet('/api/customers?limit=100'),
        apiGet('/api/products?limit=100'),
      ])
      setInvoices(invoiceResult.data)
      setCustomers(customerResult.data)
      setProducts(productResult.data)
      setProductId((current) => current || productResult.data[0]?._id || '')
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([
      apiGet('/api/invoices?limit=100'),
      apiGet('/api/customers?limit=100'),
      apiGet('/api/products?limit=100'),
    ])
      .then(([invoiceResult, customerResult, productResult]) => {
        if (!active) return
        setInvoices(invoiceResult.data)
        setCustomers(customerResult.data)
        setProducts(productResult.data)
        setProductId(productResult.data[0]?._id || '')
      })
      .catch((error) => { if (active) setLoadError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = useMemo(
    () => invoices.filter((invoice) =>
      `${invoice.reference} ${invoice.customer?.name || 'Walk-in'}`.toLowerCase().includes(search.toLowerCase())
    ),
    [invoices, search],
  )

  const total = useMemo(() => {
    const product = products.find((item) => item._id === productId)
    return (product?.sellingPricePaise || 0) * Math.max(Number(quantity) || 1, 1)
  }, [productId, products, quantity])

  const createInvoice = async (event) => {
    event.preventDefault()
    if (!productId) {
      setToast('Add a product to inventory before creating an invoice.')
      return
    }
    if (payment === 'Credit' && !customerId) {
      setToast('Choose a customer for a credit invoice.')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/transactions/sale', {
        customerId: customerId || undefined,
        amountPaidPaise: payment === 'Credit' ? 0 : total,
        paymentMethod: payment,
        items: [{ productId, quantity: Math.max(Number(quantity), 1) }],
      }, { headers: { 'Idempotency-Key': crypto.randomUUID() } })
      setDraftOpen(false)
      setCustomerId('')
      setQuantity('1')
      setToast('Invoice created and inventory updated.')
      await loadData()
    } catch (error) {
      setToast(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="Billing" subtitle="Invoices, payments and printable receipts">
      <div className="space-y-6">
        <PageHeader eyebrow="Sales" title="Billing" description="Create invoices from shop products and update stock automatically." actions={<button type="button" onClick={() => setDraftOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#172B4D] px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Create invoice</button>} />
        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Invoice value" value={money(invoices.reduce((sum, item) => sum + item.totalPaise, 0))} caption="Recorded invoices" />
          <MetricCard label="Collected" value={money(invoices.reduce((sum, item) => sum + item.amountPaidPaise, 0))} caption="Received" />
          <MetricCard label="Outstanding" value={money(invoices.reduce((sum, item) => sum + item.totalPaise - item.amountPaidPaise, 0))} caption="Awaiting payment" />
        </section>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4"><label className="flex max-w-sm items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"><Search size={16} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoices" className="w-full text-sm outline-none" /></label></div>
          {loading ? <p className="px-6 py-16 text-center text-sm text-slate-500">Loading invoices…</p> : loadError ? <div role="alert" className="px-6 py-12 text-center"><p className="font-semibold text-red-600">{loadError}</p><button type="button" onClick={loadData} className="mt-3 text-sm font-bold text-[#159A8A]">Try again</button></div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Invoice</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((invoice) => <tr key={invoice._id} className="hover:bg-slate-50"><td className="px-5 py-4 font-bold text-[#172B4D]">{invoice.reference}</td><td className="px-4 py-4">{invoice.customer?.name || 'Walk-in customer'}</td><td className="px-4 py-4 text-slate-600">{invoice.createdAt?.slice(0, 10)}</td><td className="px-4 py-4 font-semibold">{money(invoice.totalPaise)}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${invoice.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{invoice.status}</span></td><td className="px-4 py-4"><button type="button" onClick={() => window.print()} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Print ${invoice.reference}`}><Printer size={16} /></button></td></tr>)}</tbody></table></div> : <p className="px-6 py-16 text-center text-sm text-slate-500">No invoices yet. Create an invoice to get started.</p>}
        </section>

        {draftOpen && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={createInvoice} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-bold text-[#172B4D]">Create invoice</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-semibold text-slate-700">Customer<select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option value="">Walk-in customer</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name} · {customer.phone}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Product<select required value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option value="">Select product</option>{products.map((item) => <option key={item._id} value={item._id} disabled={item.stock < 1}>{item.name} · {money(item.sellingPricePaise)} · stock {item.stock}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Quantity<input type="number" min="1" max={products.find((item) => item._id === productId)?.stock || undefined} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="sm:col-span-2 text-sm font-semibold text-slate-700">Payment method<select value={payment} onChange={(event) => setPayment(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option>Cash</option><option>UPI</option><option>Bank</option><option>Credit</option></select></label><p className="sm:col-span-2 rounded-lg bg-slate-50 p-3 text-sm font-bold text-[#172B4D]">Invoice total: {money(total)}</p></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setDraftOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button><button type="submit" disabled={saving || !products.length} className="rounded-lg bg-[#172B4D] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Creating…' : 'Create invoice'}</button></div></form></div>}
      </div>
      <Toast message={toast} />
    </AppLayout>
  )
}
