'use client'

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, FileText, AlertCircle, ChevronRight, BookOpen, Clock, Activity } from "lucide-react"
import { jlptMockApi, useJlptMockTemplates, type JlptMockAttempt } from "@/lib/api/services/jlpt-mock-api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export default function JlptLevelExamPage() {
  const params = useParams<{ level: string }>()
  const levelCode = (params.level || "n3").toUpperCase()
  const router = useRouter()

  const { data: templates = [], isLoading } = useJlptMockTemplates(levelCode)

  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null)
  const [showConfirmStart, setShowConfirmStart] = useState(false)
  const [starting, setStarting] = useState(false)

  const items = useMemo(
    () =>
      templates.map((tpl) => ({
        id: tpl.id,
        title: tpl.title,
        code: tpl.code,
        duration: tpl.totalDurationMinutes ? `${tpl.totalDurationMinutes} phút` : "Không giới hạn",
        sections: "Kanji · Từ vựng · Ngữ pháp · Đọc hiểu · Nghe hiểu",
      })),
    [templates],
  )

  const pendingExam = pendingTemplateId ? items.find((x) => x.id === pendingTemplateId) : null

  const confirmStart = async () => {
    if (!pendingTemplateId) return
    try {
      setStarting(true)
      const attempt: JlptMockAttempt = await jlptMockApi.startAttempt({ templateId: pendingTemplateId })
      const endsAtQuery = attempt.endsAt ? `&endsAt=${encodeURIComponent(attempt.endsAt)}` : ""
      router.push(
        `/jlpt/attempt/section?templateId=${pendingTemplateId}&attemptId=${attempt.id}&sectionOrder=1&level=${levelCode}${endsAtQuery}`,
      )
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message ?? "Không thể bắt đầu đề JLPT")
    } finally {
      setStarting(false)
      setShowConfirmStart(false)
    }
  }

  if (isLoading) return <PageLoading className="h-screen" />

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto py-10 px-4">
      {/* Minimal Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/30 pb-8">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border/40 hover:bg-muted" asChild>
            <Link href="/dashboard/jlpt-list-exam">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
                <Badge className="px-2 py-0 rounded-md font-bold text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-none">
                    Mô phỏng JLPT {levelCode}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">{items.length} đề thi</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
              Danh sách đề luyện tập
            </h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-muted/5 border border-dashed border-border/60 rounded-xl">
            <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Hiện chưa có đề thi nào cho cấp độ này.</p>
          </div>
        ) : (
          items.map((exam) => (
            <button
              key={exam.id}
              type="button"
              disabled={starting}
              onClick={() => {
                setPendingTemplateId(exam.id)
                setShowConfirmStart(true)
              }}
              className="text-left group"
            >
              <Card className="border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-300 rounded-xl overflow-hidden group-hover:-translate-y-0.5">
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="size-9 rounded-lg bg-muted/40 group-hover:bg-primary/5 flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
                            <FileText className="size-4" />
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 h-4 border-border/50 text-muted-foreground/40">
                            {exam.code}
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {exam.title}
                        </h2>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Clock className="size-3" />
                                {exam.duration}
                            </div>
                            <span className="opacity-40">•</span>
                            <div className="flex items-center gap-1.5 italic lowercase">
                                <Activity className="size-3" />
                                full 3 phần thi
                            </div>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </button>
          ))
        )}
      </div>

      {/* Standard AlertDialog */}
      <AlertDialog open={showConfirmStart} onOpenChange={setShowConfirmStart}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto size-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="size-8 text-primary" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">Xác nhận bắt đầu thi?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium">
                Bạn đã sẵn sàng cho đề thi <span className="text-foreground font-bold">{pendingExam?.title}</span>? 
                Thời gian sẽ bắt đầu trôi ngay khi bạn nhấn xác nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 pt-4">
            <AlertDialogCancel className="flex-1 h-12 rounded-xl font-bold mt-0 border-zinc-200">Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStart}
              disabled={starting || !pendingTemplateId}
              className="flex-1 h-12 rounded-xl font-bold bg-primary text-white hover:bg-primary/90"
            >
              Vào thi ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
