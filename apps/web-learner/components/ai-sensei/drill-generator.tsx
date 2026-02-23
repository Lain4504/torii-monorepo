"use client"

import * as React from "react"
import { Dumbbell, ArrowRight, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
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

const drillFormSchema = z.object({
    type: z.enum(['grammar', 'vocabulary', 'kanji', 'listening', 'reading']),
    topic: z.string().min(1, "Vui lòng nhập chủ đề"),
    difficulty: z.enum(["N5", "N4", "N3", "N2", "N1"]),
})

type DrillFormData = z.infer<typeof drillFormSchema>
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from '@workspace/ui/components/spinner'

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
        setResult(null)
        setUserAnswers({})
        setShowResults(false)

        try {
            const res = await agentApi.sensei.generateDrill(data.type, data.topic, data.difficulty)
            setResult(res)
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
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-1 pb-2 border-b border-border/40">
                <h2 className="text-2xl font-bold tracking-tight">Practice Drills</h2>
                <p className="text-sm text-muted-foreground">
                    Bài tập luyện tập theo kỹ năng
                </p>
            </div>

            {/* Input Section */}
            <form onSubmit={form.handleSubmit(handleGenerate)} className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <Controller
                        name="type"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Kỹ năng</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="grammar">Ngữ pháp (Grammar)</SelectItem>
                                        <SelectItem value="vocabulary">Từ vựng (Vocabulary)</SelectItem>
                                        <SelectItem value="kanji">Hán tự (Kanji)</SelectItem>
                                        <SelectItem value="reading">Đọc hiểu (Reading)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />
                    <Controller
                        name="topic"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Chủ đề</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="Ví dụ: Particles, Family, Travel..."
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="difficulty"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-2">
                                <FieldLabel htmlFor={field.name}>Trình độ</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="N5">N5 (Beginner)</SelectItem>
                                        <SelectItem value="N4">N4 (Basic)</SelectItem>
                                        <SelectItem value="N3">N3 (Intermediate)</SelectItem>
                                        <SelectItem value="N2">N2 (Pre-Advanced)</SelectItem>
                                        <SelectItem value="N1">N1 (Advanced)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={!form.watch("topic").trim() || isLoading}
                        className="px-6 font-semibold min-w-[140px]"
                    >
                        {isLoading ? (
                            <><Spinner className="mr-2 size-4 animate-spin" /> Generating...</>
                        ) : (
                            <>
                                Generate Drill <ArrowRight className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Result Section */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Dumbbell className="size-5 text-primary" />
                            {result.topic} <span className="text-muted-foreground text-sm font-normal capitalize">({form.watch("type")} - {form.watch("difficulty")})</span>
                        </h3>
                        {Object.keys(userAnswers).length === result.drills.length && !showResults && (
                            <Button onClick={checkAnswers} variant="default" className="gap-2">
                                <CheckCircle2 className="size-4" /> Check Answers
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-6">
                        {result.drills.map((drill, i) => {
                            const userAnswer = userAnswers[i]
                            const isCorrect = userAnswer === drill.correctAnswer

                            return (
                                <Card key={i} className={cn("overflow-hidden transition-colors",
                                    showResults && isCorrect ? "border-green-500/50 bg-green-500/5" :
                                        showResults && !isCorrect && userAnswer ? "border-red-500/50 bg-red-500/5" : ""
                                )}>
                                    <CardHeader className="pb-3 bg-muted/30">
                                        <CardTitle className="text-base font-medium flex gap-3 leading-relaxed">
                                            <span className="flex-none flex items-center justify-center size-6 rounded bg-background border text-muted-foreground text-sm font-bold">
                                                {i + 1}
                                            </span>
                                            {drill.question}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <RadioGroup
                                            value={userAnswer}
                                            onValueChange={(val) => handleAnswer(i, val)}
                                            disabled={showResults}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                        >
                                            {drill.options.map((option, optIdx) => (
                                                <div key={optIdx} className={cn(
                                                    "flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                                                    userAnswer === option ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
                                                    showResults && option === drill.correctAnswer ? "border-green-500 bg-green-100 dark:bg-green-900/20 ring-1 ring-green-500" : "",
                                                    showResults && userAnswer === option && !isCorrect ? "border-red-500 bg-red-100 dark:bg-red-900/20" : ""
                                                )}>
                                                    <RadioGroupItem value={option} id={`q${i}-opt${optIdx}`} />
                                                    <Label htmlFor={`q${i}-opt${optIdx}`} className="flex-1 cursor-pointer font-normal">{option}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </CardContent>

                                    {showResults && (
                                        <CardFooter className={cn(
                                            "flex flex-col items-start gap-2 pt-4 border-t text-sm",
                                            isCorrect ? "bg-green-100/50 dark:bg-green-900/10 text-green-800 dark:text-green-300" : "bg-red-100/50 dark:bg-red-900/10 text-red-800 dark:text-red-300"
                                        )}>
                                            <div className="flex items-center gap-2 font-semibold">
                                                {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                                                {isCorrect ? "Correct!" : "Incorrect"}
                                            </div>
                                            {!isCorrect && (
                                                <div className="text-foreground">
                                                    Correct answer: <span className="font-bold">{drill.correctAnswer}</span>
                                                </div>
                                            )}
                                            <div className="flex gap-2 text-muted-foreground mt-1 bg-background/50 p-3 rounded w-full border border-black/5 dark:border-white/5">
                                                <HelpCircle className="size-4 mt-0.5 flex-none" />
                                                <span>{drill.explanation}</span>
                                            </div>
                                        </CardFooter>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
