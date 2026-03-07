"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { flashcardApi } from "@/lib/api/services/flashcard-api"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { Button } from "@workspace/ui/components/button"
import {
    ArrowLeft,
    BrainCircuit,
    Trophy,
    Info
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import {
    Flashcards,
    type FlashcardsData,
    type FlashcardsResult,
    type FlashcardDifficulty
} from "@workspace/ui/components/custom/flashcards"

interface FlashcardStudyProps {
    deckId: string
}

export function FlashcardStudy({ deckId }: FlashcardStudyProps) {
    const router = useRouter()
    const queryClient = useQueryClient()

    // Fetch Study Cards
    const { data: studyCards, isLoading: isLoadingCards } = useQuery({
        queryKey: ["flashcards-study", deckId],
        queryFn: () => flashcardApi.getStudyCards(deckId),
    })

    // Fetch Deck Info
    const { data: deck, isLoading: isLoadingDeck } = useQuery({
        queryKey: ["flashcard-deck", deckId],
        queryFn: () => flashcardApi.getDeckById(deckId),
    })

    // Review Card Mutation
    const { mutate: submitReview } = useMutation({
        mutationFn: ({ cardId, quality }: { cardId: string; quality: 0 | 1 }) =>
            flashcardApi.reviewCard(cardId, quality),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards-study", deckId] })
        },
        onError: () => {
            toast.error("Không thể đồng bộ tiến độ học tập.")
        }
    })

    // Convert backend StudyCard[] to Flashcards component format
    const flashcardsData: FlashcardsData | null = React.useMemo(() => {
        if (!studyCards || !deck) return null

        return {
            title: deck.name,
            description: `${studyCards.length} thẻ cần ôn tập`,
            cards: studyCards.map(card => {
                // Build front text (term + furigana if available)
                const furigana = card.languageDetails?.furigana as string | undefined
                let front = card.term
                if (furigana && furigana !== card.term) {
                    front = `${card.term}\n(${furigana})`
                }

                return {
                    id: card.id,
                    front,
                    back: card.definition,
                    tag: card.srsState
                }
            }),
            showRatings: true,
            shuffle: false
        }
    }, [studyCards, deck])

    // Handle completion with ratings
    const handleComplete = React.useCallback((result: FlashcardsResult) => {
        // Map difficulty ratings to quality scores
        // again/hard -> 0 (forgot), good/easy -> 1 (remember)
        const qualityMap: Record<FlashcardDifficulty, 0 | 1> = {
            again: 0,
            hard: 0,
            good: 1,
            easy: 1
        }

        // Submit all reviews
        result.ratings.forEach(rating => {
            submitReview({
                cardId: rating.cardId,
                quality: qualityMap[rating.difficulty]
            })
        })

        toast.success(`Đã hoàn thành ${result.ratings.length} thẻ!`)
        
        // Navigate back after a short delay
        setTimeout(() => {
            router.push("/dashboard/flashcards")
        }, 1500)
    }, [submitReview, router])

    if (isLoadingCards || isLoadingDeck) {
        return <PageLoading text="Đang chuẩn bị lộ trình ôn tập..." />
    }

    if (!flashcardsData || flashcardsData.cards.length === 0) {
        const isEmptyDeck = deck?.stats?.cardCount === 0

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700">
                <div className={cn(
                    "p-6 rounded-full border animate-bounce",
                    isEmptyDeck ? "bg-muted/10 border-muted text-muted-foreground" : "bg-primary/10 border-primary/20 text-primary"
                )}>
                    {isEmptyDeck ? <BrainCircuit className="size-12" /> : <Trophy className="size-12" />}
                </div>
                <div className="text-center space-y-2 max-w-sm">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isEmptyDeck ? "Chưa có thẻ nào" : "Tuyệt vời!"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isEmptyDeck
                            ? "Bộ thẻ này hiện tại đang trống. Hãy thêm một vài thẻ trước khi bắt đầu hành trình chinh phục kiến thức!"
                            : "Bạn đã hoàn thành tất cả các thẻ cần ôn tập trong bộ nhớ này. Hãy quay lại vào ngày mai!"}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={() => router.push("/dashboard/flashcards")} size="lg" className="font-bold uppercase tracking-widest text-[10px] px-8">
                        Quay lại kho thẻ
                    </Button>
                    {isEmptyDeck && (
                        <Button onClick={() => router.push(`/dashboard/flashcards/${deckId}/manage`)} size="lg" className="font-bold uppercase tracking-widest text-[10px] px-8">
                            Quản lý nội dung
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="size-4" />
                    Quay lại
                </Button>
            </div>
            
            <Flashcards 
                flashcardsData={flashcardsData} 
                onComplete={handleComplete}
            />
            
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-medium text-muted-foreground/40 italic">
                <Info className="size-3" />
                Click thẻ để lật. Đánh giá độ khó để hệ thống nhớ lịch trình ôn tập tốt hơn.
            </div>
        </div>
    )
}
