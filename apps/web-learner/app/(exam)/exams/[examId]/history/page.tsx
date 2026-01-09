'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, History, Award, Eye } from 'lucide-react'

export default function ExamHistoryPage() {
    const params = useParams()
    const router = useRouter()
    const examId = params.examId as string
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // TODO: Fetch exam history
        setSessions([
            {
                id: '1',
                score: 85,
                completedAt: new Date().toISOString(),
                status: 'completed',
            },
            {
                id: '2',
                score: 72,
                completedAt: new Date(Date.now() - 86400000).toISOString(),
                status: 'completed',
            },
        ])
        setLoading(false)
    }, [examId])

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
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/exams/${examId}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <History className="w-5 h-5" />
                                Lịch sử làm bài
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">Chưa có lịch sử làm bài</p>
                            </CardContent>
                        </Card>
                    ) : (
                        sessions.map((session) => (
                            <Card key={session.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg bg-muted">
                                                <History className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-foreground">
                                                        Điểm: {session.score}%
                                                    </span>
                                                    {session.score >= 60 && (
                                                        <Badge variant="default">
                                                            <Award className="w-3 h-3 mr-1" />
                                                            Đạt
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(session.completedAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push(`/exams/${examId}/review/${session.id}`)}
                                        >
                                            <Eye className="mr-2 w-4 h-4" />
                                            Xem lại
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

