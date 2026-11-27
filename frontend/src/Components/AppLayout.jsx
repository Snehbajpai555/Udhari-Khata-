import Header from './Header'
import Sidebar from './Sidebar'
import { useAuth } from '../contexts/auth-context.js'

const AppLayout = ({ title, subtitle, shopName, children }) => {
  const { session } = useAuth()
  const currentShop = shopName || session?.shop?.name || session?.user?.businessName || 'My Business'

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-slate-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} subtitle={subtitle} shopName={currentShop} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
