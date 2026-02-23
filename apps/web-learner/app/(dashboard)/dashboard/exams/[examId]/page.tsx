'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, Clock, FileText, Play, History } from 'lucide-react'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { useExamById, useExamSessions } from '@/lib/api/services/exam-api'
import { useMemo } from 'react'
import { formatDate } from '@/utils/format-utils'
import { ExamSessionStatus } from '@workspace/schemas'

export default function ExamDetailPage() {
    const params = useParams()
    const router = useRouter()
    const examId = params.examId as string

    const { data: exam, isLoading: examLoading, error: examError } = useExamById(examId)
    const { data: sessionsData, isLoading: sessionsLoading } = useExamSessions(examId, { page: 1, limit: 10 })

    const isLoading = examLoading || sessionsLoading
    const sessions = sessionsData?.data || []

    const bestScore = useMemo(() => {
        if (sessions.length === 0) return null
        const scores = sessions
            .filter((s: any) => s.score !== undefined && s.maxScore !== undefined)
            .map((s: any) => (s.score / s.maxScore) * 100)
        return scores.length > 0 ? Math.max(...scores) : null
    }, [sessions])

    if (isLoading) {
        return <PageLoading text="Đang tải dữ liệu bài thi..." className="h-[80vh]" />
    }

    if (examError || !exam) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <FileText className="size-12 text-muted-foreground/30" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Không tìm thấy dữ liệu bài thi</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/exams">
                        <Button variant="ghost" size="icon" className="rounded-xl size-10 bg-background/50 backdrop-blur-md border border-white/5 hover:bg-white/10 hover:text-primary transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                                Trình độ {exam.jlptLevel || 'N/A'}
                            </Badge>
                            {bestScore !== null && (
                                <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                                    Kết quả tốt nhất: {Math.round(bestScore)}%
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-foreground flex items-center gap-3">
                            {exam.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-background/40 backdrop-blur-xl border-white/5 shadow-2xl rounded-[2rem] overflow-hidden">
                        <CardHeader className="border-b border-white/5 p-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Mô tả bài thi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <p className="text-lg text-muted-foreground font-sans leading-relaxed">
                                {exam.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button
                            size="lg"
                            className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/40"
                            onClick={() => router.push(`/dashboard/exams/${examId}/take`)}
                        >
                            <Play className="mr-3 w-5 h-5" />
                            Bắt đầu làm bài
                        </Button>
                        {sessions.length > 0 && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 px-8 rounded-2xl border-white/10 bg-background/50 hover:bg-white/5 font-black uppercase tracking-[0.2em] text-xs hover:text-primary transition-all"
                                onClick={() => router.push(`/dashboard/exams/${examId}/history`)}
                            >
                                <History className="mr-3 w-5 h-5" />
                                Lịch sử
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                        <Card className="bg-background/60 backdrop-blur-xl border-white/5 rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-2 group hover:border-primary/20 transition-all">
                            <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-foreground tracking-tight">{exam.totalQuestions}</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Câu hỏi</div>
                        </Card>

                        <Card className="bg-background/60 backdrop-blur-xl border-white/5 rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-2 group hover:border-primary/20 transition-all">
                            <div className="size-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-2 group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black text-foreground tracking-tight">{exam.totalTime || 0}p</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Thời gian</div>
                        </Card>
                    </div>

                    {/* Exam History - Mini */}
                    {sessions.length > 0 && (
                        <Card className="bg-background/40 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden">
                            <CardHeader className="border-b border-white/5 p-6">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic flex items-center gap-2">
                                    <History className="w-4 h-4" />
                                    Hoạt động gần đây
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/5">
                                    {sessions
                                        .filter((s: any) => s.status === ExamSessionStatus.SUBMITTED || s.status === ExamSessionStatus.COMPLETED)
                                        .slice(0, 3)
                                        .map((session: any) => {
                                            const percentage = session.score !== undefined && session.maxScore !== undefined
                                                ? Math.round((session.score / session.maxScore) * 100)
                                                : null
                                            const isPassed = percentage !== null && percentage >= 60 // Assuming 60% is passing

                                            return (
                                                <div
                                                    key={session.id}
                                                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer"
                                                    onClick={() => router.push(`/dashboard/exams/${examId}/review/${session.id}`)}
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-foreground">
                                                                {percentage !== null ? `${percentage}%` : 'N/A'}
                                                            </span>
                                                            {isPassed && (
                                                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0 text-[8px] font-black uppercase tracking-wider">
                                                                    Đạt
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                                                            {session.submittedAt
                                                                ? formatDate(session.submittedAt)
                                                                : session.startedAt
                                                                    ? formatDate(session.startedAt)
                                                                    : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Play className="w-3 h-3 ml-0.5" />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

