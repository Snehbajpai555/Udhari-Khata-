import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'

const Signup = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('Account creation is not available yet. Your details were not sent or saved.')
  }

  return (
    <AuthLayout mode="signup">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-[#343148]">
            Your name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="e.g. Asha Patel"
            className="w-full rounded-xl border border-[#e6e4ed] bg-[#fcfbfe] px-4 py-3.5 text-sm text-[#201e35] outline-none transition placeholder:text-[#aaa7b5] focus:border-[#8d7aff] focus:bg-white focus:ring-4 focus:ring-[#7257ff]/10"
          />
        </div>

        <div>
          <label htmlFor="signup-business" className="mb-2 block text-sm font-semibold text-[#343148]">
            Business name
          </label>
          <input
            id="signup-business"
            name="business"
            type="text"
            autoComplete="organization"
            required
            placeholder="Your shop or business"
            className="w-full rounded-xl border border-[#e6e4ed] bg-[#fcfbfe] px-4 py-3.5 text-sm text-[#201e35] outline-none transition placeholder:text-[#aaa7b5] focus:border-[#8d7aff] focus:bg-white focus:ring-4 focus:ring-[#7257ff]/10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-[#343148]">
              Email address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@business.com"
              className="w-full rounded-xl border border-[#e6e4ed] bg-[#fcfbfe] px-4 py-3.5 text-sm text-[#201e35] outline-none transition placeholder:text-[#aaa7b5] focus:border-[#8d7aff] focus:bg-white focus:ring-4 focus:ring-[#7257ff]/10"
            />
          </div>
          <div>
            <label htmlFor="signup-phone" className="mb-2 block text-sm font-semibold text-[#343148]">
              Mobile number
            </label>
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-[#e6e4ed] bg-[#fcfbfe] px-4 py-3.5 text-sm text-[#201e35] outline-none transition placeholder:text-[#aaa7b5] focus:border-[#8d7aff] focus:bg-white focus:ring-4 focus:ring-[#7257ff]/10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-category" className="mb-2 block text-sm font-semibold text-[#343148]">
            Business type
          </label>
          <select
            id="signup-category"
            name="businessType"
            defaultValue=""
            required
            className="w-full appearance-none rounded-xl border border-[#e6e4ed] bg-[#fcfbfe] px-4 py-3.5 text-sm text-[#625f72] outline-none transition focus:border-[#8d7aff] focus:bg-white focus:ring-4 focus:ring-[#7257ff]/10"
          >
            <option value="" disabled>Select a business type</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="services">Services</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-[#343148]">
            Create a password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-[#e6e4ed] bg-[#fcfbfe] px-4 py-3.5 text-sm text-[#201e35] outline-none transition placeholder:text-[#aaa7b5] focus:border-[#8d7aff] focus:bg-white focus:ring-4 focus:ring-[#7257ff]/10"
          />
        </div>

        {message && (
          <p role="status" className="rounded-xl border border-[#f2d89e] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#785c1c]">
            {message}
          </p>
        )}

        <motion.button
          type="submit"
          whileHover={{ y: -2, boxShadow: '0 14px 28px rgba(114,87,255,0.28)' }}
          whileTap={{ scale: 0.98 }}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7257ff] to-[#9768ff] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(114,87,255,0.20)] transition"
        >
          Create account <span className="transition-transform group-hover:translate-x-1">→</span>
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-[#777487]">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-[#7257ff] transition hover:text-[#523ad4]">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Signup