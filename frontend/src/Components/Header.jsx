const Header = ({ title, subtitle }) => {
  return (
    <header className="sticky top-0 z-10 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md sm:px-8">
      <div className="min-w-0">
        <p className="truncate text-lg font-extrabold tracking-tight text-[#19172b] sm:text-xl">{title}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition focus-within:border-[#7257ff] focus-within:bg-white md:flex">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search anything"
            aria-label="Search"
            className="w-36 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-48"
          />
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">⌘ K</kbd>
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span aria-hidden="true">♧</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#7257ff]" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-[#19172b]">My Business</p>
            <p className="text-xs text-slate-500">Owner</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeeaff] text-sm font-extrabold text-[#7257ff] ring-2 ring-white">
            MB
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
