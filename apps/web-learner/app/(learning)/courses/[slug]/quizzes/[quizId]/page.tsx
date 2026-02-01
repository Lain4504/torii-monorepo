'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { ArrowLeft } from 'lucide-react'

export default function TakeCourseQuizPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const quizId = params.quizId as string
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // TODO: Fetch quiz data
        setLoading(false)
    }, [slug, quizId])

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
            <div className="border-b border-border bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${slug}/quizzes`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Bài kiểm tra</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            Nội dung bài kiểm tra sẽ được hiển thị tại đây
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Khóa học: {slug} | Bài kiểm tra: {quizId}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

