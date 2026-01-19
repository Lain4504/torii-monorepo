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
        return <PageLoading text="Loading Examination Protocols..." className="h-[60vh]" />
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                        <FileText className="size-8 text-primary" />
                        Examination Protocols
                    </h1>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] pl-1">
                        Standardized testing & competency assessment modules.
                    </p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="SEARCH PROTOCOLS..."
                        className="pl-10 h-12 rounded-2xl bg-muted/5 border-white/5 focus:bg-background/80 transition-all font-bold uppercase tracking-wider text-[10px]"
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
                    <h3 className="text-xl font-black uppercase tracking-tight italic text-muted-foreground/50">No Protocols Found</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-2">Adjust search parameters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredExams.map((exam) => (
                        <Link href={`/dashboard/exams/${exam.id}`} key={exam.id}>
                            <Card className="group relative overflow-hidden transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 bg-background/40 backdrop-blur-xl border-white/5 rounded-[2rem] h-full flex flex-col">
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
                                            {exam.description || 'No description available'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-muted-foreground/40 pt-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="size-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{exam.totalQuestions || 0} Qs</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="size-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{exam.totalTime || 0} Min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2 relative z-10">
                                    <Button className="w-full h-12 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] bg-white/5 hover:bg-primary hover:text-primary-foreground text-foreground border border-white/5 transition-all shadow-none hover:shadow-lg hover:shadow-primary/20 group-hover:bg-white/10 group-hover:text-primary">
                                        {(exam.sessionStatus === ExamSessionStatus.SUBMITTED || exam.sessionStatus === ExamSessionStatus.COMPLETED) ? (
                                            <>
                                                <History className="mr-2 size-3.5" /> Review Logs
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 size-3.5" /> Initiate
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
