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
import { Eye } from "lucide-react"
import { getExamAttempts } from "@/api/services/exam-api"
import type { ExamSessionWithExamResponseDTO } from '@workspace/schemas'
import { ExamSessionStatus } from '@workspace/schemas'
import { Inbox } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';

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

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-'
        const d = typeof date === 'string' ? new Date(date) : date
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }

    const formatTime = (minutes: number | undefined) => {
        if (!minutes) return '-'
        if (minutes < 60) return `${minutes} phút`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins} phút` : `${hours}h`
    }

    const handleViewDetails = (session: ExamSessionWithExamResponseDTO) => {
        // Review page removed - can navigate to exam detail or do nothing
        // For now, just show session info in console or could navigate to exam page
        if (session.exam?.id) {
            router.push(`/exams/${session.exam.id}`)
        }
    }

    if (loading) {
        return (
            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted">
                            <TableHead>Ngày thi</TableHead>
                            <TableHead>Đề thi</TableHead>
                            <TableHead className="text-center">Trình độ</TableHead>
                            <TableHead className="text-center">Điểm số</TableHead>
                            <TableHead className="text-center">Thời gian</TableHead>
                            <TableHead className="text-center">Kết quả</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3].map((i) => (
                            <TableRow key={i}>
                                <TableCell colSpan={7}>
                                    <div className="animate-pulse h-8 bg-muted rounded"></div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div className="flex justify-center rounded-lg border py-12">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
                        <EmptyTitle>Chưa có lịch sử thi nào</EmptyTitle>
                        <EmptyDescription>
                            Bạn chưa tham gia bất kỳ kỳ thi nào.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    return (
        <div className="rounded-lg border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted">
                        <TableHead>Ngày thi</TableHead>
                        <TableHead>Đề thi</TableHead>
                        <TableHead className="text-center">Trình độ</TableHead>
                        <TableHead className="text-center">Điểm số</TableHead>
                        <TableHead className="text-center">Thời gian</TableHead>
                        <TableHead className="text-center">Kết quả</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session) => {
                        const exam = session.exam
                        const date = session.submittedAt || session.startedAt
                        const timeSpent = exam ? exam.totalTime : undefined
                        const passed = session.passed ?? false

                        return (
                            <TableRow key={session.id}>
                                <TableCell className="font-medium text-muted-foreground">
                                    {formatDate(date)}
                                </TableCell>
                                <TableCell className="font-semibold text-foreground">
                                    {exam?.title || 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline">
                                        {exam?.jlptLevel || 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center font-bold">
                                    {session.score !== undefined && session.maxScore !== undefined
                                        ? `${session.score}/${session.maxScore}`
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                    {formatTime(timeSpent)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {session.score !== undefined && session.maxScore !== undefined ? (
                                        <Badge
                                            className={passed
                                                ? "bg-primary/10 text-primary border-0"
                                                : "bg-destructive/10 text-destructive border-0"}
                                        >
                                            {passed ? 'Đỗ' : 'Trượt'}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 cursor-pointer"
                                        onClick={() => handleViewDetails(session)}
                                    >
                                        <Eye className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                                        <span className="sr-only">Xem chi tiết</span>
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
