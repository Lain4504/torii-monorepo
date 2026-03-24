"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Card, CardContent } from "@workspace/ui/components/card"
import { RotateCcw, ChevronLeft, ChevronRight, ThumbsUp } from "lucide-react"

export type FlashcardDifficulty = "forgot" | "known"

export interface Flashcard {
    id: string
    front: string
    back: string
    frontImage?: string
    backImage?: string
    tag?: string
}

export interface FlashcardsData {
    title: string
    description?: string
    cards: Flashcard[]
    /** Show self-rating buttons (default: true) */
    showRatings?: boolean
    /** Randomise order (default: false) */
    shuffle?: boolean
}

export interface FlashcardRating {
    cardId: string
    difficulty: FlashcardDifficulty
}

export interface FlashcardsResult {
    ratings: FlashcardRating[]
    counts: Record<FlashcardDifficulty, number>
}

export interface FlashcardsProps {
    flashcardsData: FlashcardsData
    onRate?: (rating: FlashcardRating) => void
    onComplete?: (result: FlashcardsResult) => void
    className?: string
    /** Nếu true, ẩn màn hình tổng kết nội bộ để cho phép parent render UI hoàn thành riêng. */
    hideInternalCompletion?: boolean
}

function shuffleArray<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
}

const DIFFICULTY_CONFIG: Record<
    FlashcardDifficulty,
    { label: string; variant: "destructive" | "default" }
> = {
    forgot: { label: "Quên", variant: "destructive" },
    known: { label: "Nhớ", variant: "default" },
}

export function Flashcards({ flashcardsData, onRate, onComplete, className, hideInternalCompletion }: FlashcardsProps) {
    const { title, description, showRatings = true, shuffle = false } = flashcardsData

    const cards = React.useMemo(
        () => shuffle ? shuffleArray(flashcardsData.cards) : flashcardsData.cards,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const [index, setIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [ratings, setRatings] = useState<FlashcardRating[]>([])
    const [finished, setFinished] = useState(false)

    const card = cards[index]
    if (!card) return null

    const progress = ((index + (flipped ? 0.5 : 0)) / cards.length) * 100

    const handleFlip = useCallback(() => setFlipped((f) => !f), [])

    const handleRate = useCallback(
        (difficulty: FlashcardDifficulty) => {
            const rating = { cardId: card.id, difficulty }
            const newRatings = [...ratings, rating]
            setRatings(newRatings)
            
            // Call onRate callback if provided
            onRate?.(rating)

            if (index + 1 >= cards.length) {
                const counts: Record<FlashcardDifficulty, number> = { forgot: 0, known: 0 }
                for (const r of newRatings) counts[r.difficulty]++
                setFinished(true)
                onComplete?.({ ratings: newRatings, counts })
            } else {
                setIndex((i) => i + 1)
                setFlipped(false)
            }
        },
        [ratings, card.id, index, cards.length, onComplete, onRate]
    )

    // ── Finished ──────────────────────────────────────────────────────────────
    if (finished) {
        if (hideInternalCompletion) {
            // Đã hoàn thành – giao lại cho parent hiển thị UI tổng kết (onComplete đã được gọi trong handleRate).
            return null
        }

        const counts: Record<FlashcardDifficulty, number> = { forgot: 0, known: 0 }
        for (const r of ratings) counts[r.difficulty]++
        return (
            <div className={cn("w-full max-w-2xl mx-auto space-y-4", className)}>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Session Complete!</h2>
                    <p className="text-muted-foreground">You reviewed all {cards.length} cards.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(DIFFICULTY_CONFIG) as FlashcardDifficulty[]).map((d) => (
                        <Card key={d}>
                            <CardContent className="pt-4 text-center">
                                <p className="text-3xl font-bold">{counts[d]}</p>
                                <p className="text-sm text-muted-foreground capitalize">{d}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => { setIndex(0); setFlipped(false); setRatings([]); setFinished(false) }}
                    >
                        <RotateCcw className="mr-2 size-4" /> Restart
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("w-full mx-auto space-y-4", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-lg">{title}</h2>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                <Badge variant="outline">{index + 1} / {cards.length}</Badge>
            </div>

            <Progress value={progress} className="h-1.5" />

            {/* 3-D flip card */}
            <div
                className="relative min-h-[16rem] cursor-pointer select-none"
                onClick={handleFlip}
                role="button"
                aria-label={flipped ? "Card back — click to flip" : "Card front — click to flip"}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleFlip()}
            >
                <div className="w-full min-h-[16rem] transition-all duration-300">
                    {!flipped ? (
                        /* Front Side Only */
                        <div className="w-full h-full min-h-[16rem] rounded-xl border bg-card shadow-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200">
                            {card.tag && <Badge variant="secondary" className="mb-3 text-xs">{card.tag}</Badge>}
                            {card.frontImage && <img src={card.frontImage} alt="card front" className="mb-3 max-h-24 object-contain rounded" />}
                            <p className="text-2xl font-bold leading-relaxed whitespace-pre-wrap">{card.front}</p>
                            <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-50">Nhấn để xem đáp án</p>
                        </div>
                    ) : (
                        /* Back Side Only */
                        <div className="w-full h-full min-h-[16rem] rounded-xl border bg-primary/5 shadow-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200 border-primary/20">
                            {card.backImage && <img src={card.backImage} alt="card back" className="mb-4 max-h-24 object-contain rounded" />}
                            <div className="max-h-full w-full overflow-y-auto px-2">
                                <p className="text-lg leading-relaxed whitespace-pre-wrap font-medium">{card.back}</p>
                            </div>
                            <p className="mt-6 text-[10px] text-primary/60 uppercase tracking-widest font-semibold opacity-50">Đáp án</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
                <Button
                    variant="ghost" size="icon"
                    onClick={() => { if (index > 0) { setIndex((i) => i - 1); setFlipped(false) } }}
                    disabled={index === 0}
                >
                    <ChevronLeft className="size-4" />
                </Button>

                {showRatings && flipped ? (
                    <div className="flex gap-2 flex-wrap justify-center">
                        {(Object.keys(DIFFICULTY_CONFIG) as FlashcardDifficulty[]).map((d) => (
                            <Button key={d} variant={DIFFICULTY_CONFIG[d].variant} size="sm" onClick={() => handleRate(d)}>
                                {DIFFICULTY_CONFIG[d].label}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <Button onClick={handleFlip} variant="outline" className="flex-1 max-w-xs">
                        {flipped
                            ? <><RotateCcw className="mr-2 size-4" />Flip Back</>
                            : <><ThumbsUp className="mr-2 size-4" />Reveal Answer</>}
                    </Button>
                )}

                <Button
                    variant="ghost" size="icon"
                    onClick={() => { if (index + 1 < cards.length) { setIndex((i) => i + 1); setFlipped(false) } }}
                    disabled={index + 1 >= cards.length}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    )
}