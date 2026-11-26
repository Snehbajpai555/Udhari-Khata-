import { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

const paymentPeriods = {
  total: {
    label: "Total",
    amount: 528400,
    note: "Across all recorded activity",
  },
  monthly: {
    label: "Monthly",
    amount: 284600,
    note: "↑ 8.4% vs last month",
  },
  weekly: {
    label: "Weekly",
    amount: 68400,
    note: "↑ 12.8% vs last week",
  },
};

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

const formatCurrency = (amount) =>
  `₹ ${amount.toLocaleString("en-IN")}`;

const metricTones = {
  violet: "bg-[#302b50] text-[#c9bdff]",
  green: "bg-[#1d3b32] text-[#a8efd3]",
  blue: "bg-[#302b50] text-[#c9bdff]",
  orange: "bg-[#3b2d1d] text-[#ffd49b]",
};

const avatarTones = {
  blue: "bg-[#302b50] text-[#c9bdff]",
  purple: "bg-[#302b50] text-[#c9bdff]",
  orange: "bg-[#3b2d1d] text-[#ffd49b]",
  green: "bg-[#1d3b32] text-[#a8efd3]",
};

export const Dashboard = () => {
  const [paymentPeriod, setPaymentPeriod] = useState("total");
  const selectedPaymentPeriod = paymentPeriods[paymentPeriod];
  const summaryCards = [
    {
      label: "Payments received",
      value: formatCurrency(selectedPaymentPeriod.amount),
      note: selectedPaymentPeriod.note,
      icon: "↓",
      tone: "green",
    },
    {
      label: "Payable",
      value: formatCurrency(1200),
      note: "Supplier dues",
      icon: "↗",
      tone: "orange",
    },
    {
      label: "Cash in hand",
      value: formatCurrency(36450),
      note: "Current balance",
      icon: "₹",
      tone: "blue",
    },
    {
      label: "Pending payments",
      value: formatCurrency(18600),
      note: "6 due this week",
      icon: "◷",
      tone: "violet",
    },
  ];
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#0c0b18] text-[#f5f4fb]">
      <Sidebar theme="dark" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          theme="dark"
          title="Business overview"
          subtitle="A clear picture of how your business is doing."
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 p-5 sm:p-8">
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-[#a9a6bb]">{today}</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-[28px]">
                Good morning <span aria-hidden="true">☀️</span>
              </h1>
              <p className="mt-1 text-sm text-[#c2bfd0]">
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

          <section aria-label="Financial overview" className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-white">Financial overview</h2>
                <p className="mt-1 text-xs text-[#a9a6bb]">
                  Payments received by period and your current balances
                </p>
              </div>
              <div
                role="group"
                aria-label="Payment period"
                className="flex w-fit items-center gap-1 rounded-xl border border-[#3b3752] bg-[#201e36] p-1"
              >
                {Object.entries(paymentPeriods).map(([key, period]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={paymentPeriod === key}
                    onClick={() => setPaymentPeriod(key)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      paymentPeriod === key
                        ? "bg-[#393354] text-white shadow-sm"
                        : "text-[#c2bfd0] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-[#302d46] bg-[#17162a] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.16)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#c2bfd0]">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-[26px] font-extrabold tracking-tight text-white">
                        {metric.value}
                      </p>
                    </div>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${metricTones[metric.tone]}`}
                    >
                      {metric.icon}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-medium text-[#a9a6bb]">
                    {metric.note}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-2xl border border-[#302d46] bg-[#17162a] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.16)] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-white">Khata summary</h2>
                  <p className="mt-1 text-xs text-[#a9a6bb]">
                    Your customer balances
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#302b50] text-lg text-[#c9bdff]">
                  ♧
                </span>
              </div>

              <div className="mt-6 rounded-xl bg-[#201e36] p-4">
                <p className="text-xs font-semibold text-[#c2bfd0]">
                  Total outstanding
                </p>
                <p className="mt-1 text-[26px] font-extrabold tracking-tight text-white">
                  ₹ 84,250
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#3b3752]">
                  <div className="h-full w-[68%] rounded-full bg-[#7257ff]" />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-medium text-[#a9a6bb]">
                  <span>₹ 57,290 current</span>
                  <span>₹ 26,960 overdue</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#302d46] p-3">
                  <p className="text-[11px] font-medium text-[#c2bfd0]">
                    Customers who owe
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-white">
                    24
                  </p>
                </div>
                <div className="rounded-xl border border-[#302d46] p-3">
                  <p className="text-[11px] font-medium text-[#c2bfd0]">
                    Overdue accounts
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-white">
                    6
                  </p>
                </div>
              </div>
            </article>

            <article className="overflow-hidden rounded-2xl border border-[#302d46] bg-[#17162a] shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#302d46] px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-bold text-white">Recent activity</h2>
                  <p className="mt-1 text-xs text-[#a9a6bb]">
                    The latest updates from your khata
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#c9bdff] transition hover:text-white"
                >
                  View all <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className="divide-y divide-[#302d46]">
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
                      <p className="truncate text-sm font-bold text-[#f5f4fb]">
                        {item.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#a9a6bb]">
                        {item.detail}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-bold ${item.amount.startsWith("+") ? "text-[#a8efd3]" : "text-[#f5f4fb]"}`}
                      >
                        {item.amount}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#a9a6bb]">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
};
