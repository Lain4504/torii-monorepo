'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@workspace/ui/components/button"
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"
import { Menu, X, ChevronLeft } from "lucide-react"

import { ExamTimer } from "@/components/exams/take/exam-timer"
import { QuestionArea, Question } from "@/components/exams/take/question-area"
import { QuestionNavigator } from "@/components/exams/take/question-navigator"

// Mock Data
const MOCK_QUESTIONS: Question[] = [
    {
        id: "q1",
        type: "single",
        content: "Chọn cách đọc đúng cho từ: 先生",
        options: [
            { id: "a", label: "sen-sei" },
            { id: "b", label: "san-sei" },
            { id: "c", label: "sen-sai" },
            { id: "d", label: "san-sai" }
        ]
    },
    {
        id: "q2",
        type: "listening",
        content: "Người đàn ông đang nói về cái gì?",
        audioUrl: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg", // Mock audio
        options: [
            { id: "a", label: "Thời gian họp" },
            { id: "b", label: "Lịch trình tàu" },
            { id: "c", label: "Giờ ăn trưa" },
            { id: "d", label: "Cuộc hẹn nha sĩ" }
        ]
    },
    {
        id: "q3",
        type: "reading",
        content: "Tác giả muốn nói điều gì nhất?",
        readingPassage: "Mùa hè ở Tokyo rất nóng và ẩm ướt. Nhiều người chọn đi du lịch đến Hokkaido hoặc các vùng núi để tránh nóng. Tuy nhiên, tôi lại thích ở nhà và bật điều hòa mát lạnh, vừa ăn dưa hấu vừa xem phim.",
        options: [
            { id: "a", label: "Mùa hè Tokyo rất dễ chịu" },
            { id: "b", label: "Nên đi du lịch Hokkaido" },
            { id: "c", label: "Tác giả thích ở nhà tận hưởng" },
            { id: "d", label: "Ăn dưa hấu không tốt cho sức khỏe" }
        ]
    },
    {
        id: "q4",
        type: "single",
        content: "Điền từ còn thiếu: 私は毎日コーヒーを___。",
        options: [
            { id: "a", label: "飲みます (nomimasu)" },
            { id: "b", label: "読みます (yomimasu)" },
            { id: "c", label: "食べます (tabemasu)" },
            { id: "d", label: "行きます (ikimasu)" }
        ]
    },
    {
        id: "q5",
        type: "single",
        content: "Từ nào KHÔNG thuộc nhóm động vật?",
        options: [
            { id: "a", label: "犬 (inu)" },
            { id: "b", label: "猫 (neko)" },
            { id: "c", label: "机 (tsukue)" },
            { id: "d", label: "鳥 (tori)" }
        ]
    }
]

export default function TakeExamPage() {
    const router = useRouter()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [flags, setFlags] = useState<Set<string>>(new Set())

    const handleAnswer = (qId: string, optId: string) => {
        setAnswers(prev => ({ ...prev, [qId]: optId }))
    }

    const handleFlag = (qId: string) => {
        const newFlags = new Set(flags)
        if (newFlags.has(qId)) {
            newFlags.delete(qId)
        } else {
            newFlags.add(qId)
        }
        setFlags(newFlags)
    }

    const handleNext = () => {
        if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            // Submit logic
            alert("Nộp bài thành công!")
            router.push('/exams')
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const handleSubmit = () => {
        if (confirm("Bạn có chắc chắn muốn nộp bài sớm không?")) {
            router.push('/exams')
        }
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/exams" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <X className="w-6 h-6" />
                    </Link>
                    <div className="hidden sm:block font-bold text-lg text-slate-900 dark:text-white">
                        JLPT N5 Full Test
                    </div>
                </div>

                <ExamTimer durationMinutes={45} onTimeUp={() => alert("Hết giờ!")} />

                <Button onClick={handleSubmit} variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                    Nộp bài
                </Button>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Mobile Navigator Drawer */}
                <div className="lg:hidden absolute bottom-4 right-4 z-50">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg bg-slate-900 text-white">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 border-l border-slate-200 dark:border-slate-800 w-80">
                            <QuestionNavigator
                                questions={MOCK_QUESTIONS}
                                currentIndex={currentQuestionIndex}
                                answers={answers}
                                flags={flags}
                                onSelect={setCurrentQuestionIndex}
                            />
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <QuestionNavigator
                        questions={MOCK_QUESTIONS}
                        currentIndex={currentQuestionIndex}
                        answers={answers}
                        flags={flags}
                        onSelect={setCurrentQuestionIndex}
                    />
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 pb-24 lg:pb-12 bg-white dark:bg-slate-950">
                    <QuestionArea
                        question={MOCK_QUESTIONS[currentQuestionIndex]!}
                        selectedOption={answers[MOCK_QUESTIONS[currentQuestionIndex]!.id]}
                        isFlagged={flags.has(MOCK_QUESTIONS[currentQuestionIndex]!.id)}
                        onAnswer={handleAnswer}
                        onFlag={handleFlag}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        isFirst={currentQuestionIndex === 0}
                        isLast={currentQuestionIndex === MOCK_QUESTIONS.length - 1}
                    />
                </main>
            </div>
        </div>
    )
}
