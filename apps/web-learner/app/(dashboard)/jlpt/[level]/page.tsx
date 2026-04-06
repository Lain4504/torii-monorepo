"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, AlertCircle, ChevronRight, Clock, Activity } from "lucide-react"
import { jlptMockApi, useJlptMockTemplates } from "@/lib/api/services/jlpt-mock-api"
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

export default function JlptLevelExamPage() {
  const params = useParams<{ level: string }>()
  const levelCode = (params.level || "n3").toUpperCase()
  const router = useRouter()

  const { data: templates = [], isLoading } = useJlptMockTemplates(levelCode)

  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null)
  const [showConfirmStart, setShowConfirmStart] = useState(false)
  const [starting, setStarting] = useState(false)

  const pendingExam = pendingTemplateId ? templates.find((x) => x.id === pendingTemplateId) : null

  const confirmStart = async () => {
    if (!pendingTemplateId) return
    try {
      setStarting(true)
      const attempt = await jlptMockApi.startAttempt({ templateId: pendingTemplateId })
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border" asChild>
            <Link href="/dashboard/jlpt-list-exam">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-bold px-2 rounded-lg">
                    JLPT {levelCode}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-lg border">
                    <FileText className="size-3 text-primary" />
                    <span>{templates.length} đề thi</span>
                </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Hệ thống đề luyện thi mô phỏng
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.length === 0 ? (
          <div className="col-span-full py-24 bg-muted border border-dashed rounded-xl flex flex-col items-center gap-3">
            <Activity className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Hiện chưa có đề thi mới cho cấp độ {levelCode}.</p>
          </div>
        ) : (
          templates.map((exam) => (
            <button
              key={exam.id}
              type="button"
              disabled={starting}
              onClick={() => {
                setPendingTemplateId(exam.id)
                setShowConfirmStart(true)
              }}
              className="text-left group outline-none"
            >
              <Card className="bg-card hover:bg-muted/50 transition-colors rounded-xl overflow-hidden h-full">
                <CardContent className="p-5 flex flex-col h-full gap-4">
                    <div className="flex items-center justify-between">
                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border">
                            <FileText className="size-4" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-medium h-5 px-2 rounded-lg text-muted-foreground tabular-nums">
                            {exam.code}
                        </Badge>
                    </div>

                    <div className="space-y-2 flex-1">
                        <h2 className="text-base font-bold text-foreground leading-tight">
                            {exam.title}
                        </h2>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-lg border">
                                <Clock className="size-3.5 text-primary" />
                                {exam.totalDurationMinutes ? `${exam.totalDurationMinutes} phút` : "Bất định"}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Activity className="size-3.5 text-primary" />
                                đầy đủ các phần thi
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bắt đầu ngay</span>
                        <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                </CardContent>
              </Card>
            </button>
          ))
        )}
      </div>

      <AlertDialog open={showConfirmStart} onOpenChange={setShowConfirmStart}>
        <AlertDialogContent className="max-w-md p-6">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto size-16 bg-primary/10 rounded-2xl flex items-center justify-center border">
                <AlertCircle className="size-8 text-primary" />
            </div>
            <div className="space-y-2 text-center">
                <AlertDialogTitle className="text-xl font-bold">Vào phòng thi thử?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium leading-relaxed px-4 text-muted-foreground">
                    Bạn đã sẵn sàng cho kỳ thi <span className="text-foreground font-bold">{pendingExam?.title}</span>? 
                    <br/> Thời gian làm bài sẽ được tính ngay sau khi bạn xác nhận.
                </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 pt-6">
            <AlertDialogCancel className="w-full h-10 rounded-lg font-bold order-2 sm:order-1 sm:flex-1">Quay lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStart}
              disabled={starting || !pendingTemplateId}
              className="w-full h-10 rounded-lg font-bold order-1 sm:order-2 sm:flex-1"
            >
              Vào phòng thi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
