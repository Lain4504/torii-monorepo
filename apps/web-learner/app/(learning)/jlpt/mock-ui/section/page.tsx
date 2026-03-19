'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Clock, Maximize2, MessageCircle, Send, Settings } from "lucide-react"
import { jlptMockApi, type JlptMockTemplate, type JlptMockTemplateQuestion } from "@/lib/api/services/jlpt-mock-api"
import { toast } from "@workspace/ui/components/sonner"

type MondaiSection = {
  mondaiId: string | null
  mondaiCode?: string | null
  title: string
  description: string
  orderIndex: number
}

type QuestionOption = {
  id: string
  label: string
}

type QuestionBlock = {
  id: number
  sentence: React.ReactNode
  options: QuestionOption[]
  templateQuestionId: string
}

export default function JlptMockSectionPage() {
  const search = useSearchParams()
  const router = useRouter()
  const templateId = search.get("templateId")
  const attemptId = search.get("attemptId")
  const sectionOrder = Number(search.get("sectionOrder") ?? "1")
  const level = (search.get("level") ?? "N3").toUpperCase()

  const [template, setTemplate] = useState<JlptMockTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeMondaiId, setActiveMondaiId] = useState<string | null>(null)
  const [activeMondaiIndex, setActiveMondaiIndex] = useState<number>(0)
  const [activeMondaiCode, setActiveMondaiCode] = useState<string | null>(null)

  useEffect(() => {
    if (!templateId) return
    ;(async () => {
      try {
        setLoading(true)
        const tpl = await jlptMockApi.findTemplateById(templateId)
        setTemplate(tpl)
      } catch (e) {
        console.error(e)
        toast.error("Không tải được thông tin đề thi JLPT")
      } finally {
        setLoading(false)
      }
    })()
  }, [templateId])

  const currentSection = useMemo(
    () => template?.sections.find((s) => s.orderIndex === sectionOrder) ?? null,
    [template, sectionOrder],
  )

  const sectionQuestions: JlptMockTemplateQuestion[] = useMemo(
    () =>
      (template?.questions ?? []).filter(
        (q) => q.sectionId === currentSection?.id,
      ),
    [template, currentSection],
  )

  const MONDAI_SECTIONS: MondaiSection[] = useMemo(() => {
    // Prefer mondai ordering coming from backend.
    const mondaiFromApi: Array<{ id: string; code?: string | null; orderIndex: number; titleVi?: string | null; titleJa?: string | null }> =
      ((currentSection as any)?.mondai ?? []).map((m: any) => ({
        id: m.id,
        code: m.code ?? null,
        orderIndex: Number(m.orderIndex ?? 0),
        titleVi: m.titleVi ?? null,
        titleJa: m.titleJa ?? null,
      }))

    const counts = new Map<string | null, number>()
    for (const q of sectionQuestions) {
      const key = q.mondaiId ?? null
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    if (mondaiFromApi.length > 0) {
      const sorted = mondaiFromApi.slice().sort((a, b) => a.orderIndex - b.orderIndex)
      return sorted.map((m, idx) => ({
        mondaiId: m.id,
        mondaiCode: m.code ?? null,
        title: `問題${idx + 1}`,
        description: (() => {
          const label = (m.titleJa ?? m.titleVi ?? m.code ?? "").toString().trim()
          const count = counts.get(m.id) ?? 0
          return label ? `${label}·0/${count}` : `0/${count}`
        })(),
        orderIndex: idx,
      }))
    }

    // Fallback: group-by mondaiId order of appearance
    const uniq = Array.from(new Set(sectionQuestions.map((q) => q.mondaiId ?? null)))
    return uniq.map((mondaiId, idx) => ({
      mondaiId,
      mondaiCode: null,
      title: `問題${idx + 1}`,
      description: `0/${counts.get(mondaiId) ?? 0}`,
      orderIndex: idx,
    }))
  }, [sectionQuestions])

  // Initialize active mondai (first one) once we have MONDAI_SECTIONS.
  useEffect(() => {
    if (MONDAI_SECTIONS.length === 0) return
    if (activeMondaiId === null) {
      const first = MONDAI_SECTIONS[0]
      if (first) {
        setActiveMondaiId(first.mondaiId)
        setActiveMondaiIndex(0)
        setActiveMondaiCode(first.mondaiCode ?? null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MONDAI_SECTIONS])

  const activeMondaiQuestions: JlptMockTemplateQuestion[] = useMemo(() => {
    return sectionQuestions.filter((q) => (q.mondaiId ?? null) === activeMondaiId)
  }, [sectionQuestions, activeMondaiId])

  const QUESTION_BLOCKS: QuestionBlock[] = useMemo(
    () =>
      activeMondaiQuestions.map((q, idx) => ({
        id: idx + 1,
        templateQuestionId: q.id,
        sentence: (
          <>
            {q.question.contextText && (
              <span className="block mb-2 text-base text-muted-foreground">
                {q.question.contextText}
              </span>
            )}
            <span>{q.question.stemText}</span>
          </>
        ),
        options: q.question.options.map((opt) => ({
          id: opt.id,
          label: opt.contentText,
        })),
      })),
    [activeMondaiQuestions],
  )

  const QUESTION_COUNT = QUESTION_BLOCKS.length

  const problemInstruction = [
    "のことばの読み方として最もよいものを、1・2・3・4から一つえらびなさい。",
    "のことばを漢字で書くとき、最もよいものを、1・2・3・4から一つえらびなさい。",
    "( )に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。",
    "に意味が最も近いものを、1・2・3・4から一つえらびなさい。",
    "つぎのことばの使い方として最もよいものを、1・2・3・4から一つえらびなさい。",
  ]

  // When the backend only contains grammar/one-mondai, the hardcoded "vocab 1~5" instructions can be wrong.
  // Here we map known mondai codes to the correct instruction sentence.
  const instructionByMondaiCode: Record<string, string> = {
    // CSV mondai1kyu1_1400 is grammar cloze => "( )に入れる..." (index 2)
    'GRAMMAR_SENTENCE_1': problemInstruction[2] ?? problemInstruction[0] ?? "",
  }

  const activeProblemInstruction =
    (activeMondaiCode && instructionByMondaiCode[activeMondaiCode]) ??
    problemInstruction[activeMondaiIndex] ??
    problemInstruction[0] ??
    ""

  const handleSubmit = async () => {
    if (!attemptId) {
      toast.error("Thiếu attemptId, không thể nộp bài")
      return
    }
    try {
      setLoading(true)
      await jlptMockApi.submitAttempt({ attemptId })
      toast.success("Đã nộp bài JLPT mock")
      router.push("/dashboard/jlpt-list-exam")
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message ?? "Không thể nộp bài JLPT")
    } finally {
      setLoading(false)
    }
  }

  const handleExit = () => {
    router.push("/dashboard/jlpt-list-exam")
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm font-bold">
            {level}
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-foreground">
              {currentSection?.code === "LANGUAGE_VOCAB" && "Kanji - Từ vựng"}
              {currentSection?.code === "LANGUAGE_GRAMMAR_READING" && "Ngữ pháp - Đọc hiểu"}
              {currentSection?.code === "LISTENING" && "Nghe hiểu"}
              {!currentSection && "Phần thi JLPT"}
            </h1>
            <span className="text-xs text-muted-foreground">
              0/{QUESTION_COUNT} câu
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xl font-semibold text-foreground">
          <Clock className="w-5 h-5" />
          <span>-- : --</span>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors shadow-none"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Send className="w-4 h-4 mr-2" />
            Nộp bài
          </Button>
          <Button
            variant="outline"
            className="px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
            onClick={handleExit}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Thoát
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[280px] bg-card border-r border-border flex flex-col overflow-y-auto">
          <div className="p-6 space-y-8">
            <section>
              <h2 className="text-xs font-bold text-muted-foreground tracking-wider mb-4 uppercase">
                PHẦN THI
              </h2>
              <nav className="space-y-1">
                {MONDAI_SECTIONS.map((m, index) => (
                  <button
                    key={`${m.mondaiId ?? "null"}-${index}`}
                    type="button"
                    className={`block w-full text-left p-3 rounded-lg transition-colors ${
                      (m.mondaiId ?? null) === activeMondaiId
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => {
                      setActiveMondaiId(m.mondaiId)
                      setActiveMondaiIndex(index)
                      setActiveMondaiCode(m.mondaiCode ?? null)
                    }}
                  >
                    <p className="font-bold text-sm">
                      {m.title}
                    </p>
                    <p
                      className={`text-xs ${
                        (m.mondaiId ?? null) === activeMondaiId
                          ? "opacity-90"
                          : "text-muted-foreground"
                      }`}
                    >
                      {m.description}
                    </p>
                  </button>
                ))}
              </nav>
            </section>

            <section>
              <h2 className="text-xs font-bold text-muted-foreground tracking-wider mb-4 uppercase">
                CÂU HỎI
              </h2>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: QUESTION_COUNT }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      type="button"
                      className="w-full aspect-square text-[10px] flex items-center justify-center border border-border text-muted-foreground rounded hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      {num}
                    </button>
                  ),
                )}
              </div>
            </section>
          </div>

          <div className="mt-auto p-4 flex justify-start">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-muted p-8 relative">
          <div className="max-w-4xl mx-auto space-y-6 pb-24">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6">
              <p className="text-foreground font-medium">
                {`問題${activeMondaiIndex + 1}　＿＿＿${activeProblemInstruction}`}
              </p>
            </div>

            {QUESTION_BLOCKS.map((q) => (
              <div
                key={q.id}
                className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-foreground rounded-md font-bold">
                    {q.id}
                  </span>
                  <p className="text-xl text-foreground">
                    {q.sentence}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                  {q.options.map((opt, index) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="option-card border border-border rounded-lg p-4 text-left transition-all flex items-center space-x-3 group bg-card"
                    >
                      <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        {index + 1}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-6 right-6">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center px-4 py-2 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="font-medium text-sm">Nhắn tin</span>
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}


