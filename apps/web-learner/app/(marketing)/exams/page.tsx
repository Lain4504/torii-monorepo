'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Search, Inbox, SlidersHorizontal } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import { Separator } from '@workspace/ui/components/separator'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'

import { ExamStats } from "@/components/exams/exam-stats"
import { ExamCard } from "@/components/exams/exam-card"
import { ExamHistory } from "@/components/exams/exam-history"
import { getExams } from "@/lib/api/services/exam-api"
import type { ExamWithStatusResponseDTO, ExamQueryDTO, QuestionJlptLevel } from '@workspace/schemas'
import { ExamType, ExamStatus } from '@workspace/schemas'

function transformExamToCardProps(exam: ExamWithStatusResponseDTO) {
    const status = exam.sessionStatus === 'in-progress' ? 'in-progress' as const
        : exam.sessionStatus === 'submitted' ? 'completed' as const
            : 'new' as const

    return {
        id: exam.id,
        title: exam.title,
        level: exam.jlptLevel as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
        type: 'Full Test' as const,
        duration: exam.totalTime,
        totalQuestions: exam.totalQuestions,
        status,
        score: exam.score,
        maxScore: exam.maxScore,
        progress: exam.progress,
        sessionId: exam.sessionId,
        lastAttemptDate: exam.lastAttemptDate
            ? (typeof exam.lastAttemptDate === 'string' ? exam.lastAttemptDate : exam.lastAttemptDate.toISOString())
            : undefined,
    }
}

const LEVELS = ['Tất cả', 'N5', 'N4', 'N3', 'N2', 'N1']
const TYPES = ['Bài thi thực tế', 'Đề thi rút gọn']

export default function ExamPage() {
    const [activeTab, setActiveTab] = useState("available")
    const [exams, setExams] = useState<ExamWithStatusResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLevel, setSelectedLevel] = useState('Tất cả')
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
                if (selectedLevel !== 'Tất cả') query.jlptLevel = selectedLevel as QuestionJlptLevel
                if (selectedType) query.examType = ExamType.PRACTICE
                if (searchQuery.trim()) query.search = searchQuery.trim()

                const response = await getExams(query)
                const data = response.data || []

                if (data.length === 0) {
                    const { status: _s, ...queryWithoutStatus } = query
                    const fallback = await getExams(queryWithoutStatus)
                    setExams(fallback.data || [])
                } else {
                    setExams(data)
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

    return (
        <div className="min-h-screen bg-background">
            {/* Page Header */}
            <div className="border-b bg-muted/30">
                <div className="container max-w-7xl mx-auto px-4 py-12">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-primary">Đấu trường thử thách</p>
                        <h1 className="text-3xl font-bold tracking-tight">Luyện thi JLPT</h1>
                        <p className="text-muted-foreground max-w-xl">
                            Hệ thống đề thi mô phỏng thực tế với công nghệ chấm điểm AI chính xác nhất hiện nay.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-10 space-y-10">
                {/* Stats */}
                <ExamStats />

                <Separator />

                {/* Tabs + Content */}
                <Tabs defaultValue="available" onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <TabsList>
                            <TabsTrigger value="available">Đề thi có sẵn</TabsTrigger>
                            <TabsTrigger value="history">Lịch sử luyện tập</TabsTrigger>
                        </TabsList>

                        {activeTab === 'available' && (
                            <div className="flex gap-2">
                                <div className="relative flex-1 md:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm tên đề thi..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon">
                                    <SlidersHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <TabsContent value="available" className="space-y-6 mt-6">
                        {/* Level + Type filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            {LEVELS.map((level) => (
                                <Badge
                                    key={level}
                                    variant={selectedLevel === level ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedLevel(level)}
                                >
                                    {level}
                                </Badge>
                            ))}
                            <Separator orientation="vertical" className="h-5 mx-1" />
                            {TYPES.map((type) => (
                                <Badge
                                    key={type}
                                    variant={selectedType === type ? 'secondary' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                                >
                                    {type}
                                </Badge>
                            ))}
                        </div>

                        {/* Exam Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
                                ))}
                            </div>
                        ) : exams.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon"><Inbox className="w-6 h-6" /></EmptyMedia>
                                    <EmptyTitle>Không có đề thi phù hợp</EmptyTitle>
                                    <EmptyDescription>
                                        Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exams.map((exam) => (
                                    <ExamCard key={exam.id} {...transformExamToCardProps(exam)} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <ExamHistory />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
