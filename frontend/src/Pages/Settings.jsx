import { useState } from 'react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'
import Toast from '../Components/Toast'

export default function Settings() {
  const [shopName, setShopName] = useState('My Business')
  const [language, setLanguage] = useState('English')
  const [notifications, setNotifications] = useState(true)
  const [toast, setToast] = useState('')

  const save = (event) => {
    event.preventDefault()
    setToast('Settings saved locally.')
  }

  return (
    <AppLayout title="Settings" subtitle="Shop information and account preferences" shopName={shopName}>
      <div className="space-y-6">
        <PageHeader eyebrow="Administration" title="Settings" description="Manage shop preferences and account controls." />
        <form onSubmit={save} className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-xl border border-slate-200 bg-white p-3">
            {['Shop information', 'Business preferences', 'Staff', 'Notifications', 'Security', 'Backup'].map((item, index) => <button key={item} type="button" className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${index === 0 ? 'bg-[#E9F5F3] text-[#159A8A]' : 'text-slate-600 hover:bg-slate-50'}`}>{item}</button>)}
          </aside>
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-[#172B4D]">Shop information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Shop name<input required value={shopName} onChange={(event) => setShopName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Owner phone<input type="tel" defaultValue="+91 98765 43210" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="sm:col-span-2 text-sm font-semibold text-slate-700">Shop address<textarea rows="3" defaultValue="" placeholder="Add the business address" className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label></div></section>
            <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-[#172B4D]">Preferences</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Language<select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"><option>English</option><option>Hindi</option></select></label><label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">Payment reminders<input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} className="h-4 w-4 accent-[#159A8A]" /></label></div></section>
            <div className="flex justify-end"><button type="submit" className="rounded-lg bg-[#172B4D] px-5 py-2.5 text-sm font-bold text-white">Save settings</button></div>
          </div>
        </form>
      </div>
      <Toast message={toast} />
    </AppLayout>
  )
}
