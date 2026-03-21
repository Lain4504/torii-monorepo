'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { ArrowLeft, History as HistoryIcon } from 'lucide-react'

import { jlptMockApi, type JlptMockAttemptHistoryItem } from '@/lib/api/services/jlpt-mock-api'

function statusBadge(status: string) {
  if (status === 'SUBMITTED') return { text: 'SUBMITTED', variant: 'outline' as const }
  if (status === 'IN_PROGRESS') return { text: 'IN_PROGRESS', variant: 'secondary' as const }
  return { text: status, variant: 'destructive' as const }
}

export default function JlptAttemptHistoryPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['jlpt-attempt-history'],
    queryFn: () => jlptMockApi.findAttemptHistory(),
  })

  if (isLoading) return <PageLoading className="h-screen" />

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jlpt-list-exam">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl size-10 bg-background/50 backdrop-blur-md border border-white/5 hover:bg-white/10 hover:text-primary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-foreground flex items-center gap-3">
            <HistoryIcon className="size-8 text-primary" />
            JLPT Attempt History
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">
            Lịch sử làm bài JLPT mock theo tài khoản hiện tại
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-[3rem] bg-white/5">
          <div className="p-6 rounded-full bg-muted/10 mb-6">
            <HistoryIcon className="size-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight italic text-muted-foreground/50">
            No Attempts Found
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-2">
            Hãy bắt đầu làm một đề JLPT để có lịch sử
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item: JlptMockAttemptHistoryItem) => {
            const badge = statusBadge(item.status)
            return (
              <Card
                key={item.id}
                className="group overflow-hidden border-white/5 bg-background/40 backdrop-blur-sm hover:bg-background/60 hover:border-primary/20 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={badge.variant}
                          className="rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest border-0"
                        >
                          {badge.text}
                        </Badge>
                        <span className="text-xs font-bold text-muted-foreground">
                          {item.template.code ?? item.templateId}
                        </span>
                      </div>

                      <div className="font-black text-lg text-foreground">{item.template.title}</div>

                      <div className="text-xs text-muted-foreground">
                        {item.startedAt ? format(new Date(item.startedAt), 'dd MMM yyyy, HH:mm') : 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/jlpt/attempt/history/${item.id}`}>
                        <Button className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 bg-white/5 hover:bg-primary hover:text-primary-foreground border border-white/10 hover:border-primary/20 transition-all shadow-none hover:shadow-lg hover:shadow-primary/10">
                          Xem lại
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
                <div
                  className={`h-1 w-full ${
                    item.status === 'SUBMITTED' ? 'bg-primary/20' : 'bg-destructive/20'
                  }`}
                />
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

