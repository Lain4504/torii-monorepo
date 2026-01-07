'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Search, Filter } from "lucide-react"

import { ExamStats } from "@/components/exams/exam-stats"
import { ExamCard } from "@/components/exams/exam-card"
import { ExamHistory } from "@/components/exams/exam-history"
import { getExams } from "@/api/services/exam-api"
import type { ExamWithStatusResponseDTO, ExamQueryDTO, QuestionJlptLevel } from '@workspace/schemas'
import { ExamType, ExamStatus } from '@workspace/schemas'

// Transform API exam data to ExamCard props
function transformExamToCardProps(exam: ExamWithStatusResponseDTO) {
    const status = exam.sessionStatus === 'in-progress' ? 'in-progress' as const
        : exam.sessionStatus === 'submitted' ? 'completed' as const
        : 'new' as const

    // Map examType: practice = Full Test, official = Mini Test (or could be reversed based on business logic)
    // For now, assume practice = Full Test
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
        sessionId: exam.sessionId, // Add sessionId for review/retake
        // lastAttemptDate is already a string from JSON serialization, or Date object
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
                    // Try published first, but if no results, we can remove status filter
                    status: ExamStatus.PUBLISHED,
                }

                if (selectedLevel !== 'Tất cả') {
                    query.jlptLevel = selectedLevel as QuestionJlptLevel
                }

                if (selectedType) {
                    query.examType = selectedType === 'Full Test' ? ExamType.PRACTICE : ExamType.PRACTICE
                }

                if (searchQuery.trim()) {
                    query.search = searchQuery.trim()
                }

                const response = await getExams(query)
                console.log('Exams API response:', response)
                // Response is PaginatedResponse, data is directly in response
                const exams = response.data || []
                console.log('Exams count:', exams.length)
                
                // If no published exams, try without status filter
                if (exams.length === 0 && query.status === ExamStatus.PUBLISHED) {
                    console.log('No published exams found, trying without status filter...')
                    const queryWithoutStatus = { ...query }
                    delete queryWithoutStatus.status
                    const fallbackResponse = await getExams(queryWithoutStatus)
                    setExams(fallbackResponse.data || [])
                } else {
                    setExams(exams)
                }
            } catch (error) {
                console.error('Error loading exams:', error)
                console.error('Error details:', error)
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
    const types = ['Full Test', 'Mini Test']

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Luyện thi JLPT
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Kho đề thi thử và bài tập luyện tập từ N5 đến N1
                    </p>
                </div>

                {/* Overview Stats */}
                <ExamStats />

                {/* Main Content Area */}
                <Tabs defaultValue="available" className="space-y-8" onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                            <TabsTrigger value="available" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/30 dark:data-[state=active]:text-teal-400">
                                Đề thi có sẵn
                            </TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/30 dark:data-[state=active]:text-teal-400">
                                Lịch sử thi
                            </TabsTrigger>
                        </TabsList>

                        {activeTab === 'available' && (
                            <div className="flex w-full md:w-auto gap-2">
                                <div className="relative flex-1 md:w-[300px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm kiếm đề thi..."
                                        className="pl-9 bg-white dark:bg-slate-900"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" className="bg-white dark:bg-slate-900">
                                    <Filter className="w-4 h-4 text-slate-500" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <TabsContent value="available" className="space-y-8">
                        {/* Quick Filters */}
                        <div className="flex flex-wrap gap-2 pb-2">
                            {levels.map((level) => (
                                <Button
                                    key={level}
                                    variant={selectedLevel === level ? "default" : "outline"}
                                    size="sm"
                                    className={selectedLevel === level ? "bg-slate-900 text-white" : "text-slate-600 bg-white"}
                                    onClick={() => setSelectedLevel(level)}
                                >
                                    {level}
                                </Button>
                            ))}
                            <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block" />
                            {types.map((type) => (
                                <Button
                                    key={type}
                                    variant={selectedType === type ? "default" : "outline"}
                                    size="sm"
                                    className={selectedType === type ? "bg-slate-900 text-white" : "bg-white text-slate-600"}
                                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>

                        {/* Exam Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 animate-pulse">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-4"></div>
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : exams.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 dark:text-slate-400">Không tìm thấy đề thi nào</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exams.map((exam) => (
                                    <ExamCard key={exam.id} {...transformExamToCardProps(exam)} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history">
                        <ExamHistory />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
