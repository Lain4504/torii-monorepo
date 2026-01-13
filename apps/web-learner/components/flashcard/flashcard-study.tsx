'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flashcardApi } from '@/apis/services/flashcard-api'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { ArrowLeft, RotateCw, CheckCircle2, XCircle, BrainCircuit, Timer, Trophy } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from '@workspace/ui/components/sonner'

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
        queryFn: () => flashcardApi.startSession({ deckId, studyMode: 'standard' }),
        staleTime: Infinity, // Keep session active
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
        onSuccess: () => {
            // Prefetch or invalidate if needed
        },
        onError: () => {
            toast.error("Failed to sync progress to neural network.")
        }
    })

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const handleRate = async (quality: number) => {
        if (!cardsDue || !session) return

        const currentCard = cardsDue[currentIndex]
        const timeSpent = Date.now() - cardStartTime

        submitReview({
            flashcardId: currentCard.id,
            deckId,
            quality,
            timeSpent,
            sessionId: session.id
        })

        // Move to next
        setIsFlipped(false)
        setCompletedCount(prev => prev + 1)

        if (currentIndex < cardsDue.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setCardStartTime(Date.now())
        } else {
            // Session Complete
            // Optionally fetch more or show finish screen
            // For now, let's just complete the session
            handleCompleteSession()
        }
    }

    const handleCompleteSession = async () => {
        if (session) {
            await flashcardApi.completeSession(session.id, {
                durationSeconds: Math.floor((Date.now() - sessionStartTime) / 1000)
            })
            // Force re-fetch of due cards to see if more appeared or just show "Done" state locally
            // Ideally show a summary screen
            toast.success("Memory consolidation complete.")
            router.push('/dashboard/flashcards')
        }
    }

    if (isStartingSession || isLoadingCards) {
        return <PageLoading text="Initializing Neural Interface..." className="h-[60vh]" />
    }

    if (!cardsDue || cardsDue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="size-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                    <CheckCircle2 className="size-12" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">All Targets Neutralized</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">No pending memory protocols for this sector.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/flashcards')} className="rounded-xl px-8 uppercase font-black tracking-widest">
                    Return to Command
                </Button>
            </div>
        )
    }

    const currentCard = cardsDue[currentIndex]
    // Safely check if we went out of bounds (should exist due to completion logic, but for safety)
    if (!currentCard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p>Session Complete.</p>
                <Button onClick={handleCompleteSession}>Finish</Button>
            </div>
        )
    }

    const progress = ((currentIndex) / cardsDue.length) * 100

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 h-full min-h-[80vh] flex flex-col">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="rounded-xl size-10 p-0" onClick={() => router.back()}>
                    <ArrowLeft className="size-5" />
                </Button>
                <div className="flex-1 px-8">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">
                        <span>Progress sequence</span>
                        <span>{currentIndex + 1} / {cardsDue.length}</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-white/5" indicatorClassName="bg-primary/50" />
                </div>
                <div className="flex items-center gap-2 text-primary/80 font-mono text-xs">
                    <Timer className="size-4" />
                    <span>{Math.floor((Date.now() - sessionStartTime) / 1000)}s</span>
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="flex-1 flex flex-col justify-center perspective-1000">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentCard.id + (isFlipped ? '-flipped' : '')}
                        initial={{ opacity: 0, rotateX: isFlipped ? -90 : 90 }}
                        animate={{ opacity: 1, rotateX: 0 }}
                        exit={{ opacity: 0, rotateX: isFlipped ? 90 : -90 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleFlip}
                        className={cn(
                            "relative w-full aspect-[16/10] md:aspect-[2/1] rounded-[2rem] border border-white/10 bg-background/40 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center cursor-pointer group hover:border-primary/20 transition-colors p-8 md:p-16 text-center overflow-hidden",
                            isFlipped ? "border-primary/20 bg-primary/5" : ""
                        )}
                    >
                        {/* Zen UI Decorations */}
                        <div className="absolute top-6 left-6 flex gap-2">
                            <div className="size-2 rounded-full bg-white/10 animate-pulse" />
                            <div className="size-2 rounded-full bg-white/5" />
                        </div>
                        <div className="absolute top-6 right-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/10">
                            {isFlipped ? "Back Face // Audio Enabled" : "Front Face // Pattern Recognition"}
                        </div>

                        <div className="space-y-6 max-w-2xl">
                            {isFlipped ? (
                                <>
                                    <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                                        {currentCard.backText}
                                    </h2>
                                    {currentCard.reading && <p className="text-xl text-primary/60 font-mono">{currentCard.reading}</p>}
                                    {currentCard.exampleSentence && (
                                        <p className="text-lg text-muted-foreground/80 italic font-serif leading-relaxed">
                                            "{currentCard.exampleSentence}"
                                        </p>
                                    )}
                                </>
                            ) : (
                                <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground">
                                    {currentCard.frontText}
                                </h2>
                            )}
                        </div>

                        <div className="absolute bottom-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 animate-pulse">
                            {isFlipped ? "Tap to flip back" : "Tap to reveal"}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="h-24">
                {isFlipped ? (
                    <div className="grid grid-cols-4 gap-4 h-full">
                        <Button onClick={() => handleRate(0)} variant="outline" className="h-full rounded-2xl flex flex-col gap-2 border-red-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all">
                            <XCircle className="size-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Again</span>
                        </Button>
                        <Button onClick={() => handleRate(1)} variant="outline" className="h-full rounded-2xl flex flex-col gap-2 border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50 transition-all">
                            <BrainCircuit className="size-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Hard</span>
                        </Button>
                        <Button onClick={() => handleRate(2)} variant="outline" className="h-full rounded-2xl flex flex-col gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                            <CheckCircle2 className="size-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Good</span>
                        </Button>
                        <Button onClick={() => handleRate(3)} variant="outline" className="h-full rounded-2xl flex flex-col gap-2 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
                            <Trophy className="size-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Easy</span>
                        </Button>
                    </div>
                ) : (
                    <Button onClick={handleFlip} className="w-full h-full rounded-2xl text-lg font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 text-foreground border border-white/5 hover:border-primary/30 transition-all shadow-xl">
                        Reveal Answer
                    </Button>
                )}
            </div>
        </div>
    )
}
