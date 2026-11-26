import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'

const Login = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('Login is not available yet. Your details were not sent or saved.')
  }

  return (
    <AuthLayout mode="login">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-identity" className="mb-2 block text-sm font-semibold text-[#343148]">
            Email or mobile number
          </label>
          <input
            id="login-identity"
            name="identity"
            type="text"
            autoComplete="username"
            required
            placeholder="you@business.com or mobile number"
            className="w-full rounded-xl border border-[#e6e4ed] bg-[#fcfbfe] px-4 py-3.5 text-sm text-[#201e35] outline-none transition placeholder:text-[#aaa7b5] focus:border-[#8d7aff] focus:bg-white focus:ring-4 focus:ring-[#7257ff]/10"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="block text-sm font-semibold text-[#343148]">
              Password
            </label>
            <span className="text-xs font-medium text-[#a19dac]">Password recovery not available yet</span>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
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
          Continue to your khata <span className="transition-transform group-hover:translate-x-1">→</span>
        </motion.button>
      </form>

      <p className="mt-7 text-center text-sm text-[#777487]">
        New to Udhari Khata?{' '}
        <Link to="/signup" className="font-bold text-[#7257ff] transition hover:text-[#523ad4]">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login