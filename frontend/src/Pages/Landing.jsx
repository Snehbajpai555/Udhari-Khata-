import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

const features = [
  {
    number: '01',
    icon: '↗',
    title: 'Customer khata',
    description:
      'Keep credit sales, payments and balances together in a clear record for each customer.',
    color: 'bg-[#302b50] text-[#c9bdff]',
  },
  {
    number: '02',
    icon: '↙',
    title: 'Supplier dues',
    description:
      'Track what your business owes suppliers alongside the money customers owe you.',
    color: 'bg-[#1d3b32] text-[#a8efd3]',
  },
  {
    number: '03',
    icon: '＋',
    title: 'Everyday entries',
    description:
      'Record a credit sale or payment while the details are fresh, not at the end of the week.',
    color: 'bg-[#3b2d1d] text-[#ffd49b]',
  },
  {
    number: '04',
    icon: '◎',
    title: 'A clearer overview',
    description:
      'Bring customer and supplier balances into one place instead of piecing together loose notes.',
    color: 'bg-[#3d2634] text-[#ffb5c2]',
  },
]

const steps = [
  {
    number: '01',
    title: 'Set up your records',
    description:
      'Start with the customers and suppliers you work with, and add any opening balances you need to track.',
  },
  {
    number: '02',
    title: 'Add entries as they happen',
    description:
      'Record a credit sale, a payment or another change to an account while the details are fresh.',
  },
  {
    number: '03',
    title: 'Review what is outstanding',
    description:
      'Use your records to understand which balances need attention and keep follow-ups organized.',
  },
]

