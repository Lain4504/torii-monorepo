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
import { PageLoading } from '@workspace/ui/components/page-loading'

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
        return <PageLoading className="min-h-screen" />
    }

    const layoutContent = (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="min-w-0 overflow-x-hidden">
                <DashboardHeader
                    onOpenStreakModal={() => setStreakModalOpen(true)}
                    isGuest={!isAuthenticated}
                />
                <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
                    <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 md:px-6 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
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
