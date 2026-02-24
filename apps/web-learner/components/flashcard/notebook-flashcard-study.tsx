'use client'

import { useState, useCallback } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Badge } from '@workspace/ui/components/badge'
import {
    ArrowLeft, CheckCircle2, XCircle, BrainCircuit,
    Trophy, RotateCcw, Shuffle, ChevronRight
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

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

type Rating = 'again' | 'hard' | 'good' | 'easy'

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
    const [cards, setCards] = useState(() => shuffleArray(entries))
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [results, setResults] = useState<CardResult[]>([])
    const [isDone, setIsDone] = useState(false)

    const currentCard = cards[currentIndex]
    const progress = (currentIndex / cards.length) * 100

    const handleFlip = useCallback(() => {
        setIsFlipped(f => !f)
    }, [])

    const handleRate = useCallback((rating: Rating) => {
        if (!currentCard) return
        setResults(prev => [...prev, { entryId: currentCard.id, rating }])
        setIsFlipped(false)

        if (currentIndex < cards.length - 1) {
            setTimeout(() => setCurrentIndex(i => i + 1), 150)
        } else {
            setTimeout(() => setIsDone(true), 150)
        }
    }, [currentCard, currentIndex, cards.length])

    const handleSkip = useCallback(() => {
        setIsFlipped(false)
        if (currentIndex < cards.length - 1) {
            setTimeout(() => setCurrentIndex(i => i + 1), 150)
        } else {
            setTimeout(() => setIsDone(true), 150)
        }
    }, [currentIndex, cards.length])

    const handleRestart = useCallback((shuffled = false) => {
        setCards(shuffled ? shuffleArray(entries) : [...entries])
        setCurrentIndex(0)
        setIsFlipped(false)
        setResults([])
        setIsDone(false)
    }, [entries])

    // ---- DONE SCREEN ----
    if (isDone) {
        const counts = {
            again: results.filter(r => r.rating === 'again').length,
            hard: results.filter(r => r.rating === 'hard').length,
            good: results.filter(r => r.rating === 'good').length,
            easy: results.filter(r => r.rating === 'easy').length,
        }
        const mastered = counts.good + counts.easy
        const masteredPct = Math.round((mastered / results.length) * 100)

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-8 animate-in fade-in"
            >
                <div className="relative">
                    <div className={cn(
                        "size-28 rounded-full flex items-center justify-center shadow-2xl border",
                        masteredPct >= 80
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-emerald-500/20"
                            : masteredPct >= 50
                                ? "bg-primary/10 border-primary/30 text-primary shadow-primary/20"
                                : "bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-orange-500/20"
                    )}>
                        <Trophy className="size-14" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black tracking-tight">
                        {masteredPct >= 80 ? '🎉 Xuất sắc!' : masteredPct >= 50 ? '👍 Tốt lắm!' : '💪 Tiếp tục cố gắng!'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Đã học xong <span className="font-bold text-foreground">{results.length}</span> từ trong sổ tay &quot;{notebookName}&quot;
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 w-full max-w-sm">
                    {[
                        { label: 'Làm lại', count: counts.again, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                        { label: 'Khó', count: counts.hard, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                        { label: 'Tốt', count: counts.good, color: 'text-primary bg-primary/10 border-primary/20' },
                        { label: 'Dễ', count: counts.easy, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                    ].map(s => (
                        <div key={s.label} className={cn('flex flex-col items-center gap-1 p-3 rounded-xl border', s.color)}>
                            <span className="text-2xl font-black">{s.count}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-sm space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                        <span>Đã nắm vững</span>
                        <span>{masteredPct}%</span>
                    </div>
                    <Progress value={masteredPct} className="h-2" />
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => handleRestart(false)} className="rounded-xl gap-2">
                        <RotateCcw className="size-4" />
                        Học lại
                    </Button>
                    <Button variant="outline" onClick={() => handleRestart(true)} className="rounded-xl gap-2">
                        <Shuffle className="size-4" />
                        Xáo lại & học
                    </Button>
                    <Button onClick={onClose} className="rounded-xl font-bold px-6">
                        Quay lại sổ tay
                    </Button>
                </div>
            </motion.div>
        )
    }

    // ---- STUDY SCREEN ----
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="-ml-2 text-muted-foreground hover:text-foreground rounded-xl"
                >
                    <ArrowLeft className="size-4 mr-1" />
                    Thoát
                </Button>
                <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                        <span>{notebookName}</span>
                        <span>{currentIndex + 1} / {cards.length}</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>
                <Badge variant="secondary" className="font-bold text-xs">
                    {cards.length} từ
                </Badge>
            </div>

            {/* Card */}
            <div className="min-h-[320px] md:min-h-[380px] flex flex-col justify-center" style={{ perspective: '1200px' }}>
                <AnimatePresence mode="wait">
                    {currentCard && (
                        <motion.div
                            key={currentCard.id + (isFlipped ? '-back' : '-front')}
                            initial={{ opacity: 0, rotateX: isFlipped ? -80 : 80, scale: 0.97 }}
                            animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                            onClick={handleFlip}
                            className={cn(
                                "relative w-full min-h-[300px] md:min-h-[360px] rounded-[2rem] border bg-card/60 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center cursor-pointer group transition-colors p-8 md:p-14 text-center overflow-hidden select-none",
                                isFlipped
                                    ? "border-primary/25 bg-primary/5"
                                    : "border-border hover:border-primary/20"
                            )}
                        >
                            {/* Corner decoration */}
                            <div className="absolute top-5 left-5 flex gap-1.5">
                                <div className="size-2 rounded-full bg-foreground/10" />
                                <div className="size-2 rounded-full bg-foreground/5" />
                            </div>
                            <div className="absolute top-5 right-5 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/10">
                                {isFlipped ? 'Mặt sau' : 'Mặt trước'}
                            </div>

                            <div className="space-y-4 max-w-xl">
                                {isFlipped ? (
                                    <>
                                        <p className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                                            {currentCard.meaning}
                                        </p>
                                        {currentCard.phonetic && (
                                            <p className="text-lg text-primary/60 font-mono">[{currentCard.phonetic}]</p>
                                        )}
                                        {currentCard.note && (
                                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                                &ldquo;{currentCard.note}&rdquo;
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground">
                                            {currentCard.word}
                                        </h2>
                                        {currentCard.phonetic && (
                                            <p className="text-base text-muted-foreground font-mono">[{currentCard.phonetic}]</p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="absolute bottom-5 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/15">
                                {isFlipped ? 'Chạm để lật lại' : 'Chạm để xem nghĩa'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="space-y-3">
                {isFlipped ? (
                    <div className="grid grid-cols-4 gap-3 h-20">
                        <Button
                            onClick={() => handleRate('again')}
                            variant="outline"
                            className="h-full rounded-2xl flex flex-col gap-1.5 border-red-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40 transition-all"
                        >
                            <XCircle className="size-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Làm lại</span>
                        </Button>
                        <Button
                            onClick={() => handleRate('hard')}
                            variant="outline"
                            className="h-full rounded-2xl flex flex-col gap-1.5 border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/40 transition-all"
                        >
                            <BrainCircuit className="size-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Khó</span>
                        </Button>
                        <Button
                            onClick={() => handleRate('good')}
                            variant="outline"
                            className="h-full rounded-2xl flex flex-col gap-1.5 border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all"
                        >
                            <CheckCircle2 className="size-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tốt</span>
                        </Button>
                        <Button
                            onClick={() => handleRate('easy')}
                            variant="outline"
                            className="h-full rounded-2xl flex flex-col gap-1.5 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/40 transition-all"
                        >
                            <Trophy className="size-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Dễ</span>
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <Button
                            onClick={handleFlip}
                            className="flex-1 h-16 rounded-2xl text-base font-black uppercase tracking-[0.15em] bg-card/60 hover:bg-card/80 text-foreground border border-border hover:border-primary/30 transition-all shadow-lg"
                        >
                            Xem nghĩa
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleSkip}
                            className="h-16 px-5 rounded-2xl border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all flex flex-col gap-1"
                        >
                            <ChevronRight className="size-5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Bỏ qua</span>
                        </Button>
                    </div>
                )}

                {/* Skip while flipped */}
                {isFlipped && currentIndex < cards.length - 1 && (
                    <button
                        onClick={handleSkip}
                        className="w-full text-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors font-medium py-1"
                    >
                        Bỏ qua, học sau →
                    </button>
                )}
            </div>
        </div>
    )
}
