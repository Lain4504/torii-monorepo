"use client"

import * as React from "react"
import {
    QuizContainer,
    QuizHeader,
    QuizProgress,
    QuizQuestion,
    QuizOption,
    QuizNavigation,
    QuizResultSummary,
    QuizReviewItem,
    QuizResultView
} from "@workspace/ui/components/custom/quiz"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet
} from "@workspace/ui/components/field"
import { Target, ChevronRight, ClipboardList, CheckCircle2, XCircle, BookCheck, Clock } from "lucide-react"
import { agentApi } from "@/lib/api/services/agent-api"
import { Spinner } from "@workspace/ui/components/spinner"

// Types
interface TestConfig {
    level: string
    section: string
}

interface Question {
    id: string
    text: string
    options: string[]
    correctAnswer?: string
    explanation?: string
}

interface TestResult {
    score: number
    totalQuestions: number
    correctCount: number
    incorrectCount: number
    percentage: number
    questions: {
        id: string
        text: string
        userSelection?: string
        correctAnswer: string
        isCorrect: boolean
        explanation?: string
    }[]
}

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"]
const TEST_SECTIONS = [
    { value: "vocabulary", label: "Từ vựng & Kanji" },
    { value: "grammar", label: "Ngữ pháp" },
    { value: "reading", label: "Đọc hiểu" },
    { value: "listening", label: "Nghe hiểu" },
    { value: "full", label: "Mô phỏng Đầy đủ" }
]

