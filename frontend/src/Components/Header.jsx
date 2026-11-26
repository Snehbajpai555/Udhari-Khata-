const Header = ({ title, subtitle, theme = 'light' }) => {
  const isDark = theme === 'dark'

  return (
    <header className={`sticky top-0 z-10 flex min-h-[76px] items-center justify-between gap-4 border-b px-5 backdrop-blur-md sm:px-8 ${
      isDark ? 'border-[#2b2940] bg-[#111023]/90' : 'border-slate-200/80 bg-white/90'
    }`}>
      <div className="min-w-0">
        <p className={`truncate text-2xl font-extrabold tracking-tight sm:text-3xl ${isDark ? 'text-white' : 'text-[#19172b]'}`}>{title}</p>
        <p className={`mt-0.5 truncate text-base font-medium sm:text-lg ${isDark ? 'text-[#c2bfd0]' : 'text-slate-600'}`}>{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <label className={`hidden items-center gap-2 rounded-xl border px-3 py-2 text-base transition focus-within:border-[#7257ff] md:flex ${
          isDark
            ? 'border-[#39354f] bg-[#201d3b] text-[#c2bfd0] focus-within:bg-[#24213e]'
            : 'border-slate-200 bg-slate-50 text-slate-600 focus-within:bg-white'
        }`}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search anything"
            aria-label="Search"
            className={`w-36 bg-transparent text-base outline-none lg:w-48 ${
              isDark
                ? 'text-white placeholder:text-[#aaa6bb]'
                : 'text-slate-700 placeholder:text-slate-600'
            }`}
          />
          <kbd className={`rounded border px-1.5 py-0.5 text-sm font-semibold ${
            isDark
              ? 'border-[#45405d] bg-[#2b2746] text-[#c2bfd0]'
              : 'border-slate-200 bg-white text-slate-600'
          }`}>⌘ K</kbd>
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
            isDark
              ? 'border-[#39354f] bg-[#201d3b] text-[#c2bfd0] hover:border-[#514b6d] hover:bg-[#292545]'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span aria-hidden="true">♧</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#7257ff]" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 sm:pl-4">
          <div className={`hidden border-l pl-3 text-right sm:block sm:pl-4 ${
            isDark ? 'border-[#39354f]' : 'border-slate-200'
          }`}>
            <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#19172b]'}`}>My Business</p>
            <p className={`text-base ${isDark ? 'text-[#c2bfd0]' : 'text-slate-600'}`}>Owner</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold ring-2 ${
            isDark
              ? 'bg-[#292545] text-[#c2b8ff] ring-[#111023]'
              : 'bg-[#eeeaff] text-[#7257ff] ring-white'
          }`}>
            MB
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
