'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Target,
  Trophy,
  Clock,
  GraduationCap,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'
import { apiClient } from '@/lib/api/api-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAppDispatch } from '@/hooks/hooks'
import { markOnboardedLocal } from '@/store/slices/authSlice'

const STEPS = [
  'Welcome',
  'Purpose',
  'Level',
  'Target',
  'JLPT_Date',
  'Frequency',
  'Placement',
  'Complete',
]

function getFutureJLPTDates(count = 4) {
  const dates: string[] = []
  const now = new Date()
  let year = now.getFullYear()

  // Months are 0-indexed: 6 is July, 11 is December
  const jlptMonths = [6, 11]

  while (dates.length < count) {
    for (const month of jlptMonths) {
      const examDate = new Date(year, month, 1)
      if (examDate > now && dates.length < count) {
        const monthStr = month === 6 ? '07' : '12'
        dates.push(`Tháng ${monthStr} ${year}`)
      }
    }
    year++
  }
  return dates
}

function monthYearToISODate(label: string | null | undefined): string | null {
  const raw = label?.trim()
  if (!raw || raw === 'Chưa quyết định') return null

  // Expected labels in UI (Vietnamese): "Tháng 07 2024", "Tháng 12 2024", ...
  const match = raw.match(/^Tháng\s+(\d{2})\s+(\d{4})$/)
  if (!match) {
    // Fallback for English logic if still present
    const matchEn = raw.match(/^([A-Za-z]+)\s+(\d{4})$/)
    if (!matchEn) return null
    const monthName = matchEn[1]
    const yearStr = matchEn[2]
    if (!monthName || !yearStr) return null

    const year = Number(yearStr)
    const monthEnMap: Record<string, number> = { July: 6, December: 11 }
    const mIdx = monthEnMap[monthName]
    if (mIdx === undefined) return null
    return new Date(Date.UTC(year, mIdx, 1)).toISOString()
  }

  const monthNum = Number(match[1])
  const year = Number(match[2])
  if (isNaN(monthNum) || isNaN(year)) return null

  // monthNum-1 because JS Date months are 0-indexed
  return new Date(Date.UTC(year, monthNum - 1, 1)).toISOString()
}

function mapCurrentLevel(label: string | null | undefined): string | undefined {
  const raw = label?.trim()
  if (!raw) return undefined

  switch (raw) {
    case 'Chưa biết gì':
    case 'Chưa từng học':
    case 'Never learned':
    case 'Bắt đầu từ số 0':
    case 'Zero (Beginner)':
      return 'NEVER'
    case 'Biết bảng chữ cái Hiragana/Katakana':
      return 'N5'
    case 'Đã học cơ bản (N5–N4)':
      return 'N4'
    case 'Trung cấp (N3)':
      return 'N3'
    case 'Nâng cao (N2–N1)':
      return 'N1'
    case 'N5':
    case 'N4':
    case 'N3':
    case 'N2':
    case 'N1':
      return raw
    default:
      return undefined
  }
}

