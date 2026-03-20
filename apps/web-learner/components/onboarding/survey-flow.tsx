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
import { fetchProfile } from '@/store/slices/authSlice'
import { useAppDispatch } from '@/hooks/hooks'

const STEPS = [
  'Welcome',
  'Target',
  'Purpose',
  'JLPT_Date',
  'Frequency',
  'Level',
  'Complete',
]

export function SurveyFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [formData, setFormData] = useState({
    learningTarget: '6 months',
    learningPurpose: 'JLPT',
    jlptExamDate: 'July 2024',
    dailyStudyTime: 60,
    currentLevel: 'Zero (Beginner)',
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
      const response = await apiClient.post('/api/onboarding/survey', {
        learningTarget: formData.learningTarget,
        learningPurpose: formData.learningPurpose,
        jlptExamDate: formData.learningPurpose === 'JLPT' ? formData.jlptExamDate : null,
        dailyStudyTime: formData.dailyStudyTime,
        currentLevel: formData.currentLevel,
        wantsPlacementTest: formData.wantsPlacementTest,
      })

      if (response.data.success) {
        toast.success('Onboarding complete!')
        await dispatch(fetchProfile()) // Refresh user state to update isOnboarded
        router.push('/dashboard')
      }
    } catch (error) {
       toast.error('Failed to save survey. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepKey = activeSteps[currentStep]

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
    <div className="w-full flex flex-col gap-8">
      {/* Header & Progress */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>{Math.round(progress)}% Complete</span>
          <span>Step {currentStep + 1} of {activeSteps.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Slide Container */}
      <div className="min-h-[450px] relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStepKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full flex flex-col items-center text-center gap-6"
          >
            {renderStepContent(currentStepKey, formData, setFormData)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-8 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>

        {currentStep === activeSteps.length - 1 ? (
          <Button 
            onClick={handleFinish} 
            loading={isSubmitting}
            className="min-w-40 bg-gradient-to-r from-primary to-primary-foreground/20 hover:scale-105 transition-transform"
          >
            Get Started!
          </Button>
        ) : (
          <Button onClick={handleNext} className="min-w-40 gap-2 hover:scale-105 transition-transform">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

function renderStepContent(key: string, data: any, setData: any) {
  switch (key) {
    case 'Welcome':
      return (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Sparkles className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl nhai-text-gradient">
              Welcome to Torii Mon
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Help us tailor your learning experience to your goals and pace.
            </p>
          </div>
        </div>
      )
    case 'Target':
      return (
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-primary" /> What is your deadline?
            </h2>
            <p className="text-muted-foreground">When do you want to reach your goal?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['4 months', '6 months', '8 months', '12 months', 'No deadline'].map((t) => (
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
              <Trophy className="w-6 h-6 text-blue-500" /> Why learn Japanese?
            </h2>
            <p className="text-muted-foreground">Pick your main motivation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'JLPT Exam', value: 'JLPT' },
              { label: 'Work/Business', value: 'Work' },
              { label: 'Study Abroad', value: 'Study' },
              { label: 'Travel/Culture', value: 'Travel' },
              { label: 'Others', value: 'Others' },
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
              <Calendar className="w-6 h-6 text-red-500" /> When is your JLPT exam?
            </h2>
            <p className="text-muted-foreground">Select the month you plan to attend.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'July 2024',
              'December 2024',
              'July 2025',
              'December 2025',
              'Not decided yet',
            ].map((d) => (
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
              <Clock className="w-6 h-6 text-yellow-500" /> Daily Study Commitment
            </h2>
            <p className="text-muted-foreground">How many minutes can you study per day?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: '15 - 30 minutes', value: 30 },
              { label: '1 hour', value: 60 },
              { label: '2 hours', value: 120 },
              { label: '3+ hours', value: 240 },
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
              <GraduationCap className="w-6 h-6 text-purple-500" /> Current Level
            </h2>
            <p className="text-muted-foreground">Where are you starting from?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             {[
               'Never learned',
               'N5.1 (Start)',
               'N5.2 (Mid)',
               'N5.3 (End)',
               'N4',
               'N3',
               'N2',
               'N1',
               'Others'
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
          
          <div className="pt-4 flex flex-col items-center gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="placement" 
                checked={data.wantsPlacementTest}
                onChange={(e) => setData({ ...data, wantsPlacementTest: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="placement" className="text-sm font-medium leading-none cursor-pointer">
                I want to take a placement test first
              </label>
            </div>
            <p className="text-xs text-muted-foreground italic max-w-sm">
              We highly recommend a placement test if you are unsure of your exact level!
            </p>
          </div>
        </div>
      )
    case 'Complete':
      return (
        <div className="flex flex-col items-center gap-6 mt-8 animate-in zoom-in duration-500">
           <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <Check className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">You are all set!</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We have tailored a custom roadmap based on your choices. Ready to start your journey?
            </p>
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
        "h-auto py-5 flex items-center justify-between group relative overflow-hidden transition-all text-base",
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
