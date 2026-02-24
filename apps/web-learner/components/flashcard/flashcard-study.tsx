"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { flashcardApi } from "@/lib/api/services/flashcard-api"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    BrainCircuit,
    Timer,
    Trophy,
    Info,
    ChevronRight,
    RotateCw,
    Check
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import {
    Flashcard,
    FlashcardHeader,
    FlashcardContent,
    FlashcardFooter,
    FlashcardFront,
    FlashcardBack,
    FlashcardFurigana,
    FlashcardExample
} from "@workspace/ui/components/flashcard"
import { Spinner } from "@workspace/ui/components/spinner"

interface FlashcardStudyProps {
    deckId: string
}

export function FlashcardStudy({ deckId }: FlashcardStudyProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isFlipped, setIsFlipped] = React.useState(false)
    const [sessionStartTime] = React.useState(Date.now())
    const [cardStartTime, setCardStartTime] = React.useState(Date.now())
    const [completedCount, setCompletedCount] = React.useState(0)
    const [elapsedSeconds, setElapsedSeconds] = React.useState(0)

    // Timer effect
    React.useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000))
        }, 1000)
        return () => clearInterval(timer)
    }, [sessionStartTime])

    // 1. Start Session
    const { data: session, isLoading: isStartingSession } = useQuery({
        queryKey: ["flashcard-session", deckId],
        queryFn: () => flashcardApi.startSession({ deckId, studyMode: "normal" }),
        staleTime: Infinity,
    })

    // 2. Fetch Cards Due
    const { data: cardsDue, isLoading: isLoadingCards } = useQuery({
        queryKey: ["flashcards-due", deckId],
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

    const handleFlip = React.useCallback(() => {
        setIsFlipped(prev => !prev)
    }, [])

    const handleRate = React.useCallback(async (quality: number) => {
        if (!cardsDue || !session) return

        const currentCardData = cardsDue[currentIndex]
        const flashcard = currentCardData.flashcard
        const timeSpent = Date.now() - cardStartTime

        const qualityMap = ["ZERO", "ONE", "TWO", "THREE", "FOUR"]
        const qualityEnum = qualityMap[quality] || "TWO"

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
    }, [cardsDue, currentIndex, session, cardStartTime, deckId, submitReview])

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault()
                handleFlip()
            } else if (isFlipped) {
                if (e.key === "1") handleRate(0)
                else if (e.key === "2") handleRate(1)
                else if (e.key === "3") handleRate(2)
                else if (e.key === "4") handleRate(3)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleFlip, handleRate, isFlipped])

    const handleCompleteSession = async () => {
        if (session) {
            await flashcardApi.completeSession(session.id, {
                durationSeconds: elapsedSeconds
            })
            toast.success("Đã hoàn thành phiên ôn tập!")
            router.push("/dashboard/flashcards")
        }
    }

    if (isStartingSession || isLoadingCards) {
        return <PageLoading text="Đang chuẩn bị lộ trình ôn tập..." />
    }

    if (!cardsDue || cardsDue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700">
                <div className="p-6 rounded-full bg-primary/10 border border-primary/20 text-primary animate-bounce">
                    <Trophy className="size-12" />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                    <h2 className="text-3xl font-bold tracking-tight">Tuyệt vời!</h2>
                    <p className="text-muted-foreground">
                        Bạn đã hoàn thành tất cả các thẻ cần ôn tập trong bộ nhớ này. Hãy quay lại vào ngày mai!
                    </p>
                </div>
                <Button onClick={() => router.push("/dashboard/flashcards")} size="lg" className="font-bold uppercase tracking-widest text-[10px] px-8">
                    Quay lại kho thẻ
                </Button>
            </div>
        )
    }

    const currentCardData = cardsDue[currentIndex]
    const currentCard = currentCardData.flashcard

    if (!currentCard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <p className="text-muted-foreground font-medium">Đã hoàn thành phiên học.</p>
                <Button onClick={handleCompleteSession} className="font-bold uppercase tracking-widest text-[10px]">Kết thúc buổi học</Button>
            </div>
        )
    }

    const progress = ((currentIndex) / cardsDue.length) * 100
    const minutes = Math.floor(elapsedSeconds / 60)
    const seconds = elapsedSeconds % 60

    return (
        <div className="max-w-3xl mx-auto space-y-10 py-8 px-4 h-full min-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Nav */}
            <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1.5">
                            <BrainCircuit className="size-3 text-primary" />
                            Tiến độ ôn tập
                        </span>
                        <span>{currentIndex + 1} / {cardsDue.length}</span>
                    </div>
                    <Progress value={progress} className="h-1.5 shadow-none bg-muted/50" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-muted-foreground font-mono text-xs tabular-nums border">
                    <Timer className="size-3.5" />
                    <span>{minutes}:{seconds.toString().padStart(2, "0")}</span>
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="flex-1 flex flex-col justify-center perspective-[1000px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard.id + (isFlipped ? "-flipped" : "")}
                        initial={{ opacity: 0, rotateY: isFlipped ? -20 : 20, y: 10 }}
                        animate={{ opacity: 1, rotateY: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full h-full min-h-[400px]"
                    >
                        <Flashcard
                            onClick={handleFlip}
                            className={cn(
                                "w-full h-full min-h-[400px] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 border-2",
                                isFlipped ? "border-primary/20 bg-primary/5 shadow-lg shadow-primary/5" : "border-border shadow-sm hover:border-primary/30"
                            )}
                        >
                            <FlashcardContent className="p-8 md:p-16 flex flex-col items-center justify-center text-center w-full h-full">
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                                    <RotateCw className="size-2.5" />
                                    {isFlipped ? "Đáp án & Giải nghĩa" : "Câu hỏi — Click để xem đáp án"}
                                </div>

                                <div className="space-y-6 w-full">
                                    {isFlipped ? (
                                        <div className="space-y-8 animate-in zoom-in-95 duration-300">
                                            <FlashcardBack className="p-0 border-none bg-transparent shadow-none h-auto">
                                                <div className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                                                    {currentCard.backText}
                                                </div>
                                            </FlashcardBack>

                                            {(currentCard.furigana || currentCard.exampleSentence) && (
                                                <div className="space-y-4 pt-6 border-t border-primary/10">
                                                    {currentCard.furigana && (
                                                        <FlashcardFurigana className="text-xl md:text-2xl text-primary font-bold">
                                                            {currentCard.furigana}
                                                        </FlashcardFurigana>
                                                    )}
                                                    {currentCard.exampleSentence && (
                                                        <FlashcardExample className="text-base md:text-lg text-muted-foreground italic leading-relaxed max-w-lg mx-auto p-4 bg-background/50 rounded-xl border border-primary/5">
                                                            "{currentCard.exampleSentence}"
                                                        </FlashcardExample>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <FlashcardFront className="p-0 border-none bg-transparent shadow-none h-auto">
                                            <div className="text-4xl md:text-7xl font-bold tracking-tighter text-foreground">
                                                {currentCard.frontText}
                                            </div>
                                        </FlashcardFront>
                                    )}
                                </div>
                            </FlashcardContent>
                        </Flashcard>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="h-28 pt-4">
                <AnimatePresence mode="wait">
                    {isFlipped ? (
                        <motion.div
                            key="rating-controls"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-4 gap-4 h-full"
                        >
                            <Button
                                onClick={() => handleRate(0)}
                                variant="outline"
                                className="h-full flex flex-col items-center justify-center gap-2 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive group rounded-2xl border-2 transition-all"
                            >
                                <XCircle className="size-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Quên rồi</span>
                            </Button>
                            <Button
                                onClick={() => handleRate(1)}
                                variant="outline"
                                className="h-full flex flex-col items-center justify-center gap-2 hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-600 group rounded-2xl border-2 transition-all"
                            >
                                <BrainCircuit className="size-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Hơi khó</span>
                            </Button>
                            <Button
                                onClick={() => handleRate(2)}
                                variant="outline"
                                className="h-full flex flex-col items-center justify-center gap-2 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600 group rounded-2xl border-2 transition-all"
                            >
                                <Check className="size-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Nhớ tốt</span>
                            </Button>
                            <Button
                                onClick={() => handleRate(3)}
                                className="h-full flex flex-col items-center justify-center gap-2 group rounded-2xl bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            >
                                <Trophy className="size-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Quá dễ</span>
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="flip-control"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Button
                                onClick={handleFlip}
                                className="w-full h-20 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/10 flex gap-3 group"
                            >
                                <span>Xem đáp án</span>
                                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hint */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-medium text-muted-foreground/40 italic">
                <Info className="size-3" />
                Dùng Space để lật thẻ, phím 1-4 để đánh giá độ khó.
            </div>
        </div>
    )
}
