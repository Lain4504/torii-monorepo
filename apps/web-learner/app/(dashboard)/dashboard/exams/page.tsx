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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-serif font-bold italic uppercase tracking-wide">
                        <FileText className="size-3.5" />
                        Đánh giá
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Kỳ thi & <span className="text-primary not-italic">Kiểm tra</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Hệ thống đánh giá năng lực và thi thử chuẩn hóa.
                    </p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="TÌM KIẾM BÀI THI..."
                        className="pl-10 h-12 rounded-2xl bg-muted/10 border-border/40 focus:bg-background/80 transition-all font-bold uppercase tracking-wider text-[10px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {filteredExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-[3rem] bg-white/5">
                    <div className="p-6 rounded-full bg-muted/10 mb-6">
                        <FileText className="size-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight italic text-muted-foreground/50">Không tìm thấy bài thi</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-2">Vui lòng điều chỉnh tiêu chí tìm kiếm.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredExams.map((exam) => (
                        <Link href={`/dashboard/exams/${exam.id}`} key={exam.id}>
                            <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 bg-background/50 backdrop-blur-xl border-border/40 rounded-[2rem] h-full flex flex-col shadow-md">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="p-6 space-y-6 relative z-10 flex-1">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className={
                                            `rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-white/10 ${exam.jlptLevel === 'N5' ? 'bg-blue-500/10 text-blue-500' :
                                                exam.jlptLevel === 'N4' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    exam.jlptLevel === 'N3' ? 'bg-amber-500/10 text-amber-500' :
                                                        exam.jlptLevel === 'N2' ? 'bg-purple-500/10 text-purple-500' :
                                                            exam.jlptLevel === 'N1' ? 'bg-red-500/10 text-red-500' :
                                                                'bg-white/5 text-muted-foreground'
                                            }`
                                        }>
                                            {exam.jlptLevel || 'N/A'}
                                        </Badge>

                                        {(exam.sessionStatus === ExamSessionStatus.SUBMITTED || exam.sessionStatus === ExamSessionStatus.COMPLETED) && exam.score !== undefined && (
                                            <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0 text-[8px] font-black uppercase tracking-wider gap-1">
                                                <Trophy className="size-3" />
                                                {exam.maxScore ? `${Math.round((exam.score / exam.maxScore) * 100)}%` : exam.score}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black uppercase italic tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {exam.title}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground/60 line-clamp-2 min-h-[2.5em]">
                                            {exam.description || 'Không có mô tả cho bài thi này.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-muted-foreground/40 pt-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="size-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{exam.totalQuestions || 0} Câu hỏi</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="size-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{exam.totalTime || 0} Phút</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2 relative z-10">
                                    <Button className="w-full h-12 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] bg-muted/20 hover:bg-primary hover:text-primary-foreground text-foreground border border-border/30 transition-all shadow-none hover:shadow-lg hover:shadow-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
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
