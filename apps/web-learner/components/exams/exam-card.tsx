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
    N5: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    N4: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    N3: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    N2: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    N1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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
        <Card className="flex flex-col h-full border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <Badge className={cn("border-0 font-bold", LEVEL_COLORS[level])}>
                        {level}
                    </Badge>
                    <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-700">
                        {type}
                    </Badge>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 mb-2">
                        {title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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
                            <span className="text-slate-500">Đang làm dở</span>
                            <span className="text-teal-600">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                {status === 'completed' && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                        <div className="text-sm text-slate-500">Kết quả</div>
                        <div className="font-bold text-lg">
                            <span className={cn(
                                (score || 0) >= (maxScore * 0.6) ? "text-green-600" : "text-red-600"
                            )}>
                                {score}
                            </span>
                            <span className="text-slate-400 text-sm">/{maxScore}</span>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-6 pt-0 mt-auto">
                {status === 'new' && (
                    <Button 
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
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
                        <Button variant="outline" className="w-full" onClick={handleReview}>
                            Xem lại
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full group"
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
