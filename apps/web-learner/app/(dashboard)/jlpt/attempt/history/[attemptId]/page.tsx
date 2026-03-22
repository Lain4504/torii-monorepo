'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'

import { jlptMockApi } from '@/lib/api/services/jlpt-mock-api'

type JlptAttemptDetail = {
  attempt: {
    id: string
    templateId: string
    level: string
    status: string
    startedAt: string | null
    submittedAt: string | null
  }
  scores: {
    languageRaw?: number
    readingRaw?: number
    listeningRaw?: number
    languageScaled?: number
    readingScaled?: number
    listeningScaled?: number
    totalScaled?: number
    passMock?: boolean
  }
}

const SECTION_LABELS: Record<string, string> = {
  languageScaled: 'Language Knowledge',
  readingScaled: 'Reading',
  listeningScaled: 'Listening',
}

export default function JlptAttemptHistoryDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router = useRouter()

  const [data, setData] = useState<JlptAttemptDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!attemptId) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await jlptMockApi.getAttemptById(attemptId)
        setData(res as unknown as JlptAttemptDetail)
      } catch (e: any) {
        console.error(e)
        toast.error(e?.message ?? 'Không tải được kết quả bài thi')
      } finally {
        setLoading(false)
      }
    })()
  }, [attemptId])

  if (!attemptId) return null
  if (loading || !data) return <PageLoading className="h-screen" />

  const { attempt, scores } = data
  const scoreOrNna = (v: number | undefined | null) =>
    v === 0 ? 0 : v != null ? v : '—'

  const sectionRows = [
    { key: 'languageScaled', label: SECTION_LABELS.languageScaled, value: scores?.languageScaled },
    { key: 'readingScaled', label: SECTION_LABELS.readingScaled, value: scores?.readingScaled },
    { key: 'listeningScaled', label: SECTION_LABELS.listeningScaled, value: scores?.listeningScaled },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-lg shrink-0" asChild>
          <Link href="/jlpt/attempt/history">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kết quả bài thi JLPT</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {attempt.submittedAt
              ? `Nộp bài: ${format(new Date(attempt.submittedAt), 'dd/MM/yyyy HH:mm')}`
              : attempt.startedAt
                ? `Bắt đầu: ${format(new Date(attempt.startedAt), 'dd/MM/yyyy HH:mm')}`
                : '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Badge variant={attempt.status === 'SUBMITTED' ? 'default' : 'secondary'}>
                {attempt.status}
              </Badge>
              <Badge variant="outline">{attempt.level}</Badge>
              {typeof scores?.passMock === 'boolean' && (
                <Badge
                  variant={scores.passMock ? 'default' : 'destructive'}
                  className={scores.passMock ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}
                >
                  {scores.passMock ? 'Đạt' : 'Chưa đạt'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead>Phần thi</TableHead>
                  <TableHead className="text-right w-24">Điểm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectionRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {scoreOrNna(row.value)}
                    </TableCell>
                  </TableRow>
                ))}
                {scores?.totalScaled != null && (
                  <TableRow className="bg-muted/30 font-semibold">
                    <TableCell>Tổng điểm</TableCell>
                    <TableCell className="text-right">{scoreOrNna(scores.totalScaled)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Thông tin
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Mã attempt: <span className="font-mono text-foreground">{attemptId.substring(0, 8)}...</span>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/jlpt/attempt/history">Quay lại lịch sử</Link>
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/dashboard/jlpt-list-exam">Danh sách đề thi</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