export function SurveyFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const futureJLPTDates = useMemo(() => getFutureJLPTDates(4), [])

  const [formData, setFormData] = useState({
    learningTarget: '6 tháng',
    learningPurpose: 'JLPT',
    jlptExamDate: futureJLPTDates[0] || '',
    dailyStudyTime: 60,
    currentLevel: 'Bắt đầu từ số 0',
    wantsPlacementTest: false,
  })

  // Skip JLPT Date if purpose is not JLPT
  const activeSteps = useMemo(() => {
    if (formData.learningPurpose !== 'JLPT') {
      return STEPS.filter(s => s !== 'JLPT_Date')
    }
    return STEPS
  }, [formData.learningPurpose])

  const progress = (currentStep / (activeSteps.length - 1)) * 100

  const handleNext = () => {
    if (currentStep < activeSteps.length - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      const targetLevelMap: Record<string, string> = {
        'Chưa biết gì': 'N5',
        'Biết bảng chữ cái Hiragana/Katakana': 'N5',
        'Đã học cơ bản (N5–N4)': 'N3',
        'Trung cấp (N3)': 'N2',
        'Nâng cao (N2–N1)': 'N1+',
      }

      const payload = {
        goal_type: formData.learningPurpose === 'JLPT' ? 'jlpt_exam' : 'general',
        // Spec dùng `target_date` (ISO). UI chỉ có ngày JLPT nếu purpose=JLPT.
        target_date:
          formData.learningPurpose === 'JLPT'
            ? monthYearToISODate(formData.jlptExamDate)
            : null,
        // MVP skeleton: lấy target level từ mapping UI hiện có.
        target_jlpt_level: targetLevelMap[formData.currentLevel] ?? 'N5',
        weekly_available_minutes: formData.dailyStudyTime * 7,
        self_assessed_level: mapCurrentLevel(formData.currentLevel) ?? 'N5',
        preferred_learning_modes: ['practice', 'video'],
        preferred_study_slots: [],
        constraints: {},
      }

      const response = await apiClient.put('/api/v1/learners/me/profile', payload)
      if (response.data.success) {
        toast.success('Cập nhật lộ trình thành công!')
        dispatch(markOnboardedLocal(true))
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Lưu khảo sát thất bại. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepKey = activeSteps[currentStep]
  if (!currentStepKey) return null

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  }

  return (
    <div className="w-full flex flex-col gap-6 max-w-xl mx-auto">
      {/* Header & Progress */}
      <div className="flex flex-col gap-2 flex-shrink-0 w-full">
        <Progress value={progress} className="h-1.5" />
        <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
          <span>Tiến độ {Math.round(progress)}%</span>
          <span>{currentStep + 1} / {activeSteps.length}</span>
        </div>
      </div>

      {/* Slide Container */}
      <div className="relative overflow-hidden min-h-[350px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStepKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full flex flex-col items-center text-center gap-4 overflow-hidden"
          >
            {renderStepContent(currentStepKey, formData, setFormData, futureJLPTDates, handleFinish, isSubmitting)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className={cn(
        "flex items-center -mt-4 flex-shrink-0 relative z-20 w-full",
        (currentStep === 0 || currentStep === activeSteps.length - 1) ? "justify-center" : "justify-between"
      )}>
        {currentStep > 0 && currentStep < activeSteps.length - 1 && (
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isSubmitting}
            className="gap-2 font-bold text-sm px-0 hover:bg-transparent text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </Button>
        )}

        {currentStep === activeSteps.length - 1 ? null : (
          <Button
            variant="ghost"
            onClick={handleNext}
            className={cn(
              "gap-3 font-bold text-sm px-0 hover:bg-transparent transition-all text-primary hover:text-primary/80"
            )}
          >
            {currentStep === 0 ? "Khám phá lộ trình cá nhân" : "Tiếp theo"}
            <ChevronRight className="w-4 h-4 text-primary" />
          </Button>
        )}
      </div>
    </div>
  )
}

function renderStepContent(key: string, data: any, setData: any, jlptDates: string[], onFinish?: () => void, isSubmitting?: boolean) {
  switch (key) {
    case 'Welcome':
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Sparkles className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl nhai-text-gradient">
              Chào mừng tới Torii Nihongo
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Chỉ mất 1 phút để tìm ra lộ trình học tiếng Nhật phù hợp nhất với bạn
            </p>
          </div>
        </div>
      )
    case 'Target':
      return (
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-primary" /> Bạn dự tính sẽ học trong bao lâu?
            </h2>
            <p className="text-muted-foreground">Chọn thời gian bạn mong muốn đạt được mục tiêu.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Càng nhanh càng tốt', '3–6 tháng', '6–12 tháng', 'Không vội, học từ từ'].map((t) => (
              <SelectButton
                key={t}
                label={t}
                isSelected={data.learningTarget === t}
                onClick={() => setData({ ...data, learningTarget: t })}
              />
            ))}
          </div>
        </div>
      )
    case 'Purpose':
      return (
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-blue-500" /> Lý do bạn học tiếng Nhật?
            </h2>
            <p className="text-muted-foreground">Chọn động lực chính của bạn.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Thi JLPT', value: 'JLPT' },
              { label: 'Đi làm IT / công ty Nhật', value: 'Work' },
              { label: 'Du học', value: 'Study' },
              { label: 'Sở thích / Du lịch', value: 'Travel' },
              { label: 'Giao tiếp cơ bản', value: 'Communicate' },
              { label: 'Lý do khác', value: 'Others' },
            ].map((p) => (
              <SelectButton
                key={p.value}
                label={p.label}
                isSelected={data.learningPurpose === p.value}
                onClick={() => setData({ ...data, learningPurpose: p.value })}
              />
            ))}
          </div>
        </div>
      )
    case 'JLPT_Date':
      return (
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Calendar className="w-6 h-6 text-red-500" /> Khi nào bạn dự định thi JLPT?
            </h2>
            <p className="text-muted-foreground">Chọn kỳ thi bạn muốn đạt mục tiêu.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...jlptDates, 'Chưa quyết định'].map((d) => (
              <SelectButton
                key={d}
                label={d}
                isSelected={data.jlptExamDate === d}
                onClick={() => setData({ ...data, jlptExamDate: d })}
              />
            ))}
          </div>
        </div>
      )
    case 'Frequency':
      return (
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Clock className="w-6 h-6 text-yellow-500" /> Thời gian học mỗi ngày
            </h2>
            <p className="text-muted-foreground">Bạn có thể dành bao nhiêu phút mỗi ngày cho tiếng Nhật?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: '10 phút', value: 10 },
              { label: '30 phút', value: 30 },
              { label: '1 tiếng', value: 60 },
              { label: '2+ tiếng', value: 120 },
            ].map((f) => (
              <SelectButton
                key={f.value}
                label={f.label}
                isSelected={data.dailyStudyTime === f.value}
                onClick={() => setData({ ...data, dailyStudyTime: f.value })}
              />
            ))}
          </div>
        </div>
      )
    case 'Level':
      return (
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-500" /> Trình độ hiện tại
            </h2>
            <p className="text-muted-foreground">Bạn đã có nền tảng như thế nào rồi?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Chưa biết gì',
              'Biết bảng chữ cái Hiragana/Katakana',
              'Đã học cơ bản (N5–N4)',
              'Trung cấp (N3)',
              'Nâng cao (N2–N1)'
            ].map((l) => (
              <SelectButton
                key={l}
                label={l}
                className="py-3 px-2 text-sm"
                isSelected={data.currentLevel === l}
                onClick={() => setData({ ...data, currentLevel: l })}
              />
            ))}
          </div>
        </div>
      )
    case 'Placement':
      return (
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" /> Xác định trình độ
            </h2>
            <p className="text-muted-foreground">Bạn có muốn làm bài kiểm tra để chúng tôi xác định trình độ chính xác nhất cho bạn không?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Có, tôi muốn kiểm tra', value: true },
              { label: 'Không, tôi tự chọn', value: false },
            ].map((p) => (
              <SelectButton
                key={p.label}
                label={p.label}
                isSelected={data.wantsPlacementTest === p.value}
                onClick={() => setData({ ...data, wantsPlacementTest: p.value })}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground italic max-w-sm mx-auto">
            Chúng tôi khuyến khích bạn làm bài kiểm tra nếu chưa chắc chắn về trình độ hiện tại của mình!
          </p>
        </div>
      )
    case 'Complete':
      const targetLevelMap: Record<string, string> = {
        'Chưa biết gì': 'N5',
        'Biết bảng chữ cái Hiragana/Katakana': 'N5',
        'Đã học cơ bản (N5–N4)': 'N3',
        'Trung cấp (N3)': 'N2',
        'Nâng cao (N2–N1)': 'N1+',
      }
      const targetLevel = targetLevelMap[data.currentLevel] || 'N5'
      const targetTime = data.learningTarget === 'Không vội, học từ từ' ? 'mọi lúc' : data.learningTarget

      return (
        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <Check className="w-12 h-12" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Lộ trình dành cho bạn đã sẵn sàng!</h2>
              <p className="text-muted-foreground text-lg">
                Bạn có thể đạt <span className="text-primary font-black">{targetLevel}</span> trong khoảng <span className="text-primary font-black">{targetTime}</span>
              </p>
            </div>

            <Button
              onClick={onFinish}
              disabled={isSubmitting}
              className="w-full max-w-xs bg-primary text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl font-black text-sm h-14 hover:scale-105 transition-all"
            >
              BẮT ĐẦU HỌC NGAY!
            </Button>
          </div>
        </div>
      )
    default:
      return null
  }
}

function SelectButton({ label, isSelected, onClick, className }: any) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      className={cn(
        "h-auto py-4 flex items-center justify-between group relative overflow-hidden transition-all text-base",
        isSelected ? "border-primary bg-primary/5 text-primary shadow-sm" : "hover:border-primary/50",
        className
      )}
    >
      <span className="relative z-10">{label}</span>
      {isSelected && <Check className="w-5 h-5 relative z-10 animate-in zoom-in" />}

      {/* Glossy background effect on hover/select */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity",
        isSelected ? "opacity-100" : "group-hover:opacity-100"
      )} />
    </Button>
  )
}
