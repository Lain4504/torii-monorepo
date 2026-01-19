'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowLeft, FileText, CheckCircle2, XCircle, Clock, Award } from 'lucide-react'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { useAttemptDetails } from '@/apis/services/exam-api'
import { format } from 'date-fns'

export default function ExamReviewPage() {
    const params = useParams()
    const router = useRouter()
    const examId = params.examId as string
    const sessionId = params.sessionId as string

    const { data: reviewData, isLoading, error } = useAttemptDetails(sessionId)

    if (isLoading) {
        return <PageLoading text="Analyzing Performance Metrics..." className="h-screen" />
    }

    if (error || !reviewData) {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/exams/${examId}`}>
                            <Button variant="ghost" size="icon" className="rounded-xl size-10 bg-background/50 backdrop-blur-md border border-white/5 hover:bg-white/10 hover:text-primary transition-all">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center space-y-6 py-20 border border-dashed border-white/10 rounded-[3rem] bg-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Review data not found</p>
                    <Button onClick={() => router.push(`/dashboard/exams/${examId}`)} className="rounded-xl px-8 uppercase font-black tracking-widest">
                        Return to Exam Overview
                    </Button>
                </div>
            </div>
        )
    }

    const percentage = reviewData.percentage !== undefined ? Math.round(reviewData.percentage) : null
    const isPassed = (reviewData.isPassed !== undefined && reviewData.isPassed !== null) ? reviewData.isPassed : (percentage !== null && percentage >= 60)
    const details = reviewData.details || []

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
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
                            {reviewData.quizTitle || 'Exam Review'} | Session {sessionId.substring(0, 8)}...
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <Card className="bg-background/40 backdrop-blur-xl border-white/5 shadow-2xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className={`size-16 rounded-full flex items-center justify-center ${isPassed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                                {percentage !== null ? (
                                    <span className="text-2xl font-black">{percentage}%</span>
                                ) : (
                                    <span className="text-2xl font-black">N/A</span>
                                )}
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Score</div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="size-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <span className="text-2xl font-black">
                                    {reviewData.score !== undefined ? reviewData.score : 'N/A'}
                                </span>
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Points</div>
                            {reviewData.maxScore !== undefined && (
                                <div className="text-[8px] text-muted-foreground/40">of {reviewData.maxScore}</div>
                            )}
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="size-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Clock className="size-8" />
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Time Taken</div>
                            {reviewData.timeTakenSeconds !== undefined && (
                                <div className="text-[8px] text-muted-foreground/40">
                                    {Math.round(reviewData.timeTakenSeconds / 60)}m
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className={`size-16 rounded-full flex items-center justify-center ${isPassed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                                {isPassed ? <Award className="size-8" /> : <XCircle className="size-8" />}
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Status</div>
                            <Badge variant={isPassed ? 'default' : 'destructive'} className="text-[8px] font-black uppercase">
                                {isPassed ? 'PASSED' : 'FAILED'}
                            </Badge>
                        </div>
                    </div>

                    {reviewData.submittedAt && (
                        <div className="mt-6 pt-6 border-t border-white/5 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                Submitted: {format(new Date(reviewData.submittedAt), 'dd MMM yyyy, HH:mm')}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Questions Review */}
            {details.length > 0 && (
                <Card className="bg-background/40 backdrop-blur-xl border-white/5 shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-white/5 p-6">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Question Review ({details.length} questions)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {details.map((detail: any, index: number) => (
                                <div key={detail.id || index} className="p-6 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-muted-foreground/40">#{index + 1}</span>
                                                {detail.isCorrect ? (
                                                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0 text-[8px] font-black uppercase tracking-wider gap-1">
                                                        <CheckCircle2 className="size-3" />
                                                        Correct
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 text-[8px] font-black uppercase tracking-wider gap-1">
                                                        <XCircle className="size-3" />
                                                        Incorrect
                                                    </Badge>
                                                )}
                                                <span className="text-[9px] font-bold text-muted-foreground/60">
                                                    {detail.pointsEarned} / {detail.pointsEarned + (detail.isCorrect ? 0 : detail.pointsEarned)} points
                                                </span>
                                            </div>
                                            <p className="text-base font-medium text-foreground leading-relaxed">
                                                {detail.questionText}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pl-4 border-l-2 border-white/5">
                                        {detail.options && typeof detail.options === 'object' && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Options:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {Object.entries(detail.options).map(([key, value]: [string, any]) => (
                                                        <div
                                                            key={key}
                                                            className={`p-2 rounded-lg text-sm ${detail.userAnswer === key
                                                                    ? detail.isCorrect
                                                                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                                                                        : 'bg-destructive/10 border border-destructive/20 text-destructive'
                                                                    : detail.correctAnswer === key && !detail.isCorrect
                                                                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-500'
                                                                        : 'bg-white/5 border border-white/5 text-muted-foreground'
                                                                }`}
                                                        >
                                                            <span className="font-bold mr-2">{key}:</span>
                                                            {value}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Your Answer:</p>
                                            <p className={`text-sm font-medium ${detail.isCorrect ? 'text-emerald-500' : 'text-destructive'}`}>
                                                {detail.userAnswer || 'No answer provided'}
                                            </p>
                                        </div>

                                        {detail.correctAnswer !== undefined && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Correct Answer:</p>
                                                <p className="text-sm font-medium text-blue-500">
                                                    {detail.correctAnswer}
                                                </p>
                                            </div>
                                        )}

                                        {detail.explanation && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Explanation:</p>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {detail.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    onClick={() => router.push(`/dashboard/exams/${examId}`)}
                    className="rounded-xl px-8 uppercase font-black tracking-widest"
                >
                    Return to Exam Overview
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/exams/${examId}/history`)}
                    className="rounded-xl px-8 uppercase font-black tracking-widest"
                >
                    View All Attempts
                </Button>
            </div>
        </div>
    )
}
