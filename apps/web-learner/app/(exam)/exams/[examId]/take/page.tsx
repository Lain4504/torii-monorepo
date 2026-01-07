'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@workspace/ui/components/button"
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet"
import { Menu, X } from "lucide-react"

import { ExamTimer } from "@/components/exams/take/exam-timer"
import { QuestionArea, Question } from "@/components/exams/take/question-area"
import { QuestionNavigator } from "@/components/exams/take/question-navigator"
import { startExam, saveExamAnswers, submitExam } from "@/api/services/exam-api"
import type { ExamSessionStartResponseDTO, ExamSessionAnswersDTO } from '@workspace/schemas'

// Type helper for resume data (schema includes these fields but types may not be updated)
type ExamSessionStartResponseWithResume = ExamSessionStartResponseDTO & {
    answers?: Record<string, string>
    flaggedQuestions?: string[]
    currentQuestion?: number
    timeRemaining?: number
}

// Transform API question to component Question format
function transformQuestion(apiQuestion: any, index: number): Question {
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
    };
}

export default function TakeExamPage() {
    const router = useRouter()
    const params = useParams()
    const examId = params.examId as string

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [examTitle, setExamTitle] = useState('')
    const [questions, setQuestions] = useState<Question[]>([])
    const [timeLimit, setTimeLimit] = useState(0) // seconds
    const [timeRemaining, setTimeRemaining] = useState(0) // seconds - current time left
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [flags, setFlags] = useState<Set<string>>(new Set())
    const [currentSection, setCurrentSection] = useState<string | null>(null)

    // Auto-save refs
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastSaveRef = useRef<Record<string, string>>({})
    const lastFlagsRef = useRef<Set<string>>(new Set())

    // Load exam on mount
    useEffect(() => {
        async function loadExam() {
            try {
                setLoading(true)
                const response = await startExam(examId)
                setSessionId(response.sessionId)
                setExamTitle(response.exam.title)
                setTimeLimit(response.timeLimit)
                setCurrentSection(response.sections[0]?.type || null)

                // Transform API questions to component format
                const transformedQuestions = response.questions.map(transformQuestion)
                setQuestions(transformedQuestions)

                // Load existing answers and flags from session (for resume)
                // Response includes optional resume data: answers, flaggedQuestions, currentQuestion, timeRemaining
                const resumeData = response as ExamSessionStartResponseWithResume
                
                if (resumeData.answers && typeof resumeData.answers === 'object') {
                    setAnswers(resumeData.answers)
                } else {
                    setAnswers({})
                }

                if (resumeData.flaggedQuestions && Array.isArray(resumeData.flaggedQuestions) && resumeData.flaggedQuestions.length > 0) {
                    setFlags(new Set(resumeData.flaggedQuestions))
                } else {
                    setFlags(new Set())
                }

                // Resume to last question if available
                if (resumeData.currentQuestion && typeof resumeData.currentQuestion === 'number' && resumeData.currentQuestion > 1) {
                    setCurrentQuestionIndex(resumeData.currentQuestion - 1)
                }

                // Update time limit if resuming (use timeRemaining if available)
                // Always use timeRemaining from server if available (even if 0, it means time is up)
                if (typeof resumeData.timeRemaining === 'number') {
                    // Server calculated timeRemaining based on actual elapsed time
                    setTimeRemaining(resumeData.timeRemaining)
                    // Keep original timeLimit for progress calculation, but use timeRemaining for timer
                    setTimeLimit(response.timeLimit)
                } else {
                    // New session - use full time limit
                    setTimeRemaining(response.timeLimit)
                    setTimeLimit(response.timeLimit)
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load exam')
                console.error('Error loading exam:', err)
            } finally {
                setLoading(false)
            }
        }

        if (examId) {
            loadExam()
        }
    }, [examId])

    // Auto-save function
    const autoSave = useCallback(async () => {
        if (!sessionId) return

        const hasChanges =
            JSON.stringify(answers) !== JSON.stringify(lastSaveRef.current) ||
            JSON.stringify(Array.from(flags).sort()) !== JSON.stringify(Array.from(lastFlagsRef.current).sort())

        if (!hasChanges) return

        try {
            // Type assertion: timeRemaining is in schema but type may not be updated
            const saveData = {
                answers,
                flaggedQuestions: Array.from(flags),
                currentSection: currentSection || undefined,
                currentQuestion: currentQuestionIndex + 1,
                timeRemaining: timeRemaining > 0 ? timeRemaining : undefined,
            } as ExamSessionAnswersDTO & { timeRemaining?: number }
            await saveExamAnswers(sessionId, saveData)
            lastSaveRef.current = { ...answers }
            lastFlagsRef.current = new Set(flags)
        } catch (err) {
            console.error('Auto-save failed:', err)
            // Don't show error to user for auto-save failures
        }
    }, [sessionId, answers, flags, currentSection, currentQuestionIndex, timeRemaining])

    // Auto-save on answer/flag change (debounced)
    useEffect(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
        }

        autoSaveTimerRef.current = setTimeout(() => {
            autoSave()
        }, 2000) // Save 2 seconds after last change

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [answers, flags, currentSection, currentQuestionIndex, timeRemaining, autoSave])

    // Save on unmount
    useEffect(() => {
        return () => {
            if (sessionId && Object.keys(answers).length > 0) {
                // Final save on unmount
                const saveData = {
                    answers,
                    flaggedQuestions: Array.from(flags),
                    currentSection: currentSection || undefined,
                    currentQuestion: currentQuestionIndex + 1,
                    timeRemaining: timeRemaining > 0 ? timeRemaining : undefined,
                } as ExamSessionAnswersDTO & { timeRemaining?: number }
                saveExamAnswers(sessionId, saveData).catch(console.error)
            }
        }
    }, [sessionId, answers, flags, currentSection, currentQuestionIndex, timeRemaining])

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
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            handleSubmit()
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (!sessionId) return

        if (!confirm("Bạn có chắc chắn muốn nộp bài không?")) {
            return
        }

        try {
            // Final save before submit
            const saveData = {
                answers,
                flaggedQuestions: Array.from(flags),
                currentSection: currentSection || undefined,
                currentQuestion: currentQuestionIndex + 1,
                timeRemaining: timeRemaining > 0 ? timeRemaining : undefined,
            } as ExamSessionAnswersDTO & { timeRemaining?: number }
            await saveExamAnswers(sessionId, saveData)

            // Submit exam
            await submitExam(sessionId)
            router.push('/exams')
        } catch (err: any) {
            alert('Lỗi khi nộp bài: ' + (err.message || 'Unknown error'))
            console.error('Error submitting exam:', err)
        }
    }

    const handleTimeUp = async () => {
        if (!sessionId) return

        try {
            // Auto-submit on time up
            const saveData = {
                answers,
                flaggedQuestions: Array.from(flags),
                currentSection: currentSection || undefined,
                currentQuestion: currentQuestionIndex + 1,
                timeRemaining: 0, // Time is up
            } as ExamSessionAnswersDTO & { timeRemaining?: number }
            
            // Try to save first, but don't fail if it errors (time might be up)
            try {
                await saveExamAnswers(sessionId, saveData)
            } catch (saveErr: any) {
                console.warn('Failed to save before auto-submit:', saveErr)
                // Continue to submit even if save fails
            }
            
            // Submit exam
            await submitExam(sessionId)
            alert('Hết giờ! Bài thi đã được nộp tự động.')
            router.push('/exams')
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error'
            console.error('Error auto-submitting exam:', err)
            alert('Lỗi khi nộp bài tự động: ' + errorMessage)
            // Still redirect to exams page even if submit fails
            router.push('/exams')
        }
    }

    // Update timeRemaining from timer
    const handleTimeUpdate = useCallback((seconds: number) => {
        setTimeRemaining(seconds)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Đang tải bài thi...</p>
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

                {timeLimit > 0 && (
                    <ExamTimer
                        durationMinutes={Math.ceil(timeLimit / 60)}
                        initialSeconds={typeof timeRemaining === 'number' ? timeRemaining : timeLimit}
                        onTimeUp={handleTimeUp}
                        onTimeUpdate={handleTimeUpdate}
                    />
                )}

                <Button
                    onClick={handleSubmit}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
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
                                questions={questions}
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
                        questions={questions}
                        currentIndex={currentQuestionIndex}
                        answers={answers}
                        flags={flags}
                        onSelect={setCurrentQuestionIndex}
                    />
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 pb-24 lg:pb-12 bg-white dark:bg-slate-950">
                    {currentQuestion && (
                        <QuestionArea
                            question={currentQuestion}
                            selectedOption={answers[currentQuestion.id]}
                            isFlagged={flags.has(currentQuestion.id)}
                            onAnswer={handleAnswer}
                            onFlag={handleFlag}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            isFirst={currentQuestionIndex === 0}
                            isLast={currentQuestionIndex === questions.length - 1}
                        />
                    )}
                </main>
            </div>
        </div>
    )
}
