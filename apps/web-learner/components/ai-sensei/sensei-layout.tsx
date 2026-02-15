"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AgentSelector } from "./agent-selector"

export function SenseiLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "280px",
                    "--sidebar-width-mobile": "100%",
                } as React.CSSProperties
            }
        >
            <div className="flex min-h-screen w-full bg-background overflow-hidden">
                <AgentSelector />

                <SidebarInset className="relative z-10 flex flex-col bg-transparent">
                    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                        <SidebarTrigger />
                        <span className="text-sm font-semibold text-foreground">AI Sensei</span>
                    </header>
                    <div className="h-[calc(100vh-3.5rem)] overflow-hidden relative">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
