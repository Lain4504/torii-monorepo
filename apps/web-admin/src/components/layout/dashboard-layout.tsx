import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/layout/app-sidebar.tsx";
import { DashboardHeader } from "@/components/layout/dashboard-header.tsx";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans selection:bg-primary/10 selection:text-primary overflow-hidden relative">

        {/* Zen Ambient Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/[0.02] blur-[100px] rounded-full" />
        </div>

        <AppSidebar />

        <SidebarInset className="relative z-10 flex flex-col min-w-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-transparent">
          {/* Header - Sticky with Deep Glassmorphism */}
          <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-4 bg-card/60 px-4 md:px-6 backdrop-blur-xl transition-all duration-500 border-b border-border/10">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300" />
              <Separator orientation="vertical" className="h-6 bg-border/20" />
              <div className="flex-1 min-w-0">
                <DashboardHeader />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8 lg:p-12 min-w-0 relative">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full pb-20">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
