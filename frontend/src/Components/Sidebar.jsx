import { useEffect, useState } from 'react'
import {
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context.js'

const navigation = [
  {
    label: 'Overview',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Transactions',
    path: '/transactions',
    icon: WalletCards,
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Package,
  },
  {
    label: 'Billing',
    path: '/billing',
    icon: ReceiptText,
  },
  {
    label: 'Cashbook',
    path: '/cashbook',
    icon: CircleDollarSign,
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: Truck,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
  },
  {
    label: 'AI Assistant',
    path: '/assistant',
    icon: Bot,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]

export const SidebarContent = ({ collapsed = false, onNavigate, onCollapse, onLogout }) => {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-[72px] shrink-0 items-center border-b border-[#253956] ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#159A8A] text-sm font-black tracking-tight text-white">
          UK
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-bold text-white">Udhari Khata</p>
            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Shop management
            </p>
          </div>
        )}
        {!collapsed && onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white lg:flex"
          >
            <ChevronLeft size={17} />
          </button>
        )}
      </div>

      <nav aria-label="Main navigation" className={`flex-1 space-y-1 overflow-y-auto py-5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navigation.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.path

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center rounded-lg text-sm font-semibold transition ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                active
                  ? 'bg-[#159A8A] text-white'
                  : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className={`shrink-0 border-t border-[#253956] py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
          className={`flex w-full items-center rounded-lg py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-200 ${
            collapsed ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
        >
          <LogOut size={18} />
          {!collapsed && 'Log out'}
        </button>
      </div>
    </div>
  )
}

const Sidebar = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', closeOnDesktop)
    return () => window.removeEventListener('resize', closeOnDesktop)
  }, [])

  const navigateTo = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const logout = async () => {
    if (!window.confirm('Log out of Udhari Khata?')) return
    try {
      await signOut()
      navigateTo('/login')
    } catch {
      navigateTo('/login')
    }
  }

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 bg-[#172B4D] transition-[width] duration-200 lg:block ${
          collapsed ? 'w-[76px]' : 'w-[248px]'
        }`}
      >
        <SidebarContent
          collapsed={collapsed}
          onNavigate={navigateTo}
          onLogout={logout}
          onCollapse={() => setCollapsed(true)}
        />
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="absolute left-[64px] top-[25px] flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#172B4D] text-white shadow-lg lg:hidden"
      >
        <ShoppingBag size={20} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/45"
          />
          <aside className="relative h-full w-[280px] max-w-[85vw] bg-[#172B4D] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-3 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={navigateTo} onLogout={logout} />
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
