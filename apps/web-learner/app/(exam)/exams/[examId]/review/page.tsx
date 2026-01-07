'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@workspace/ui/components/button"
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"
import { Menu, X, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

import { QuestionArea, Question } from "@/components/exams/take/question-area"
import { QuestionNavigator } from "@/components/exams/take/question-navigator"
// Review page - API removed, showing placeholder

// Transform API question to component Question format (with review info)
function transformQuestion(apiQuestion: any, index: number): Question & { 
    correctAnswer?: string
    userAnswer?: string
    isCorrect?: boolean
    explanation?: string
} {
    const options = apiQuestion.options ? Object.entries(apiQuestion.options).map(([key, value]) => ({
        id: key,
        label: value as string,
    })) : [];

    return {
        id: apiQuestion.id,
        content: apiQuestion.questionText,
        type: apiQuestion.section === 'listening' ? 'listening' : apiQuestion.section === 'reading' ? 'reading' : 'single',
        audioUrl: apiQuestion.audioUrl,
        options,
        correctAnswer: apiQuestion.correctAnswer,
        userAnswer: apiQuestion.userAnswer,
        isCorrect: apiQuestion.isCorrect,
        explanation: apiQuestion.explanation,
    };
}

export default function ReviewExamPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const examId = params.examId as string
    const sessionId = searchParams.get('sessionId')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [examTitle, setExamTitle] = useState('')
    const [questions, setQuestions] = useState<(Question & { correctAnswer?: string; userAnswer?: string; isCorrect?: boolean; explanation?: string })[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [score, setScore] = useState<number | null>(null)
    const [maxScore, setMaxScore] = useState<number | null>(null)
    const [passed, setPassed] = useState<boolean | null>(null)

    // Review API removed - showing placeholder
    useEffect(() => {
        setLoading(false)
        setError('Review feature is not available')
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Đang tải kết quả...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => router.push('/exams')}>Quay lại</Button>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Không có câu hỏi nào</p>
                    <Button onClick={() => router.push('/exams')}>Quay lại</Button>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentQuestionIndex]

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/exams" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <X className="w-6 h-6" />
                    </Link>
                    <div className="hidden sm:block font-bold text-lg text-slate-900 dark:text-white">
                        {examTitle}
                    </div>
                </div>

                {/* Score Display */}
                {score !== null && maxScore !== null && (
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "text-lg font-bold",
                            passed ? "text-green-600" : "text-red-600"
                        )}>
                            {score}/{maxScore}
                        </div>
                        {passed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                        )}
                    </div>
                )}

                <Button
                    onClick={() => router.push('/exams')}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                    Quay lại
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
                                questions={questions}
                                currentIndex={currentQuestionIndex}
                                answers={questions.reduce((acc, q) => {
                                    if (q.userAnswer) acc[q.id] = q.userAnswer
                                    return acc
                                }, {} as Record<string, string>)}
                                flags={new Set()}
                                onSelect={setCurrentQuestionIndex}
                            />
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <QuestionNavigator
                        questions={questions}
                        currentIndex={currentQuestionIndex}
                        answers={questions.reduce((acc, q) => {
                            if (q.userAnswer) acc[q.id] = q.userAnswer
                            return acc
                        }, {} as Record<string, string>)}
                        flags={new Set()}
                        onSelect={setCurrentQuestionIndex}
                    />
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 pb-24 lg:pb-12 bg-white dark:bg-slate-950">
                    {currentQuestion && (
                        <div className="space-y-6">
                            {/* Review Mode Indicator */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Chế độ xem lại:</strong> Bạn đang xem kết quả bài thi đã nộp. 
                                    {currentQuestion.isCorrect ? (
                                        <span className="text-green-600 dark:text-green-400 ml-2">✓ Đúng</span>
                                    ) : (
                                        <span className="text-red-600 dark:text-red-400 ml-2">✗ Sai</span>
                                    )}
                                </p>
                            </div>

                            {/* Question Area with Review Info */}
                            <div className="space-y-4">
                                <QuestionArea
                                    question={currentQuestion}
                                    selectedOption={currentQuestion.userAnswer || undefined}
                                    isFlagged={false}
                                    onAnswer={() => {}} // Disabled in review mode
                                    onFlag={() => {}} // Disabled in review mode
                                    onNext={() => {
                                        if (currentQuestionIndex < questions.length - 1) {
                                            setCurrentQuestionIndex(prev => prev + 1)
                                        }
                                    }}
                                    onPrev={() => {
                                        if (currentQuestionIndex > 0) {
                                            setCurrentQuestionIndex(prev => prev - 1)
                                        }
                                    }}
                                    isFirst={currentQuestionIndex === 0}
                                    isLast={currentQuestionIndex === questions.length - 1}
                                />

                                {/* Answer Review Section */}
                                <div className="mt-6 space-y-4">
                                    {currentQuestion.userAnswer && (
                                        <div className={cn(
                                            "p-4 rounded-lg border-2",
                                            currentQuestion.isCorrect
                                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                        )}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {currentQuestion.isCorrect ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                                <span className={cn(
                                                    "font-semibold",
                                                    currentQuestion.isCorrect
                                                        ? "text-green-700 dark:text-green-300"
                                                        : "text-red-700 dark:text-red-300"
                                                )}>
                                                    {currentQuestion.isCorrect ? 'Đáp án đúng' : 'Đáp án sai'}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-slate-600 dark:text-slate-400">Đáp án của bạn: </span>
                                                    <span className="font-medium">{currentQuestion.userAnswer}</span>
                                                </div>
                                                {!currentQuestion.isCorrect && currentQuestion.correctAnswer && (
                                                    <div>
                                                        <span className="text-slate-600 dark:text-slate-400">Đáp án đúng: </span>
                                                        <span className="font-medium text-green-600 dark:text-green-400">{currentQuestion.correctAnswer}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {currentQuestion.explanation && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Giải thích:</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{currentQuestion.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}








