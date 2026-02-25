'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Eye, Inbox, FileText, Calendar, Sparkles } from "lucide-react"
import { getExamAttempts } from "@/lib/api/services/exam-api"
import type { ExamSessionWithExamResponseDTO } from '@workspace/schemas'
import { ExamSessionStatus } from '@workspace/schemas'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { cn } from "@workspace/ui/lib/utils"
import { formatDate } from "@/utils/format-utils"

export function ExamHistory() {
    const router = useRouter()
    const [sessions, setSessions] = useState<ExamSessionWithExamResponseDTO[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadHistory() {
            try {
                setLoading(true)
                const response = await getExamAttempts({
                    status: ExamSessionStatus.SUBMITTED,
                    page: 1,
                    limit: 50,
                })
                setSessions(response.data || [])
            } catch (error) {
                console.error('Error loading exam history:', error)
                setSessions([])
            } finally {
                setLoading(false)
            }
        }

        loadHistory()
    }, [])


    const formatTime = (minutes: number | undefined) => {
        if (!minutes) return '-'
        if (minutes < 60) return `${minutes} phút`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins} phút` : `${hours}h`
    }

    const handleViewDetails = (session: ExamSessionWithExamResponseDTO) => {
        if (session.exam?.id) {
            router.push(`/exams/${session.exam.id}`)
        }
    }

    if (loading) {
        return (
            <div className="rounded-lg border border-border/40 overflow-hidden bg-background/60 py-12">
                <Empty className="border-none shadow-none bg-transparent">
                    <EmptyHeader>
                        <EmptyMedia variant="icon" className="animate-pulse bg-primary/5 shadow-none border-none">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </EmptyMedia>
                        <EmptyTitle className="text-[10px] font-bold uppercase tracking-wider animate-pulse">Loading chronicles...</EmptyTitle>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div className="flex justify-center py-24 px-6 rounded-lg bg-muted/10 border border-border/40">
                <Empty className="max-w-md">
                    <EmptyHeader>
                        <EmptyMedia variant="icon" className="bg-background shadow-sm border border-border"><Inbox className="text-primary w-8 h-8" /></EmptyMedia>
                        <EmptyTitle className="text-xl font-bold tracking-tight">Chưa có lịch sử thi</EmptyTitle>
                        <EmptyDescription className="font-medium text-muted-foreground/60">
                            Bạn chưa thực hiện bài thi nào. Hãy bắt đầu thử thách ngay hôm nay!
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-border/40 overflow-hidden bg-background/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-border/20">
                        <TableHead className="py-6 pl-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Thứ tự & Ngày thi</TableHead>
                        <TableHead className="py-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Thông tin đề thi</TableHead>
                        <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">JLPT</TableHead>
                        <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Điểm số</TableHead>
                        <TableHead className="py-6 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Kết quả</TableHead>
                        <TableHead className="py-6 pr-10 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session, idx) => {
                        const exam = session.exam
                        const date = session.submittedAt || session.startedAt
                        const passed = session.passed ?? false

                        return (
                            <TableRow key={session.id} className="group hover:bg-primary/[0.02] border-b-border/10 transition-colors">
                                <TableCell className="py-8 pl-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded bg-muted/30 flex items-center justify-center text-[10px] font-bold text-muted-foreground/40">
                                            0{idx + 1}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                                <Calendar className="w-3 h-3 text-muted-foreground/40" />
                                                {formatDate(date) || '-'}
                                            </div>
                                            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30">Lần thi gần nhất</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-8">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                                            {exam?.title || 'N/A'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30">
                                            <FileText className="w-3 h-3" />
                                            Full Simulation Test
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-8 text-center">
                                    <Badge variant="outline" className="border-border/40 text-muted-foreground/60 font-bold uppercase tracking-wider text-[9px] px-3 py-1">
                                        {exam?.jlptLevel || 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-8 text-center">
                                    <span className="text-lg font-bold tracking-tight text-foreground leading-none">
                                        {session.score !== undefined && session.maxScore !== undefined
                                            ? `${session.score}/${session.maxScore}`
                                            : '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="py-8 text-center">
                                    <Badge
                                        className={cn(
                                            "font-bold uppercase tracking-wider text-[8px] px-3 py-1",
                                            passed
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-destructive/10 text-destructive border-destructive/20"
                                        )}
                                    >
                                        {passed ? 'PASSED' : 'FAILED'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-8 pr-10 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all cursor-pointer group/btn"
                                        onClick={() => handleViewDetails(session)}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
