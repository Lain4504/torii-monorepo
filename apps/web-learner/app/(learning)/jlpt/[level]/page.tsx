'use client'

import { useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, CalendarDays, FileText, MessageCircle } from "lucide-react"
import { useJlptMockTemplates } from "@/lib/api/services/jlpt-mock-api"

const LEVEL_BADGE_COLOR = "bg-amber-400 text-amber-950 dark:text-amber-50"

export default function JlptLevelExamPage() {
  const params = useParams<{ level: string }>()
  const levelCode = (params.level || "n3").toUpperCase()

  const { data: templates = [], isLoading } = useJlptMockTemplates(levelCode)

  const items = useMemo(
    () =>
      templates.map((tpl) => ({
        id: tpl.id,
        title: tpl.title,
        code: tpl.code,
        duration: tpl.totalDurationMinutes
          ? `Tổng ${tpl.totalDurationMinutes} phút`
          : "Không giới hạn thời gian",
        sections: "Kanji – Từ vựng · Ngữ pháp – Đọc hiểu · Nghe hiểu",
      })),
    [templates],
  )

  return (
    <div className="min-h-screen bg-muted">
      <div className="w-full h-screen overflow-y-auto relative px-6 py-10 md:px-16 md:py-16">
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
            <h1 className="text-2xl font-bold text-foreground">
              Danh sách đề thi JLPT {levelCode}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chọn một đề thi bên dưới để vào màn hình chọn phần thi (Kanji, Ngữ pháp –
              Đọc hiểu, Nghe hiểu).
            </p>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải danh sách đề thi...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có đề thi mô phỏng nào cho cấp độ này.
              </p>
            ) : (
              items.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/jlpt/mock-ui?templateId=${exam.id}&level=${levelCode}`}
                  className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {levelCode}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em]">
                        {exam.code}
                      </p>
                      <h2 className="text-base md:text-lg font-bold text-foreground">
                        {exam.title}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exam.sections}
                      </p>
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
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="fixed bottom-10 right-10">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Nhắn tin</span>
          </Button>
        </div>
      </div>
    </div>
  )
}


