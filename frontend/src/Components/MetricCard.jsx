const MetricCard = ({ label, value, caption, tone = 'teal', icon: Icon }) => {
  const tones = {
    teal: 'bg-[#E9F5F3] text-[#159A8A]',
    navy: 'bg-slate-100 text-[#172B4D]',
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#172B4D]">{value}</p>
          {caption && <p className="mt-1 text-xs text-slate-400">{caption}</p>}
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
    </article>
  )
}

export default MetricCard