const Landing = () => (
  <div className="min-h-screen overflow-hidden bg-[#0c0b18] text-[#f5f4fb]">
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-8 sm:pt-6">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/15 bg-[#16142d]/70 px-4 py-3 text-white shadow-lg shadow-black/10 backdrop-blur-xl sm:px-6"
      >
        <Link to="/" className="group flex items-center gap-3" aria-label="Udhari Khata home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9ff63] text-sm font-black text-[#19172b] shadow-[0_0_24px_rgba(201,255,99,0.28)] transition-transform duration-300 group-hover:rotate-[-8deg]">
            UK
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight">Udhari Khata</span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Khata, made clearer
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-white/70 md:flex">
          <a className="transition-colors hover:text-[#c9ff63]" href="#features">What it helps with</a>
          <a className="transition-colors hover:text-[#c9ff63]" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-[#c9ff63]" href="#about-khata">About digital khata</a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#c9ff63] px-4 py-2.5 text-sm font-bold text-[#19172b] shadow-[0_6px_24px_rgba(201,255,99,0.18)] transition hover:-translate-y-0.5 hover:bg-[#d8ff8e] hover:shadow-[0_10px_30px_rgba(201,255,99,0.28)]"
          >
            Get started <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </nav>
    </header>

    <main id="top">
      <section className="relative isolate min-h-[720px] overflow-hidden bg-[#111023] px-5 pb-24 pt-36 text-white sm:px-8 sm:pt-44 lg:min-h-[790px] lg:pb-32">
        <div aria-hidden="true" className="hero-grid absolute inset-0 opacity-30" />
        <div aria-hidden="true" className="hero-orb hero-orb-one absolute -right-32 -top-28 h-[30rem] w-[30rem] rounded-full bg-[#7257ff]/40 blur-[110px]" />
        <div aria-hidden="true" className="hero-orb hero-orb-two absolute -bottom-48 left-[30%] h-[28rem] w-[28rem] rounded-full bg-[#31d8ac]/20 blur-[120px]" />
        <div aria-hidden="true" className="absolute left-[8%] top-[35%] h-2 w-2 animate-pulse rounded-full bg-[#c9ff63] shadow-[0_0_20px_5px_rgba(201,255,99,0.35)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.13, delayChildren: 0.18 } },
            }}
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold tracking-wide text-white/80 backdrop-blur"
            >
              <span className="h-2 w-2 rounded-full bg-[#c9ff63] shadow-[0_0_12px_#c9ff63]" />
              A digital khata for Indian small businesses
            </motion.p>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.65 } },
              }}
              className="mt-7 max-w-3xl text-[2.9rem] font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[4.5rem]"
            >
              Business dues, meet your{' '}
              <span className="relative whitespace-nowrap text-[#c9ff63]">
                brighter side.
                <svg aria-hidden="true" viewBox="0 0 310 18" className="absolute -bottom-2 left-0 w-full text-[#9c85ff]">
                  <path d="M4 13C84 3 217 2 306 10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
                </svg>
              </span>
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
              }}
              className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8"
            >
              Keep customer udhaar, supplier dues and payment entries easier to
              follow. A familiar khata, thoughtfully reimagined for the everyday
              rhythm of running a business.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-3 rounded-xl bg-[#c9ff63] px-5 py-3.5 text-sm font-bold text-[#19172b] shadow-[0_8px_32px_rgba(201,255,99,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-[#d8ff8e] hover:shadow-[0_14px_38px_rgba(201,255,99,0.35)]"
              >
                Create your account
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:bg-white/[0.06]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] transition group-hover:bg-[#9c85ff]">↓</span>
                See how it works
              </a>
            </motion.div>
            <motion.p
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { duration: 0.5 } },
              }}
              className="mt-6 text-xs text-white/40"
            >
              Built around everyday business records. No invented numbers, no inflated promises.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 45, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative mx-auto w-full max-w-[540px]"
          >
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-dashed border-[#9c85ff]/35"
            />
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-8 top-16 z-10 hidden rounded-2xl border border-white/15 bg-[#24213e]/90 p-3.5 shadow-2xl backdrop-blur-xl sm:block"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1d3b32] text-[#a8efd3]">↗</span>
                Customer credit
              </span>
              <span className="mt-2 block text-sm font-bold">Example entry</span>
            </motion.div>

            <div className="relative rounded-[2rem] border border-white/15 bg-white/[0.08] p-3 shadow-[0_32px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-4">
              <div className="overflow-hidden rounded-[1.45rem] bg-[#17162a] text-[#f5f4fb]">
              <div className="flex items-center justify-between border-b border-[#302d46] px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#302b50] text-sm font-bold text-[#c9bdff]">M</span>
                    <div>
                      <p className="text-sm font-bold">Mohan Stores</p>
                      <p className="text-[11px] text-[#b3b0c1]">Illustrative customer account</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#302b50] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#c9bdff]">
                    Sample
                  </span>
                </div>
                <div className="px-5 pb-5 pt-5 sm:px-6">
                  <div className="rounded-2xl bg-gradient-to-br from-[#201d3b] to-[#39306b] p-5 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">Example outstanding</p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight">₹8,400</p>
                      </div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#c9ff63]">↗</span>
                    </div>
                    <div className="mt-5 flex h-8 items-end gap-1">
                      {[24, 35, 29, 48, 39, 61, 50, 72, 54, 82, 63, 94].map((height, index) => (
                        <motion.span
                          key={index}
                          initial={{ height: 3 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.7, delay: 0.55 + index * 0.045, ease: 'easeOut' }}
                          className="flex-1 rounded-full bg-gradient-to-t from-[#9c85ff] to-[#c9ff63]"
                          style={{ maxHeight: '2rem' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#c2bfd0]">Example entries</p>
                    <span className="text-[10px] text-[#aaa6bb]">Sample figures only</span>
                  </div>
                  <div className="mt-2 divide-y divide-[#f0eff5]">
                    <div className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b2d1d] text-sm text-[#ffd49b]">＋</span>
                        <div><p className="text-xs font-semibold">Credit sale</p><p className="mt-0.5 text-[10px] text-[#aaa6bb]">Example transaction</p></div>
                      </div>
                      <span className="text-xs font-bold text-[#ffd49b]">+ ₹10,000</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1d3b32] text-sm text-[#a8efd3]">✓</span>
                        <div><p className="text-xs font-semibold">Payment received</p><p className="mt-0.5 text-[10px] text-[#aaa6bb]">Example transaction</p></div>
                      </div>
                      <span className="text-xs font-bold text-[#a8efd3]">− ₹1,600</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, 9, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="absolute -bottom-6 -right-4 rounded-2xl border border-white/15 bg-[#24213e]/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:-right-8"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">One clear place</p>
              <p className="mt-1 text-sm font-bold text-white">Khata at a glance <span className="ml-1 text-[#c9ff63]">✦</span></p>
            </motion.div>
          </motion.div>
        </div>
        <div className="relative mx-auto mt-20 flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:justify-between sm:text-xs">
          <span>Customer ledger</span><span className="hidden h-1 w-1 rounded-full bg-[#9c85ff] sm:block" />
          <span>Supplier dues</span><span className="hidden h-1 w-1 rounded-full bg-[#9c85ff] sm:block" />
          <span>Payment entries</span><span className="hidden h-1 w-1 rounded-full bg-[#9c85ff] sm:block" />
          <span>Everyday clarity</span>
        </div>
      </section>

      <section id="features" className="relative px-5 py-20 sm:px-8 sm:py-28">
        <div aria-hidden="true" className="absolute right-0 top-20 h-64 w-64 rounded-full bg-[#7257ff]/20 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ad9eff]">Made for everyday business</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              The little details that keep business moving.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#c2bfd0]">
              From a customer’s credit balance to a supplier payment, give your everyday records a more organized home.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.article
                key={feature.number}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.09 }}
                whileHover={{ y: -8, rotate: index % 2 === 0 ? -1 : 1 }}
                className="group rounded-[1.6rem] border border-[#302d46] bg-[#17162a] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-shadow hover:shadow-[0_24px_50px_rgba(0,0,0,0.3)] sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-semibold transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 ${feature.color}`}>
                    {feature.icon}
                  </span>
                  <span className="text-xs font-bold tracking-widest text-[#a9a6bb]">{feature.number}</span>
                </div>
                <h3 className="mt-7 text-lg font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#c2bfd0]">{feature.description}</p>
                <span className="mt-5 inline-block text-sm font-bold text-[#ad9eff] transition-transform group-hover:translate-x-1">Thoughtfully organized <span aria-hidden="true">→</span></span>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="overflow-hidden border-y border-[#25223a] bg-[#111023] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ad9eff]">A straightforward routine</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Easy to follow. Familiar from day one.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#c2bfd0]">
              A digital khata follows the same simple idea as a paper ledger: note who a transaction is with, record what changed, and review the balance when needed.
            </p>
            <Link to="/signup" className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-[#7257ff] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(114,87,255,0.25)] transition hover:-translate-y-1 hover:bg-[#5f43ec] hover:shadow-[0_16px_30px_rgba(114,87,255,0.33)]">
              Get started <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          <div className="relative">
            <div aria-hidden="true" className="absolute bottom-10 left-[1.55rem] top-10 hidden w-px bg-gradient-to-b from-[#7257ff]/20 via-[#7257ff]/70 to-[#31bd99]/20 sm:block" />
            <ol>
              {steps.map((step, index) => (
                <motion.li
                  key={step.number}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: index * 0.14 }}
                  className="relative mb-4 rounded-[1.6rem] border border-white/10 bg-[#17162a]/90 p-6 shadow-sm backdrop-blur sm:mb-5 sm:grid sm:grid-cols-[3.5rem_1fr] sm:gap-5 sm:p-7"
                >
                  <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7257ff] text-sm font-bold text-white shadow-[0_8px_20px_rgba(114,87,255,0.25)]">
                    {step.number}
                  </span>
                  <div className="mt-4 sm:mt-1">
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#c2bfd0]">{step.description}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="about-khata" className="px-5 py-20 sm:px-8 sm:py-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65 }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#17142f] px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16"
        >
          <div aria-hidden="true" className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#7257ff]/35 blur-[100px]" />
          <div aria-hidden="true" className="absolute -bottom-40 left-[35%] h-72 w-72 rounded-full bg-[#31d8ac]/20 blur-[90px]" />
          <div className="relative grid items-end gap-8 md:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c9ff63]">The idea behind Udhari Khata</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                A familiar way to keep track, with a little more clarity.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                A khata helps a business keep track of credit given, payments made and balances still due. Digital records can make everyday entries easier to find; formal bookkeeping and tax requirements may still need dedicated accounting support.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/signup" className="rounded-xl bg-[#c9ff63] px-5 py-3.5 text-sm font-bold text-[#19172b] transition hover:-translate-y-1 hover:bg-[#d8ff8e]">Create an account <span aria-hidden="true">→</span></Link>
              <Link to="/login" className="rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Log in</Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>

    <footer className="border-t border-[#302d46] bg-[#111023] px-5 py-7 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-[#c2bfd0] sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="font-bold text-white">Udhari Khata</Link>
        <p>Clearer records for the everyday work of running a business.</p>
        <div className="flex gap-5 font-semibold">
          <Link className="transition hover:text-[#7257ff]" to="/login">Log in</Link>
          <Link className="transition hover:text-[#7257ff]" to="/signup">Sign up</Link>
        </div>
      </div>
    </footer>
  </div>
)

export default Landing
