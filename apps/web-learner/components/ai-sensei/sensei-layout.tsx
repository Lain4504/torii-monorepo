"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"

export function SenseiLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full overflow-hidden bg-background">
                <AppSidebar />

                <SidebarInset className="relative z-10 flex min-h-0 flex-1 flex-col bg-transparent">
                    <DashboardHeader />
                    <main className="relative flex h-[calc(100vh-4rem)] min-h-0 flex-1 flex-col overflow-hidden scrollbar-none">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
