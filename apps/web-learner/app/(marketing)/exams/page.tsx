'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Search, Filter, Inbox, Sparkles, SlidersHorizontal, ChevronRight } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';

import { ExamStats } from "@/components/exams/exam-stats"
import { ExamCard } from "@/components/exams/exam-card"
import { ExamHistory } from "@/components/exams/exam-history"
import { getExams } from "@/apis/services/exam-api"
import type { ExamWithStatusResponseDTO, ExamQueryDTO, QuestionJlptLevel } from '@workspace/schemas'
import { ExamType, ExamStatus } from '@workspace/schemas'
import { cn } from '@workspace/ui/lib/utils'

function transformExamToCardProps(exam: ExamWithStatusResponseDTO) {
    const status = exam.sessionStatus === 'in-progress' ? 'in-progress' as const
        : exam.sessionStatus === 'submitted' ? 'completed' as const
            : 'new' as const

    const type = exam.examType === 'practice' ? 'Full Test' as const : 'Full Test' as const

    return {
        id: exam.id,
        title: exam.title,
        level: exam.jlptLevel as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
        type,
        duration: exam.totalTime,
        totalQuestions: exam.totalQuestions,
        status,
        score: exam.score,
        maxScore: exam.maxScore,
        progress: exam.progress,
        sessionId: exam.sessionId,
        lastAttemptDate: exam.lastAttemptDate
            ? (typeof exam.lastAttemptDate === 'string'
                ? exam.lastAttemptDate
                : exam.lastAttemptDate.toISOString())
            : undefined,
    }
}

export default function ExamPage() {
    const [activeTab, setActiveTab] = useState("available")
    const [exams, setExams] = useState<ExamWithStatusResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLevel, setSelectedLevel] = useState<string>('Tất cả')
    const [selectedType, setSelectedType] = useState<string | null>(null)

    useEffect(() => {
        async function loadExams() {
            try {
                setLoading(true)
                const query: ExamQueryDTO = {
                    page: 1,
                    limit: 100,
                    status: ExamStatus.PUBLISHED,
                }

                if (selectedLevel !== 'Tất cả') {
                    query.jlptLevel = selectedLevel as QuestionJlptLevel
                }

                if (selectedType) {
                    query.examType = selectedType === 'Bài thi thực tế' ? ExamType.PRACTICE : ExamType.PRACTICE
                }

                if (searchQuery.trim()) {
                    query.search = searchQuery.trim()
                }

                const response = await getExams(query)
                const exams = response.data || []

                if (exams.length === 0 && query.status === ExamStatus.PUBLISHED) {
                    const queryWithoutStatus = { ...query }
                    delete queryWithoutStatus.status
                    const fallbackResponse = await getExams(queryWithoutStatus)
                    setExams(fallbackResponse.data || [])
                } else {
                    setExams(exams)
                }
            } catch (error) {
                console.error('Error loading exams:', error)
                setExams([])
            } finally {
                setLoading(false)
            }
        }

        loadExams()
    }, [selectedLevel, selectedType, searchQuery])

    const handleSearch = (value: string) => {
        setSearchQuery(value)
    }

    const levels = ['Tất cả', 'N5', 'N4', 'N3', 'N2', 'N1']
    const types = ['Bài thi thực tế', 'Đề thi rút gọn']

    return (
        <div className="min-h-screen bg-background py-24 selection:bg-primary/10 selection:text-primary">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-20 space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <Sparkles className="w-3 h-3" />
                        <span>Đấu trường Thử thách</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-[0.8] mb-6">
                        Luyện thi <span className="text-primary not-italic">JLPT</span>
                    </h1>
                    <p className="text-xl text-muted-foreground/60 font-bold max-w-2xl">
                        Hệ thống đề thi mô phỏng thực tế với công nghệ chấm điểm AI chính xác nhất hiện nay.
                    </p>
                </div>

                {/* Overview Stats */}
                <ExamStats />

                {/* Main Content Area */}
                <Tabs defaultValue="available" className="space-y-12" onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-border/40 pb-8">
                        <TabsList className="bg-transparent h-auto p-0 gap-8">
                            <TabsTrigger
                                value="available"
                                className="px-0 py-2 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary text-xl font-black uppercase tracking-tight text-muted-foreground/40 border-b-2 border-transparent data-[state=active]:border-primary transition-all rounded-none"
                            >
                                Đề thi có sẵn
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="px-0 py-2 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary text-xl font-black uppercase tracking-tight text-muted-foreground/40 border-b-2 border-transparent data-[state=active]:border-primary transition-all rounded-none"
                            >
                                Lịch sử luyện tập
                            </TabsTrigger>
                        </TabsList>

                        {activeTab === 'available' && (
                            <div className="flex w-full md:w-auto gap-4">
                                <div className="relative group flex-1 md:w-[320px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                                    <Input
                                        placeholder="Tìm tên đề thi..."
                                        className="h-14 pl-12 pr-6 rounded-2xl bg-muted/20 border-border/40 focus:bg-background focus:ring-0 text-sm font-bold transition-all"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" className="h-14 w-14 rounded-2xl border-border/40 hover:bg-muted active:scale-95 transition-all">
                                    <SlidersHorizontal className="w-5 h-5 text-muted-foreground/40" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <TabsContent value="available" className="space-y-12 outline-none">
                        {/* Quick Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mr-2 flex items-center gap-2">
                                <Filter className="w-3 h-3" />
                                Bộ lọc:
                            </div>
                            {levels.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level)}
                                    className={cn(
                                        "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer",
                                        selectedLevel === level
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "bg-muted/30 text-muted-foreground/60 hover:bg-muted/50"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                            <div className="w-px h-6 bg-border/40 mx-3 hidden md:block" />
                            {types.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                                    className={cn(
                                        "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer",
                                        selectedType === type
                                            ? "bg-foreground text-background"
                                            : "bg-muted/30 text-muted-foreground/60 hover:bg-muted/50"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Exam Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[4/3] rounded-[2.5rem] bg-muted/20 animate-pulse border border-border/20" />
                                ))}
                            </div>
                        ) : exams.length === 0 ? (
                            <div className="flex justify-center py-24 px-6 rounded-[2.5rem] bg-muted/10 border border-border/40">
                                <Empty className="max-w-md">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon" className="bg-background shadow-xl"><Inbox className="text-primary w-8 h-8" /></EmptyMedia>
                                        <EmptyTitle className="text-xl font-black tracking-tight uppercase">Không có đề thi phù hợp</EmptyTitle>
                                        <EmptyDescription className="font-bold text-muted-foreground/60">
                                            Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để khám phá thêm nhiều thử thách.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {exams.map((exam) => (
                                    <ExamCard key={exam.id} {...transformExamToCardProps(exam)} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="outline-none">
                        <ExamHistory />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
