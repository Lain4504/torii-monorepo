'use client'

import * as React from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, status, user } = useAppSelector((state) => state.auth)
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && status === 'succeeded' && !isAuthenticated) {
            router.push('/login')
        }
        if (mounted && status === 'succeeded' && isAuthenticated && user?.isOnboarded) {
             router.push('/dashboard')
        }
    }, [isAuthenticated, status, user, router, mounted])

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

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen h-screen bg-background nhai-blueprint-bg flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-4xl h-full overflow-hidden">
                {children}
            </div>
        </div>
    )
}
