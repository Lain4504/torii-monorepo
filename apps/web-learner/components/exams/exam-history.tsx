'use client'

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

const HISTORY_DATA = [
    {
        id: 1,
        date: '2025-01-02',
        exam: 'JLPT N5 Full Test 01',
        level: 'N5',
        score: 145,
        maxScore: 180,
        time: '95 phút',
        status: 'passed'
    },
    {
        id: 2,
        date: '2024-12-28',
        exam: 'JLPT N5 Mini Test - Vocabulary',
        level: 'N5',
        score: 25,
        maxScore: 30,
        time: '15 phút',
        status: 'passed'
    },
    {
        id: 3,
        date: '2024-12-20',
        exam: 'JLPT N4 Mock Test 03',
        level: 'N4',
        score: 80,
        maxScore: 180,
        time: '105 phút',
        status: 'failed'
    }
]

export function ExamHistory() {
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
                    {HISTORY_DATA.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                {row.date}
                            </TableCell>
                            <TableCell className="font-semibold text-slate-900 dark:text-white">
                                {row.exam}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="border-slate-200 dark:border-slate-700">
                                    {row.level}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold">
                                {row.score}/{row.maxScore}
                            </TableCell>
                            <TableCell className="text-center text-slate-500">
                                {row.time}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge
                                    className={row.status === 'passed'
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0"}
                                >
                                    {row.status === 'passed' ? 'Đỗ' : 'Trượt'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="w-4 h-4 text-slate-500 hover:text-teal-600" />
                                    <span className="sr-only">Xem chi tiết</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
