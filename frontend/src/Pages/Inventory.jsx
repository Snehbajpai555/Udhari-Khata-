import { useEffect, useMemo, useState } from 'react'
import { Package, Plus, Search, SlidersHorizontal } from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'
import MetricCard from '../Components/MetricCard'
import Toast from '../Components/Toast'
import { apiGet, apiPost } from '../api/client'

const money = (paise) => `₹ ${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const mapProduct = (product) => ({
  ...product,
  purchasePrice: product.purchasePricePaise,
  sellingPrice: product.sellingPricePaise,
  expiry: product.expiryDate?.slice(0, 10) || '—',
})

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [toast, setToast] = useState('')

  const loadProducts = async () => {
    setLoadError('')
    try {
      const result = await apiGet('/api/products?limit=100')
      setProducts(result.data.map(mapProduct))
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    apiGet('/api/products?limit=100')
      .then((result) => { if (active) setProducts(result.data.map(mapProduct)) })
      .catch((error) => { if (active) setLoadError(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  const filtered = useMemo(() => products.filter((product) =>
    (!lowOnly || product.stock <= product.minimumStock) &&
    `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(search.toLowerCase())
  ), [lowOnly, products, search])

  const openAdd = () => setDialog({ id: null, name: '', sku: '', category: '', purchasePrice: '', sellingPrice: '', stock: '', minimumStock: '', expiry: '' })

  const saveProduct = (event) => {
    event.preventDefault()
    if (!dialog.name.trim() || !dialog.sku.trim()) {
      setToast('Enter a product name and SKU.')
      return
    }
    const body = {
      name: dialog.name.trim(),
      sku: dialog.sku.trim().toUpperCase(),
      category: dialog.category.trim() || 'General',
      purchasePricePaise: Math.round(Number(dialog.purchasePrice || 0) * 100),
      sellingPricePaise: Math.round(Number(dialog.sellingPrice || 0) * 100),
      stock: Math.max(Number(dialog.stock || 0), 0),
      minimumStock: Math.max(Number(dialog.minimumStock || 0), 0),
      expiryDate: dialog.expiry ? new Date(`${dialog.expiry}T00:00:00.000Z`).toISOString() : null,
    }
    void apiPost('/api/products', body)
      .then(async () => {
        setDialog(null)
        setToast('Product added.')
        await loadProducts()
      })
      .catch((error) => setToast(error.message))
  }

  return (
    <AppLayout title="Inventory" subtitle="Products, stock levels and valuations">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Stock management"
          title="Inventory"
          description="Monitor products and restocking requirements."
          actions={
            <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-[#172B4D] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#243D66]">
              <Plus size={16} /> Add product
            </button>
          }
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Products" value={String(products.length)} caption="Across all categories" icon={Package} />
          <MetricCard label="Low stock" value={String(products.filter((item) => item.stock <= item.minimumStock).length)} caption="Needs attention" />
          <MetricCard label="Inventory value" value={money(products.reduce((sum, item) => sum + item.purchasePrice * item.stock, 0))} caption="At purchase cost" />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:max-w-sm">
              <Search size={16} className="text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or SKU" className="w-full text-sm outline-none" />
            </label>
            <button type="button" onClick={() => setLowOnly((value) => !value)} aria-pressed={lowOnly} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${lowOnly ? 'border-[#159A8A] bg-[#E9F5F3] text-[#159A8A]' : 'border-slate-200 text-slate-600'}`}>
              <SlidersHorizontal size={15} /> Low stock
            </button>
          </div>

          {loading ? <div className="px-6 py-16 text-center text-sm text-slate-500">Loading inventory…</div> : loadError ? (
            <div role="alert" className="px-6 py-12 text-center"><p className="font-semibold text-red-600">{loadError}</p><button type="button" onClick={loadProducts} className="mt-3 text-sm font-bold text-[#159A8A]">Try again</button></div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Purchase</th><th className="px-4 py-3">Selling</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Expiry</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4"><p className="font-bold text-[#172B4D]">{product.name}</p><p className="mt-0.5 text-xs text-slate-400">{product.sku}</p></td>
                      <td className="px-4 py-4 text-slate-600">{product.category}</td>
                      <td className="px-4 py-4">{money(product.purchasePrice)}</td>
                      <td className="px-4 py-4">{money(product.sellingPrice)}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.stock <= product.minimumStock ? 'bg-red-50 text-red-600' : 'bg-[#E9F5F3] text-[#159A8A]'}`}>{product.stock} units</span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{product.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center"><p className="font-bold text-[#172B4D]">No products found</p><button type="button" onClick={() => { setSearch(''); setLowOnly(false) }} className="mt-2 text-sm font-bold text-[#159A8A]">Clear filters</button></div>
          )}
        </section>

        {dialog && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
            <form onSubmit={saveProduct} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-bold text-[#172B4D]">Add product</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Product name<input required value={dialog.name} onChange={(event) => setDialog({ ...dialog, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-700">SKU<input required value={dialog.sku} onChange={(event) => setDialog({ ...dialog, sku: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-700">Category<input value={dialog.category} onChange={(event) => setDialog({ ...dialog, category: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-700">Expiry<input type="date" value={dialog.expiry} onChange={(event) => setDialog({ ...dialog, expiry: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-700">Purchase price<input type="number" min="0" step="0.01" value={dialog.purchasePrice} onChange={(event) => setDialog({ ...dialog, purchasePrice: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-700">Selling price<input type="number" min="0" step="0.01" value={dialog.sellingPrice} onChange={(event) => setDialog({ ...dialog, sellingPrice: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-700">Opening stock<input type="number" min="0" value={dialog.stock} onChange={(event) => setDialog({ ...dialog, stock: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-700">Minimum stock<input type="number" min="0" value={dialog.minimumStock} onChange={(event) => setDialog({ ...dialog, minimumStock: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#172B4D] px-4 py-2 text-sm font-bold text-white">Add product</button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Toast message={toast} />
    </AppLayout>
  )
}
