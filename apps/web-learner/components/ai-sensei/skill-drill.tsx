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
import {
    Quiz,
    type QuizData,
    type QuizResult
} from "@workspace/ui/components/custom/quiz"
import { Separator } from "@workspace/ui/components/separator"
import { nanoid } from 'nanoid'

const drillFormSchema = z.object({
    type: z.enum(['grammar', 'vocabulary', 'kanji', 'listening', 'reading']),
    topic: z.string().min(1, "Vui lòng nhập chủ đề"),
    difficulty: z.enum(["N5", "N4", "N3", "N2", "N1"]),
})

type DrillFormData = z.infer<typeof drillFormSchema>

export function SkillDrill({ embed = false }: { embed?: boolean }) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<DrillResponse | null>(null)
    const [userAnswers, setUserAnswers] = React.useState<Record<number, string>>({})
    const [showResults, setShowResults] = React.useState(false)
    const [quizData, setQuizData] = React.useState<QuizData | null>(null)

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
            
            // Map to QuizData
            const mappedQuizData: QuizData = {
                title: res.topic,
                description: `Bài tập ${data.type} - ${data.difficulty}`,
                questions: res.drills.map((drill, index) => {
                    // Create stable IDs for options
                    const optionObjects = drill.options.map(opt => ({
                        id: nanoid(),
                        label: opt,
                        explanation: drill.correctAnswer === opt ? drill.explanation : undefined
                    }))

                    // Find correct ID
                    const correctOption = optionObjects.find(opt => opt.label === drill.correctAnswer)
                    
                    return {
                        id: `q-${index}`,
                        type: 'single',
                        question: drill.question,
                        options: optionObjects,
                        correctIds: correctOption ? [correctOption.id] : [],
                        points: 1
                    }
                })
            }
            setQuizData(mappedQuizData)
            setUserAnswers({})
            setShowResults(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuizComplete = (result: QuizResult) => {
        // You can handle additional logic here if needed
        console.log("Quiz completed", result);
    }

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

            {quizData && (
                <div className="pt-8 animate-in fade-in duration-500">
                    <Quiz 
                        quizData={quizData} 
                        onComplete={handleQuizComplete}
                        className="border rounded-xl shadow-sm"
                    />
                </div>
            )}
        </div>
    )

    if (embed) return Content

    return (
        <div className="h-full overflow-y-auto w-full">
             <div className="max-w-6xl mx-auto p-4">
                {Content}
            </div>
        </div>
    )
}
