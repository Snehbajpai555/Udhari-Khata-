import { useState } from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'

const SidebarItem = ({ label, icon, path, badge, active, collapsed, isDark, navigate }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.97 }}
    onClick={() => navigate(path)}
    title={collapsed ? label : undefined}
    aria-current={active ? 'page' : undefined}
    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base font-semibold transition-colors ${
      active
        ? isDark
          ? 'bg-[#c9ff63] text-[#19172b] shadow-md shadow-black/15'
          : 'bg-[#201d3b] text-white shadow-md shadow-[#201d3b]/15'
        : isDark
          ? 'text-[#c8c5d4] hover:bg-white/[0.06] hover:text-[#c9ff63]'
          : 'text-slate-600 hover:bg-[#f7f6fc] hover:text-[#7257ff]'
    } ${collapsed ? 'justify-center px-2' : ''}`}
  >
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition-colors ${
      active
        ? isDark
          ? 'bg-black/10'
          : 'bg-white/10'
        : isDark
          ? 'bg-[#24213e] group-hover:bg-[#302b50]'
          : 'bg-slate-100 group-hover:bg-white'
    }`}>
      {icon}
    </span>
    {!collapsed && <span className="flex-1">{label}</span>}
    {!collapsed && badge && (
      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
        active
          ? isDark
            ? 'bg-black/10 text-[#19172b]'
            : 'bg-white/15 text-white'
          : isDark
            ? 'bg-white/10 text-[#c9ff63]'
            : 'bg-[#f2efff] text-[#7257ff]'
      }`}>{badge}</span>
    )}
  </motion.button>
)

const Sidebar = ({ theme = 'light' }) => {
  const isDark = theme === 'dark'
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
    <aside className={`sticky top-0 flex h-screen shrink-0 flex-col border-r transition-[width] duration-300 ${
      collapsed ? 'w-[76px]' : 'w-[260px]'
    } ${isDark ? 'border-[#2b2940] bg-[#111023]' : 'border-slate-200/80 bg-white'}`}>
      <div className={`flex h-[76px] shrink-0 items-center border-b ${
        collapsed ? 'justify-center px-2' : 'gap-3 px-5'
      } ${isDark ? 'border-[#2b2940]' : 'border-slate-100'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c9ff63] text-sm font-black tracking-tight text-[#19172b] shadow-[0_6px_20px_rgba(201,255,99,0.2)]">
          UK
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className={`truncate text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#19172b]'}`}>Udhari Khata</p>
            <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-[#a9a6bb]' : 'text-slate-600'}`}>Business manager</p>
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              isDark
                ? 'text-[#a9a6bb] hover:bg-white/10 hover:text-white'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            ‹
          </button>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className={`absolute right-[-12px] top-[25px] flex h-6 w-6 items-center justify-center rounded-full border text-xs shadow-sm transition ${
              isDark
                ? 'border-[#3a3652] bg-[#201d3b] text-[#c8c5d4] hover:text-[#c9ff63]'
                : 'border-slate-200 bg-white text-slate-500 hover:text-[#7257ff]'
            }`}
          >
            ›
          </button>
        )}
      </div>

      <nav aria-label="Main navigation" className={`flex-1 space-y-1 overflow-y-auto py-5 ${
        collapsed ? 'px-2' : 'px-3'
      }`}>
        {!collapsed && <p className={`mb-2 px-3 text-xs font-bold uppercase tracking-[0.16em] ${isDark ? 'text-[#9692aa]' : 'text-slate-600'}`}>Workspace</p>}
        <SidebarItem {...itemProps('/dashboard')} label="Dashboard" icon="⌂" isDark={isDark} />
        <SidebarItem {...itemProps('/customers')} label="Customers & Khata" icon="♧" badge="2" isDark={isDark} />
        <SidebarItem {...itemProps('/statement')} label="Party statements" icon="▤" isDark={isDark} />
        <SidebarItem {...itemProps('/cashbook')} label="Cashbook" icon="₹" isDark={isDark} />
        <SidebarItem {...itemProps('/transactions')} label="Transactions" icon="↕" isDark={isDark} />

        {!collapsed && <p className={`mb-2 mt-7 px-3 text-xs font-bold uppercase tracking-[0.16em] ${isDark ? 'text-[#9692aa]' : 'text-slate-600'}`}>Manage business</p>}
        {collapsed && <div className={`my-4 border-t ${isDark ? 'border-[#2b2940]' : 'border-slate-100'}`} />}
        <SidebarItem {...itemProps('/items')} label="Items & stock" icon="▦" isDark={isDark} />
        <SidebarItem {...itemProps('/stock-alerts')} label="Stock alerts" icon="△" badge="!" isDark={isDark} />
        <SidebarItem {...itemProps('/expenses')} label="Expenses" icon="↗" isDark={isDark} />
        <SidebarItem {...itemProps('/reports')} label="Reports" icon="▥" isDark={isDark} />
        <SidebarItem {...itemProps('/gst')} label="GST returns" icon="▧" isDark={isDark} />
        <SidebarItem {...itemProps('/settings')} label="Settings" icon="⚙" isDark={isDark} />
      </nav>

      <div className={`shrink-0 border-t py-4 ${collapsed ? 'px-2' : 'px-3'} ${isDark ? 'border-[#2b2940]' : 'border-slate-100'}`}>
        {!collapsed && (
          <div className={`mb-3 rounded-xl p-3 ${isDark ? 'bg-[#201d3b]' : 'bg-[#f7f6fc]'}`}>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#19172b]'}`}>Need a hand?</p>
            <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-[#b3b0c1]' : 'text-slate-600'}`}>Your business records, all in one place.</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate('/login')}
          title={collapsed ? 'Log out' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base font-semibold transition ${
            isDark
              ? 'text-[#c8c5d4] hover:bg-red-500/10 hover:text-[#ff9da8]'
              : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
          } ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${
            isDark ? 'bg-[#24213e]' : 'bg-slate-100'
          }`}>↪</span>
          {!collapsed && 'Log out'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