export function TestRunner() {
    const [status, setStatus] = React.useState<"setup" | "running" | "result">("setup")
    const [isLoading, setIsLoading] = React.useState(false)
    const [config, setConfig] = React.useState<TestConfig>({ level: "N5", section: "vocabulary" })
    const [testId, setTestId] = React.useState<string | null>(null)
    const [questions, setQuestions] = React.useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [userAnswers, setUserAnswers] = React.useState<Record<string, string>>({})
    const [result, setResult] = React.useState<TestResult | null>(null)
    const [timeLeft, setTimeLeft] = React.useState<number>(0)

    // Timer effect
    React.useEffect(() => {
        if (status === "running" && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleSubmit()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [status, timeLeft])

    const startTest = async () => {
        setIsLoading(true)
        try {
            const count = config.section === "full" ? 20 : 10
            const data = await agentApi.assessment.generateTest(config.level, config.section, count)

            setTestId(data.testId)
            setQuestions(data.questions.map(q => ({
                id: q.id,
                text: q.question,
                options: q.options || []
            })))

            // Set timer based on section (approx 1 min per question)
            setTimeLeft(count * 60)
            setStatus("running")
            setCurrentIndex(0)
            setUserAnswers({})
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectOption = (value: string) => {
        const q = questions[currentIndex]
        if (q) {
            setUserAnswers(prev => ({ ...prev, [q.id]: value }))
        }
    }

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        if (!testId) return
        setIsLoading(true)
        try {
            const formattedAnswers = Object.entries(userAnswers).map(([qId, ans]) => ({
                questionId: qId,
                userAnswer: ans
            }))

            const evaluation = await agentApi.assessment.evaluateTest(testId, formattedAnswers)

            setResult({
                score: evaluation.score || 0,
                totalQuestions: questions.length,
                correctCount: evaluation.score || 0,
                incorrectCount: questions.length - (evaluation.score || 0),
                percentage: evaluation.percentage || ((evaluation.score || 0) / questions.length * 100),
                questions: questions.map(q => {
                    const detail = evaluation.details?.find(d => d.questionId === q.id)
                    return {
                        ...q,
                        userSelection: userAnswers[q.id],
                        isCorrect: detail?.isCorrect ?? false,
                        correctAnswer: q.correctAnswer || "",
                        explanation: detail?.explanation || q.explanation
                    }
                }) as any
            })
            setStatus("result")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (status === "setup") {
        return (
            <QuizContainer>
                <QuizHeader
                    title="JLPT Practice Test"
                    description="Kỳ thi thử mô phỏng cấu trúc JLPT thực tế với giới hạn thời gian."
                />

                <Card className="border-border shadow-none rounded-xl overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Target className="size-5 text-primary" />
                            Cấu hình bài thi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={e => { e.preventDefault(); startTest(); }}>
                            <FieldGroup>
                                <FieldSet>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field>
                                            <FieldLabel>Trình độ mục tiêu</FieldLabel>
                                            <Select value={config.level} onValueChange={v => setConfig(prev => ({ ...prev, level: v }))}>
                                                <SelectTrigger className="rounded-lg">
                                                    <SelectValue placeholder="Chọn cấp độ" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {JLPT_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>Chọn cấp độ thi JLPT bạn đang luyện tập.</FieldDescription>
                                        </Field>

                                        <Field>
                                            <FieldLabel>Phần thi trọng tâm</FieldLabel>
                                            <Select value={config.section} onValueChange={v => setConfig(prev => ({ ...prev, section: v }))}>
                                                <SelectTrigger className="rounded-lg">
                                                    <SelectValue placeholder="Chọn phần thi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TEST_SECTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>Tập trung vào một kỹ năng cụ thể hoặc làm bài thi tổng hợp.</FieldDescription>
                                        </Field>
                                    </div>
                                </FieldSet>
                            </FieldGroup>

                            <div className="flex justify-end pt-2">
                                <Button size="lg" disabled={isLoading} className="w-full md:w-auto rounded-lg font-bold uppercase tracking-widest text-[10px] h-11 px-8 shadow-md">
                                    {isLoading ? <Spinner className="mr-2" /> : null}
                                    Bắt đầu thi ngay
                                    <ChevronRight className="ml-2 size-4" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </QuizContainer>
        )
    }

    if (status === "running" && questions.length > 0) {
        const q = questions[currentIndex]
        if (!q) return null

        return (
            <QuizContainer className="text-center">
                <QuizHeader
                    title={`${config.level} Practice Session`}
                    description={`${config.section.toUpperCase()} - ${questions.length} Questions`}
                    actions={
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/50 font-mono text-sm font-bold",
                            timeLeft < 60 ? "text-destructive animate-pulse border-destructive/50" : "text-primary"
                        )}>
                            <Clock className="size-4" />
                            {formatTime(timeLeft)}
                        </div>
                    }
                />

                <QuizProgress current={currentIndex + 1} total={questions.length} />

                <div className="space-y-12">
                    <QuizQuestion
                        question={q.text}
                        level={config.level}
                        category={config.section}
                        index={currentIndex + 1}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {q.options.map((option, idx) => (
                            <QuizOption
                                key={idx}
                                index={idx}
                                value={option}
                                label={option}
                                isSelected={userAnswers[q.id] === option}
                                onSelect={handleSelectOption}
                            />
                        ))}
                    </div>

                    <QuizNavigation
                        onBack={() => setCurrentIndex(p => Math.max(0, p - 1))}
                        onNext={nextQuestion}
                        backDisabled={currentIndex === 0 || isLoading}
                        nextDisabled={!userAnswers[q.id] || isLoading}
                        isLast={currentIndex === questions.length - 1}
                        nextLabel={currentIndex === questions.length - 1 ? "Submit Exam" : "Next Question"}
                    />
                </div>
            </QuizContainer>
        )
    }

    if (status === "result" && result) {
        return (
            <QuizContainer>
                <QuizResultView
                    badge="Practice Results"
                    title={`${config.level} ${config.section.charAt(0).toUpperCase() + config.section.slice(1)} Performance`}
                    percentage={result.percentage}
                    stats={[
                        { label: "Total Questions", value: result.totalQuestions, icon: ClipboardList },
                        { label: "Correct Answers", value: result.correctCount, icon: CheckCircle2 },
                        { label: "Needs Review", value: result.incorrectCount, icon: XCircle }
                    ]}
                    questions={result.questions}
                    onRetry={startTest}
                    onSecondaryAction={{
                        label: "Try Different Level",
                        onClick: () => setStatus("setup")
                    }}
                />
            </QuizContainer>
        )
    }

    return null
}
