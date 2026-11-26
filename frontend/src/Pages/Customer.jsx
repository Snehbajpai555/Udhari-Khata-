import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Header from '../Components/Header.jsx'
import Sidebar from '../Components/Sidebar.jsx'

const initialParties = [
  { id: 1, name: 'Aman Verma (Customer)', type: 'CUSTOMER', phone: '9876543210', gstin: '-', balance: 0 },
  { id: 2, name: 'bigkgg', type: 'CUSTOMER', phone: '-', gstin: '-', balance: -53.5 },
  { id: 3, name: 'HDFC Bank Media (Brand/Advertiser)', type: 'ADVERTISER', phone: '9123456789', gstin: '-', balance: 0 },
  { id: 4, name: 'sdasd', type: 'CUSTOMER', phone: '-', gstin: '-', balance: 53.5 },
  { id: 5, name: 'Vipin Publisher (Affiliate Vendor)', type: 'PUBLISHER', phone: '9988776655', gstin: '-', balance: 0 },
  { id: 6, name: 'Sharma Traders', type: 'SUPPLIER', phone: '9812345670', gstin: '09ABCDE1234F1Z5', balance: -1200 },
]

const partyTypes = [
  { key: 'ALL', label: 'All parties' },
  { key: 'CUSTOMER', label: 'Customers' },
  { key: 'SUPPLIER', label: 'Suppliers' },
  { key: 'ADVERTISER', label: 'Advertisers' },
  { key: 'PUBLISHER', label: 'Publishers' },
]

const typeStyles = {
  CUSTOMER: 'bg-[#302b50] text-[#c9bdff]',
  SUPPLIER: 'bg-[#3b2d1d] text-[#ffd49b]',
  ADVERTISER: 'bg-[#302b50] text-[#d0c7ff]',
  PUBLISHER: 'bg-[#1d3b32] text-[#a8efd3]',
}

const emptyForm = {
  name: '',
  type: 'CUSTOMER',
  phone: '',
  gstin: '',
  balance: 0,
}

