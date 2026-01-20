'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Clock, FileText, ArrowRight, RotateCcw, Sparkles } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface ExamCardProps {
    id: string
    title: string
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
    type: 'Full Test' | 'Mini Test'
    duration: number // minutes
    totalQuestions: number
    status: 'new' | 'in-progress' | 'completed'
    score?: number
    maxScore?: number
    progress?: number // 0-100
    lastAttemptDate?: string
    sessionId?: string // Session ID for review/retake
}

export function ExamCard({
    id,
    title,
    level,
    type,
    duration,
    totalQuestions,
    status,
    score,
    maxScore = 180,
    progress = 0,
    lastAttemptDate,
    sessionId,
}: ExamCardProps) {
    const router = useRouter()

    const handleStartExam = () => {
        router.push(`/exams/${id}/take`)
    }

    const handleReview = () => {
        if (sessionId) {
            router.push(`/exams/${id}/review?sessionId=${sessionId}`)
        }
    }

    const handleRetake = () => {
        router.push(`/exams/${id}/take`)
    }

    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <Card className="flex flex-col h-full rounded-[2.5rem] border-border/40 bg-background/60 backdrop-blur-xl relative z-10 overflow-hidden hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-500">
                <CardContent className="p-8 pb-4 flex-1 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Badge className="bg-primary text-white font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full border-none shadow-lg shadow-primary/10">
                                {level}
                            </Badge>
                            <Badge variant="outline" className="border-border/40 text-muted-foreground/60 font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
                                {type === 'Full Test' ? 'Bài thi thực tế' : 'Đề thi rút gọn'}
                            </Badge>
                        </div>
                        {status === 'completed' && (
                            <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
                                <Sparkles className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-black tracking-tight text-foreground leading-tight uppercase group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                            {title}
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 group/meta">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/meta:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{duration} phút</span>
                            </div>
                            <div className="flex items-center gap-2 group/meta">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/meta:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{totalQuestions} câu hỏi</span>
                            </div>
                        </div>
                    </div>

                    {status === 'in-progress' && (
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Tiến độ hiện tại</span>
                                <span className="text-[11px] font-black text-primary">{progress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    {status === 'completed' && (
                        <div className="bg-muted/20 rounded-2xl p-5 border border-border/20 flex flex-col gap-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Kết quả đánh giá</span>
                            <div className="flex items-end gap-2">
                                <span className={cn(
                                    "text-3xl font-black tracking-tighter italic leading-none",
                                    (score || 0) >= (maxScore * 0.6) ? "text-emerald-500" : "text-destructive"
                                )}>
                                    {score}
                                </span>
                                <span className="text-sm font-black text-muted-foreground/20 italic mb-0.5">/ {maxScore}</span>
                                <div className="ml-auto">
                                    <Badge variant="outline" className={cn(
                                        "text-[8px] font-black px-2 py-0.5 rounded-lg border-none",
                                        (score || 0) >= (maxScore * 0.6) ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                                    )}>
                                        {(score || 0) >= (maxScore * 0.6) ? "ĐẠT" : "KHÔNG ĐẠT"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-8 pt-4">
                    {status === 'new' && (
                        <Button
                            className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer group/btn"
                            onClick={handleStartExam}
                        >
                            Vào thi thử
                            <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                    {status === 'in-progress' && (
                        <Button
                            className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:bg-foreground/90 transition-all cursor-pointer group/btn"
                            onClick={handleStartExam}
                        >
                            Tiếp tục thi đấu
                            <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                    {status === 'completed' && (
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button variant="outline" className="h-14 rounded-2xl border-border/40 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all cursor-pointer" onClick={handleReview}>
                                Xem lại
                            </Button>
                            <Button
                                variant="outline"
                                className="h-14 rounded-2xl border-border/40 text-[10px] font-black uppercase tracking-widest hover:bg-muted group/retake transition-all cursor-pointer"
                                onClick={handleRetake}
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-2.5 group-hover/retake:rotate-180 transition-transform" />
                                Làm lại
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
