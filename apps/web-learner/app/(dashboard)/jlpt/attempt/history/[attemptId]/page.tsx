'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { ArrowLeft } from 'lucide-react'
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
  scores: any
  answers: Array<any>
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
        // API mock có thể trả về kiểu khác JlptAttemptDetail, nên cast theo chủ đích.
        // Next/TS strict hơn yêu cầu phải cast qua `unknown` trước.
        setData(res as unknown as JlptAttemptDetail)
      } catch (e: any) {
        console.error(e)
        toast.error(e?.message ?? 'Không tải được lịch sử làm bài')
      } finally {
        setLoading(false)
      }
    })()
  }, [attemptId])

  if (!attemptId) return null
  if (loading || !data) return <PageLoading className="h-screen" />

  const { attempt, scores, answers } = data
  const languageScaled = scores?.languageScaled
  const readingScaled = scores?.readingScaled
  const listeningScaled = scores?.listeningScaled

  const scoreOrNna = (v: any) => (v === 0 ? 0 : v ?? 'N/A')

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Link href="/jlpt/attempt/history">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl size-10 bg-background/50 backdrop-blur-md border border-white/5 hover:bg-white/10 hover:text-primary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-foreground">
            JLPT Result Review
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">
            Attempt ID: {attemptId.substring(0, 8)}...
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant={attempt.status === 'SUBMITTED' ? 'default' : 'secondary'}
                className="rounded-md px-2 py-1 text-[11px] font-black uppercase tracking-widest"
              >
                {attempt.status}
              </Badge>
              <span className="text-xs font-bold text-muted-foreground">{attempt.level}</span>
            </div>

            <div className="text-xs text-muted-foreground">
              {attempt.submittedAt
                ? `Submitted: ${format(new Date(attempt.submittedAt), 'dd MMM yyyy, HH:mm')}`
                : attempt.startedAt
                  ? `Started: ${format(new Date(attempt.startedAt), 'dd MMM yyyy, HH:mm')}`
                  : 'N/A'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Card className="shadow-none border-white/5 bg-background/40">
                <CardContent className="p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    LANGUAGE
                  </div>
                  <div className="text-xl font-black">{scoreOrNna(languageScaled)}</div>
                </CardContent>
              </Card>
              <Card className="shadow-none border-white/5 bg-background/40">
                <CardContent className="p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    READING
                  </div>
                  <div className="text-xl font-black">{scoreOrNna(readingScaled)}</div>
                </CardContent>
              </Card>
              <Card className="shadow-none border-white/5 bg-background/40">
                <CardContent className="p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    LISTENING
                  </div>
                  <div className="text-xl font-black">{scoreOrNna(listeningScaled)}</div>
                </CardContent>
              </Card>
            </div>

            {typeof scores?.passMock === 'boolean' && (
              <div className="pt-2">
                <Badge
                  variant={scores.passMock ? 'default' : 'destructive'}
                  className="rounded-md px-2 py-1 text-[11px] font-black uppercase tracking-widest"
                >
                  {scores.passMock ? 'PASSED' : 'NOT PASSED'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="text-sm font-black">Tóm tắt</div>
            <div className="text-xs text-muted-foreground">Tổng câu trả lời: {answers?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground">
              TemplateId: {attempt.templateId.substring(0, 8)}...
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/jlpt-list-exam')}>
              Quay lại danh sách đề
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {(answers ?? []).map((a, idx) => {
          const chosenOption = a.review?.options?.find((o: any) => o.id === a.selectedOptionId)
          return (
            <Card key={a.templateQuestionId ?? idx} className="border-white/5 bg-background/40">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Q{idx + 1} · {a.section?.code ?? 'N/A'} · {a.mondai?.code ?? 'N/A'}
                  </div>
                  <Badge
                    variant={a.isCorrect ? 'default' : 'destructive'}
                    className="rounded-md px-2 py-1 text-[11px] font-black uppercase tracking-widest"
                  >
                    {a.isCorrect ? 'Đúng' : 'Sai'}
                  </Badge>
                </div>

                {a.review?.stemText && <div className="text-sm font-semibold">{a.review.stemText}</div>}

                <div className="text-xs text-muted-foreground">
                  Đáp án bạn chọn: {chosenOption?.contentText ?? a.selectedOptionId ?? 'Chưa chọn'}
                </div>
                <div className="text-xs text-muted-foreground">Điểm: {a.scoreAwarded ?? 'N/A'}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

