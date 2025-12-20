import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { DashboardSidebar } from "./dashboard_sidebar"
import { DashboardHeader } from "./dashboard_header"

// Main layout component
export default function DashboardLayout() {
  const [sidebarMode, setSidebarMode] = useState<"expanded" | "collapsed" | "hover">("hover")

  useEffect(() => {
    // init sidebar mode
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null) : null
    if (stored === 'expanded' || stored === 'collapsed' || stored === 'hover') {
      setSidebarMode(stored)
    }
    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      const mode = e.detail
      if (mode === 'expanded' || mode === 'collapsed' || mode === 'hover') setSidebarMode(mode)
    }
    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)

    return () => {
      window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    }
  }, [])

  return (
      <div className="h-screen w-full overflow-hidden">
        <div className="flex h-full w-full max-w-full">
          {/* Custom Sidebar với hover expand - chỉ hiện trên desktop */}
          <div className="group relative hidden lg:block">
            <div className={"fixed left-0 top-12 h-[calc(100vh-3rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40 overflow-hidden " + (sidebarMode === 'expanded' ? 'w-64' : sidebarMode === 'collapsed' ? 'w-12' : 'w-12 hover:w-64')}>
              <DashboardSidebar/>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={"flex flex-col flex-1 pt-12 min-h-0 max-w-full overflow-hidden dashboard-content " + (sidebarMode === 'expanded' ? 'lg:ml-64' : 'lg:ml-12')}>
            <main className="flex-1 overflow-x-hidden max-w-full">
              <Outlet />
            </main>
          </div>
        </div>

        {/* Header được đặt ngoài sidebar để trải dài hết màn hình */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <DashboardHeader />
        </div>
      </div>
  )
}
