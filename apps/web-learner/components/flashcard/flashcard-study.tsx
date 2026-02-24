'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flashcardApi } from '@/lib/api/services/flashcard-api'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { ArrowLeft, CheckCircle2, XCircle, BrainCircuit, Timer, Trophy } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from '@workspace/ui/components/sonner'
import { Card, CardContent } from '@workspace/ui/components/card'

interface FlashcardStudyProps {
    deckId: string
}

export function FlashcardStudy({ deckId }: FlashcardStudyProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [sessionStartTime] = useState(Date.now())
    const [cardStartTime, setCardStartTime] = useState(Date.now())
    const [completedCount, setCompletedCount] = useState(0)

    // 1. Start Session
    const { data: session, isLoading: isStartingSession } = useQuery({
        queryKey: ['flashcard-session', deckId],
        queryFn: () => flashcardApi.startSession({ deckId, studyMode: 'normal' }),
        staleTime: Infinity,
    })

    // 2. Fetch Cards Due
    const { data: cardsDue, isLoading: isLoadingCards } = useQuery({
        queryKey: ['flashcards-due', deckId],
        queryFn: () => flashcardApi.getCardsDue({ deckId, limit: 20 }),
        enabled: !!session,
    })

    // 3. Submit Review Mutation
    const { mutate: submitReview } = useMutation({
        mutationFn: flashcardApi.submitReview,
        onSuccess: () => { },
        onError: () => {
            toast.error("Không thể đồng bộ tiến độ học tập.")
        }
    })

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const handleRate = async (quality: number) => {
        if (!cardsDue || !session) return

        const currentCardData = cardsDue[currentIndex]
        const flashcard = currentCardData.flashcard
        const timeSpent = Date.now() - cardStartTime

        const qualityMap = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR']
        const qualityEnum = qualityMap[quality] || 'TWO'

        submitReview({
            flashcardId: flashcard.id,
            deckId,
            quality: qualityEnum as any,
            timeSpent,
            sessionId: session.id
        })

        setIsFlipped(false)
        setCompletedCount(prev => prev + 1)

        if (currentIndex < cardsDue.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setCardStartTime(Date.now())
        } else {
            handleCompleteSession()
        }
    }

    const handleCompleteSession = async () => {
        if (session) {
            await flashcardApi.completeSession(session.id, {
                durationSeconds: Math.floor((Date.now() - sessionStartTime) / 1000)
            })
            toast.success("Đã hoàn thành phiên ôn tập!")
            router.push('/dashboard/flashcards')
        }
    }

    if (isStartingSession || isLoadingCards) {
        return <PageLoading text="Đang chuẩn bị bộ thẻ nhớ..." className="h-[60vh]" />
    }

    if (!cardsDue || cardsDue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500">
                <div className="size-20 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <CheckCircle2 className="size-10" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Hoàn thành mục tiêu</h2>
                    <p className="text-sm text-muted-foreground">Không còn thẻ nào cần ôn tập trong bộ này.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/flashcards')} className="font-bold px-8">
                    Quay lại kho thẻ
                </Button>
            </div>
        )
    }

    const currentCardData = cardsDue[currentIndex]
    const currentCard = currentCardData.flashcard

    if (!currentCard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground">Đã hoàn thành phiên học.</p>
                <Button onClick={handleCompleteSession}>Kết thúc</Button>
            </div>
        )
    }

    const progress = ((currentIndex) / cardsDue.length) * 100

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 h-full min-h-[80vh] flex flex-col">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="size-5" />
                </Button>
                <div className="flex-1 px-8">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
                        <span>Tiến độ học tập</span>
                        <span>{currentIndex + 1} / {cardsDue.length}</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                    <Timer className="size-4" />
                    <span>{Math.floor((Date.now() - sessionStartTime) / 1000)} giây</span>
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentCard.id + (isFlipped ? '-flipped' : '')}
                        initial={{ opacity: 0, rotateX: isFlipped ? -90 : 90 }}
                        animate={{ opacity: 1, rotateX: 0 }}
                        exit={{ opacity: 0, rotateX: isFlipped ? 90 : -90 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleFlip}
                    >
                        <Card className={cn(
                            "w-full aspect-[16/10] md:aspect-[2/1] cursor-pointer transition-all border-border/50 hover:border-primary/30 hover:bg-muted/20",
                            isFlipped ? "border-primary/30 bg-primary/5" : ""
                        )}>
                            <CardContent className="h-full flex flex-col items-center justify-center gap-6 p-8 md:p-16 text-center">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    {isFlipped ? "Mặt sau" : "Mặt trước — Nhấn để lật"}
                                </div>

                                <div className="space-y-4 max-w-2xl">
                                    {isFlipped ? (
                                        <>
                                            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                                                {currentCard.backText}
                                            </h2>
                                            {currentCard.furigana && <p className="text-xl text-primary/70 font-mono">{currentCard.furigana}</p>}
                                            {currentCard.exampleSentence && (
                                                <p className="text-base text-muted-foreground italic leading-relaxed">
                                                    "{currentCard.exampleSentence}"
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground">
                                            {currentCard.frontText}
                                        </h2>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="h-24">
                {isFlipped ? (
                    <div className="grid grid-cols-4 gap-3 h-full">
                        <Button onClick={() => handleRate(0)} variant="outline" className="h-full flex flex-col gap-2 hover:bg-destructive/5 hover:border-destructive/50 hover:text-destructive">
                            <XCircle className="size-6" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Làm lại</span>
                        </Button>
                        <Button onClick={() => handleRate(1)} variant="outline" className="h-full flex flex-col gap-2 hover:bg-muted/50">
                            <BrainCircuit className="size-6" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Khó</span>
                        </Button>
                        <Button onClick={() => handleRate(2)} variant="outline" className="h-full flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 hover:text-primary">
                            <CheckCircle2 className="size-6" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Tốt</span>
                        </Button>
                        <Button onClick={() => handleRate(3)} variant="default" className="h-full flex flex-col gap-2">
                            <Trophy className="size-6" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Dễ</span>
                        </Button>
                    </div>
                ) : (
                    <Button onClick={handleFlip} variant="outline" className="w-full h-full text-base font-bold hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all">
                        Xem đáp án
                    </Button>
                )}
            </div>
        </div>
    )
}
