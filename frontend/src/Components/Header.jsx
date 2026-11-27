import { Bell, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Header = ({ title, subtitle, shopName = 'My Business' }) => {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleSearch = (event) => {
    event.preventDefault()
    const query = search.trim()
    if (query) navigate(`/transactions?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 backdrop-blur-md sm:px-8">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold tracking-tight text-[#172B4D]">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <form
          onSubmit={handleSearch}
          className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-[#F7F8FA] px-3 py-2 text-slate-500 md:flex"
        >
          <Search size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            aria-label="Global search"
            className="w-36 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-48"
          />
        </form>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#159A8A]" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-[52px] w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
              <p className="text-sm font-bold text-slate-800">Notifications</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                No new notifications.
              </p>
            </div>
          )}
        </div>

        <div className="relative border-l border-slate-200 pl-2 sm:pl-4">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9F5F3] text-xs font-bold text-[#159A8A]">
              MB
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-bold text-slate-800">{shopName}</span>
              <span className="block text-[11px] text-slate-500">Owner</span>
            </span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[52px] w-52 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Account profile
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Shop settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
