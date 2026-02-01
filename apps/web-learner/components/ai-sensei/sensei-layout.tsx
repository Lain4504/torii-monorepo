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
            <div className="flex min-h-screen w-full bg-background selection:bg-purple-500/10 selection:text-purple-500 overflow-hidden">
                {/* Zen Ambient Background Elements - Purple Theme for Sensei */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/[0.03] rounded-full blur-[140px] animate-pulse duration-[8s]" />
                    <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-blue-500/[0.02] rounded-full blur-[120px] animate-pulse duration-[10s]" />
                    <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-indigo-500/[0.04] rounded-full blur-[100px]" />
                </div>

                <AgentSelector />

                <SidebarInset className="relative z-10 flex flex-col bg-transparent">
                    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/20 backdrop-blur-md px-4">
                        <SidebarTrigger />
                        <span className="text-sm font-serif font-bold italic tracking-wider text-muted-foreground/60 uppercase">Torii Sensei AI</span>
                    </header>
                    <div className="flex-1 overflow-hidden h-[calc(100vh-3.5rem)] relative">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
