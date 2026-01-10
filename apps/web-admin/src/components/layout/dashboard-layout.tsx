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
    <div className="flex min-h-screen w-full bg-muted/10 font-sans selection:bg-primary/10 selection:text-primary">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block transition-all duration-300 ease-in-out">
          <DashboardSidebar
            isCollapsed={isCollapsed}
            toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            className="h-full"
          />
        </aside>
      )}

      {/* Main Content Wrapper */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out min-w-0 ${!isMobile
          ? (isCollapsed ? "pl-[80px]" : "pl-[280px]")
          : "pl-0"
          }`}
      >
        {/* Header - Sticky with Glassmorphism and no border */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-background/60 px-6 backdrop-blur-xl transition-all duration-300">
          {isMobile && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 lg:hidden hover:bg-transparent">
                  <Menu className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-[280px] sm:w-[300px] bg-transparent shadow-none">
                <DashboardSidebar
                  isCollapsed={false}
                  toggleCollapse={() => setMobileOpen(false)}
                  className="w-full h-full rounded-tr-2xl rounded-br-2xl overflow-hidden shadow-2xl"
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Main Header Content */}
          <div className="flex flex-1 items-center justify-between">
            <DashboardHeader />
          </div>
        </header>

        {/* Page Content - More breathing room */}
        <main className="flex-1 p-6 lg:p-10 min-w-0">
          <div className="mx-auto max-w-7xl animate-in fade-in-50 duration-700 slide-in-from-bottom-4 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

