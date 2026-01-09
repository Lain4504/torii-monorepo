'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Award, CheckCircle2, XCircle } from 'lucide-react'

export default function ExamReviewPage() {
    const params = useParams()
    const router = useRouter()
    const examId = params.examId as string
    const sessionId = params.sessionId as string
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // TODO: Fetch exam session review data
        setLoading(false)
    }, [examId, sessionId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/exams/${examId}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Xem lại bài thi</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            Exam review component sẽ được tích hợp ở đây
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Exam: {examId} | Session: {sessionId}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

