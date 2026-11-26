import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

const AuthLayout = ({ children, mode }) => {
  const isSignup = mode === 'signup'

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f7f6fc] lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#111023] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div aria-hidden="true" className="auth-grid absolute inset-0 opacity-30" />
        <div aria-hidden="true" className="auth-orb absolute -right-32 top-20 h-[32rem] w-[32rem] rounded-full bg-[#7257ff]/35 blur-[110px]" />
        <div aria-hidden="true" className="auth-orb auth-orb-delay absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-[#31d8ac]/20 blur-[100px]" />

        <Link to="/" className="relative z-10 inline-flex w-fit items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c9ff63] text-sm font-black text-[#19172b]">UK</span>
          <span>
            <span className="block font-bold">Udhari Khata</span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Khata, made clearer</span>
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10 max-w-xl py-12"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white/75">
            <span className="h-2 w-2 rounded-full bg-[#c9ff63]" />
            A clearer way to keep your khata
          </p>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.06] tracking-[-0.05em] xl:text-6xl">
            Good records make room for <span className="text-[#c9ff63]">good business.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/60">
            Organize everyday customer dues, supplier balances and payment entries in one considered place.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {[
              ['01', 'Customer khata'],
              ['02', 'Supplier dues'],
              ['03', 'Payment entries'],
            ].map(([number, label], index) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.35 + index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur"
              >
                <span className="text-[10px] font-bold tracking-widest text-[#9c85ff]">{number}</span>
                <p className="mt-3 text-xs font-semibold text-white/80">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-white/35">
          For everyday record-keeping. Not a replacement for accounting or tax advice.
        </p>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <div aria-hidden="true" className="absolute -right-28 top-0 h-72 w-72 rounded-full bg-[#dcd5ff]/60 blur-[90px] lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative w-full max-w-[470px]"
        >
          <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#716d84] transition hover:text-[#7257ff] lg:hidden">
            <span aria-hidden="true">←</span> Udhari Khata
          </Link>

          <div className="rounded-[1.8rem] border border-[#eae8f1] bg-white p-6 shadow-[0_24px_80px_rgba(37,31,76,0.10)] sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7257ff]">
                  {isSignup ? 'Get started' : 'Welcome back'}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#201e35]">
                  {isSignup ? 'Create your account' : 'Log in to your khata'}
                </h2>
              </div>
              <span className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#f0edff] text-xl text-[#7257ff] sm:flex" aria-hidden="true">
                {isSignup ? '✦' : '↗'}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#777487]">
              {isSignup
                ? 'A simple starting point for more organized business records.'
                : 'Pick up where you left off with your business records.'}
            </p>

            <div className="mt-7 grid grid-cols-2 rounded-xl bg-[#f3f2f8] p-1">
              <Link
                to="/login"
                aria-current={!isSignup ? 'page' : undefined}
                className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition ${!isSignup ? 'bg-white text-[#342c62] shadow-sm' : 'text-[#888598] hover:text-[#342c62]'}`}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                aria-current={isSignup ? 'page' : undefined}
                className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition ${isSignup ? 'bg-white text-[#342c62] shadow-sm' : 'text-[#888598] hover:text-[#342c62]'}`}
              >
                Sign up
              </Link>
            </div>

            <div className="mt-7">{children}</div>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-[#9692a3]">
            The account service is not connected yet. Details entered here are not saved or sent.
          </p>
        </motion.div>
      </section>
    </main>
  )
}

export default AuthLayout
