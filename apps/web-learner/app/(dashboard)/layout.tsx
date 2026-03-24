'use client'

import * as React from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { SidebarInset, SidebarProvider } from '@workspace/ui/components/sidebar'
import { StreakWelcomeModal } from '@/components/dashboard/streak-welcome-modal'
import { GuestActionGuard } from '@/components/auth/guest-action-guard'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, status, user } = useAppSelector((state) => state.auth)
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = React.useState(false)
    const [streakModalOpen, setStreakModalOpen] = React.useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && status === 'succeeded' && isAuthenticated && user && !user.isOnboarded) {
            router.push('/onboarding')
        }
    }, [isAuthenticated, status, user, router, mounted])

    // Delay rendering logic until after hydration to avoid mismatch
    if (!mounted || status === 'loading') {

        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-700">
                    <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Torii Loading...</div>
                </div>
            </div>
        )
    }

    const layoutContent = (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardHeader
                    onOpenStreakModal={() => setStreakModalOpen(true)}
                    isGuest={!isAuthenticated}
                />
                <main className="flex-1 overflow-y-auto scrollbar-none">
                    <div className="max-w-[1600px] mx-auto px-2 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                        {children}
                    </div>
                </main>
                <StreakWelcomeModal open={streakModalOpen} onOpenChange={setStreakModalOpen} />
            </SidebarInset>
        </SidebarProvider>
    )

    const isGuestDashboardHome = pathname === '/dashboard' || pathname === '/dashboard/'

    if (!isAuthenticated && !isGuestDashboardHome) {
        return <GuestActionGuard>{layoutContent}</GuestActionGuard>
    }

    return layoutContent
}
