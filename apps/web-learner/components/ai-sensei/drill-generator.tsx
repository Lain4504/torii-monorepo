"use client"

import * as React from "react"
import {
    CheckCircle2,
    Sparkles,
    ClipboardList,
    Target,
    BookCheck
} from 'lucide-react'
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentDrillResponseDTO as DrillResponse } from "@workspace/schemas"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from '@workspace/ui/components/spinner'
import { Separator } from "@workspace/ui/components/separator"

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

const drillFormSchema = z.object({
    type: z.enum(['grammar', 'vocabulary', 'kanji', 'listening', 'reading']),
    topic: z.string().min(1, "Vui lòng nhập chủ đề"),
    difficulty: z.enum(["N5", "N4", "N3", "N2", "N1"]),
})

type DrillFormData = z.infer<typeof drillFormSchema>

export function DrillGenerator({ embed = false }: { embed?: boolean }) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<DrillResponse | null>(null)
    const [userAnswers, setUserAnswers] = React.useState<Record<number, string>>({})
    const [showResults, setShowResults] = React.useState(false)

    const form = useForm<DrillFormData>({
        resolver: zodResolver(drillFormSchema),
        defaultValues: {
            type: "grammar",
            topic: "",
            difficulty: "N5",
        },
    })

    const handleGenerate = async (data: DrillFormData) => {
        setIsLoading(true)
        try {
            const res = await agentApi.sensei.generateDrill(data.type, data.topic, data.difficulty)
            setResult(res)
            setUserAnswers({})
            setShowResults(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAnswer = (index: number, answer: string) => {
        if (showResults) return
        setUserAnswers(prev => ({ ...prev, [index]: answer }))
    }

    const checkAnswers = () => {
        setShowResults(true)
    }

    const correctCount = result ? result.drills.filter((d, i) => userAnswers[i] === d.correctAnswer).length : 0

    const Content = (
        <div className={cn("space-y-8", embed ? "" : "py-6 md:py-8")}>
            {!embed && (
                <QuizHeader
                    title="Luyện tập Kỹ năng"
                    description="Tạo các bài tập tùy chỉnh để rèn luyện kỹ năng tiếng Nhật của bạn."
                />
            )}

            <Card className="shadow-none border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Target className="size-4" />
                        Cấu hình bài tập
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form id="drill-form" onSubmit={form.handleSubmit(handleGenerate)} className="grid md:grid-cols-3 gap-6">
                        <Controller
                            name="type"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel className="text-xs font-semibold uppercase text-muted-foreground">Kỹ năng</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="grammar">Ngữ pháp</SelectItem>
                                            <SelectItem value="vocabulary">Từ vựng</SelectItem>
                                            <SelectItem value="kanji">Hán tự</SelectItem>
                                            <SelectItem value="reading">Đọc hiểu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />
                        <Controller
                            name="topic"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-xs font-semibold uppercase text-muted-foreground">Chủ đề</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Ví dụ: Particles, Family..."
                                        disabled={isLoading}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="difficulty"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel className="text-xs font-semibold uppercase text-muted-foreground">Trình độ</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="N5">N5</SelectItem>
                                            <SelectItem value="N4">N4</SelectItem>
                                            <SelectItem value="N3">N3</SelectItem>
                                            <SelectItem value="N2">N2</SelectItem>
                                            <SelectItem value="N1">N1</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end pt-6">
                    <Button
                        form="drill-form"
                        type="submit"
                        disabled={!form.watch("topic").trim() || isLoading}
                        className="font-bold uppercase tracking-widest text-[10px]"
                    >
                        {isLoading ? <Spinner className="mr-2" /> : <Sparkles className="size-3.5 mr-2" />}
                        Tạo bài tập
                    </Button>
                </CardFooter>
            </Card>

            {result && !showResults && (
                <div className="space-y-10 pt-10 animate-in fade-in duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b pb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-primary" />
                            {result.topic}
                            <Badge variant="secondary" className="ml-2 font-bold text-[10px] uppercase">{result.drills.length} Questions</Badge>
                        </h3>
                        {Object.keys(userAnswers).length === result.drills.length && (
                            <Button onClick={checkAnswers} className="font-bold uppercase tracking-widest text-[10px]">
                                Nộp bài & Xem kết quả
                            </Button>
                        )}
                    </div>

                    <div className="space-y-8">
                        {result.drills.map((drill, i) => (
                            <div key={i} className="space-y-6">
                                <QuizQuestion
                                    index={i + 1}
                                    question={drill.question}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                    {drill.options.map((option, optIdx) => (
                                        <QuizOption
                                            key={optIdx}
                                            index={optIdx}
                                            value={option}
                                            label={option}
                                            isSelected={userAnswers[i] === option}
                                            onSelect={(val) => handleAnswer(i, val)}
                                            disabled={showResults}
                                        />
                                    ))}
                                </div>
                                {i < result.drills.length - 1 && <Separator className="max-w-md mx-auto" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {result && showResults && (
                <div className="pt-12">
                    <QuizResultView
                        badge="Drill Results"
                        title={result.topic}
                        percentage={(correctCount / result.drills.length) * 100}
                        stats={[
                            { label: "Questions", value: result.drills.length, icon: ClipboardList },
                            { label: "Correct", value: correctCount, icon: CheckCircle2 },
                            { label: "Accuracy", value: `${Math.round((correctCount / result.drills.length) * 100)}%`, icon: Target }
                        ]}
                        questions={result.drills.map((d, i) => ({
                            id: i.toString(),
                            text: d.question,
                            userSelection: userAnswers[i],
                            correctAnswer: d.correctAnswer,
                            isCorrect: userAnswers[i] === d.correctAnswer,
                            explanation: d.explanation
                        }))}
                        onRetry={() => {
                            setUserAnswers({})
                            setShowResults(false)
                        }}
                        onSecondaryAction={{
                            label: "Tạo Bài Mới",
                            onClick: () => setResult(null)
                        }}
                    />
                </div>
            )}
        </div>
    )

    if (embed) return Content

    return (
        <div className="h-full overflow-y-auto w-full">
            <QuizContainer className="max-w-6xl">
                {Content}
            </QuizContainer>
        </div>
    )
}
