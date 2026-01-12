import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Menu } from "lucide-react"

import { useWindowSize } from "@workspace/ui/hooks/use-window-size"
import { useLocalStorage } from "@workspace/ui/hooks/use-local-storage"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar.tsx";
import { DashboardHeader } from "@/components/layout/dashboard-header.tsx";
import { Button } from "@workspace/ui/components/button"
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useLocalStorage("sidebar-collapsed", false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { width } = useWindowSize()
  const isMobile = typeof width === "number" && width < 1024

  // Close mobile sidebar on route change
  const location = useLocation()
  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <div className="flex min-h-screen w-full bg-background font-sans selection:bg-primary/10 selection:text-primary overflow-hidden relative">

      {/* Zen Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/[0.02] blur-[100px] rounded-full" />
      </div>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden lg:block transition-all duration-300 ease-in-out">
          <DashboardSidebar
            isCollapsed={isCollapsed}
            toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            className="h-full"
          />
        </aside>
      )}

      {/* Main Content Wrapper */}
      <div
        className={`flex flex-col flex-1 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] min-w-0 relative z-10 ${!isMobile
          ? (isCollapsed ? "pl-[90px]" : "pl-[300px]")
          : "pl-0"
          }`}
      >
        {/* Header - Sticky with Deep Glassmorphism */}
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-background/40 px-8 backdrop-blur-3xl transition-all duration-500 border-b border-border/10">
          {isMobile && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 lg:hidden hover:bg-primary/5 rounded-xl">
                  <Menu className="h-6 w-6 text-foreground" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-[300px] bg-transparent shadow-none">
                <DashboardSidebar
                  isCollapsed={false}
                  toggleCollapse={() => setMobileOpen(false)}
                  className="w-full h-full rounded-tr-3xl rounded-br-3xl overflow-hidden shadow-2xl"
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Main Header Content */}
          <div className="flex flex-1 items-center justify-between min-w-0">
            <DashboardHeader />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 lg:p-12 min-w-0 relative">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full pb-20">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
