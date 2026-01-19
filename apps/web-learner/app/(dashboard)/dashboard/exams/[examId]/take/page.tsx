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
import { startExam, saveExamAnswers, submitExam } from "@/apis/services/exam-api"
import type { ExamSessionStartResponseDTO, ExamSessionAnswersDTO } from '@workspace/schemas'
import { PageLoading } from "@workspace/ui/components/page-loading"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { AlertCircle, CheckCircle2 } from "lucide-react"

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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

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
        if (!sessionId || isSubmitting) return

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
    }, [sessionId, answers, flags, currentSection, currentQuestionIndex, timeRemaining, isSubmitting])

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
            if (sessionId && !isSubmitting && Object.keys(answers).length > 0) {
                // Final save on unmount only if not already submitting
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
    }, [sessionId, answers, flags, currentSection, currentQuestionIndex, timeRemaining, isSubmitting])

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

    const handleSubmit = () => {
        if (!sessionId || isSubmitting) return
        setShowConfirmSubmit(true)
    }

    const confirmSubmit = async () => {
        if (!sessionId || isSubmitting) return
        setShowConfirmSubmit(false)

        try {
            setIsSubmitting(true)
            toast.loading("Đang nộp bài...", { id: "submit-exam" })
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
            toast.success("Nộp bài thành công!", { id: "submit-exam" })
            router.push('/dashboard/exams')
        } catch (err: any) {
            setIsSubmitting(false)
            toast.error('Lỗi khi nộp bài: ' + (err.message || 'Unknown error'), { id: "submit-exam" })
            console.error('Error submitting exam:', err)
        }
    }

    const handleTimeUp = async () => {
        if (!sessionId || isSubmitting) return

        try {
            setIsSubmitting(true)
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
            toast.success('Hết giờ! Bài thi đã được nộp tự động.', { duration: 5000 })
            router.push('/dashboard/exams')
        } catch (err: any) {
            setIsSubmitting(false)
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error'
            console.error('Error auto-submitting exam:', err)
            toast.error('Lỗi khi nộp bài tự động: ' + errorMessage)
            // Still redirect to exams page even if submit fails
            router.push('/dashboard/exams')
        }
    }

    // Update timeRemaining from timer
    const handleTimeUpdate = useCallback((seconds: number) => {
        setTimeRemaining(seconds)
    }, [])

    if (loading) {
        return <PageLoading text="Initializing Exam Matrix..." className="h-screen" />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <p className="text-destructive mb-4 font-bold uppercase tracking-widest text-[10px]">Error: {error}</p>
                    <Button onClick={() => router.push('/dashboard/exams')} variant="outline">Return to Base</Button>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Không có câu hỏi nào</p>
                    <Button onClick={() => router.push('/exams')}>Quay lại</Button>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentQuestionIndex]

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b bg-background flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/exams" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <X className="w-6 h-6" />
                    </Link>
                    <div className="hidden sm:block font-bold text-lg text-foreground">
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
                    className="border-primary text-primary hover:bg-primary/10"
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
                            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg bg-foreground text-background">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 border-l w-80">
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
                <aside className="hidden lg:block w-80 border-r bg-muted/50">
                    <QuestionNavigator
                        questions={questions}
                        currentIndex={currentQuestionIndex}
                        answers={answers}
                        flags={flags}
                        onSelect={setCurrentQuestionIndex}
                    />
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 pb-24 lg:pb-12 bg-background">
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

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
                <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="bg-background border rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="p-8 text-center space-y-6">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-primary" />
                            </div>

                            <div className="space-y-2">
                                <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                                    Xác nhận nộp bài
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground text-base px-2 uppercase text-[10px] font-bold tracking-widest">
                                    Bạn có chắc chắn muốn kết thúc bài thi này không? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <AlertDialogCancel className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] border-2 hover:bg-muted transition-all active:scale-95">
                                    Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmSubmit}
                                    className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    Nộp bài
                                </AlertDialogAction>
                            </div>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
