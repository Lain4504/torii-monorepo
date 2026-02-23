"use client"

import * as React from "react"
import { ArrowRight, Sparkles, BookCheck, Clock, Trophy } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentTestGenerationResponseDTO as PlacementTestResponse, AgentTestEvaluationResponseDTO as PlacementEvaluationResponse } from "@workspace/schemas"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"

export function PlacementTest() {
    const [step, setStep] = React.useState<"intro" | "test" | "result">("intro")
    const [isLoading, setIsLoading] = React.useState(false)
    const [testData, setTestData] = React.useState<PlacementTestResponse | null>(null)
    const [answers, setAnswers] = React.useState<Record<string, string>>({})
    const [result, setResult] = React.useState<PlacementEvaluationResponse | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)

    const handleStart = async () => {
        setIsLoading(true)
        try {
            const data = await agentApi.assessment.generatePlacementTest(15)
            setTestData(data)
            setStep("test")
            setAnswers({})
            setCurrentQuestionIndex(0)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!testData) return
        setIsLoading(true)
        try {
            // Map answers to the format expected by the backend
            const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => {
                const question = testData.questions.find(q => q.id === questionId)
                return {
                    questionId,
                    level: question?.level || "N5",
                    userAnswer,
                    correctAnswer: question?.correctAnswer || 0
                }
            })

            const evaluation = await agentApi.assessment.evaluatePlacementTest(testData.testId, formattedAnswers)
            setResult(evaluation)
            setStep("result")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }))
    }

    const handleSelectLevel = (level: string) => {
        console.log("Selected level:", level)
    }

    if (step === "intro") {
        return (
            <div className="max-w-4xl mx-auto py-24 px-6 text-center space-y-16 animate-in fade-in duration-700">
                <div className="space-y-8">
                    <div className="size-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
                        <Sparkles className="size-10" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">Placement Test</h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            Discover your current Japanese level in just 10 minutes.
                            Our AI will adapt to your answers to find the perfect starting point.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    {[
                        { icon: BookCheck, val: "15", label: "Questions" },
                        { icon: Clock, val: "~10", label: "Minutes" },
                        { icon: Sparkles, val: "AI", label: "Powered" },
                    ].map((item, i) => (
                        <Card key={i} className="border-border/50 bg-muted/30 shadow-none rounded-2xl">
                            <CardContent className="flex flex-col items-center p-8 space-y-3">
                                <div className="p-3 bg-primary/10 rounded-xl mb-1">
                                    <item.icon className="size-6 text-primary" />
                                </div>
                                <div className="font-bold text-3xl tracking-tight">{item.val}</div>
                                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{item.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button size="lg" onClick={handleStart} disabled={isLoading} className="h-14 px-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20">
                    {isLoading ? <><Spinner className="mr-3 size-5" /> Preparing...</> : "Start Assessment"}
                </Button>
            </div>
        )
    }

    if (step === "test" && testData) {
        const totalQuestions = testData.questions.length
        const progress = (Object.keys(answers).length / totalQuestions) * 100
        const currentQuestion = testData.questions[currentQuestionIndex]

        const handleNext = () => {
            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(prev => prev + 1)
            }
        }

        const handlePrevious = () => {
            if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(prev => prev - 1)
            }
        }

        if (!currentQuestion) return null

        return (
            <div className="max-w-3xl mx-auto py-8 space-y-8">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{Object.keys(answers).length} / {totalQuestions} Answered</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                    <Progress value={progress} className="h-2.5 rounded-full" />
                </div>

                <div className="space-y-8 min-h-[400px]">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-lg font-medium leading-relaxed flex gap-4">
                                <span className="flex-none bg-background border size-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm text-muted-foreground">
                                    {currentQuestionIndex + 1}
                                </span>
                                {currentQuestion.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <RadioGroup key={currentQuestion.id} value={answers[currentQuestion.id] || ""} onValueChange={(val) => handleAnswer(currentQuestion.id, val)} className="space-y-3">
                                {currentQuestion.options?.map((opt: string, idx: number) => (
                                    <Label
                                        key={idx}
                                        htmlFor={`q-${currentQuestion.id}-${idx}`}
                                        className={cn(
                                            "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-all m-0",
                                            answers[currentQuestion.id] === opt ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <RadioGroupItem value={opt} id={`q-${currentQuestion.id}-${idx}`} />
                                        <span className="flex-1 font-normal break-words leading-relaxed text-sm md:text-base">{opt}</span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-between pt-4 pb-20 items-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0 || isLoading}
                        className="min-w-[120px]"
                    >
                        Previous
                    </Button>

                    <div className="text-sm font-medium text-muted-foreground">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </div>

                    {currentQuestionIndex < totalQuestions - 1 ? (
                        <Button
                            size="lg"
                            onClick={handleNext}
                            disabled={!currentQuestion.id || !answers[currentQuestion.id] || isLoading}
                            className="min-w-[120px]"
                        >
                            Next <ArrowRight className="ml-2 size-4" />
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isLoading || Object.keys(answers).length < totalQuestions}
                            className="min-w-[160px]"
                        >
                            {isLoading ? <><Loader2 className="mr-2 size-5 animate-spin" /> Analyzing...</> : "Submit Answers"}
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    if (step === "result" && result) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Hoàn Thành Đánh Giá!</h2>
                    <p className="text-muted-foreground">Dưới đây là kết quả phân tích năng lực và lộ trình đề xuất dành cho bạn.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 text-left">
                    <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden relative col-span-1 md:col-span-2">
                        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <CardHeader className="text-center">
                            <CardDescription className="uppercase tracking-widest text-xs font-semibold text-primary">Cấp Độ Đề Xuất</CardDescription>
                            <CardTitle className="text-6xl font-black text-primary py-2">{result.assessedLevel}</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 text-center space-y-4">
                            <p className="text-lg leading-relaxed text-foreground/80 max-w-lg mx-auto">
                                Dựa trên kết quả làm bài tập phân bổ qua các cấp độ khó khác nhau, chúng tôi đề xuất bạn nên bắt đầu lộ trình học từ trình độ <strong>{result.assessedLevel}</strong>.
                            </p>
                            {result.score !== undefined && result.maxScore !== undefined && (
                                <div className="inline-flex items-center space-x-2 bg-background/50 backdrop-blur border rounded-full px-4 py-1.5 text-sm font-medium">
                                    <span className="text-muted-foreground">Số câu trả lời đúng:</span>
                                    <span className="text-primary font-bold">{result.score} / {result.maxScore}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {result.scoreBreakdown && Object.keys(result.scoreBreakdown).length > 0 && (
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Phân Tích Điểm Số</CardTitle>
                                <CardDescription>Tỉ lệ chính xác theo từng cấp độ JLPT</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(result.scoreBreakdown).map(([level, score]) => (
                                    <div key={level} className="flex items-center justify-between">
                                        <div className="font-medium">{level}</div>
                                        <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: score.toString().includes('%') ? score : `${score}%` }}
                                            />
                                        </div>
                                        <div className="text-sm font-semibold">{score}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {result.studyPathRecommendation && result.studyPathRecommendation.focusAreas && (
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Trọng Tâm Cần Luyện Tập</CardTitle>
                                <CardDescription>Các chủ đề cần ưu tiên để đạt {result.targetLevel || result.assessedLevel}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                    {result.studyPathRecommendation.focusAreas.map((area: string, idx: number) => (
                                        <li key={idx} className="text-sm leading-relaxed">{area}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="flex justify-center pt-6">
                    <Button
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 min-w-[200px]"
                        onClick={() => handleSelectLevel(result.assessedLevel ?? 'N5')}
                        asChild
                    >
                        <Link href="/dashboard">
                            Xác Nhận & Bắt Đầu Học <ArrowRight className="ml-2 size-5" />
                        </Link>
                    </Button>
                </div>

                <div className="pt-6">
                    <Button variant="ghost" asChild className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                        <Link href="/assessment">Back to Assessment Center</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return null
}
