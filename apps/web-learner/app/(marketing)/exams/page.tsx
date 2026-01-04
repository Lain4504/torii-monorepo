'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Search, Filter } from "lucide-react"

import { ExamStats } from "@/components/exams/exam-stats"
import { ExamCard } from "@/components/exams/exam-card"
import { ExamHistory } from "@/components/exams/exam-history"

// Mock Data
const MOCK_EXAMS = [
    {
        id: "1",
        title: "JLPT N5 Full Test 2024 - Đề số 1",
        level: "N5" as const,
        type: "Full Test" as const,
        duration: 105,
        totalQuestions: 100,
        status: "new" as const,
    },
    {
        id: "2",
        title: "JLPT N4 Mock Test - Listening Special",
        level: "N4" as const,
        type: "Mini Test" as const,
        duration: 45,
        totalQuestions: 30,
        status: "in-progress" as const,
        progress: 65,
    },
    {
        id: "3",
        title: "JLPT N3 Grammar Challenge",
        level: "N3" as const,
        type: "Mini Test" as const,
        duration: 30,
        totalQuestions: 25,
        status: "completed" as const,
        score: 22,
        maxScore: 25,
    },
    {
        id: "4",
        title: "JLPT N5 Official Practice Workbook",
        level: "N5" as const,
        type: "Full Test" as const,
        duration: 100,
        totalQuestions: 95,
        status: "new" as const,
    },
    {
        id: "5",
        title: "JLPT N2 Reading Comprehension",
        level: "N2" as const,
        type: "Mini Test" as const,
        duration: 60,
        totalQuestions: 15,
        status: "new" as const,
    },
    {
        id: "6",
        title: "JLPT N1 Advanced Vocabulary",
        level: "N1" as const,
        type: "Mini Test" as const,
        duration: 40,
        totalQuestions: 50,
        status: "new" as const,
    }
]

export default function ExamPage() {
    const [activeTab, setActiveTab] = useState("available")

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
                            {['Tất cả', 'N5', 'N4', 'N3', 'N2', 'N1'].map((filter, i) => (
                                <Button
                                    key={filter}
                                    variant={i === 0 ? "default" : "outline"}
                                    size="sm"
                                    className={i === 0 ? "bg-slate-900 text-white" : "text-slate-600 bg-white"}
                                >
                                    {filter}
                                </Button>
                            ))}
                            <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block" />
                            {['Full Test', 'Mini Test'].map((filter) => (
                                <Button key={filter} variant="outline" size="sm" className="bg-white text-slate-600">
                                    {filter}
                                </Button>
                            ))}
                        </div>

                        {/* Exam Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_EXAMS.map((exam) => (
                                <ExamCard key={exam.id} {...exam} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <ExamHistory />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
