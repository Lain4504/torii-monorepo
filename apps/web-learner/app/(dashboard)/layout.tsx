'use client'

import { useAppSelector } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { SidebarInset, SidebarProvider } from '@workspace/ui/components/sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, status } = useAppSelector((state) => state.auth)
    const router = useRouter()

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
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
                {/* Zen Ambient Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/[0.03] rounded-full blur-[140px] animate-pulse duration-[8s]" />
                    <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-primary/[0.02] rounded-full blur-[120px] animate-pulse duration-[10s]" />
                    <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-primary/[0.04] rounded-full blur-[100px]" />
                </div>

                <AppSidebar />

                <SidebarInset className="relative z-10 flex flex-col bg-transparent">
                    <DashboardHeader />
                    <main className="flex-1 overflow-y-auto scrollbar-none">
                        <div className="container mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
