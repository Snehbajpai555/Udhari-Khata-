import { ArrowRight, Construction } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../Components/AppLayout'

const ModulePlaceholder = ({ title, subtitle, description }) => {
  const navigate = useNavigate()

  return (
    <AppLayout title={title} subtitle={subtitle}>
      <section className="flex min-h-[calc(100vh-137px)] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E9F5F3] text-[#159A8A]">
            <Construction size={21} />
          </div>
          <h1 className="mt-5 text-xl font-bold text-[#172B4D]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#172B4D] px-4 py-2.5 text-sm font-bold text-white"
          >
            Back to overview
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </AppLayout>
  )
}

export default ModulePlaceholder
