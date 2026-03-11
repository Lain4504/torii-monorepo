'use client'

import * as React from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { SidebarInset, SidebarProvider } from '@workspace/ui/components/sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, status } = useAppSelector((state) => state.auth)
    const [hasMounted, setHasMounted] = useState(false)
    const router = useRouter()
    const [mounted, setMounted] = React.useState(false)

    useEffect(() => {

        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && status === 'succeeded' && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, status, router, mounted])

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

    if (!isAuthenticated) {
        return null
    }

    return (
    <SidebarProvider>
      {/* <style jsx global>{`
        .nhai-blueprint-bg {
          background-color: #dbeafe;
          background-image:
            linear-gradient(to right, rgba(0, 132, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 132, 255, 0.08) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style> */}
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto scrollbar-none nhai-blueprint-bg">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
    )
}
