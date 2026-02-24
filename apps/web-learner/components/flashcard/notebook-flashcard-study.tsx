"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    BrainCircuit,
    Trophy,
    RotateCcw,
    Shuffle,
    ChevronRight,
    RotateCw,
    Check,
    Home
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@workspace/ui/components/card"
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

interface NoteEntry {
    id: string
    word: string
    phonetic?: string
    meaning: string
    note?: string
    partOfSpeech: string
}

interface NotebookFlashcardStudyProps {
    entries: NoteEntry[]
    notebookName: string
    onClose: () => void
}

type Rating = "again" | "hard" | "good" | "easy"

interface CardResult {
    entryId: string
    rating: Rating
}

function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = a[i] as T
        a[i] = a[j] as T
        a[j] = temp
    }
    return a
}

export function NotebookFlashcardStudy({ entries, notebookName, onClose }: NotebookFlashcardStudyProps) {
    const [cards, setCards] = React.useState(() => shuffleArray(entries))
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isFlipped, setIsFlipped] = React.useState(false)
    const [results, setResults] = React.useState<CardResult[]>([])
    const [isDone, setIsDone] = React.useState(false)

    const currentCard = cards[currentIndex]
    const progress = (currentIndex / cards.length) * 100

    const handleFlip = React.useCallback(() => {
        setIsFlipped(f => !f)
    }, [])

    const handleRate = React.useCallback((rating: Rating) => {
        if (!currentCard) return
        setResults(prev => [...prev, { entryId: currentCard.id, rating }])
        setIsFlipped(false)

        if (currentIndex < cards.length - 1) {
            setTimeout(() => setCurrentIndex(i => i + 1), 150)
        } else {
            setTimeout(() => setIsDone(true), 150)
        }
    }, [currentCard, currentIndex, cards.length])

    const handleSkip = React.useCallback(() => {
        setIsFlipped(false)
        if (currentIndex < cards.length - 1) {
            setTimeout(() => setCurrentIndex(i => i + 1), 150)
        } else {
            setTimeout(() => setIsDone(true), 150)
        }
    }, [currentIndex, cards.length])

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault()
                handleFlip()
            } else if (e.key === "ArrowRight") {
                handleSkip()
            } else if (isFlipped) {
                if (e.key === "1") handleRate("again")
                else if (e.key === "2") handleRate("hard")
                else if (e.key === "3") handleRate("good")
                else if (e.key === "4") handleRate("easy")
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleFlip, handleRate, handleSkip, isFlipped])

    const handleRestart = React.useCallback((shuffled = false) => {
        setCards(shuffled ? shuffleArray(entries) : [...entries])
        setCurrentIndex(0)
        setIsFlipped(false)
        setResults([])
        setIsDone(false)
    }, [entries])

    // ---- DONE SCREEN ----
    if (isDone) {
        const counts = {
            again: results.filter(r => r.rating === "again").length,
            hard: results.filter(r => r.rating === "hard").length,
            good: results.filter(r => r.rating === "good").length,
            easy: results.filter(r => r.rating === "easy").length,
        }
        const mastered = counts.good + counts.easy
        const masteredPct = Math.round((mastered / results.length) * 100)

        return (
            <div className="max-w-xl mx-auto py-12 px-4 space-y-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center space-y-6">
                    <div className="inline-flex p-6 rounded-full bg-primary/10 border border-primary/20 text-primary animate-bounce">
                        <Trophy className="size-12" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold tracking-tight">
                            {masteredPct >= 80 ? "Xuất sắc!" : masteredPct >= 50 ? "Tốt lắm!" : "Cố gắng thêm nhé!"}
                        </h2>
                        <p className="text-muted-foreground">
                            Đã hoàn thành <span className="font-bold text-foreground">{results.length}</span> từ trong sổ tay "{notebookName}"
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Quên", count: counts.again, color: "text-destructive", bg: "bg-destructive/5" },
                        { label: "Khó", count: counts.hard, color: "text-orange-600", bg: "bg-orange-500/5" },
                        { label: "Tốt", count: counts.good, color: "text-primary", bg: "bg-primary/5" },
                        { label: "Dễ", count: counts.easy, color: "text-emerald-600", bg: "bg-emerald-500/5" },
                    ].map(s => (
                        <Card key={s.label} className={cn("border-none shadow-none text-center p-4", s.bg)}>
                            <div className={cn("text-2xl font-bold", s.color)}>{s.count}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Tỉ lệ nắm vững</span>
                        <span className="text-2xl font-bold">{masteredPct}%</span>
                    </div>
                    <Progress value={masteredPct} className="h-2.5 shadow-none bg-muted/50" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
                    <Button variant="outline" onClick={() => handleRestart(false)} className="h-12 font-bold uppercase tracking-widest text-[10px]">
                        <RotateCcw className="size-3.5 mr-2" />
                        Học lại từ đầu
                    </Button>
                    <Button variant="outline" onClick={() => handleRestart(true)} className="h-12 font-bold uppercase tracking-widest text-[10px]">
                        <Shuffle className="size-3.5 mr-2" />
                        Xáo trộn & Học lại
                    </Button>
                    <Button onClick={onClose} className="sm:col-span-2 h-14 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                        <Home className="size-4 mr-2" />
                        Quay lại sổ tay
                    </Button>
                </div>
            </div>
        )
    }

    // ---- STUDY SCREEN ----
    return (
        <div className="max-w-2xl mx-auto space-y-10 py-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center gap-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="shrink-0"
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span className="truncate max-w-[200px]">{notebookName}</span>
                        <span>{currentIndex + 1} / {cards.length}</span>
                    </div>
                    <Progress value={progress} className="h-1.5 shadow-none bg-muted/50" />
                </div>
                <Badge variant="secondary" className="px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider">
                    {cards.length} TỪ
                </Badge>
            </div>

            {/* Card Area */}
            <div className="min-h-[380px] flex flex-col justify-center perspective-[1000px]">
                <AnimatePresence mode="wait">
                    {currentCard && (
                        <motion.div
                            key={currentCard.id + (isFlipped ? "-back" : "-front")}
                            initial={{ opacity: 0, rotateX: isFlipped ? -20 : 20, y: 10 }}
                            animate={{ opacity: 1, rotateX: 0, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onClick={handleFlip}
                            className="w-full h-full"
                        >
                            <Flashcard
                                className={cn(
                                    "min-h-[360px] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 border-2",
                                    isFlipped ? "border-primary/20 bg-primary/5 shadow-lg shadow-primary/5" : "border-border shadow-sm hover:border-primary/30"
                                )}
                            >
                                <FlashcardContent className="p-10 md:p-14 flex flex-col items-center justify-center text-center w-full">
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                                        <RotateCw className="size-2.5" />
                                        {isFlipped ? "Giải nghĩa & Trình bày" : "Từ vựng — Click để xem nghĩa"}
                                    </div>

                                    <div className="space-y-6 w-full">
                                        {isFlipped ? (
                                            <div className="space-y-8 animate-in zoom-in-95 duration-300">
                                                <FlashcardBack className="p-0 border-none bg-transparent shadow-none h-auto">
                                                    <div className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                                                        {currentCard.meaning}
                                                    </div>
                                                </FlashcardBack>

                                                {(currentCard.phonetic || currentCard.note) && (
                                                    <div className="space-y-4 pt-6 border-t border-primary/10">
                                                        {currentCard.phonetic && (
                                                            <FlashcardFurigana className="text-xl md:text-2xl text-primary font-bold">
                                                                [{currentCard.phonetic}]
                                                            </FlashcardFurigana>
                                                        )}
                                                        {currentCard.note && (
                                                            <FlashcardExample className="text-base text-muted-foreground italic leading-relaxed max-w-sm mx-auto p-4 bg-background/50 rounded-xl border border-primary/5">
                                                                &ldquo;{currentCard.note}&rdquo;
                                                            </FlashcardExample>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <FlashcardFront className="p-0 border-none bg-transparent shadow-none h-auto space-y-4">
                                                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
                                                    {currentCard.word}
                                                </h2>
                                                {currentCard.phonetic && (
                                                    <div className="text-lg text-muted-foreground/60 font-mono">[{currentCard.phonetic}]</div>
                                                )}
                                                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-[0.2em] py-1 px-3 border-foreground/10">
                                                    {currentCard.partOfSpeech}
                                                </Badge>
                                            </FlashcardFront>
                                        )}
                                    </div>
                                </FlashcardContent>
                            </Flashcard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="h-32">
                <AnimatePresence mode="wait">
                    {isFlipped ? (
                        <motion.div
                            key="rating-controls"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-4 gap-4 h-24"
                        >
                            <Button
                                onClick={() => handleRate("again")}
                                variant="outline"
                                className="h-full flex flex-col items-center justify-center gap-2 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive group rounded-2xl border-2 transition-all"
                            >
                                <XCircle className="size-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Học lại</span>
                            </Button>
                            <Button
                                onClick={() => handleRate("hard")}
                                variant="outline"
                                className="h-full flex flex-col items-center justify-center gap-2 hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-600 group rounded-2xl border-2 transition-all"
                            >
                                <BrainCircuit className="size-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Hơi khó</span>
                            </Button>
                            <Button
                                onClick={() => handleRate("good")}
                                variant="outline"
                                className="h-full flex flex-col items-center justify-center gap-2 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600 group rounded-2xl border-2 transition-all"
                            >
                                <Check className="size-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Đã nhớ</span>
                            </Button>
                            <Button
                                onClick={() => handleRate("easy")}
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
                            className="flex gap-4"
                        >
                            <Button
                                onClick={handleFlip}
                                className="flex-[4] h-20 text-sm font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/10 flex gap-3 group"
                            >
                                <span>Xem nghĩa từ</span>
                                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSkip}
                                className="flex-1 h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 hover:bg-muted/50"
                            >
                                <ChevronRight className="size-5 text-muted-foreground" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Bỏ qua</span>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isFlipped && currentIndex < cards.length - 1 && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleSkip}
                        className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-6"
                    >
                        Học từ tiếp theo &rarr;
                    </motion.button>
                )}
            </div>
        </div>
    )
}
