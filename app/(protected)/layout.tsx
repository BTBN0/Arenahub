import Sidebar from '@/components/layout/Sidebar'
import MobileDrawer from '@/components/layout/MobileDrawer'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <Sidebar />
      <MobileDrawer />
      {children}
    </div>
  )
}