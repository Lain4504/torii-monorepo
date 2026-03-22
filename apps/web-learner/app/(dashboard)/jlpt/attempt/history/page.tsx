'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { ArrowLeft, ChevronRight, History as HistoryIcon } from 'lucide-react'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty'

import { jlptMockApi, type JlptMockAttemptHistoryItem } from '@/lib/api/services/jlpt-mock-api'
import { cn } from '@workspace/ui/lib/utils'

function statusBadge(status: string) {
  if (status === 'SUBMITTED') return { text: 'Đã nộp', variant: 'default' as const }
  if (status === 'IN_PROGRESS') return { text: 'Đang làm', variant: 'secondary' as const }
  return { text: status, variant: 'outline' as const }
}

export default function JlptAttemptHistoryPage() {
  const router = useRouter()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['jlpt-attempt-history'],
    queryFn: () => jlptMockApi.findAttemptHistory(),
  })

  if (isLoading) return <PageLoading className="h-screen" />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-lg shrink-0" asChild>
          <Link href="/dashboard/jlpt-list-exam">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lịch sử làm bài JLPT</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Xem lại kết quả các bài thi JLPT mock đã thực hiện
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex justify-center py-16 px-6">
            <Empty className="max-w-sm">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-muted">
                  <HistoryIcon className="h-8 w-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle className="text-lg font-semibold">Chưa có lịch sử làm bài</EmptyTitle>
                <EmptyDescription className="text-muted-foreground">
                  Hãy bắt đầu làm một đề JLPT để có lịch sử và xem kết quả.
                </EmptyDescription>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/jlpt-list-exam">Đến danh sách đề thi</Link>
                </Button>
              </EmptyHeader>
            </Empty>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Đề thi</TableHead>
                <TableHead className="hidden sm:table-cell">Mã đề</TableHead>
                <TableHead className="hidden md:table-cell">Trình độ</TableHead>
                <TableHead>Ngày làm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-24 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => {
                const badge = statusBadge(item.status)
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/jlpt/attempt/history/${item.id}`)}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.template.title}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {item.template.code ?? item.templateId}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="font-normal">
                        {item.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.submittedAt
                        ? format(new Date(item.submittedAt), 'dd/MM/yyyy HH:mm')
                        : item.startedAt
                          ? format(new Date(item.startedAt), 'dd/MM/yyyy HH:mm')
                          : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={badge.variant}
                        className={cn(
                          badge.variant === 'default' && 'bg-primary/10 text-primary border-primary/20',
                          badge.variant === 'secondary' && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {badge.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/jlpt/attempt/history/${item.id}`)
                        }}
                        asChild
                      >
                        <Link href={`/jlpt/attempt/history/${item.id}`} onClick={(e) => e.stopPropagation()}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