const formatCurrency = (amount) =>
  `₹${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

const Customers = () => {
  const [parties, setParties] = useState(initialParties)
  const [tab, setTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!toast) return undefined

    const timeoutId = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const stats = useMemo(
    () => ({
      total: parties.length,
      receivable: parties
        .filter((party) => party.balance > 0)
        .reduce((sum, party) => sum + party.balance, 0),
      payable: Math.abs(
        parties
          .filter((party) => party.balance < 0)
          .reduce((sum, party) => sum + party.balance, 0),
      ),
    }),
    [parties],
  )

  const filteredParties = useMemo(() => {
    const query = search.trim().toLowerCase()

    return parties.filter((party) => {
      const matchesType = tab === 'ALL' || party.type === tab
      const matchesSearch =
        !query ||
        [party.name, party.phone, party.gstin].some((value) =>
          value.toLowerCase().includes(query),
        )

      return matchesType && matchesSearch
    })
  }, [parties, search, tab])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, type: tab === 'ALL' ? 'CUSTOMER' : tab })
    setShowModal(true)
  }

  const openEdit = (party) => {
    setEditing(party)
    setForm({ ...party })
    setShowModal(true)
  }

  const saveParty = (event) => {
    event.preventDefault()
    const party = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim() || '-',
      gstin: form.gstin.trim() || '-',
      balance: Number(form.balance) || 0,
    }

    if (editing) {
      setParties((current) =>
        current.map((item) =>
          item.id === editing.id ? { ...party, id: editing.id } : item,
        ),
      )
      setToast('Party details updated.')
    } else {
      setParties((current) => [{ ...party, id: Date.now() }, ...current])
      setToast('Party added to your directory.')
    }

    setShowModal(false)
  }

  const deleteParty = (party) => {
    if (!window.confirm(`Remove ${party.name} from your parties?`)) return

    setParties((current) => current.filter((item) => item.id !== party.id))
    setToast('Party removed from your directory.')
  }

  const clearFilters = () => {
    setSearch('')
    setTab('ALL')
  }

  const renderBalance = (party) => {
    const isReceivable = party.balance > 0
    const isPayable = party.balance < 0

    return (
      <div>
        <p
          className={`text-lg font-semibold ${
            isReceivable
              ? 'text-[#ffd49b]'
              : isPayable
                ? 'text-[#a8efd3]'
                : 'text-white'
          }`}
        >
          {isReceivable ? '+' : isPayable ? '−' : ''}
          {formatCurrency(party.balance)}
        </p>
        <p className="mt-0.5 text-base text-[#c2bfd0]">
          {isReceivable ? 'Owed to you' : isPayable ? 'You owe' : 'Settled'}
        </p>
      </div>
    )
  }

  const renderActions = (party) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setToast(`Statement for ${party.name} is coming soon.`)}
        aria-label={`View statement for ${party.name}`}
        title="View statement"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-[#c9bdff] transition hover:bg-white/10"
      >
        ↗
      </button>
      <button
        type="button"
        onClick={() => openEdit(party)}
        aria-label={`Edit ${party.name}`}
        title="Edit party"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-[#c2bfd0] transition hover:bg-white/10 hover:text-white"
      >
        ✎
      </button>
      <button
        type="button"
        onClick={() => deleteParty(party)}
        aria-label={`Delete ${party.name}`}
        title="Delete party"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-[#a9a6bb] transition hover:bg-red-500/10 hover:text-[#ff9da8]"
      >
        ×
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0c0b18] text-[#f5f4fb]">
      <Sidebar theme="dark" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          theme="dark"
          title="Party directory"
          subtitle="Keep your customer and supplier records organized."
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 p-5 sm:p-8">
          <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151329] px-6 py-7 text-white shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:px-8 sm:py-9">
            <div aria-hidden="true" className="hero-grid absolute inset-0 opacity-25" />
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-32 h-72 w-72 rounded-full bg-[#7257ff]/30 blur-[90px]"
            />
            <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c9ff63]" />
                  Your business, in good company
                </p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                  Every relationship,
                  <span className="text-[#c9ff63]"> one clear view.</span>
                </h1>
                <p className="mt-3 max-w-xl text-lg leading-7 text-white/80 sm:text-xl">
                  Keep customers, suppliers and business partners together with
                  the balances and contact details you need.
                </p>
              </div>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c9ff63] px-5 py-3 text-lg font-bold text-[#19172b] shadow-[0_8px_24px_rgba(201,255,99,0.16)] transition hover:-translate-y-0.5 hover:bg-[#d8ff8e]"
              >
                <span aria-hidden="true" className="text-lg leading-none">＋</span>
                Add a party
              </button>
            </div>
          </section>

          <section aria-label="Party balance summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-2xl border border-[#302d46] bg-[#17162a] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[#c2bfd0]">Total parties</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{stats.total}</p>
                  <p className="mt-1 text-base text-[#a9a6bb]">Across your directory</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#302b50] text-lg font-semibold text-[#c9bdff]">
                  ♧
                </span>
              </div>
            </article>

            <article className="rounded-2xl border border-[#302d46] bg-[#17162a] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[#c2bfd0]">Total receivable</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{formatCurrency(stats.receivable)}</p>
                  <p className="mt-1 text-base text-[#a9a6bb]">Balances owed to you</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3b2d1d] text-lg font-semibold text-[#ffd49b]">
                  ↗
                </span>
              </div>
            </article>

            <article className="rounded-2xl border border-[#302d46] bg-[#17162a] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[#c2bfd0]">Total payable</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{formatCurrency(stats.payable)}</p>
                  <p className="mt-1 text-base text-[#a9a6bb]">Balances you owe</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d3b32] text-lg font-semibold text-[#a8efd3]">
                  ↙
                </span>
              </div>
            </article>
          </section>

          <section className="overflow-hidden rounded-[1.6rem] border border-[#302d46] bg-[#17162a] shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
            <div className="border-b border-[#302d46] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Your parties</h2>
                  <p className="mt-1 text-lg text-[#a9a6bb]">
                    {filteredParties.length} {filteredParties.length === 1 ? 'record' : 'records'}
                    {search ? ` matching “${search}”` : ''}
                  </p>
                </div>

                <label className="flex w-full items-center gap-2.5 rounded-xl border border-[#3b3752] bg-[#201e36] px-3.5 py-3 text-lg text-[#c2bfd0] transition focus-within:border-[#9c85ff] focus-within:bg-[#24213e] focus-within:ring-4 focus-within:ring-[#7257ff]/20 lg:max-w-[360px]">
                  <span aria-hidden="true" className="text-lg">⌕</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, phone or GSTIN"
                    aria-label="Search parties"
                    className="min-w-0 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-[#aaa6bb]"
                  />
                </label>
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {partyTypes.map((type) => {
                  const count =
                    type.key === 'ALL'
                      ? parties.length
                      : parties.filter((party) => party.type === type.key).length

                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setTab(type.key)}
                      aria-pressed={tab === type.key}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition ${
                        tab === type.key
                          ? 'bg-[#7257ff] text-white shadow-[0_6px_18px_rgba(114,87,255,0.2)]'
                          : 'bg-[#24213e] text-[#c2bfd0] hover:bg-[#302b50] hover:text-[#d0c7ff]'
                      }`}
                    >
                      {type.label}
                      <span className={tab === type.key ? 'text-white/80' : 'text-[#a9a6bb]'}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {filteredParties.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[780px] text-left">
                    <thead>
                      <tr className="bg-[#201e36] text-sm font-bold uppercase tracking-[0.12em] text-[#c2bfd0]">
                        <th className="px-6 py-3.5">Party</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5">Contact</th>
                        <th className="px-4 py-3.5">Balance</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302d46]">
                      {filteredParties.map((party) => (
                        <tr key={party.id} className="transition hover:bg-white/[0.03]">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#302b50] text-base font-bold text-[#c9bdff]">
                                {getInitials(party.name)}
                              </span>
                              <div className="min-w-0">
                                <p className="max-w-[260px] truncate text-lg font-semibold text-white">
                                  {party.name}
                                </p>
                                <p className="mt-0.5 text-base text-[#a9a6bb]">
                                  GSTIN {party.gstin}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${typeStyles[party.type]}`}>
                              {party.type.charAt(0) + party.type.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-lg text-[#c2bfd0]">{party.phone}</td>
                          <td className="px-4 py-4">{renderBalance(party)}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end">{renderActions(party)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {filteredParties.map((party) => (
                    <article key={party.id} className="rounded-2xl border border-[#302d46] bg-[#1b1930] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#302b50] text-base font-bold text-[#c9bdff]">
                            {getInitials(party.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-white">{party.name}</p>
                            <p className="mt-1 text-base text-[#c2bfd0]">{party.phone}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${typeStyles[party.type]}`}>
                          {party.type.charAt(0) + party.type.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="mt-4 flex items-end justify-between border-t border-[#302d46] pt-3">
                        {renderBalance(party)}
                        {renderActions(party)}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="px-6 py-16 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#302b50] text-xl text-[#c9bdff]">
                  ⌕
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">No parties found</h3>
                <p className="mx-auto mt-1 max-w-sm text-lg leading-7 text-[#c2bfd0]">
                  Try a different search or clear the filters to see all your parties.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg px-3 py-2 text-base font-semibold text-[#c9bdff] transition hover:bg-white/10"
                >
                  Clear filters
                </button>
              </div>
            )}

            {filteredParties.length > 0 && (
              <div className="border-t border-[#302d46] px-5 py-3.5 text-base text-[#c2bfd0] sm:px-6">
                Showing {filteredParties.length} of {parties.length} parties
              </div>
            )}
          </section>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-xl border border-white/10 bg-[#201d3b] px-4 py-3 text-base font-medium text-white shadow-[0_16px_40px_rgba(25,23,43,0.24)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowModal(false)
            }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="party-form-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="my-auto w-full max-w-lg overflow-hidden rounded-[1.6rem] border border-[#39354f] bg-[#17162a] shadow-[0_28px_90px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-start justify-between border-b border-[#302d46] px-6 py-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7257ff]">
                    Party details
                  </p>
                  <h2 id="party-form-title" className="mt-1 text-2xl font-semibold tracking-tight text-white">
                    {editing ? 'Edit party' : 'Add a party'}
                  </h2>
                  <p className="mt-1 text-lg text-[#c2bfd0]">
                    Keep the important account details in one place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label="Close form"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-[#c2bfd0] transition hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form onSubmit={saveParty} className="space-y-4 p-6">
                <label className="block">
                  <span className="mb-1.5 block text-base font-semibold text-[#e2dfeb]">
                    Party name <span className="text-[#c44761]">*</span>
                  </span>
                  <input
                    autoFocus
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="e.g. Mohan Stores"
                    className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-3.5 py-3 text-lg text-white outline-none transition placeholder:text-[#a9a6bb] focus:border-[#9c85ff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-base font-semibold text-[#e2dfeb]">Category</span>
                    <select
                      value={form.type}
                      onChange={(event) => setForm({ ...form, type: event.target.value })}
                      className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-3.5 py-3 text-lg text-white outline-none transition focus:border-[#9c85ff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
                    >
                      {partyTypes.slice(1).map((type) => (
                        <option key={type.key} value={type.key}>{type.label.slice(0, -1)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-base font-semibold text-[#e2dfeb]">Phone number</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      placeholder="Optional"
                      className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-3.5 py-3 text-lg text-white outline-none transition placeholder:text-[#a9a6bb] focus:border-[#9c85ff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-base font-semibold text-[#e2dfeb]">GSTIN / UPI reference</span>
                  <input
                    value={form.gstin === '-' ? '' : form.gstin}
                    onChange={(event) => setForm({ ...form, gstin: event.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-3.5 py-3 text-lg text-white outline-none transition placeholder:text-[#a9a6bb] focus:border-[#9c85ff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-base font-semibold text-[#e2dfeb]">Opening balance</span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-lg text-[#c2bfd0]">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.balance}
                      onChange={(event) => setForm({ ...form, balance: event.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] py-3 pl-8 pr-3.5 text-lg text-white outline-none transition placeholder:text-[#a9a6bb] focus:border-[#9c85ff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
                    />
                  </div>
                  <span className="mt-1.5 block text-base text-[#c2bfd0]">
                    Positive means owed to you; negative means you owe them.
                  </span>
                </label>

                <div className="flex flex-col-reverse gap-2 border-t border-[#302d46] pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-[#3b3752] px-4 py-2.5 text-lg font-semibold text-[#c2bfd0] transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#7257ff] px-5 py-2.5 text-lg font-bold text-white shadow-[0_8px_20px_rgba(114,87,255,0.2)] transition hover:-translate-y-0.5 hover:bg-[#5f43ec]"
                  >
                    {editing ? 'Save changes' : 'Add party'}
                  </button>
                </div>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Customers
