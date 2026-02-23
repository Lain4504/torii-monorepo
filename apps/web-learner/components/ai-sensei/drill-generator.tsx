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
        <div className="max-w-4xl mx-auto space-y-8 pb-20 p-4 md:p-8">
            {/* Header */}
            <div className="space-y-1 pb-4 border-b">
                <h1 className="text-3xl font-bold tracking-tight">Practice Drills</h1>
                <p className="text-muted-foreground font-medium">
                    Bài tập luyện tập theo kỹ năng
                </p>
            </div>

            {/* Input Section */}
            <Card className="p-6">
                <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Controller
                            name="type"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Kỹ năng</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id={field.name}>
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
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Chủ đề</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Ví dụ: Particles, Family, Travel..."
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="difficulty"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Trình độ</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id={field.name}>
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
                        >
                            {isLoading ? (
                                <><Spinner className="mr-2" /> Generating...</>
                            ) : (
                                <>
                                    Generate Drill <ArrowRight className="ml-2 size-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

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
                                <Card key={i} className={cn("transition-colors overflow-hidden",
                                    showResults && isCorrect ? "border-primary/50 bg-primary/5" :
                                        showResults && !isCorrect && userAnswer ? "border-destructive/20 bg-destructive/5" : ""
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
                                                <div key={optIdx} className="relative">
                                                    <RadioGroupItem value={option} id={`q${i}-opt${optIdx}`} className="sr-only" />
                                                    <Label
                                                        htmlFor={`q${i}-opt${optIdx}`}
                                                        className={cn(
                                                            "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all",
                                                            userAnswer === option
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50 hover:bg-muted/50",
                                                            showResults && option === drill.correctAnswer ? "border-primary bg-primary/10" : "",
                                                            showResults && userAnswer === option && !isCorrect ? "border-destructive bg-destructive/10" : ""
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "size-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors shrink-0",
                                                            userAnswer === option ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </div>
                                                        <span className="flex-1 font-medium text-sm">{option}</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </CardContent>

                                    {showResults && (
                                        <CardFooter className={cn(
                                            "flex flex-col items-start gap-2 pt-4 border-t text-sm",
                                            isCorrect ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"
                                        )}>
                                            <div className="flex items-center gap-2 font-bold">
                                                {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                                                {isCorrect ? "Correct!" : "Incorrect"}
                                            </div>
                                            {!isCorrect && (
                                                <div className="text-foreground">
                                                    Correct answer: <span className="font-bold">{drill.correctAnswer}</span>
                                                </div>
                                            )}
                                            <div className="flex gap-2 text-muted-foreground mt-1 bg-background/50 p-3 rounded w-full border border-border/50 transition-colors">
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
