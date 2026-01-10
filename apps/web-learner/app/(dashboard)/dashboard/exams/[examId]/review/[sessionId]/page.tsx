'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { ArrowLeft, FileText } from 'lucide-react'
import { PageLoading } from '@workspace/ui/components/page-loading'

export default function ExamReviewPage() {
    const params = useParams()
    const router = useRouter()
    const examId = params.examId as string
    const sessionId = params.sessionId as string
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // TODO: Fetch exam session review data
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)
        return () => clearTimeout(timer)
    }, [examId, sessionId])

    if (loading) {
        return <PageLoading text="Analyzing Performance Metrics..." className="h-screen" />
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/exams/${examId}`}>
                        <Button variant="ghost" size="icon" className="rounded-xl size-10 bg-background/50 backdrop-blur-md border border-white/5 hover:bg-white/10 hover:text-primary transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-foreground flex items-center gap-3">
                            Performance Review
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            Session {sessionId.substring(0, 8)}... | Exam {examId.substring(0, 8)}...
                        </p>
                    </div>
                </div>
            </div>

            {/* Content placeholder */}
            <div className="flex flex-col items-center justify-center space-y-6 py-20 border border-dashed border-white/10 rounded-[3rem] bg-white/5">
                <div className="p-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/20 animate-pulse">
                    <FileText className="size-16" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tight italic text-foreground">Detailed Analysis Pending</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        This module is under construction. Full session analytics will be available in the next cycle.
                    </p>
                </div>
                <Button onClick={() => router.push(`/dashboard/exams/${examId}`)} className="rounded-xl px-8 uppercase font-black tracking-widest">
                    Return to Exam Overview
                </Button>
            </div>
        </div>
    )
}
