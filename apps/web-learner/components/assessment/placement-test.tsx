"use client"

import * as React from "react"
import { Sparkles, BookCheck, Clock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentTestGenerationResponseDTO as PlacementTestResponse, AgentTestEvaluationResponseDTO as PlacementEvaluationResponse } from "@workspace/schemas"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"


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
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react"

export function PlacementTest() {
    const [step, setStep] = React.useState<"intro" | "test" | "result">("intro")
    const [isLoading, setIsLoading] = React.useState(false)
    const [testData, setTestData] = React.useState<PlacementTestResponse | null>(null)
    const [answers, setAnswers] = React.useState<Record<string, string>>({})
    const [result, setResult] = React.useState<PlacementEvaluationResponse | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)

    const pathname = usePathname()
    const router = useRouter()
    const isMarketing = pathname === "/placement-test"

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
            <div className="space-y-10 animate-in fade-in duration-500">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="size-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Sparkles className="size-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black font-serif tracking-tight">Bài Thi Xác Định Trình Độ</h2>
                        <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
                            Hãy trả lời 15 câu hỏi để AI phân tích và đề xuất lộ trình học tập tối ưu cho bạn.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                    {[
                        { icon: BookCheck, val: '15', label: 'Câu hỏi' },
                        { icon: Clock, val: '~10', label: 'Phút' },
                        { icon: Sparkles, val: 'AI', label: 'Thích nghi' },
                    ].map((item, i) => (
                        <div key={i} className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors">
                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <item.icon className="size-5 text-primary" />
                            </div>
                            <div className="font-black text-2xl tracking-tighter">{item.val}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* Info box */}
                <div className="flex gap-3 p-5 rounded-2xl bg-primary/5 border border-primary/20 max-w-xl mx-auto">
                    <Sparkles className="size-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Bài thi gồm các câu từ N5 đến N1. AI sẽ điều chỉnh độ khó theo từng câu trả lời để đưa ra phân loại <strong className="text-foreground">chuẩn xác nhất</strong>.
                    </p>
                </div>

                {/* CTA */}
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleStart}
                        disabled={isLoading}
                        className="h-12 px-10 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {isLoading ? <><Spinner className="mr-2 size-4" /> Đang chuẩn bị...</> : <><Sparkles className="mr-2 size-4" /> Bắt đầu kiểm tra</>}
                    </Button>
                </div>
            </div>
        )
    }


    if (step === "test" && testData) {
        const totalQuestions = testData.questions.length
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
            <QuizContainer className="text-center">
                <QuizProgress current={currentQuestionIndex + 1} total={totalQuestions} label="Placement Progress" />

                <div className="space-y-12">
                    <QuizQuestion
                        question={currentQuestion.question}
                        level={currentQuestion.level}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {currentQuestion.options?.map((opt: string, idx: number) => (
                            <QuizOption
                                key={idx}
                                index={idx}
                                value={opt}
                                label={opt}
                                isSelected={answers[currentQuestion.id] === opt}
                                onSelect={(val) => handleAnswer(currentQuestion.id, val)}
                            />
                        ))}
                    </div>

                    <QuizNavigation
                        onBack={handlePrevious}
                        onNext={currentQuestionIndex < totalQuestions - 1 ? handleNext : handleSubmit}
                        backDisabled={currentQuestionIndex === 0 || isLoading}
                        nextDisabled={!currentQuestion.id || !answers[currentQuestion.id] || isLoading}
                        isLast={currentQuestionIndex === totalQuestions - 1}
                        nextLabel={currentQuestionIndex < totalQuestions - 1 ? "Next" : "Submit Answers"}
                    />
                </div>
            </QuizContainer>
        )
    }

    if (step === "result" && result) {
        return (
            <QuizContainer>
                <QuizResultView
                    badge="Assessment Complete"
                    title="Hoàn Thành Đánh Giá!"
                    percentage={result.score && result.maxScore ? (result.score / result.maxScore) * 100 : 0}
                    stats={[
                        { label: "Assessed Level", value: result.assessedLevel || "N5", icon: ClipboardList },
                        { label: "Score", value: `${result.score} / ${result.maxScore}`, icon: CheckCircle2 },
                        { label: "Target Level", value: result.targetLevel || "N4", icon: Sparkles }
                    ]}
                    questions={[]} // Placement test result from backend doesn't include detailed review by default
                    onSecondaryAction={{
                        label: isMarketing ? "Đăng Ký & Lưu Kết Quả" : "Xác Nhận & Bắt Đầu Học",
                        onClick: () => {
                            if (isMarketing) {
                                router.push(`/register?level=${result.assessedLevel}`)
                            } else {
                                handleSelectLevel(result.assessedLevel ?? 'N5')
                            }
                        }
                    }}
                />

                <div className="grid gap-6 md:grid-cols-2 text-left pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <Card className="border-border shadow-sm col-span-1 md:col-span-2 rounded-xl overflow-hidden">
                        <CardHeader className="text-center pb-2">
                            <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-primary">Cấp Độ Đề Xuất</CardDescription>
                            <CardTitle className="text-5xl font-black text-primary py-1">{result.assessedLevel}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <p className="text-sm text-muted-foreground max-w-lg mx-auto font-medium">
                                Dựa trên kết quả bài tập, chúng tôi đề xuất bạn bắt đầu từ trình độ <strong>{result.assessedLevel}</strong>.
                            </p>
                        </CardContent>
                    </Card>

                    {result.scoreBreakdown && Object.keys(result.scoreBreakdown).length > 0 && (
                        <Card className="shadow-sm rounded-xl border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">Phân Tích Điểm Số</CardTitle>
                                <CardDescription className="text-[10px] font-medium uppercase tracking-wider">Tỉ lệ chính xác theo trình độ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(result.scoreBreakdown).map(([level, score]) => (
                                    <div key={level} className="flex items-center justify-between">
                                        <div className="font-bold text-xs w-8">{level}</div>
                                        <div className="flex-1 mx-4 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: score.toString().includes('%') ? score : `${score}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] font-black text-primary">{score}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {result.studyPathRecommendation && result.studyPathRecommendation.focusAreas && (
                        <Card className="shadow-sm rounded-xl border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">Trọng Tâm Luyện Tập</CardTitle>
                                <CardDescription className="text-[10px] font-medium uppercase tracking-wider">Các chủ đề cần ưu tiên</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2.5">
                                    {result.studyPathRecommendation.focusAreas.map((area: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-xs font-medium text-muted-foreground">
                                            <div className="size-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                            {area}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="pt-12 text-center">
                    {!isMarketing && (
                        <Button variant="ghost" asChild className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                            <Link href="/assessment">Quay lại Assessment Center</Link>
                        </Button>
                    )}
                    {isMarketing && (
                        <Button variant="ghost" asChild className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                            <Link href="/register">Tham gia ngay để nhận lộ trình chi tiết</Link>
                        </Button>
                    )}
                </div>
            </QuizContainer>
        )
    }

    return null
}
