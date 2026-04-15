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
import { PageLoading } from '@workspace/ui/components/page-loading'
import { ArrowLeft, ChevronRight, History as HistoryIcon } from 'lucide-react'
import { jlptMockApi } from '@/lib/api/services/jlpt-mock-api'
import { cn } from '@workspace/ui/lib/utils'
import { dataTableHeaderClass, dataTableShellClass } from '@/lib/ui-shell'

function statusBadge(status: string) {
  if (status === 'SUBMITTED') return { text: 'Đã nộp', variant: 'default' as const, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
  if (status === 'IN_PROGRESS') return { text: 'Đang làm', variant: 'secondary' as const, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
  return { text: status, variant: 'outline' as const, className: '' }
}

export default function JlptAttemptHistoryPage() {
  const router = useRouter()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['jlpt-attempt-history'],
    queryFn: () => jlptMockApi.findAttemptHistory(),
  })

  if (isLoading) return <PageLoading className="h-screen" />

  return (
      <div className="space-y-6 animate-in fade-in duration-500 md:space-y-8 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="space-y-4 border-b border-border pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg border border-border/40"
                asChild
              >
                <Link href="/dashboard/jlpt-list-exam">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>

              <div className="min-w-0 space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Lịch sử làm bài</h1>
                <p className="text-sm font-medium text-muted-foreground">
                  Xem lại kết quả luyện thi JLPT của bạn
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex items-baseline justify-between gap-6 sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-medium text-muted-foreground leading-none">Tổng số lượt thi</p>
                  <p className="text-xl font-bold text-foreground tabular-nums leading-none">{items.length}</p>
                </div>
              </div>

              <Button asChild variant="outline" className="h-10 w-full sm:w-auto px-6 rounded-lg">
                <Link href="/dashboard/jlpt-list-exam">Thi thử mới</Link>
              </Button>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
            <div className="size-14 bg-muted/50 rounded-full flex items-center justify-center">
              <HistoryIcon className="size-7 text-muted-foreground/20" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-lg font-bold">Chưa có dữ liệu</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Bạn chưa tham gia bất kỳ đề thi thử JLPT nào.
              </p>
            </div>
            <Button asChild variant="outline" className="h-10 px-8 rounded-lg">
              <Link href="/dashboard/jlpt-list-exam">Bắt đầu ngay</Link>
            </Button>
          </div>
        ) : (
          <div className={dataTableShellClass}>
            <Table>
              <TableHeader className={dataTableHeaderClass}>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60px] text-center">STT</TableHead>
                  <TableHead className="min-w-[240px] pl-4">Đề thi</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Cấp độ</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Thời gian</TableHead>
                  <TableHead className="text-center">Tình trạng</TableHead>
                  <TableHead className="w-[60px] text-right pr-4">
                    <span className="sr-only">Thao tác</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => {
                  const badge = statusBadge(item.status)
                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors group border-b last:border-b-0"
                      onClick={() => router.push(`/jlpt/attempt/history/${item.id}`)}
                    >
                      <TableCell className="text-center tabular-nums font-medium text-muted-foreground/60 text-xs py-4">
                        {String(idx + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="pl-4 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="font-semibold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {item.template.title}
                          </div>
                          <div className="text-xs font-medium text-muted-foreground/40 tabular-nums">
                            {item.template.code ?? item.templateId.substring(0, 8).toUpperCase()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center py-4">
                        <Badge variant="outline" className="font-normal tabular-nums">
                          {item.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center py-4 tabular-nums">
                        <div className="text-sm font-medium text-muted-foreground/60 leading-none">
                          {item.submittedAt || item.startedAt
                            ? format(new Date(item.submittedAt || item.startedAt!), "dd/MM/yyyy")
                            : "—"}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground/30 mt-1">
                          {item.submittedAt || item.startedAt
                            ? format(new Date(item.submittedAt || item.startedAt!), "HH:mm")
                            : ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge
                          variant={badge.variant}
                          className={cn("px-2 rounded-md font-semibold text-xs border shadow-none", badge.className)}
                        >
                          {badge.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-4">
                        <ChevronRight className="size-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
  )
}