'use client'

import { useAppSelector } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, status } = useAppSelector((state) => state.auth)
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        if (status === 'succeeded' && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, status, router])

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
                    <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Torii Loading...</div>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
            {/* Zen Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/[0.03] rounded-full blur-[140px] animate-pulse duration-[8s]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-primary/[0.02] rounded-full blur-[120px] animate-pulse duration-[10s]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-primary/[0.04] rounded-full blur-[100px]" />
            </div>

            <DashboardHeader isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

            <div className="flex relative z-10 container mx-auto">
                <DashboardSidebar isCollapsed={isCollapsed} />
                <main className={cn(
                    "flex-1 min-h-[calc(100vh-4rem)] relative transition-all duration-300",
                    isCollapsed ? "lg:ml-20" : "lg:ml-72"
                )}>
                    <div className="w-full h-full pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
