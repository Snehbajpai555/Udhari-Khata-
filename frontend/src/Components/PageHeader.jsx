const PageHeader = ({ eyebrow, title, description, actions }) => (
  <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#159A8A]">{eyebrow}</p>
      )}
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#172B4D]">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </section>
)

export default PageHeader
