"use client"

import * as React from "react"
import { Layers, ArrowRight, Loader2, RotateCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { agentApi } from "@/apis/services/agent-api"
import { AgentFlashcardResponseDTO as FlashcardResponse } from "@workspace/schemas"
import { Card, CardContent } from "@workspace/ui/components/card"

export function FlashcardGenerator() {
    const [topic, setTopic] = React.useState("")
    const [difficulty, setDifficulty] = React.useState<"beginner" | "intermediate" | "advanced">("intermediate")
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<FlashcardResponse | null>(null)
    const [flippedCards, setFlippedCards] = React.useState<Record<number, boolean>>({})

    const handleGenerate = async () => {
        if (!topic.trim()) return
        setIsLoading(true)
        setResult(null)
        setFlippedCards({})

        try {
            const data = await agentApi.sensei.createFlashcard(topic, difficulty)
            setResult(data)
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
            <div className="space-y-1 pb-2 border-b border-border/40">
                <h2 className="text-2xl font-bold tracking-tight">AI Flashcards</h2>
                <p className="text-sm text-muted-foreground">
                    Tạo bộ thẻ học thông minh theo chủ đề
                </p>
            </div>

            {/* Input Section */}
            <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
                <div className="grid md:grid-cols-[1fr,200px] gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Chủ đề</label>
                        <Input
                            placeholder="Ví dụ: Đồ ăn, Du lịch, Business Email..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Trình độ</label>
                        <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Sơ cấp (Beginner)</SelectItem>
                                <SelectItem value="intermediate">Trung cấp (Intermediate)</SelectItem>
                                <SelectItem value="advanced">Cao cấp (Advanced)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleGenerate}
                        disabled={!topic.trim() || isLoading}
                        className="px-6 font-semibold min-w-[140px]"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 size-4 animate-spin" /> Creating...</>
                        ) : (
                            <>
                                Create Deck <ArrowRight className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

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
                                    <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center bg-card rounded-xl border border-border">
                                        <div className="font-bold text-2xl mb-2">{card.front}</div>
                                        <div className="text-sm text-muted-foreground">Mặt trước</div>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                                            <RotateCw className="size-4" />
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center bg-primary/5 rounded-xl border border-primary/20">
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
