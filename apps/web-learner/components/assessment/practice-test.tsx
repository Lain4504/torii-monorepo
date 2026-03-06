"use client"

import * as React from "react"
import {
    Quiz,
    type QuizData,
    type QuizResult,
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
    FieldSet
} from "@workspace/ui/components/field"
import { Target, ChevronRight, ClipboardList, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react"
import { agentApi } from "@/lib/api/services/agent-api"
import { Spinner } from "@workspace/ui/components/spinner"
import { SkillDrill } from "@/components/ai-sensei/skill-drill"
import { nanoid } from 'nanoid'

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

export function PracticeTest() {
    const [status, setStatus] = React.useState<"setup" | "running" | "result">("setup")
    const [isLoading, setIsLoading] = React.useState(false)
    const [config, setConfig] = React.useState<TestConfig>({ level: "N5", section: "vocabulary" })
    const [testId, setTestId] = React.useState<string | null>(null)
    const [quizData, setQuizData] = React.useState<QuizData | null>(null)
    const [optionMap, setOptionMap] = React.useState<Record<string, Record<string, string>>>({}) 
    const [result, setResult] = React.useState<TestResult | null>(null)
    const [timeLeft, setTimeLeft] = React.useState<number>(0)
    
    // Timer effect
    React.useEffect(() => {
        if (status === "running" && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        // TODO: Handle auto-submit if possible, or show "Time's up"
                        // Since Quiz component doesn't expose submit, we might force a result state
                        // For now, we'll let the user finish or show a warning overlay
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
            
            // Map to QuizData
            const newOptionMap: Record<string, Record<string, string>> = {}
            const questions = data.questions.map(q => {
                const optionObjects = (q.options || []).map(opt => ({
                    id: nanoid(),
                    label: opt
                }))
                
                newOptionMap[q.id] = {}
                optionObjects.forEach(opt => {
                    newOptionMap[q.id][opt.id] = opt.label
                })

                let correctIds: string[] = []
                // Assuming correctAnswer maps to one of the options
                const correctOpt = optionObjects.find(o => o.label === q.correctAnswer)
                if (correctOpt) correctIds = [correctOpt.id]

                // Attach explanation to the correct option(s)
                const optionsWithExplanation = optionObjects.map(opt => ({
                    ...opt,
                    explanation: correctIds.includes(opt.id) ? q.explanation : undefined
                }))

                return {
                    id: q.id,
                    type: 'single' as const,
                    question: q.question,
                    options: optionsWithExplanation,
                    correctIds,
                    hint: undefined
                }
            })

            setOptionMap(newOptionMap)
            setQuizData({
                title: `${config.level} Practice Test`,
                description: `${config.section.toUpperCase()} - ${questions.length} Questions`,
                questions
            })

            // Set timer based on section (approx 1 min per question)
            setTimeLeft(count * 60)
            setStatus("running")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleQuizComplete = async (quizResult: QuizResult) => {
        if (!testId || !quizData) return
        setIsLoading(true)
        try {
            const formattedAnswers = Object.entries(quizResult.answers).map(([qId, selectedIds]) => {
                const selectedId = selectedIds[0]
                const userAnswer = optionMap[qId]?.[selectedId] || ""
                return {
                    questionId: qId,
                    userAnswer
                }
            })

            const evaluation = await agentApi.assessment.evaluateTest(testId, formattedAnswers)

            setResult({
                score: evaluation.score || 0,
                totalQuestions: quizData.questions.length,
                correctCount: evaluation.score || 0,
                incorrectCount: quizData.questions.length - (evaluation.score || 0),
                percentage: evaluation.percentage || ((evaluation.score || 0) / quizData.questions.length * 100),
                questions: quizData.questions.map(q => {
                    const detail = evaluation.details?.find(d => d.questionId === q.id)
                    const userSelectedId = quizResult.answers[q.id]?.[0]
                    const userSelection = optionMap[q.id]?.[userSelectedId] || ""
                    
                    return {
                        id: q.id,
                        text: q.question,
                        userSelection: userSelection,
                        correctAnswer: q.correctIds[0] ? optionMap[q.id][q.correctIds[0]] : "", // Not perfect if we only have IDs
                        isCorrect: detail?.isCorrect ?? false,
                        explanation: detail?.explanation 
                    }
                })
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
            <div className="max-w-4xl mx-auto p-4">
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
            </div>
        )
    }

    if (status === "running" && quizData) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-end">
                     <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/50 font-mono text-sm font-bold",
                        timeLeft < 60 ? "text-destructive animate-pulse border-destructive/50" : "text-primary"
                    )}>
                        <Clock className="size-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <Quiz quizData={quizData} onComplete={handleQuizComplete} />
            </div>
        )
    }

    if (status === "result" && result) {
        return (
            <div className="max-w-6xl mx-auto space-y-12">
                <Card className="border-border shadow-sm rounded-xl">
                    <CardHeader className="text-center">
                        <CardTitle>Practice Results</CardTitle>
                        <div className="text-muted-foreground">{config.level} {config.section.charAt(0).toUpperCase() + config.section.slice(1)} Performance</div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Total Questions</div>
                                <div className="text-2xl font-bold">{result.totalQuestions}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Correct</div>
                                <div className="text-2xl font-bold text-green-600">{result.correctCount}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Incorrect</div>
                                <div className="text-2xl font-bold text-red-600">{result.incorrectCount}</div>
                            </div>
                             <div className="text-center">
                                <div className="text-sm text-muted-foreground">Score</div>
                                <div className="text-2xl font-bold text-primary">{Math.round(result.percentage)}%</div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={startTest}>Try Again</Button>
                            <Button onClick={() => setStatus("setup")}>Try Different Level</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-12 border-t space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="size-5 text-primary" />
                            Lấp lỗ hổng kiến thức
                        </h3>
                        <p className="text-sm text-muted-foreground">AI Sensei gợi ý bạn luyện tập tập trung vào phần vừa thi để cải thiện điểm số.</p>
                    </div>

                    <Card className="border-primary/20 bg-primary/5 shadow-none rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <SkillDrill embed />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return null
}
