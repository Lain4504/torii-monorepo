"use client"

import * as React from "react"
import { ChevronRight, Loader2, Sparkles, BookOpen, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

// Types
interface Question {
    id: string
    level: string
    type: string
    question: string
    options: string[]
}

interface TestData {
    testId: string
    questions: Question[]
    estimatedTimeMinutes: number
}

interface EvaluationResult {
    userId: string
    assessedLevel: string
    targetLevel: string
    scoreBreakdown: Record<string, string>
    studyPathRecommendation: {
        focusAreas: string[]
        estimatedWeeks: number
        weeklySchedule: Array<{
            week: number
            topics: string[]
        }>
    }
}

export function PlacementTestWizard() {
    const router = useRouter()


    // State
    const [status, setStatus] = React.useState<'intro' | 'loading' | 'testing' | 'evaluating' | 'result'>('intro')
    const [testData, setTestData] = React.useState<TestData | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
    const [answers, setAnswers] = React.useState<Record<string, string>>({})
    const [result, setResult] = React.useState<EvaluationResult | null>(null)

    // Start Test
    const startTest = async () => {
        setStatus('loading')
        try {
            const response = await fetch('/api/agents/placement/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionCount: 10 }),
            })

            if (response.status === 401) {
                toast.error("Session expired", { description: "Please login again." });
                router.push('/login');
                return;
            }

            if (!response.ok) throw new Error('Failed to start test')

            const data = await response.json()
            if (data.data) {
                setTestData(data.data)
                setStatus('testing')
            } else {
                throw new Error('Invalid response format')
            }
        } catch (error) {
            console.error(error);
            toast.error("Error starting test", {
                description: "Please check your connection and try again.",
            })
            setStatus('intro')
        }
    }

    // Handle Answer Selection
    const handleAnswer = (value: string) => {
        if (!testData) return
        const currentQ = testData.questions[currentQuestionIndex]
        if (!currentQ) return
        setAnswers(prev => ({
            ...prev,
            [currentQ.id]: value
        }))
    }

    // Next Question or Submit
    const handleNext = async () => {
        if (!testData) return

        if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            // Submit
            setStatus('evaluating')
            try {
                const response = await fetch('/api/agents/placement/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        testId: testData.testId,
                        userAnswers: answers
                    }),
                })

                if (!response.ok) throw new Error('Failed to evaluate test')

                const data = await response.json()
                if (data.data) {
                    setResult(data.data)
                    setStatus('result')
                } else {
                    throw new Error('Invalid evaluation response')
                }
            } catch (error) {
                toast.error("Error evaluating test", {
                    description: "We saved your answers but couldn't generate the results right now."
                })
                setStatus('intro') // Or handle error state better
            }
        }
    }

    // Render Intro
    if (status === 'intro') {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center p-4 md:p-8 animate-in fade-in duration-700">
                <div className="w-full max-w-4xl mx-auto text-center space-y-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-primary/10 p-4 rounded-3xl ring-1 ring-primary/20">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
                            Discover Your <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Japanese Level</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                            Adaptive AI assessment. Personalized study roadmap. ~10 minutes.
                        </p>
                    </div>
                </div>
                <div className="w-full max-w-5xl mx-auto grid gap-4 md:grid-cols-3 py-12">
                    {[
                        { icon: BookOpen, title: "Adaptive", desc: "Questions adjust to your level" },
                        { icon: Clock, title: "Quick", desc: "Complete in under 15 mins" },
                        { icon: Trophy, title: "Personalized", desc: "Get a custom learning path" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <item.icon className="w-8 h-8 text-primary mb-4" />
                            <h3 className="font-bold text-lg text-foreground mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={startTest}
                        className="py-6 h-auto px-12 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        Start Assessment
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        )
    }

    // Render Loading
    if (status === 'loading' || status === 'evaluating') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative bg-background p-4 rounded-full border border-border shadow-lg">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                </div>
                <p className="text-lg font-medium text-muted-foreground animate-pulse">
                    {status === 'loading' ? 'Generating your test...' : 'Analyzing your results...'}
                </p>
            </div>
        )
    }

    // Render Result
    if (status === 'result' && result) {
        return (
            <div className="w-full h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center max-w-7xl mx-auto px-6 animate-in fade-in duration-700">
                {/* Left Column: Score Section */}
                <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-in slide-in-from-left-8 duration-700 delay-100">
                    <div className="space-y-4">
                        <p className="text-lg font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1 rounded-full w-fit mx-auto lg:mx-0">
                            Official Result
                        </p>
                        <h1 className="text-[8rem] lg:text-[10rem] font-black text-foreground leading-none tracking-tighter">
                            {result.assessedLevel}
                        </h1>
                        <p className="text-2xl font-medium text-muted-foreground">
                            JLPT Certified Standard
                        </p>
                    </div>

                    <div className="w-full space-y-4 pt-4">
                        <Button
                            className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
                            onClick={() => router.push('/dashboard')}
                        >
                            Start Learning {result.targetLevel}
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={() => router.push('/dashboard')}
                        >
                            Skip for now
                        </Button>
                    </div>
                </div>

                {/* Right Column: Roadmap (Scrollable) */}
                <div className="lg:col-span-7 h-[calc(100vh-140px)] flex flex-col space-y-6 animate-in slide-in-from-right-8 duration-700 delay-200">
                    <div className="shrink-0 space-y-2">
                        <h2 className="text-3xl font-bold text-foreground">Your Path to {result.targetLevel}</h2>
                        <p className="text-muted-foreground">
                            {result.studyPathRecommendation.estimatedWeeks}-week personalized curriculum.
                        </p>
                    </div>

                    <ScrollArea className="flex-1 pr-4 -mr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                            {result.studyPathRecommendation.weeklySchedule.map((week, i) => (
                                <div key={i} className="group relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                            W{week.week}
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground/50 group-hover:text-primary/50 transition-colors">
                                            PHASE {Math.ceil(week.week / 4)}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {week.topics.map((topic, j) => (
                                            <div key={j} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                                                <div className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                                                {topic}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        )
    }

    // Render Testing
    if (!testData) return null
    const currentQ = testData.questions[currentQuestionIndex]
    if (!currentQ) return null
    const progress = ((currentQuestionIndex) / testData.questions.length) * 100

    return (
        <div className="max-w-4xl mx-auto w-full py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Minimal Progress */}
            <div className="mb-16 max-w-xl mx-auto">
                <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">
                    <span>Question {currentQuestionIndex + 1}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question centered and large */}
            <div className="text-center space-y-12">
                <div className="space-y-6">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 uppercase tracking-widest opacity-50">
                        {currentQ.type.replace('_', ' ')}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight md:leading-tight">
                        {currentQ.question}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {currentQ.options.map((option, i) => (
                        <button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            className={cn(
                                "group relative min-h-[4rem] px-6 py-4 rounded-xl border-2 text-left transition-all duration-300",
                                answers[currentQ.id] === option
                                    ? "border-primary bg-primary/5 shadow-inner"
                                    : "border-muted bg-background hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <span className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors",
                                    answers[currentQ.id] === option
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                )}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <span className={cn(
                                    "text-lg font-medium transition-colors",
                                    answers[currentQ.id] === option ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {option}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="pt-12 flex justify-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="text-muted-foreground"
                    >
                        Back
                    </Button>
                    {answers[currentQ.id] && (
                        <Button
                            size="sm"
                            onClick={handleNext}
                            className="animate-in fade-in zoom-in"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
