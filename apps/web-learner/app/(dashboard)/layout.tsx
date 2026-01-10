'use client'

import { useAppSelector } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

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
        <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
            {/* Soft Background Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <DashboardHeader />

            <div className="flex relative z-10 container mx-auto">
                <DashboardSidebar />
                <main className="flex-1 lg:ml-72 min-h-[calc(100vh-4rem)] relative">
                    <div className="w-full h-full pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
