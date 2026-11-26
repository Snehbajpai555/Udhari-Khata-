import { useState } from 'react'
import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import { signup } from '../api/auth.js'

const Signup = () => {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const details = {
      name: String(formData.get('name') || '').trim(),
      businessName: String(formData.get('business') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      role: String(formData.get('businessType') || ''),
      password: String(formData.get('password') || ''),
    }

    try {
      const result = await signup(details)
      navigate('/dashboard', { replace: true, state: { user: result.user } })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="signup">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-[#e2dfeb]">
            Your name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="e.g. Asha Patel"
            className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#aaa6bb] focus:border-[#8d7aff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
          />
        </div>

        <div>
          <label htmlFor="signup-business" className="mb-2 block text-sm font-semibold text-[#e2dfeb]">
            Business name
          </label>
          <input
            id="signup-business"
            name="business"
            type="text"
            autoComplete="organization"
            required
            placeholder="Your shop or business"
            className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#aaa6bb] focus:border-[#8d7aff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-[#e2dfeb]">
              Email address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@business.com"
              className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#aaa6bb] focus:border-[#8d7aff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
            />
          </div>
          <div>
            <label htmlFor="signup-phone" className="mb-2 block text-sm font-semibold text-[#e2dfeb]">
              Mobile number
            </label>
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#aaa6bb] focus:border-[#8d7aff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-category" className="mb-2 block text-sm font-semibold text-[#e2dfeb]">
            Business type
          </label>
          <select
            id="signup-category"
            name="businessType"
            defaultValue=""
            required
            className="w-full appearance-none rounded-xl border border-[#3b3752] bg-[#201e36] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#8d7aff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
          >
            <option value="" disabled>Select a business type</option>
            <option value="retailer">Retail</option>
            <option value="wholesaler">Wholesale</option>
            <option value="manufacturer">Manufacturing</option>
            <option value="service">Services</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-[#e2dfeb]">
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
            className="w-full rounded-xl border border-[#3b3752] bg-[#201e36] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#aaa6bb] focus:border-[#8d7aff] focus:bg-[#24213e] focus:ring-4 focus:ring-[#7257ff]/20"
          />
        </div>

        {message && (
          <p
            role="alert"
            className="rounded-xl border border-[#735626] bg-[#3b2d1d] px-4 py-3 text-sm leading-5 text-[#ffdc97]"
          >
            {message}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ y: -2, boxShadow: '0 14px 28px rgba(114,87,255,0.28)' }}
          whileTap={{ scale: 0.98 }}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7257ff] to-[#9768ff] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(114,87,255,0.20)] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
          {!isSubmitting && <span className="transition-transform group-hover:translate-x-1">→</span>}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-[#c2bfd0]">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-[#c9bdff] transition hover:text-white">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Signup