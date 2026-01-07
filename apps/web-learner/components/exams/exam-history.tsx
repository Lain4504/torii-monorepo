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
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900">
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
                                    <div className="animate-pulse h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
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
            <div className="rounded-md border border-slate-200 dark:border-slate-800 p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">Chưa có lịch sử thi nào</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
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
                                <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                    {formatDate(date)}
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900 dark:text-white">
                                    {exam?.title || 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className="border-slate-200 dark:border-slate-700">
                                        {exam?.jlptLevel || 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center font-bold">
                                    {session.score !== undefined && session.maxScore !== undefined
                                        ? `${session.score}/${session.maxScore}`
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-center text-slate-500">
                                    {formatTime(timeSpent)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {session.score !== undefined && session.maxScore !== undefined ? (
                                        <Badge
                                            className={passed
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0"}
                                        >
                                            {passed ? 'Đỗ' : 'Trượt'}
                                        </Badge>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleViewDetails(session)}
                                    >
                                        <Eye className="w-4 h-4 text-slate-500 hover:text-teal-600" />
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
