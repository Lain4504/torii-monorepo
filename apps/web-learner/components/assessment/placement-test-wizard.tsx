"use client"

import * as React from "react"
import { ChevronRight, Sparkles, BookOpen, Trophy, Clock, CheckCircle2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from '@workspace/ui/components/spinner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

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
                setStatus('intro')
            }
        }
    }

    // Render Intro
    if (status === 'intro') {
        return (
            <div className="w-full min-h-[80vh] flex flex-col justify-center items-center p-6 md:p-12 animate-in fade-in duration-1000">
                <div className="w-full max-w-4xl mx-auto text-center space-y-16">
                    <div className="flex flex-col items-center gap-8">
                        <div className="bg-primary text-primary-foreground p-6 rounded-[32px] shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
                            <Sparkles className="w-12 h-12" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
                                Discover Your <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40">Japanese Level</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                                Adaptive AI assessment. Personalized study roadmap. ~10 minutes to transform your journey.
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-5xl mx-auto grid gap-8 md:grid-cols-3 py-4">
                        {[
                            { icon: BookOpen, title: "Adaptive", desc: "AI adjusts to your pace" },
                            { icon: Clock, title: "Swift", desc: "Results in under 10 mins" },
                            { icon: Trophy, title: "Personal", desc: "Custom study roadmap" },
                        ].map((item, i) => (
                            <Card key={i} className="group border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-300 rounded-[2rem] shadow-none">
                                <CardContent className="flex flex-col items-center md:items-start text-center md:text-left p-8 space-y-4">
                                    <div className="p-3.5 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <item.icon className="size-6 text-primary group-hover:text-inherit" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl text-foreground">{item.title}</h3>
                                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={startTest}
                            className="h-14 px-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20"
                        >
                            Start Assessment
                            <ChevronRight className="size-5 ml-1.5" />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Render Loading
    if (status === 'loading' || status === 'evaluating') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 animate-in fade-in duration-500">
                <Spinner className="w-14 h-14 text-primary" />
                <div className="text-center space-y-3">
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                        {status === 'loading' ? 'Crafting your test...' : 'Analyzing performance...'}
                    </p>
                    <p className="text-muted-foreground font-medium text-lg">Our AI is processing Japanese linguistic patterns</p>
                </div>
            </div>
        )
    }

    // Render Result
    if (status === 'result' && result) {
        return (
            <div className="w-full min-h-[calc(100vh-120px)] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center max-w-7xl mx-auto px-6 py-16 animate-in fade-in zoom-in-95 duration-1000">
                <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-12">
                    <div className="space-y-8">
                        <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5">
                            Assessment Verified
                        </Badge>
                        <div className="relative py-4 inline-block">
                            <h1 className="text-[10rem] md:text-[13rem] font-bold text-gradient leading-[0.75] tracking-tighter text-primary">
                                {result.assessedLevel}
                            </h1>
                            <div className="absolute -top-6 -right-6 bg-foreground text-background size-16 rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-background overflow-hidden ring-1 ring-border/50">
                                <Sparkles className="size-8 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-muted-foreground/80 leading-tight">
                                JLPT Certified Standard
                            </p>
                            <p className="text-4xl font-bold text-foreground tracking-tight">Level Confirmed</p>
                        </div>
                    </div>

                    <div className="w-full max-w-sm space-y-4">
                        <Button
                            className="w-full h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20"
                            size="lg"
                            onClick={() => router.push('/dashboard')}
                        >
                            Begin {result.targetLevel} Path
                            <ChevronRight className="size-5 ml-1.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground"
                            onClick={() => router.push('/dashboard')}
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-7 h-full flex flex-col space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-0.5 w-12 bg-primary/30 rounded-full" />
                            <h2 className="text-3xl font-bold text-foreground tracking-tight">Your Path to {result.targetLevel}</h2>
                        </div>
                        <p className="text-lg text-muted-foreground font-medium max-w-xl">
                            A specialized <span className="text-foreground font-bold">{result.studyPathRecommendation.estimatedWeeks}-week</span> curriculum tailored for your unique linguistic profile.
                        </p>
                    </div>

                    <ScrollArea className="flex-1 rounded-[2.5rem] bg-muted/20 border border-border/40 p-3 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
                            {result.studyPathRecommendation.weeklySchedule.map((week, i) => (
                                <Card key={i} className="group relative border-none bg-card hover:bg-muted font-item transition-all duration-300 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5">
                                    <div className="p-8 space-y-5">
                                        <div className="flex justify-between items-center">
                                            <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                                                W{week.week}
                                            </div>
                                            <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-widest px-3">
                                                PHASE {Math.ceil(week.week / 4)}
                                            </Badge>
                                        </div>
                                        <div className="space-y-3.5">
                                            {week.topics.map((topic, j) => (
                                                <div key={j} className="flex items-start gap-3.5 text-sm font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors">
                                                    <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                        <CheckCircle2 className="size-3" />
                                                    </div>
                                                    <span className="leading-tight">{topic}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Card>
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
        <div className="max-w-5xl mx-auto w-full py-20 px-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="mb-24 max-w-2xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Assessment Engine Online</p>
                        <h3 className="text-3xl font-bold tracking-tight">Question {currentQuestionIndex + 1} <span className="text-muted-foreground/30 font-medium">/</span> {testData.questions.length}</h3>
                    </div>
                    <span className="text-5xl font-bold text-primary/20 tracking-tighter">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden p-1 ring-1 ring-border shadow-inner">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(var(--primary),0.6)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="text-center space-y-16">
                <div className="space-y-10">
                    <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-[0.3em] px-4 py-1 rounded-full border-primary/30 text-primary bg-primary/5">
                        {currentQ.type.replace('_', ' ')}
                    </Badge>
                    <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] max-w-4xl mx-auto">
                        {currentQ.question}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {currentQ.options.map((option, i) => (
                        <Button
                            key={option}
                            variant="outline"
                            onClick={() => handleAnswer(option)}
                            className={cn(
                                "group relative h-auto p-8 rounded-[2rem] transition-all duration-500 text-left items-start justify-start flex flex-row border-2",
                                answers[currentQ.id] === option
                                    ? "border-primary bg-primary/5 ring-8 ring-primary/5"
                                    : "bg-card hover:border-primary/40 hover:bg-muted/50 border-border/50"
                            )}
                        >
                            <div className="flex items-center gap-6 w-full">
                                <div className={cn(
                                    "flex items-center justify-center size-12 rounded-2xl text-base font-bold transition-all shrink-0 shadow-sm",
                                    answers[currentQ.id] === option
                                        ? "bg-primary text-primary-foreground shadow-xl scale-110 rotate-3"
                                        : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                )}>
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <span className={cn(
                                    "text-xl font-bold transition-colors leading-tight whitespace-normal text-left flex-1",
                                    answers[currentQ.id] === option ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {option}
                                </span>
                            </div>
                        </Button>
                    ))}
                </div>

                <div className="pt-16 flex justify-center items-center gap-10">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="h-12 px-8 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground"
                    >
                        Previous
                    </Button>
                    {answers[currentQ.id] && (
                        <Button
                            size="lg"
                            onClick={handleNext}
                            className="h-14 px-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 animate-in fade-in zoom-in slide-in-from-right-4 duration-500"
                        >
                            {currentQuestionIndex === testData.questions.length - 1 ? 'Analyze Results' : 'Next Question'}
                            <ChevronRight className="size-5 ml-1.5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
