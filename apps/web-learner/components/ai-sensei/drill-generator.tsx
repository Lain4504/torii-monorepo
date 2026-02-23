"use client"

import * as React from "react"
import { Dumbbell, ArrowRight, CheckCircle2, XCircle, HelpCircle, Sparkles } from 'lucide-react'
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from '@workspace/ui/components/spinner'
import { Separator } from "@workspace/ui/components/separator"
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert"

const drillFormSchema = z.object({
    type: z.enum(['grammar', 'vocabulary', 'kanji', 'listening', 'reading']),
    topic: z.string().min(1, "Vui lòng nhập chủ đề"),
    difficulty: z.enum(["N5", "N4", "N3", "N2", "N1"]),
})

type DrillFormData = z.infer<typeof drillFormSchema>

export function DrillGenerator() {
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

    return (
        <div className="h-full overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-8 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="space-y-2 border-b pb-6">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <Dumbbell className="size-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Sensei</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Luyện tập Kỹ năng</h1>
                    <p className="text-muted-foreground mt-1">Tạo các bài tập tùy chỉnh để rèn luyện kỹ năng tiếng Nhật của bạn.</p>
                </header>

                {/* Configuration Card */}
                <Card className="shadow-sm">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cấu hình bài tập</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <form id="drill-form" onSubmit={form.handleSubmit(handleGenerate)} className="grid md:grid-cols-3 gap-6">
                            <Controller
                                name="type"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Kỹ năng</FieldLabel>
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
                                        <FieldLabel>Chủ đề</FieldLabel>
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
                                        <FieldLabel>Trình độ</FieldLabel>
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
                    <CardFooter className="flex justify-end py-4 bg-muted/30">
                        <Button
                            form="drill-form"
                            type="submit"
                            disabled={!form.watch("topic").trim() || isLoading}
                        >
                            {isLoading ? <Spinner className="mr-2" /> : <Sparkles className="size-4 mr-2" />}
                            Tạo bài tập
                        </Button>
                    </CardFooter>
                </Card>

                {/* Drill Content */}
                {result && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-primary" />
                                {result.topic}
                                <span className="text-sm font-normal text-muted-foreground ml-2">({result.drills.length} câu hỏi)</span>
                            </h3>
                            {Object.keys(userAnswers).length === result.drills.length && !showResults && (
                                <Button onClick={checkAnswers} variant="default" className="shadow-sm">
                                    Nộp bài & Xem kết quả
                                </Button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {result.drills.map((drill, i) => {
                                const userAnswer = userAnswers[i]
                                const isCorrect = userAnswer === drill.correctAnswer

                                return (
                                    <Card key={i} className={cn(
                                        "transition-all",
                                        showResults && isCorrect ? "border-emerald-500/50 bg-emerald-50/30" :
                                            showResults && !isCorrect && userAnswer ? "border-destructive/30 bg-destructive/5" : ""
                                    )}>
                                        <CardHeader className="py-4 bg-muted/20">
                                            <CardTitle className="text-base font-medium flex gap-3 text-foreground leading-relaxed">
                                                <span className="flex-none flex items-center justify-center size-7 rounded-full bg-background border text-primary text-sm font-bold">
                                                    {i + 1}
                                                </span>
                                                {drill.question}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <RadioGroup
                                                value={userAnswer}
                                                onValueChange={(val) => handleAnswer(i, val)}
                                                disabled={showResults}
                                                className="grid gap-3"
                                            >
                                                {drill.options.map((option, optIdx) => (
                                                    <div key={optIdx} className="relative">
                                                        <RadioGroupItem value={option} id={`q${i}-opt${optIdx}`} className="sr-only" />
                                                        <Label
                                                            htmlFor={`q${i}-opt${optIdx}`}
                                                            className={cn(
                                                                "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors font-medium",
                                                                userAnswer === option
                                                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                                    : "border-border hover:bg-muted/50",
                                                                showResults && option === drill.correctAnswer ? "border-emerald-500 bg-emerald-500/10" : "",
                                                                showResults && userAnswer === option && !isCorrect ? "border-destructive bg-destructive/10" : ""
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "size-6 rounded flex items-center justify-center text-[10px] font-black transition-colors shrink-0",
                                                                userAnswer === option ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </div>
                                                            <span className="flex-1">{option}</span>
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </CardContent>

                                        {showResults && (
                                            <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t bg-muted/10">
                                                <div className={cn(
                                                    "flex items-center gap-2 font-bold text-sm",
                                                    isCorrect ? "text-emerald-600" : "text-destructive"
                                                )}>
                                                    {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                                                    {isCorrect ? "Chính xác!" : "Chưa đúng"}
                                                </div>
                                                {!isCorrect && (
                                                    <div className="text-sm">
                                                        Đáp án đúng: <span className="font-bold text-emerald-600">{drill.correctAnswer}</span>
                                                    </div>
                                                )}
                                                <Alert className="border-primary/20 bg-primary/5 shadow-none">
                                                    <HelpCircle className="size-4 text-primary" />
                                                    <AlertTitle className="text-xs font-bold uppercase tracking-wider text-primary">Giải thích</AlertTitle>
                                                    <AlertDescription className="text-foreground mt-1 text-sm leading-relaxed">
                                                        {drill.explanation}
                                                    </AlertDescription>
                                                </Alert>
                                            </CardFooter>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
