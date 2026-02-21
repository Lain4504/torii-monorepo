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

        {/* Subtle ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/[0.03] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/[0.02] blur-[100px] rounded-full" />
        </div>

        <AppSidebar />

        <SidebarInset className="relative z-10 flex flex-col min-w-0 bg-transparent">
          {/* Sticky Header */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 bg-background/80 px-4 md:px-6 backdrop-blur-xl border-b border-border/10">
            <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-muted hover:text-primary transition-colors shrink-0" />
            <Separator orientation="vertical" className="h-5 bg-border/30" />
            <div className="flex-1 min-w-0">
              <DashboardHeader />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
