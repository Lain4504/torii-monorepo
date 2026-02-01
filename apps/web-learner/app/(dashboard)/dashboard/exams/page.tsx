'use client'

import { useExams } from '@/apis/services/exam-api'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { FileText, Clock, Trophy, Search, Play, History } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { ExamSessionStatus } from '@workspace/schemas'

export default function ExamsPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: examsData, isLoading } = useExams({
        page: 1,
        limit: 50,
        search: searchQuery || undefined
    })

    const exams = examsData?.data || []

    // Filter exams by search query
    const filteredExams = useMemo(() => {
        if (!searchQuery) return exams
        return exams.filter(e =>
            e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [exams, searchQuery])

    if (isLoading) {
        return <PageLoading text="Đang tải hệ thống thi cử..." className="h-[60vh]" />
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header */}
            <div className="space-y-4 pb-2 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">
                    Kỳ thi & Kiểm tra
                </h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Hệ thống đánh giá năng lực và thi thử chuẩn hóa, giúp bạn chuẩn bị tốt nhất cho các kỳ thi thực tế.
                </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 icon-xs text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm bài thi..."
                        className="pl-9 h-10 rounded-xl bg-background border-input focus:ring-1 focus:ring-primary text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {filteredExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-muted/5">
                    <div className="p-4 rounded-full bg-muted/20 mb-4">
                        <FileText className="size-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Không tìm thấy bài thi</h3>
                    <p className="text-sm text-muted-foreground mt-1">Vui lòng điều chỉnh tiêu chí tìm kiếm.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredExams.map((exam) => (
                        <Link href={`/dashboard/exams/${exam.id}`} key={exam.id}>
                            <Card className="group relative overflow-hidden transition-all hover:shadow-lg bg-card border-border rounded-2xl h-full flex flex-col">
                                <div className="p-6 space-y-6 flex-1">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={
                                            `rounded-md px-2 py-0.5 text-xs font-bold border-border ${exam.jlptLevel === 'N5' ? 'bg-blue-500/10 text-blue-600' :
                                                exam.jlptLevel === 'N4' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    exam.jlptLevel === 'N3' ? 'bg-amber-500/10 text-amber-600' :
                                                        exam.jlptLevel === 'N2' ? 'bg-purple-500/10 text-purple-600' :
                                                            exam.jlptLevel === 'N1' ? 'bg-red-500/10 text-red-600' :
                                                                'bg-muted text-muted-foreground'
                                            }`
                                        }>
                                            {exam.jlptLevel || 'N/A'}
                                        </Badge>

                                        {(exam.sessionStatus === ExamSessionStatus.SUBMITTED || exam.sessionStatus === ExamSessionStatus.COMPLETED) && exam.score !== undefined && (
                                            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 text-xs font-bold gap-1">
                                                <Trophy className="size-3" />
                                                {exam.maxScore ? `${Math.round((exam.score / exam.maxScore) * 100)}%` : exam.score}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {exam.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                                            {exam.description || 'Không có mô tả cho bài thi này.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-muted-foreground text-xs font-medium pt-2 border-t border-border/50 mt-auto">
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="size-3.5" />
                                            <span>{exam.totalQuestions || 0} câu hỏi</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="size-3.5" />
                                            <span>{exam.totalTime || 0} phút</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/20 border-t border-border/50">
                                    <Button className="w-full h-10 rounded-xl text-xs font-bold shadow-sm">
                                        {(exam.sessionStatus === ExamSessionStatus.SUBMITTED || exam.sessionStatus === ExamSessionStatus.COMPLETED) ? (
                                            <>
                                                <History className="mr-2 size-3.5" /> Xem kết quả
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 size-3.5" /> Bắt đầu thi
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
