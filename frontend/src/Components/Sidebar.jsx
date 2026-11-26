import { useState } from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'

const SidebarItem = ({ label, icon, path, badge, active, collapsed, navigate }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.97 }}
    onClick={() => navigate(path)}
    title={collapsed ? label : undefined}
    aria-current={active ? 'page' : undefined}
    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${
      active
        ? 'bg-[#201d3b] text-white shadow-md shadow-[#201d3b]/15'
        : 'text-slate-600 hover:bg-[#f7f6fc] hover:text-[#7257ff]'
    } ${collapsed ? 'justify-center px-2' : ''}`}
  >
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition-colors ${
      active ? 'bg-white/10' : 'bg-slate-100 group-hover:bg-white'
    }`}>
      {icon}
    </span>
    {!collapsed && <span className="flex-1">{label}</span>}
    {!collapsed && badge && (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
        active ? 'bg-white/15 text-white' : 'bg-[#f2efff] text-[#7257ff]'
      }`}>{badge}</span>
    )}
  </motion.button>
)

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const itemProps = (path) => ({
    path,
    active: location.pathname === path,
    collapsed,
    navigate,
  })

  return (
    <aside className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white transition-[width] duration-300 ${
      collapsed ? 'w-[76px]' : 'w-[260px]'
    }`}>
      <div className={`flex h-[76px] shrink-0 items-center border-b border-slate-100 ${
        collapsed ? 'justify-center px-2' : 'gap-3 px-5'
      }`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c9ff63] text-sm font-black tracking-tight text-[#19172b] shadow-[0_6px_20px_rgba(201,255,99,0.2)]">
          UK
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-extrabold tracking-tight text-[#19172b]">Udhari Khata</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Business manager</p>
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ‹
          </button>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="absolute right-[-12px] top-[25px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-500 shadow-sm transition hover:text-[#7257ff]"
          >
            ›
          </button>
        )}
      </div>

      <nav aria-label="Main navigation" className={`flex-1 space-y-1 overflow-y-auto py-5 ${
        collapsed ? 'px-2' : 'px-3'
      }`}>
        {!collapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>}
        <SidebarItem {...itemProps('/dashboard')} label="Dashboard" icon="⌂" />
        <SidebarItem {...itemProps('/customers')} label="Customers & Khata" icon="♧" badge="2" />
        <SidebarItem {...itemProps('/statement')} label="Party statements" icon="▤" />
        <SidebarItem {...itemProps('/cashbook')} label="Cashbook" icon="₹" />
        <SidebarItem {...itemProps('/transactions')} label="Transactions" icon="↕" />

        {!collapsed && <p className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Manage business</p>}
        {collapsed && <div className="my-4 border-t border-slate-100" />}
        <SidebarItem {...itemProps('/items')} label="Items & stock" icon="▦" />
        <SidebarItem {...itemProps('/stock-alerts')} label="Stock alerts" icon="△" badge="!" />
        <SidebarItem {...itemProps('/expenses')} label="Expenses" icon="↗" />
        <SidebarItem {...itemProps('/reports')} label="Reports" icon="▥" />
        <SidebarItem {...itemProps('/gst')} label="GST returns" icon="▧" />
        <SidebarItem {...itemProps('/settings')} label="Settings" icon="⚙" />
      </nav>

      <div className={`shrink-0 border-t border-slate-100 py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-[#f7f6fc] p-3">
            <p className="text-xs font-bold text-[#19172b]">Need a hand?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Your business records, all in one place.</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate('/login')}
          title={collapsed ? 'Log out' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">↪</span>
          {!collapsed && 'Log out'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
