"use client"

import * as React from "react"
import { Layers, ArrowRight, RotateCw } from 'lucide-react'
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
import { AgentFlashcardResponseDTO as FlashcardResponse } from "@workspace/schemas"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Spinner } from '@workspace/ui/components/spinner'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const flashcardFormSchema = z.object({
    topic: z.string().min(1, "Vui lòng nhập chủ đề"),
    level: z.enum(["N5", "N4", "N3", "N2", "N1"]),
})

type FlashcardFormData = z.infer<typeof flashcardFormSchema>

export function FlashcardGenerator() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<FlashcardResponse | null>(null)
    const [flippedCards, setFlippedCards] = React.useState<Record<number, boolean>>({})

    const form = useForm<FlashcardFormData>({
        resolver: zodResolver(flashcardFormSchema),
        defaultValues: {
            topic: "",
            level: "N4",
        },
    })

    const handleGenerate = async (data: FlashcardFormData) => {
        setIsLoading(true)
        setResult(null)
        setFlippedCards({})

        try {
            const res = await agentApi.sensei.createFlashcard(data.topic, data.level)
            setResult(res)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleFlip = (index: number) => {
        setFlippedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">

            {/* Header */}
            <div className="space-y-1 pb-4 border-b">
                <h1 className="text-3xl font-extrabold tracking-tight">AI Flashcards</h1>
                <p className="text-muted-foreground font-medium">
                    Tạo bộ thẻ học thông minh theo chủ đề
                </p>
            </div>

            {/* Input Section */}
            <Card className="p-6">
                <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
                    <div className="grid md:grid-cols-[1fr,200px] gap-4">
                        <Controller
                            name="topic"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Chủ đề</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Ví dụ: Đồ ăn, Du lịch, Business Email..."
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="level"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Trình độ</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id={field.name}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="N5">N5 (Sơ cấp)</SelectItem>
                                            <SelectItem value="N4">N4 (Cơ bản)</SelectItem>
                                            <SelectItem value="N3">N3 (Trung cấp)</SelectItem>
                                            <SelectItem value="N2">N2 (Tiền cao cấp)</SelectItem>
                                            <SelectItem value="N1">N1 (Cao cấp)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={!form.watch("topic").trim() || isLoading}
                            className="font-semibold min-w-[140px]"
                        >
                            {isLoading ? (
                                <><Spinner className="mr-2" /> Creating...</>
                            ) : (
                                <>
                                    Create Deck <ArrowRight className="ml-2 size-4" />
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
                            <Layers className="size-5 text-primary" />
                            {result.topic}
                            <span className="text-muted-foreground text-sm font-normal">({result.flashcards.length} cards)</span>
                        </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.flashcards.map((card, i) => (
                            <Card
                                key={i}
                                className="cursor-pointer hover:shadow-md transition-all h-[200px] perspective-1000 group relative"
                                onClick={() => toggleFlip(i)}
                            >
                                <CardContent className="p-0 h-full relative preserve-3d transition-transform duration-500" style={{ transform: flippedCards[i] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

                                    {/* Front */}
                                    <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center bg-card rounded-lg border border-border">
                                        <div className="font-bold text-2xl mb-2">{card.front}</div>
                                        <div className="text-sm text-muted-foreground">Mặt trước</div>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                                            <RotateCw className="size-4" />
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center bg-primary/5 rounded-lg border border-primary/20">
                                        <div className="font-bold text-xl mb-2 text-primary">{card.back}</div>
                                        {card.reading && <div className="text-sm text-muted-foreground mb-1">{card.reading}</div>}
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Mặt sau</div>
                                    </div>

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
