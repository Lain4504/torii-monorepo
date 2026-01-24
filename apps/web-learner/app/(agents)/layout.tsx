'use client'

import { useAppSelector } from '@/hooks/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@workspace/ui/components/button'
import { X } from 'lucide-react'
import Link from 'next/link'

export default function AgentsLayout({
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
                </div>
            </div>
        )
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Zen Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Minimal Header */}
            <header className="relative z-20 w-full p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="font-bold text-xl tracking-tight text-foreground/80 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary">AI</span>
                    </div>
                    Torii Agent
                </div>
                <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard">
                        Exit
                        <X className="w-4 h-4" />
                    </Link>
                </Button>
            </header>

            {/* Main Focused Content */}
            <main className="relative z-10 flex-1 w-full mx-auto flex flex-col">
                <div className="flex-1 w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
