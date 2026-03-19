'use client'

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, FileText, Headphones, Languages, MessageCircle, Timer } from "lucide-react"
import { jlptMockApi, type JlptMockTemplate } from "@/lib/api/services/jlpt-mock-api"
import { useAppSelector } from "@/hooks/hooks"
import type { RootState } from "@/store/store"
import { toast } from "@workspace/ui/components/sonner"

const LEVEL_BADGE_COLOR = "bg-amber-400 text-amber-950 dark:text-amber-50"

export default function JlptMockUiPage() {
  const search = useSearchParams()
  const router = useRouter()
  const templateId = search.get("templateId")
  const level = (search.get("level") ?? "N3").toUpperCase()
  const userId = useAppSelector((s: RootState) => s.auth.user?.id)

  const [template, setTemplate] = useState<JlptMockTemplate | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!templateId) return
    ;(async () => {
      try {
        setLoading(true)
        const tpl = await jlptMockApi.findTemplateById(templateId)
        setTemplate(tpl)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [templateId])

  const handleStartSection = async (sectionOrder: number) => {
    if (!templateId || !userId) {
      toast.error("Bạn cần đăng nhập để làm bài JLPT")
      return
    }
    try {
      setLoading(true)
      const attempt = await jlptMockApi.startAttempt({ templateId })
      router.push(
        `/jlpt/mock-ui/section?templateId=${templateId}&attemptId=${attempt.id}&sectionOrder=${sectionOrder}&level=${level}`,
      )
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message ?? "Không thể bắt đầu bài thi JLPT")
    } finally {
      setLoading(false)
    }
  }

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
              {level}
            </span>
          </nav>

          <div className="mb-10">
            <h1 className="text-2xl font-bold text-foreground">
              {template?.title ?? "Kỳ thi JLPT mock"}
              <span className="text-muted-foreground font-normal text-base ml-2">
                {template?.code}
              </span>
            </h1>
            {loading && (
              <p className="text-sm text-muted-foreground mt-2">
                Đang tải thông tin đề thi...
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {([1, 2, 3] as const).map((orderIndex, idx) => {
              const sec = template?.sections.find((s) => s.orderIndex === orderIndex)
              if (!sec) {
                return <div key={orderIndex} className="hidden" />
              }

              const questionCount =
                (template?.questions ?? []).filter((q) => q.sectionId === sec.id).length || 0

              const cardMeta = (() => {
                if (sec.code === "LANGUAGE_VOCAB") {
                  return {
                    icon: <Languages className="w-6 h-6" />,
                    iconBg: "bg-sky-50 text-sky-500",
                    title: "Kanji - Từ vựng",
                    subtitle: "文字・語彙",
                  }
                }
                if (sec.code === "LANGUAGE_GRAMMAR_READING") {
                  return {
                    icon: <FileText className="w-6 h-6" />,
                    iconBg: "bg-purple-50 text-purple-500",
                    title: "Ngữ pháp - Đọc hiểu",
                    subtitle: "文法・読解",
                  }
                }
                return {
                  icon: <Headphones className="w-6 h-6" />,
                  iconBg: "bg-emerald-50 text-emerald-500",
                  title: "Nghe hiểu",
                  subtitle: "聴解 (ちょうかい)",
                }
              })()

              return (
                <ExamCard
                  key={sec.id}
                  icon={cardMeta.icon}
                  iconBg={cardMeta.iconBg}
                  title={cardMeta.title}
                  subtitle={cardMeta.subtitle}
                  duration={`${sec.durationMinutes} phút`}
                  questions={`${questionCount} câu`}
                  onClick={() => handleStartSection(orderIndex)}
                />
              )
            })}
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

interface ExamCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  duration: string
  questions: string
  onClick?: () => void
}

function ExamCard({ icon, iconBg, title, subtitle, duration, questions, onClick }: ExamCardProps) {
  const Wrapper: any = onClick ? "button" : "div"
  const wrapperProps = onClick ? { type: "button", onClick } : {}

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className="bg-card rounded-2xl p-8 shadow-sm border border-border flex flex-col gap-6 hover:shadow-md transition-shadow text-left"
    >
      <div className={`${iconBg} size-10 rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-foreground text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-6 text-[13px] text-muted-foreground mt-2">
        <div className="flex items-center gap-1.5">
          <Timer className="w-4 h-4" />
          {duration}
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          {questions}
        </div>
      </div>
    </Wrapper>
  )
}

