'use client'

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, FileText, AlertCircle } from "lucide-react"
import { jlptMockApi, useJlptMockTemplates, type JlptMockAttempt } from "@/lib/api/services/jlpt-mock-api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "@workspace/ui/components/sonner"

const LEVEL_BADGE_COLOR = "bg-amber-400 text-amber-950 dark:text-amber-50"

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
        duration: tpl.totalDurationMinutes ? `Tổng ${tpl.totalDurationMinutes} phút` : "Không giới hạn thời gian",
        sections: "Kanji – Từ vựng · Ngữ pháp – Đọc hiểu · Nghe hiểu",
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

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center gap-2 mb-6">
          <Link
            href="/dashboard/jlpt-list-exam"
            className="text-sm text-muted-foreground flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Chọn cấp độ JLPT
          </Link>
          <span
            className={`${LEVEL_BADGE_COLOR} text-[12px] font-bold px-3 py-0.5 rounded-full ml-2`}
          >
            {levelCode}
          </span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Danh sách đề thi JLPT {levelCode}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chọn một đề thi bên dưới để vào màn hình chọn phần thi (Kanji, Ngữ pháp – Đọc hiểu, Nghe hiểu).
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải danh sách đề thi...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có đề thi mô phỏng nào cho cấp độ này.</p>
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
                className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {levelCode}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em]">
                      {exam.code}
                    </p>
                    <h2 className="text-base md:text-lg font-bold text-foreground">{exam.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{exam.sections}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>Kỳ thi mô phỏng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{exam.duration}</span>
                  </div>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary group-hover:text-primary/80">
                    Nhấn để chọn đề
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Confirm start exam */}
      <AlertDialog open={showConfirmStart} onOpenChange={setShowConfirmStart}>
        <AlertDialogContent className="max-w-[420px] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <div className="bg-background border rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                  Xác nhận làm đề?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-base px-2 uppercase text-[10px] font-bold tracking-widest">
                  Bạn sẽ bắt đầu đề {pendingExam?.title ?? ""}. Hành động này có thể không thể hủy ngay lập tức.
                </AlertDialogDescription>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <AlertDialogCancel className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] border-2 hover:bg-muted transition-all active:scale-95">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmStart}
                  disabled={starting || !pendingTemplateId}
                  className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Bắt đầu
                </AlertDialogAction>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

