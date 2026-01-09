'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Clock, FileText, Play, History, Award } from 'lucide-react'
import { examApi } from '@/api/services/exam-api'

export default function ExamDetailPage() {
    const params = useParams()
    const router = useRouter()
    const examId = params.examId as string
    const [exam, setExam] = useState<any>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // TODO: Fetch exam details from API
                // const examData = await examApi.getExamById(examId)
                // setExam(examData)
                
                // Mock data
                setExam({
                    id: examId,
                    title: 'Đề thi JLPT N5 - Mẫu',
                    description: 'Đề thi mẫu JLPT N5 với đầy đủ các phần: Từ vựng, Ngữ pháp, Đọc hiểu, Nghe hiểu',
                    totalQuestions: 50,
                    timeLimit: 60,
                    passingScore: 60,
                    level: 'N5',
                })

                // TODO: Fetch exam sessions/history
                // const sessionsData = await examApi.getExamSessions(examId)
                // setSessions(sessionsData)
                
                // Mock sessions
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
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (examId) {
            fetchData()
        }
    }, [examId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        )
    }

    if (!exam) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Không tìm thấy đề thi</p>
            </div>
        )
    }

    const bestScore = sessions.length > 0 
        ? Math.max(...sessions.map((s: any) => s.score || 0))
        : null

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/exams">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{exam.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge>{exam.level}</Badge>
                                {bestScore !== null && (
                                    <Badge variant="secondary">
                                        Điểm cao nhất: {bestScore}%
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Số câu hỏi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {exam.totalQuestions}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Thời gian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {exam.timeLimit} phút
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {exam.description && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Mô tả</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{exam.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Exam History */}
                {sessions.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Lịch sử làm bài
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sessions.map((session: any) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground">
                                                    Điểm: {session.score}%
                                                </span>
                                                {session.score >= exam.passingScore && (
                                                    <Badge variant="default">
                                                        <Award className="w-3 h-3 mr-1" />
                                                        Đạt
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {new Date(session.completedAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/exams/${examId}/review/${session.id}`)}
                                        >
                                            Xem lại
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    <Button
                        size="lg"
                        onClick={() => router.push(`/exams/${examId}/take`)}
                    >
                        <Play className="mr-2 w-4 h-4" />
                        Bắt đầu làm bài
                    </Button>
                    {sessions.length > 0 && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.push(`/exams/${examId}/history`)}
                        >
                            <History className="mr-2 w-4 h-4" />
                            Lịch sử
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

