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
import { jlptMockApi } from '@/lib/api/services/jlpt-mock-api'
import { cn } from '@workspace/ui/lib/utils'

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
        <div className="space-y-12 max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-700">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 border-b border-border/30 pb-8">
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/40" asChild>
                            <Link href="/dashboard/jlpt-list-exam">
                                <ArrowLeft className="size-3.5" />
                            </Link>
                        </Button>
                        <Badge variant="outline" className="px-2 py-0 rounded-md text-[10px] font-medium border-border/50 text-muted-foreground/60 leading-none">
                            Mock History
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Lịch sử làm bài</h1>
                    <p className="text-[13px] font-medium text-muted-foreground/40 leading-relaxed">
                        Xem lại kết quả luyện thi JLPT của bạn
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-medium text-muted-foreground/30 leading-none mb-1.5">Tổng số lượt thi</p>
                        <p className="text-2xl font-bold text-foreground tabular-nums leading-none tracking-tight">{items.length}</p>
                    </div>
                    <Button asChild variant="outline" className="font-semibold h-10 px-6 rounded-full text-xs tracking-tight">
                        <Link href="/dashboard/jlpt-list-exam">Thi thử mới</Link>
                    </Button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="size-16 bg-muted/50 rounded-full flex items-center justify-center">
                        <HistoryIcon className="size-8 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                        <h3 className="text-lg font-bold">Chưa có dữ liệu</h3>
                        <p className="text-xs text-muted-foreground font-medium">Bạn chưa tham gia bất kỳ đề thi thử JLPT nào.</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-full px-8 font-bold text-xs uppercase tracking-tight">
                        <Link href="/dashboard/jlpt-list-exam">Bắt đầu ngay</Link>
                    </Button>
                </div>
            ) : (
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/30">
                                <TableHead className="w-16 text-center font-bold text-[10px] uppercase text-muted-foreground/60 tracking-wider h-11">STT</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground/60 tracking-wider h-11">Đề thi</TableHead>
                                <TableHead className="hidden sm:table-cell font-bold text-[10px] uppercase text-muted-foreground/60 tracking-wider text-center h-11">Cấp độ</TableHead>
                                <TableHead className="hidden md:table-cell font-bold text-[10px] uppercase text-muted-foreground/60 tracking-wider text-center h-11">Thời gian</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground/60 tracking-wider text-center h-11">Tình trạng</TableHead>
                                <TableHead className="w-12 h-11"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, idx) => {
                                const badge = statusBadge(item.status)
                                return (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer hover:bg-muted/40 transition-colors group border-b border-border/30 last:border-0"
                                        onClick={() => router.push(`/jlpt/attempt/history/${item.id}`)}
                                    >
                                        <TableCell className="text-center font-mono text-[11px] text-muted-foreground/40 py-4">
                                            {String(idx + 1).padStart(2, '0')}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                                                    {item.template.title}
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest tabular-nums">
                                                    {item.template.code ?? item.templateId.substring(0, 8).toUpperCase()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-center py-4">
                                            <Badge variant="outline" className="font-bold text-[10px] rounded-md px-1.5 py-0 h-5 border-border/50 text-muted-foreground/50">
                                                {item.level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-center py-4 tabular-nums">
                                            <div className="text-[11px] font-bold text-muted-foreground/40 leading-none">
                                                {item.submittedAt || item.startedAt
                                                  ? format(new Date(item.submittedAt || item.startedAt!), 'dd/MM/yyyy')
                                                  : '—'}
                                            </div>
                                            <div className="text-[10px] font-medium text-muted-foreground/20 mt-1 uppercase tracking-tighter">
                                                {item.submittedAt || item.startedAt
                                                  ? format(new Date(item.submittedAt || item.startedAt!), 'HH:mm')
                                                  : ''}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge
                                                variant={badge.variant}
                                                className={cn(
                                                    "px-2 px-1 rounded-md font-bold text-[9px] uppercase tracking-wider border shadow-none",
                                                    badge.className
                                                )}
                                            >
                                                {badge.text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <ChevronRight className="size-3.5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
