"use client"

import * as React from "react"
import { Sparkles, BookCheck, Clock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { agentApi } from "@/lib/api/services/agent-api"
import {
    AcademyPlacementInfoResponseDTO,
} from "@workspace/schemas"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"


import {
    Quiz,
    type QuizData,
    type QuizResult,
    type QuizOption as QuizOptionType
} from "@workspace/ui/components/custom/quiz"
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react"
import { nanoid } from 'nanoid'

export function PlacementAssessment() {
    const [step, setStep] = React.useState<"intro" | "test" | "result">("intro")
    const [isLoading, setIsLoading] = React.useState(false)
    const [attemptId, setAttemptId] = React.useState<string | null>(null)
    const [info, setInfo] = React.useState<AcademyPlacementInfoResponseDTO | null>(null)
    const [quizData, setQuizData] = React.useState<QuizData | null>(null)
    const [result, setResult] = React.useState<any | null>(null)

    const pathname = usePathname()
    const router = useRouter()
    const isMarketing = pathname === "/placement-test"

    React.useEffect(() => {
        const loadInfo = async () => {
            try {
                const data = await agentApi.placement.getInfo()
                setInfo(data)
            } catch (error) {
                console.error(error)
            }
        }
        loadInfo()
    }, [])

    const handleStart = async () => {
        setIsLoading(true)
        try {
            const data = await agentApi.placement.start()
            setAttemptId(data.attemptId)

            const mappedQuizData: QuizData = {
                title: "Bài Thi Xác Định Trình Độ",
                description: "Bài thi gồm các câu từ N5 đến N1. Kết quả dùng để gợi ý lộ trình học phù hợp.",
                questions: data.questions.map((q) => {
                    const optionObjects = (q.options || []).map(opt => ({
                        id: nanoid(),
                        label: opt
                    }))

                    return {
                        id: q.id,
                        type: 'single',
                        question: q.content,
                        options: optionObjects,
                        correctIds: [],
                        hint: undefined
                    }
                })
            }

            setQuizData(mappedQuizData)
            setStep("test")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuizComplete = async (quizResult: QuizResult) => {
        if (!attemptId) return
        setIsLoading(true)
        try {
            const formattedAnswers: Record<string, unknown> = {}
            Object.entries(quizResult.answers).forEach(([questionId, selectedIds]) => {
                const selectedId = selectedIds[0]
                if (!quizData) return
                const question = quizData.questions.find(q => q.id === questionId)
                if (!question) return
                const index = question.options.findIndex(o => o.id === selectedId)
                if (index >= 0) {
                    formattedAnswers[questionId] = index
                }
            })

            const evaluation = await agentApi.placement.submit(attemptId, formattedAnswers)
            setResult(evaluation)
            setStep("result")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
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
                            Hãy hoàn thành bài kiểm tra để hệ thống xác định trình độ hiện tại và gợi ý lộ trình học phù hợp nhất cho bạn.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                    {[
                        { icon: BookCheck, val: info?.totalQuestions?.toString() ?? '—', label: 'Câu hỏi' },
                        { icon: Clock, val: info?.timeLimitMinutes ? `~${info.timeLimitMinutes}` : 'Không giới hạn', label: 'Phút' },
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
                        disabled={isLoading || !!(info && !info.canRetake)}
                        className="h-12 px-10 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {isLoading ? <><Spinner className="mr-2 size-4" /> Đang chuẩn bị...</> : <><Sparkles className="mr-2 size-4" /> Bắt đầu kiểm tra</>}
                    </Button>
                </div>
            </div>
        )
    }


    if (step === "test" && quizData) {
        return (
            <div className="max-w-2xl mx-auto">
                <Quiz
                    quizData={quizData}
                    onComplete={handleQuizComplete}
                />
            </div>
        )
    }

    if (step === "result" && result) {
        return (
            <div className="max-w-6xl mx-auto space-y-8">
                <Card className="border-border shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold">Hoàn Thành Đánh Giá!</CardTitle>
                        <CardDescription>
                            Assessment Complete
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center gap-8">
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground uppercase tracking-wider">Assessed Level</div>
                                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                                    <ClipboardList className="size-5" />
                                    {result.assessedLevel || "N5"}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground uppercase tracking-wider">Score</div>
                                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 className="size-5" />
                                    {result.rawScore || result.score || 0} / {result.maxScore}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground uppercase tracking-wider">Target Level</div>
                                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                                    <Sparkles className="size-5" />
                                    {result.targetLevel || "N4"}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={() => {
                                    if (isMarketing) {
                                        router.push(`/register?level=${result.assessedLevel}`)
                                    } else {
                                        handleSelectLevel(result.assessedLevel ?? 'N5')
                                    }
                                }}
                            >
                                {isMarketing ? "Đăng Ký & Lưu Kết Quả" : "Xác Nhận & Bắt Đầu Học"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 text-left pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    {(result.levelPercentages || result.scoreBreakdown) && Object.keys(result.levelPercentages || result.scoreBreakdown).length > 0 && (
                        <Card className="shadow-sm rounded-xl border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold">Phân Tích Điểm Số</CardTitle>
                                <CardDescription className="text-[10px] font-medium uppercase tracking-wider">Tỉ lệ chính xác theo trình độ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(result.levelPercentages || result.scoreBreakdown || {}).map(([level, score]: [string, any]) => (
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
            </div>
        )
    }

    return null
}
