'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
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
import { ArrowLeft, BookOpen, Trophy, ClipboardCheck, Calendar, Info, ChevronRight, Target, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { cn } from "@workspace/ui/lib/utils"
import { Separator } from "@workspace/ui/components/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { MarkdownRenderer } from "@/components/common/markdown-renderer"
import { jlptMockApi } from '@/lib/api/services/jlpt-mock-api'

type JlptAttemptAnswerItem = {
  templateQuestionId: string
  questionId: string
  section: {
    id: string
    orderIndex: number
    code: string
  }
  mondai: {
    id: string
    code: string
    titleVi: string
  } | null
  selectedOptionId: string | null
  isCorrect: boolean | null
  scoreAwarded: number
  review: {
    stemText: string
    contextText: string | null
    explanation: string | null
    options: {
      id: string
      key: string
      contentText: string
      isCorrect?: boolean
    }[]
    correctOptionId?: string
  } | null
}

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
  answers?: JlptAttemptAnswerItem[]
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
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedAnswers(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    if (!attemptId) return
      ; (async () => {
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

  const groupedSections = useMemo(() => {
    if (!data?.answers) return []
    const grouped: Record<string, {
      id: string;
      code: string;
      orderIndex: number;
      answers: JlptAttemptAnswerItem[];
    }> = {}

    data.answers.forEach(ans => {
      const sectionId = ans.section?.id
      if (!sectionId) return

      if (!grouped[sectionId]) {
        grouped[sectionId] = {
          ...ans.section,
          answers: []
        }
      }
      grouped[sectionId]!.answers.push(ans)
    })

    return Object.values(grouped).sort((a, b) => a.orderIndex - b.orderIndex)
  }, [data?.answers])

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

          {/* Detailed Answers Section */}
          {groupedSections.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 px-1">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardCheck className="size-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">Chi tiết bài làm</h2>
                  <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none mt-1">
                    Xem lại từng phần thi và đáp án
                  </p>
                </div>
              </div>

              <Tabs defaultValue={groupedSections[0]?.id ?? ''} className="w-full space-y-8">
                <div className="px-1 overflow-x-auto pb-2 scrollbar-none">
                  <TabsList className="bg-muted/30 p-1 rounded-xl h-auto flex flex-wrap sm:flex-nowrap justify-start sm:w-fit gap-1 border border-border/20">
                    {groupedSections.map((sec) => (
                      <TabsTrigger
                        key={sec.id}
                        value={sec.id}
                        className="rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all shrink-0"
                      >
                        {sec.code === 'LANGUAGE_VOCAB'
                          ? 'Từ vựng/Kanji'
                          : sec.code === 'LANGUAGE_GRAMMAR_READING'
                            ? 'Ngữ pháp/Đọc hiểu'
                            : sec.code === 'LISTENING'
                              ? 'Nghe hiểu'
                              : sec.code}
                        <Badge variant="outline" className="ml-2 px-1.5 h-4 text-[9px] border-primary/20 bg-primary/5 text-primary/60 font-bold">
                          {sec.answers.length}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {groupedSections.map((sec) => (
                  <TabsContent key={sec.id} value={sec.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                    {sec.answers.map((ans, idx) => {
                      if (!ans.review) return null
                      const isCorrect = ans.isCorrect
                      const isExpanded = !!expandedAnswers[ans.templateQuestionId]

                      return (
                        <div
                          key={ans.templateQuestionId}
                          className={cn(
                            "rounded-xl border transition-all overflow-hidden",
                            isCorrect ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-destructive/20 bg-destructive/[0.02]"
                          )}
                        >
                          <button
                            className="w-full text-left p-4 sm:p-5 flex items-start gap-4 hover:bg-muted/50 transition-colors"
                            onClick={() => toggleExpand(ans.templateQuestionId)}
                          >
                            <div className={cn(
                              "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs",
                              isCorrect ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                            )}>
                              {idx + 1}
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center gap-2 mb-2">
                                {ans.mondai && (
                                  <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 h-5 text-muted-foreground border-muted-foreground/20">
                                    {ans.mondai.code}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm font-bold text-foreground leading-relaxed line-clamp-2">
                                <MarkdownRenderer content={ans.review.stemText} inline />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-center">
                              {isCorrect ? (
                                <CheckCircle2 className="size-5 text-emerald-500" />
                              ) : (
                                <XCircle className="size-5 text-destructive" />
                              )}
                              {isExpanded ? <ChevronUp className="size-4 text-muted-foreground/40" /> : <ChevronDown className="size-4 text-muted-foreground/40" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-5 pb-6 sm:px-12 pt-0 space-y-6 animate-in slide-in-from-top-2 duration-300">
                              <Separator className="opacity-50" />

                              {ans.review.contextText && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Ngữ cảnh</p>
                                  <div className="text-sm text-foreground bg-muted/20 p-4 rounded-lg italic font-japanese">
                                    <MarkdownRenderer content={ans.review.contextText} />
                                  </div>
                                </div>
                              )}

                              <div className="space-y-4">
                                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Lựa chọn</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {ans.review.options.map((opt, oIdx) => {
                                    const isSelected = ans.selectedOptionId === opt.id
                                    const isCorrectOption = opt.isCorrect === true || ans.review?.correctOptionId === opt.id

                                    return (
                                      <div
                                        key={opt.id}
                                        className={cn(
                                          "flex items-center gap-3 p-3 rounded-lg border text-sm transition-all",
                                          isSelected && isCorrectOption && "border-emerald-500 bg-emerald-500/5",
                                          isSelected && !isCorrectOption && "border-destructive bg-destructive/5",
                                          !isSelected && isCorrectOption && "border-emerald-500 bg-emerald-500/5",
                                          !isSelected && !isCorrectOption && "border-border bg-background"
                                        )}
                                      >
                                        <div className={cn(
                                          "size-6 rounded-md flex items-center justify-center font-bold text-[10px] border shrink-0",
                                          isSelected && isCorrectOption && "bg-emerald-500 text-white border-emerald-500",
                                          isSelected && !isCorrectOption && "bg-destructive text-white border-destructive",
                                          !isSelected && isCorrectOption && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                          !isSelected && !isCorrectOption && "bg-muted text-muted-foreground border-transparent"
                                        )}>
                                          {oIdx + 1}
                                        </div>
                                        <div className="flex-1 font-medium font-japanese">
                                          <MarkdownRenderer content={opt.contentText} inline />
                                        </div>
                                        {isSelected && (
                                          <span className="text-[9px] font-bold uppercase tracking-tighter opacity-40">Bạn chọn</span>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {ans.review.explanation && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                                    <Info className="size-3" />
                                    <span>Giải thích</span>
                                  </p>
                                  <div className="text-sm text-foreground bg-primary/[0.03] border border-primary/5 p-4 rounded-lg leading-relaxed">
                                    <MarkdownRenderer content={ans.review.explanation} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
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
