'use client'

import * as React from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageLoading } from '@workspace/ui/components/page-loading'

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
        return <PageLoading className="min-h-screen" />
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-4xl h-full overflow-hidden">
                {children}
            </div>
        </div>
    )
}
