'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { AlertCircle, Clock, Maximize2, Send, Settings } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { jlptMockApi, type JlptMockTemplate, type JlptMockTemplateQuestion } from "@/lib/api/services/jlpt-mock-api"
import { storageApi } from "@/lib/api/services/storage-api"
import { ListeningPlayer } from "@/components/learning/jlpt/listening-player"
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
  const initialSectionOrder = Number(search.get("sectionOrder") ?? "1")
  const [currentSectionOrder, setCurrentSectionOrder] = useState<number>(initialSectionOrder)
  const level = (search.get("level") ?? "N3").toUpperCase()
  const [endsAtIsoState, setEndsAtIsoState] = useState<string | null>(() => search.get("endsAt"))

  const [template, setTemplate] = useState<JlptMockTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeMondaiId, setActiveMondaiId] = useState<string | null>(null)
  const [activeMondaiIndex, setActiveMondaiIndex] = useState<number>(0)
  const [activeMondaiCode, setActiveMondaiCode] = useState<string | null>(null)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [showConfirmNextSection, setShowConfirmNextSection] = useState(false)
  const [showConfirmExit, setShowConfirmExit] = useState(false)
  const [pendingNextSectionOrder, setPendingNextSectionOrder] = useState<number | null>(null)
  const [pendingNextEndsAtIso, setPendingNextEndsAtIso] = useState<string | null>(null)

  // Map theo templateQuestionId: optionId được chọn.
  // Dùng state để bấm chọn đáp án và submit sẽ lưu vào DB.
  const [selectedOptionByTemplateQuestionId, setSelectedOptionByTemplateQuestionId] = useState<
    Record<string, string | undefined>
  >({})

  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined)
  const [questionImageUrls, setQuestionImageUrls] = useState<Record<string, string>>({})

  // Câu (templateQuestionId) vừa được chọn gần nhất.
  // Sidebar sẽ sáng item tương ứng với câu này.
  const [activeQuestionTemplateId, setActiveQuestionTemplateId] = useState<string | null>(null)

  const endsAtMs = endsAtIsoState ? Date.parse(endsAtIsoState) : null
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (endsAtMs == null || Number.isNaN(endsAtMs)) return
    const t = setInterval(() => {
        const now = Date.now()
        setNowMs(now)
        if (now >= endsAtMs) {
            clearInterval(t)
            handleAutoSubmit()
        }
    }, 1000)
    return () => clearInterval(t)
  }, [endsAtMs])

  const handleAutoSubmit = async () => {
      toast.info("Hết thời gian làm bài! Đang tự động nộp bài...")
      await confirmSubmit()
  }

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
    () => template?.sections.find((s) => s.orderIndex === currentSectionOrder) ?? null,
    [template, currentSectionOrder],
  )

  const sectionQuestions: JlptMockTemplateQuestion[] = useMemo(
    () =>
      (template?.questions ?? []).filter(
        (q) => q.sectionId === currentSection?.id,
      ),
    [template, currentSection],
  )

  const sectionQuestionsSorted = useMemo(() => {
    const arr = [...sectionQuestions]
    arr.sort((a, b) => a.orderIndex - b.orderIndex)
    return arr
  }, [sectionQuestions])

  const questionIndexByTemplateQuestionId = useMemo(() => {
    const map = new Map<string, number>()
    sectionQuestionsSorted.forEach((q, idx) => {
      map.set(q.id, idx + 1)
    })
    return map
  }, [sectionQuestionsSorted])

  // When switching part/section inside the same page, reset mondai + question highlight.
  useEffect(() => {
    setActiveMondaiId(null)
    setActiveMondaiIndex(0)
    setActiveMondaiCode(null)
    setActiveQuestionTemplateId(null)
    setAudioUrl(undefined)
  }, [currentSectionOrder])

  const SECTION_ORDERS = useMemo(() => {
    return (template?.sections ?? []).map((s) => s.orderIndex).sort((a, b) => a - b)
  }, [template])
  const currentSectionIdx = SECTION_ORDERS.indexOf(currentSectionOrder)
  const PART_NUMBER = currentSectionIdx >= 0 ? currentSectionIdx + 1 : 1
  const PART_TOTAL = SECTION_ORDERS.length
  const isLastSection = PART_TOTAL > 0 && currentSectionIdx === PART_TOTAL - 1

  // Khi sectionQuestions thay đổi (switch template/route), đảm bảo state luôn có key.
  useEffect(() => {
    if (!sectionQuestions.length) return
    setSelectedOptionByTemplateQuestionId((prev) => {
      let changed = false
      const next = { ...prev }
      for (const q of sectionQuestions) {
        if (!(q.id in next)) {
          next[q.id] = undefined
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [sectionQuestions])

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
        id: questionIndexByTemplateQuestionId.get(q.id) ?? idx + 1,
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
    [activeMondaiQuestions, questionIndexByTemplateQuestionId],
  )

  // Sidebar "CÂU HỎI" phản ánh tổng câu hỏi của cả section.
  const QUESTION_COUNT = sectionQuestionsSorted.length

  const countdown = (() => {
    if (endsAtMs == null || Number.isNaN(endsAtMs)) return "-- : --"
    const diffMs = Math.max(0, endsAtMs - nowMs)
    const minutes = Math.floor(diffMs / 60_000)
    const seconds = Math.floor((diffMs % 60_000) / 1000)
    const mm = String(minutes).padStart(2, "0")
    const ss = String(seconds).padStart(2, "0")
    return `${mm} : ${ss}`
  })()

  const problemInstruction = [
    "のことばの読み方として最もよいものを、1・2・3・4から一つえらびなさい。",
    "のことばを漢字で書くとき、最もよいものを、1・2・3・4から一つえらびなさい。",
    "( )に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。",
    "に意味が最も近いものを、1・2・3・4 từ一つえらびなさい。",
    "つぎのことばの使い方として最もよいものを、1・2・3・4 từ一つえらびなさい。",
  ]

  const activeMondaiObject = useMemo(() => {
    return ((currentSection as any)?.mondai ?? []).find((m: any) => m.id === activeMondaiId)
  }, [currentSection, activeMondaiId])

  const activeProblemInstruction =
    activeMondaiObject?.instructionJa ||
    problemInstruction[activeMondaiIndex] ||
    problemInstruction[0]

  const confirmSubmit = async () => {
    setShowConfirmSubmit(false)
    if (!attemptId) {
      toast.error("Thiếu attemptId, không thể nộp bài")
      return
    }
    try {
      setLoading(true)

      const answers = sectionQuestions.map((q) => ({
        templateQuestionId: q.id,
        selectedOptionId: selectedOptionByTemplateQuestionId[q.id],
      }))

      await jlptMockApi.saveAnswers({ attemptId, answers })

      // Nộp theo từng phần: phần cuối mới gọi submitAttempt.
      if (isLastSection) {
        await jlptMockApi.submitAttempt({ attemptId })
        toast.success("Đã nộp bài JLPT mock")
        router.push(`/jlpt/attempt/history/${attemptId}`)
        return
      }

      const next = await jlptMockApi.nextSection({ attemptId, currentSectionOrder })

      // Tạm tắt timer UI của phần hiện tại cho đúng với "timer chạy khi bấm vào phần đó".
      setEndsAtIsoState(null)
      setPendingNextSectionOrder(next.currentSectionOrder)
      setPendingNextEndsAtIso(next.endsAt ?? null)
      setShowConfirmNextSection(true)
      toast.success(`Đã nộp phần ${PART_NUMBER}`)
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message ?? "Không thể nộp bài JLPT")
    } finally {
      setLoading(false)
    }
  }

  const confirmExit = () => {
    router.push("/dashboard/jlpt-list-exam")
  }

  const goBackToLevel = () => {
    router.push(`/jlpt/${level.toLowerCase()}`)
  }

  // Hydrate đáp án đã lưu (khi tải lại trang).
  useEffect(() => {
    if (!attemptId) return
    if (!sectionQuestionsSorted.length) return
    ;(async () => {
      try {
        const items = await jlptMockApi.getAttemptAnswers(attemptId)
        setSelectedOptionByTemplateQuestionId((prev) => {
          const next = { ...prev }
          for (const a of items) {
            if (!questionIndexByTemplateQuestionId.has(a.templateQuestionId)) continue
            next[a.templateQuestionId] = a.selectedOptionId ?? undefined
          }
          return next
        })
        const lastAnswered = items
          .filter((a) => a.selectedOptionId && questionIndexByTemplateQuestionId.has(a.templateQuestionId))
          .sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime())[0]
        if (lastAnswered?.templateQuestionId) setActiveQuestionTemplateId(lastAnswered.templateQuestionId)
        else if (sectionQuestionsSorted[0]?.id) setActiveQuestionTemplateId(sectionQuestionsSorted[0].id)
        
        // Fetch audio if listening
        if (currentSection?.isListening) {
           const firstListenQ = sectionQuestionsSorted.find(q => q.question.audioAssetId)
           if (firstListenQ?.question.audioAssetId) {
               const { signedUrl } = await storageApi.getSignedUrl({ fileId: firstListenQ.question.audioAssetId })
               setAudioUrl(signedUrl)
           }
        }

        // Fetch images for questions in this section
        const questionsWithImages = sectionQuestionsSorted.filter(q => q.question.imageAssetId)
        for (const q of questionsWithImages) {
            if (q.question.imageAssetId) {
              const { signedUrl } = await storageApi.getSignedUrl({ fileId: q.question.imageAssetId })
              setQuestionImageUrls(prev => ({ ...prev, [q.id]: signedUrl }))
            }
        }

      } catch (e) {
        console.error(e)
      }
    })()
  }, [attemptId, sectionQuestionsSorted.length, questionIndexByTemplateQuestionId, currentSection?.isListening])

  const handleSelectOption = async (templateQuestionId: string, optionId: string) => {
    if (!attemptId) {
      toast.error("Thiếu attemptId")
      return
    }

    setSelectedOptionByTemplateQuestionId((prev) => ({
      ...prev,
      [templateQuestionId]: optionId,
    }))
    setActiveQuestionTemplateId(templateQuestionId)

    try {
      // Persist ngay để reload trang không bị mất.
      await jlptMockApi.saveAnswers({
        attemptId,
        answers: [{ templateQuestionId, selectedOptionId: optionId }],
      })
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message ?? "Không thể lưu đáp án")
    }
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
            {PART_TOTAL > 0 && (
              <span className="text-xs text-muted-foreground">
                Phần {PART_NUMBER}/{PART_TOTAL}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              0/{QUESTION_COUNT} câu
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xl font-semibold text-foreground">
          <Clock className="w-5 h-5" />
          <span>{countdown}</span>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors shadow-none"
            onClick={() => setShowConfirmSubmit(true)}
            disabled={loading || sectionQuestionsSorted.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            {isLastSection ? "Nộp bài" : `Nộp phần ${PART_NUMBER}`}
          </Button>
          <Button
            variant="outline"
            className="px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
            onClick={() => setShowConfirmExit(true)}
            disabled={loading}
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
                {sectionQuestionsSorted.map((q, idx) => {
                  const num = idx + 1
                  const isActive = q.id === activeQuestionTemplateId
                  const isAnswered = selectedOptionByTemplateQuestionId[q.id] != null
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setActiveQuestionTemplateId(q.id)
                        const targetMondaiId = q.mondaiId ?? null
                        const mondaiItem = MONDAI_SECTIONS.find(
                          (m) => (m.mondaiId ?? null) === targetMondaiId,
                        )
                        if (mondaiItem) {
                          setActiveMondaiId(mondaiItem.mondaiId)
                          setActiveMondaiIndex(mondaiItem.orderIndex)
                          setActiveMondaiCode(mondaiItem.mondaiCode ?? null)
                        }
                      }}
                      className={`w-full aspect-square text-[10px] flex items-center justify-center border rounded hover:transition-colors transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : isAnswered
                            ? "border-primary/40 bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      {num}
                    </button>
                  )
                })}
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

        <main className="flex-1 overflow-y-auto bg-background p-8 relative">
          <div className="max-w-4xl mx-auto space-y-6 pb-24">
            {currentSection?.isListening && (
               <ListeningPlayer audioUrl={audioUrl} autoPlay />
            )}

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
                
                {activeMondaiQuestions.find(amq => amq.id === q.templateQuestionId)?.question.imageAssetId && (
                   <div className="ml-12 mb-6 border rounded-lg overflow-hidden bg-accent/20">
                      <img 
                        src={questionImageUrls[q.templateQuestionId]} 
                        alt="Question Content" 
                        className="max-w-full h-auto object-contain mx-auto"
                      />
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                  {q.options.map((opt, index) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(q.templateQuestionId, opt.id)}
                      aria-pressed={selectedOptionByTemplateQuestionId[q.templateQuestionId] === opt.id}
                      className={`option-card border rounded-lg p-4 text-left transition-all flex items-center space-x-3 group bg-card ${
                        selectedOptionByTemplateQuestionId[q.templateQuestionId] === opt.id
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                          selectedOptionByTemplateQuestionId[q.templateQuestionId] === opt.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Confirm submit */}
      <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <div className="bg-background border rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                  {isLastSection ? "Xác nhận nộp bài" : `Xác nhận nộp phần ${PART_NUMBER}`}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-base px-2 uppercase text-[10px] font-bold tracking-widest">
                  {isLastSection
                    ? "Bạn có chắc chắn muốn kết thúc bài thi này không? Hành động này không thể hoàn tác."
                    : "Bạn có chắc chắn muốn nộp phần thi hiện tại không? Phần tiếp theo sẽ được kích hoạt trong cùng attempt."}
                </AlertDialogDescription>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <AlertDialogCancel className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] border-2 hover:bg-muted transition-all active:scale-95">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmSubmit}
                  disabled={loading}
                  className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {isLastSection ? "Nộp bài" : `Nộp phần ${PART_NUMBER}`}
                </AlertDialogAction>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm next section */}
      <AlertDialog open={showConfirmNextSection} onOpenChange={setShowConfirmNextSection}>
        <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <div className="bg-background border rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                  Tiến hành phần thi tiếp theo?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-base px-2 uppercase text-[10px] font-bold tracking-widest">
                  Bạn sẽ bắt đầu phần tiếp theo ngay. Nếu quay lại, attempt vẫn được giữ lại.
                </AlertDialogDescription>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <AlertDialogCancel
                  className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] border-2 hover:bg-muted transition-all active:scale-95"
                  onClick={() => {
                    setShowConfirmNextSection(false)
                    goBackToLevel()
                  }}
                >
                  Quay lại
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setShowConfirmNextSection(false)
                    if (pendingNextSectionOrder == null) return
                    setCurrentSectionOrder(pendingNextSectionOrder)
                    setEndsAtIsoState(pendingNextEndsAtIso)
                  }}
                  disabled={loading || pendingNextSectionOrder == null}
                  className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Bắt đầu
                </AlertDialogAction>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm exit */}
      <AlertDialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
        <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none">
          <div className="bg-background border rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                  Thoát bài thi?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-base px-2 uppercase text-[10px] font-bold tracking-widest">
                  Bạn có chắc chắn muốn thoát khỏi bài thi không? Tiến trình hiện tại sẽ bị bỏ qua.
                </AlertDialogDescription>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <AlertDialogCancel className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] border-2 hover:bg-muted transition-all active:scale-95">
                  Quay lại
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setShowConfirmExit(false)
                    confirmExit()
                  }}
                  disabled={loading}
                  className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Thoát
                </AlertDialogAction>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

