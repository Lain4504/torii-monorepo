"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export function SenseiLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background overflow-hidden">
                <AppSidebar />

                <SidebarInset className="relative z-10 flex flex-col bg-transparent">
                    <DashboardHeader />
                    <div className="h-[calc(100vh-4rem)] overflow-hidden relative">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
