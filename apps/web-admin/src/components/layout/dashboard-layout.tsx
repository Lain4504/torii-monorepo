import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Menu } from "lucide-react"

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar.tsx";
import { DashboardHeader } from "@/components/layout/dashboard-header.tsx";
import { Button } from "@workspace/ui/components/button"
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile sidebar on route change
  const location = useLocation()
  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <div className="flex min-h-screen w-full bg-muted/40 font-sans">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden border-r bg-background lg:block transition-all duration-300 ease-in-out">
          <DashboardSidebar
            isCollapsed={isCollapsed}
            toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            className="border-none"
          />
        </aside>
      )}

      {/* Main Content Wrapper */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${!isMobile
            ? (isCollapsed ? "pl-[80px]" : "pl-[280px]")
            : "pl-0"
          }`}
      >
        {/* Header - Sticky */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {isMobile && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-r w-[280px] sm:w-[300px]">
                <DashboardSidebar
                  isCollapsed={false}
                  toggleCollapse={() => setMobileOpen(false)}
                  className="w-full h-full border-none"
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Main Header Content (Breadcrumbs, Search, UserProfile) */}
          <div className="flex flex-1 items-center justify-between">
            <DashboardHeader />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="mx-auto max-w-7xl animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
