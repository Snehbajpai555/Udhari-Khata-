import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

const metrics = [
  {
    label: "Total receivables",
    value: "₹ 84,250",
    note: "Across 24 customers",
    icon: "↗",
    tone: "violet",
  },
  {
    label: "Collected today",
    value: "₹ 12,800",
    note: "From 8 payments",
    icon: "↓",
    tone: "green",
  },
  {
    label: "Cash in hand",
    value: "₹ 36,450",
    note: "Updated just now",
    icon: "₹",
    tone: "blue",
  },
  {
    label: "Pending payments",
    value: "₹ 18,600",
    note: "6 due this week",
    icon: "◷",
    tone: "orange",
  },
];

const activity = [
  {
    initials: "RS",
    name: "Rakesh Sharma",
    detail: "Payment received · Cash",
    amount: "+ ₹ 2,500",
    time: "10:42 AM",
    tone: "blue",
  },
  {
    initials: "PM",
    name: "Priya Medical Store",
    detail: "New credit added · Khata",
    amount: "₹ 1,200",
    time: "10:18 AM",
    tone: "purple",
  },
  {
    initials: "AG",
    name: "Amit Gupta",
    detail: "Payment received · UPI",
    amount: "+ ₹ 850",
    time: "09:56 AM",
    tone: "orange",
  },
  {
    initials: "SK",
    name: "Sunita Kirana",
    detail: "New credit added · Khata",
    amount: "₹ 620",
    time: "09:30 AM",
    tone: "green",
  },
];

const week = [
  { day: "Mon", height: "48%" },
  { day: "Tue", height: "72%" },
  { day: "Wed", height: "56%" },
  { day: "Thu", height: "88%" },
  { day: "Fri", height: "64%" },
  { day: "Sat", height: "100%" },
  { day: "Sun", height: "40%" },
];

const metricTones = {
  violet: "bg-[#eae5ff] text-[#7257ff]",
  green: "bg-[#dff8ef] text-[#16866b]",
  blue: "bg-[#eeeaff] text-[#7257ff]",
  orange: "bg-[#fff0d6] text-[#b56713]",
};

const avatarTones = {
  blue: "bg-[#eae5ff] text-[#654de5]",
  purple: "bg-[#eeeaff] text-[#7257ff]",
  orange: "bg-[#fff0d6] text-[#b56713]",
  green: "bg-[#dff8ef] text-[#16866b]",
};

export const Dashboard = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#f7f6fc] text-[#19172b]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title="Business overview"
          subtitle="A clear picture of how your business is doing."
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 p-5 sm:p-8">
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500">{today}</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#19172b] sm:text-[28px]">
                Good morning <span aria-hidden="true">☀️</span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Here’s what’s happening with your business today.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#c9ff63] px-4 py-2.5 text-sm font-bold text-[#19172b] shadow-[0_6px_24px_rgba(201,255,99,0.18)] transition hover:-translate-y-0.5 hover:bg-[#d8ff8e]"
            >
              <span className="text-base leading-none">＋</span> Add transaction
            </button>
          </section>

          <section
            aria-label="Business summary"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-[#ebe9f2] bg-white p-5 shadow-[0_8px_30px_rgba(36,29,79,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-[26px] font-extrabold tracking-tight text-[#19172b]">
                      {metric.value}
                    </p>
                  </div>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${metricTones[metric.tone]}`}
                  >
                    {metric.icon}
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-400">
                  {metric.note}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <article className="rounded-2xl border border-[#ebe9f2] bg-white p-5 shadow-[0_8px_30px_rgba(36,29,79,0.04)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-[#19172b]">Cash flow</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Money in and out this week
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  This week <span className="ml-1 text-slate-400">⌄</span>
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-[#19172b]">
                    ₹ 68,400
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">
                    ↑ 12.8% <span className="text-slate-400">vs last week</span>
                  </p>
                </div>
                <div className="flex gap-4 text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#7257ff]" />
                    Money in
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#ded6ff]" />
                    Money out
                  </span>
                </div>
              </div>

              <div className="mt-5 grid h-44 grid-cols-7 items-end gap-3 border-b border-slate-100 pb-2 sm:gap-5">
                {week.map(({ day, height }) => (
                  <div
                    key={day}
                    className="flex h-full flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-1.5">
                      <div
                        className="w-2/5 rounded-t-md bg-[#7257ff]"
                        style={{ height }}
                      />
                      <div
                        className="w-2/5 rounded-t-md bg-[#ded6ff]"
                        style={{ height: `calc(${height} * 0.62)` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#ebe9f2] bg-white p-5 shadow-[0_8px_30px_rgba(36,29,79,0.04)] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-[#19172b]">Khata summary</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Your customer balances
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eae5ff] text-lg text-[#7257ff]">
                  ♧
                </span>
              </div>

              <div className="mt-6 rounded-xl bg-[#f7f6fc] p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Total outstanding
                </p>
                <p className="mt-1 text-[26px] font-extrabold tracking-tight text-[#19172b]">
                  ₹ 84,250
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[68%] rounded-full bg-[#7257ff]" />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
                  <span>₹ 57,290 current</span>
                  <span>₹ 26,960 overdue</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[11px] font-medium text-slate-500">
                    Customers who owe
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[#19172b]">
                    24
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[11px] font-medium text-slate-500">
                    Overdue accounts
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[#19172b]">
                    6
                  </p>
                </div>
              </div>
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#ebe9f2] bg-white shadow-[0_8px_30px_rgba(36,29,79,0.04)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-bold text-[#19172b]">Recent activity</h2>
                <p className="mt-1 text-xs text-slate-500">
                  The latest updates from your khata
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-[#7257ff] transition hover:text-[#5f43ec]"
              >
                View all <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {activity.map((item) => (
                <div
                  key={`${item.name}-${item.time}`}
                  className="flex items-center gap-3 px-5 py-3.5 sm:gap-4 sm:px-6"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarTones[item.tone]}`}
                  >
                    {item.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-700">
                      {item.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold ${item.amount.startsWith("+") ? "text-emerald-600" : "text-slate-700"}`}
                    >
                      {item.amount}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
