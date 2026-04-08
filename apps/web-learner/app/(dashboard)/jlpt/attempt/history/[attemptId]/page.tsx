'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card'
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
import { ArrowLeft, BookOpen, Trophy, ClipboardCheck, Calendar, Info, ChevronRight, Target } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { cn } from "@workspace/ui/lib/utils"
import { Separator } from "@workspace/ui/components/separator"

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
  languageScaled: 'Kiến thức ngôn ngữ',
  readingScaled: 'Đọc hiểu',
  listeningScaled: 'Nghe hiểu',
}

export default function JlptAttemptHistoryDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router = useRouter()

  const [data, setData] = useState<JlptAttemptDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!attemptId) return
    ;(async () => {
      try {
        setErrorMessage(null)
        setLoading(true)
        const res = await jlptMockApi.getAttemptById(attemptId)
        setData(res as unknown as JlptAttemptDetail)
      } catch (e: any) {
        console.error(e)
        setErrorMessage(e?.message ?? 'Không tải được kết quả bài thi')
        toast.error(e?.message ?? 'Không tải được kết quả bài thi')
      } finally {
        setLoading(false)
      }
    })()
  }, [attemptId])

  if (!attemptId) return null
  if (loading) return <PageLoading className="h-screen" />
  if (!data) {
    return (
      <div className="space-y-6 animate-in fade-in duration-700 max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border/40 hover:bg-muted" asChild>
            <Link href="/jlpt/attempt/history">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Không tải được kết quả
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{errorMessage ?? 'Không có dữ liệu.'}</p>
        <Button asChild variant="outline" className="w-full h-10 rounded-xl text-sm">
          <Link href="/jlpt/attempt/history">Quay lại lịch sử</Link>
        </Button>
      </div>
    )
  }

  const { attempt, scores } = data
  const scoreOrNna = (v: number | undefined | null) =>
    v === 0 ? 0 : v != null ? v : '—'

  const sectionRows = [
    { key: 'languageScaled', label: SECTION_LABELS.languageScaled, value: scores?.languageScaled, icon: <BookOpen className="size-4 text-primary" /> },
    { key: 'readingScaled', label: SECTION_LABELS.readingScaled, value: scores?.readingScaled, icon: <Target className="size-4 text-primary" /> },
    { key: 'listeningScaled', label: SECTION_LABELS.listeningScaled, value: scores?.listeningScaled, icon: <Trophy className="size-4 text-primary" /> },
  ]

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto py-10 px-4">
      {/* Minimal Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/30 pb-8">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border/40 hover:bg-muted" asChild>
            <Link href="/jlpt/attempt/history">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
                <Badge variant="outline" className="px-2 py-0 rounded-md font-bold text-[10px] uppercase tracking-wider border-border/50 text-muted-foreground/40 leading-none">
                    Mock Result
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em]">JLPT {attempt.level}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
              Chi tiết kết quả
            </h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden bg-card">
                <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-muted/10 border-b border-border/20">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
                            <ClipboardCheck className="size-5 text-primary/60" />
                            Tổng quan điểm số
                        </h2>
                        <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">Hệ thống tính điểm scaled score</p>
                    </div>
                    {typeof scores?.passMock === 'boolean' && (
                        <Badge 
                            className={cn(
                                "px-5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-none border-none",
                                scores.passMock 
                                    ? "bg-emerald-500/10 text-emerald-600" 
                                    : "bg-destructive/10 text-destructive"
                            )}
                        >
                            {scores.passMock ? 'Đạt (PASS)' : 'Chưa đạt (FAIL)'}
                        </Badge>
                    )}
                </div>
                
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/5 hover:bg-muted/5 border-b border-border/30">
                                <TableHead className="pl-8 py-3.5 font-bold text-[10px] uppercase text-muted-foreground/40 tracking-wider">Phần thi</TableHead>
                                <TableHead className="pr-8 py-3.5 text-right font-bold text-[10px] uppercase text-muted-foreground/40 tracking-wider">Điểm đạt được</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sectionRows.map((row) => (
                                <TableRow key={row.key} className="hover:bg-muted/30 transition-colors border-b border-border/20 last:border-0">
                                    <TableCell className="pl-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-8 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground/40 shrink-0">
                                                {row.icon}
                                            </div>
                                            <span className="font-bold text-sm text-foreground tracking-tight">{row.label}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-8 py-6 text-right">
                                        <div className="space-y-1">
                                            <div className="font-bold text-xl text-foreground tabular-nums leading-none tracking-tight">{scoreOrNna(row.value)}</div>
                                            <div className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-tighter">Tối đa: 60</div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {scores?.totalScaled != null && (
                    <div className="p-8 bg-primary/[0.02] border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary/60">
                                <Trophy className="size-5" />
                            </div>
                            <span className="text-lg font-bold text-foreground uppercase tracking-tight">Tổng điểm (Scaled)</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-4xl font-bold text-primary tabular-nums tracking-tighter leading-none mb-1">
                                {scoreOrNna(scores.totalScaled)}
                            </span>
                            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest italic lowercase">/ 180 điểm tối đa</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-xl border-border/50 p-6 shadow-sm bg-muted/5">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="size-9 rounded-lg bg-white border border-border/50 flex items-center justify-center text-muted-foreground/30 shrink-0">
                                <Calendar className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none mb-1.5">Ngày nộp bài</p>
                                <p className="text-sm font-bold text-foreground">
                                    {attempt.submittedAt ? format(new Date(attempt.submittedAt), 'dd/MM/yyyy HH:mm') : '—'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="size-9 rounded-lg bg-white border border-border/50 flex items-center justify-center text-muted-foreground/30 shrink-0 font-mono text-[10px] font-bold">
                                ID
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none mb-1.5">Mã lần thi</p>
                                <p className="text-sm font-bold text-foreground font-mono truncate opacity-60">
                                    {attemptId.toString().toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/30" />

                    <div className="space-y-3">
                        <Button className="w-full h-10 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 text-xs uppercase tracking-tight group" asChild>
                            <Link href="/dashboard/jlpt-list-exam">
                                Thi thử đề mới
                                <ChevronRight className="size-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full h-10 rounded-xl font-bold text-muted-foreground/60 transition-colors hover:text-foreground text-xs uppercase tracking-tight" asChild>
                            <Link href="/jlpt/attempt/history">
                                Xem lại lịch sử
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="p-6 rounded-xl border border-primary/10 bg-primary/[0.02] space-y-2.5">
                <div className="flex items-center gap-2 text-primary/40 font-bold text-[10px] uppercase tracking-widest leading-none">
                    <Info className="size-3.5" />
                    <span>Lưu ý về điểm số</span>
                </div>
                <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium italic">
                    Kết quả đã được chuẩn hóa (Scaled Score) theo hình thức thi JLPT thật. Hãy sử dụng đây như mốc tham khảo cho kỳ thi chính thức.
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
