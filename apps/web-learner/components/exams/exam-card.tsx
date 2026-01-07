'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Clock, FileText, ArrowRight, RotateCcw } from "lucide-react"
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

const LEVEL_COLORS = {
    N5: "bg-primary/10 text-primary",
    N4: "bg-primary/10 text-primary",
    N3: "bg-primary/10 text-primary",
    N2: "bg-primary/10 text-primary",
    N1: "bg-primary/10 text-primary",
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
        // Navigate to review page with sessionId
        if (sessionId) {
            router.push(`/exams/${id}/review?sessionId=${sessionId}`)
        }
    }

    const handleRetake = () => {
        // Navigate to take page (will create new session)
        router.push(`/exams/${id}/take`)
    }

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <Badge className={cn("border-0 font-bold", LEVEL_COLORS[level])}>
                        {level}
                    </Badge>
                    <Badge variant="outline">
                        {type}
                    </Badge>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-card-foreground line-clamp-2 mb-2">
                        {title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{duration} phút</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            <span>{totalQuestions} câu</span>
                        </div>
                    </div>
                </div>

                {status === 'in-progress' && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-muted-foreground">Đang làm dở</span>
                            <span className="text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                {status === 'completed' && (
                    <div className="bg-muted rounded-lg p-3 flex items-center justify-between border">
                        <div className="text-sm text-muted-foreground">Kết quả</div>
                        <div className="font-bold text-lg">
                            <span className={cn(
                                (score || 0) >= (maxScore * 0.6) ? "text-primary" : "text-destructive"
                            )}>
                                {score}
                            </span>
                            <span className="text-muted-foreground text-sm">/{maxScore}</span>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-6 pt-0 mt-auto">
                {status === 'new' && (
                    <Button 
                        className="w-full"
                        onClick={handleStartExam}
                    >
                        Bắt đầu thi
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
                {status === 'in-progress' && (
                    <Button 
                        className="w-full" 
                        variant="secondary"
                        onClick={handleStartExam}
                    >
                        Tiếp tục thi
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
                {status === 'completed' && (
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button variant="outline" className="w-full cursor-pointer" onClick={handleReview}>
                            Xem lại
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full group cursor-pointer"
                            onClick={handleRetake}
                        >
                            <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
                            Làm lại
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
