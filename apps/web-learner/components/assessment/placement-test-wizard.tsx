"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, CheckCircle2, Loader2, Sparkles, BookOpen, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "@workspace/ui/components/sonner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"
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
    detailedResults?: Array<{
        id: string
        question: string
        options: string[]
        correctAnswer: string
        userAnswer: string
        isCorrect: boolean
        explanation?: string
    }>
}

export function PlacementTestWizard() {
    const router = useRouter()


    // State
    const [status, setStatus] = React.useState<'intro' | 'loading' | 'testing' | 'evaluating' | 'result' | 'review'>('intro')
    const [testData, setTestData] = React.useState<TestData | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
    const [answers, setAnswers] = React.useState<Record<string, string>>({})
    const [result, setResult] = React.useState<EvaluationResult | null>(null)

    // Load persisted result on mount
    React.useEffect(() => {
        const savedResult = localStorage.getItem('torii-placement-result')
        if (savedResult) {
            try {
                setResult(JSON.parse(savedResult))
                setStatus('result')
            } catch (e) {
                console.error('Failed to parse saved result', e)
                localStorage.removeItem('torii-placement-result')
            }
        }
    }, [])

    const handleTakeAgain = () => {
        localStorage.removeItem('torii-placement-result')
        setTestData(null)
        setAnswers({})
        setResult(null)
        setCurrentQuestionIndex(0)
        setStatus('intro')
    }

    // Start Test
    const startTest = async () => {
        setStatus('loading')
        try {
            const response = await fetch('http://localhost:8080/api/agents/placement/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Send cookies/auth headers
                body: JSON.stringify({ questionCount: 30 }),
            })

            if (response.status === 401) {
                toast.error("Session expired", { description: "Please login again." });
                router.push('/login');
                return;
            }

            if (!response.ok) throw new Error('Failed to start test')

            const data = await response.json()
            console.log('API Response:', data); // Debug log
            if (data.data) {
                // If data.data exists, we expect it to match TestData, but let's handle potential double wrapping
                // If backend returns { data: { testId... } } and gateway wraps it, we might have data.data.data?
                // Or if backend returns { data: { ... } }, gateway returns { data: { data: { ... } } }
                // Let's check if the inner object is what we need.
                const innerData = data.data.data || data.data;
                if (innerData.testId && innerData.questions) {
                    setTestData(innerData);
                    setStatus('testing');
                } else {
                    console.error('Missing expected fields in data:', innerData);
                    throw new Error('Invalid response structure (missing fields)');
                }
            } else {
                console.error('No data property in response:', data);
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
                const response = await fetch('http://localhost:8080/api/agents/placement/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        testId: testData.testId,
                        answers: answers
                    }),
                })

                if (!response.ok) throw new Error('Failed to evaluate test')

                const data = await response.json()
                console.log('Evaluation Response:', data); // Debug log
                if (data.data) {
                    setResult(data.data)
                    localStorage.setItem('torii-placement-result', JSON.stringify(data.data))
                    setStatus('result')
                } else {
                    console.error('Missing data in evaluation response:', data);
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                        {(() => {
                            const total = Object.keys(result.scoreBreakdown || {}).length
                            const correct = Object.values(result.scoreBreakdown || {}).filter(s => s === 'correct').length
                            const wrong = total - correct

                            return (
                                <>
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <span className="text-2xl font-bold text-green-500">{correct}</span>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Correct</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <span className="text-2xl font-bold text-red-500">{wrong}</span>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Wrong</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-2xl font-bold text-foreground">{total}</span>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
                                    </div>
                                </>
                            )
                        })()}
                    </div>

                    {/* Review Section Button */}
                    <div className="w-full max-w-sm mt-4">
                        <Button
                            variant="outline"
                            className="w-full border-white/10 hover:bg-white/5 text-muted-foreground hover:text-primary gap-2"
                            onClick={() => setStatus('review')}
                        >
                            <BookOpen className="w-4 h-4" />
                            Review Test
                        </Button>
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
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-destructive transition-colors"
                            onClick={handleTakeAgain}
                        >
                            Retake Test
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
                        {(() => {
                            if (!result.studyPathRecommendation.weeklySchedule || result.studyPathRecommendation.weeklySchedule.length === 0) {
                                return (
                                    <div className="text-center text-muted-foreground py-8">
                                        <p>Study path details could not be generated. Please try again later.</p>
                                    </div>
                                )
                            }

                            // Group by Phase (4 weeks per phase)
                            const phases = result.studyPathRecommendation.weeklySchedule.reduce((acc, week) => {
                                const phase = Math.ceil(week.week / 4)
                                if (!acc[phase]) acc[phase] = []
                                acc[phase].push(week)
                                return acc
                            }, {} as Record<number, typeof result.studyPathRecommendation.weeklySchedule>)

                            return (
                                <Accordion type="single" collapsible defaultValue="phase-1" className="w-full">
                                    {Object.entries(phases).map(([phaseNum, weeks]) => (
                                        <AccordionItem key={phaseNum} value={`phase-${phaseNum}`} className="border-white/10 mb-2">
                                            <AccordionTrigger className="hover:no-underline py-3 px-4 rounded-xl bg-white/5 data-[state=open]:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                                        P{phaseNum}
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-bold text-foreground">Phase {phaseNum}</h4>
                                                        <span className="text-xs text-muted-foreground">Weeks {weeks[0].week}-{weeks[weeks.length - 1].week}</span>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-1">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                                                    {weeks.map((week, i) => (
                                                        <div key={i} className="group relative p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-xs font-bold text-primary/70">WEEK {week.week}</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                {week.topics.map((topic, j) => (
                                                                    <div key={j} className="flex items-start gap-2 text-xs text-foreground/80 leading-snug">
                                                                        <div className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                                                                        {topic}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            )
                        })()}
                    </ScrollArea>
                </div>
            </div>
        )
    }

    // Review View
    if (status === 'review' && result) {
        return (
            <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500 py-8 px-4">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="shrink-0 space-y-2 mb-4 w-full">
                        <div className="flex items-center justify-start mb-4">
                            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => setStatus('result')}>
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                Back to Results
                            </Button>
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Test Review</h2>
                        <p className="text-muted-foreground">
                            Review your answers and explanations.
                        </p>
                    </div>

                    <ScrollArea className="w-full h-[65vh] pr-4 rounded-xl border border-white/5 bg-black/20 p-6">
                        <div className="space-y-6 text-left">
                            {result.detailedResults?.map((r, idx) => (
                                <div key={r.id} className={cn(
                                    "p-6 rounded-xl border transition-colors",
                                    r.isCorrect
                                        ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                                        : "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                                )}>
                                    <div className="flex items-start gap-4 mb-4">
                                        <Badge variant={r.isCorrect ? "default" : "destructive"} className={cn("shrink-0 text-base py-1 px-3", r.isCorrect && "bg-green-600 hover:bg-green-700")}>
                                            Q{idx + 1}
                                        </Badge>
                                        <p className="font-medium text-lg leading-relaxed">{r.question}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base bg-black/20 p-5 rounded-lg border border-white/5">
                                        <div className="space-y-2">
                                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                Your Answer
                                            </span>
                                            <div className="font-bold text-red-400 text-lg flex items-center gap-2">
                                                {r.options && r.options.indexOf(r.userAnswer) !== -1 ? (
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs shrink-0">
                                                        {String.fromCharCode(65 + r.options.indexOf(r.userAnswer))}
                                                    </span>
                                                ) : null}
                                                {r.userAnswer}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                Correct Answer
                                            </span>
                                            <div className="font-bold text-green-400 text-lg flex items-center gap-2">
                                                {r.options && r.options.indexOf(r.correctAnswer) !== -1 ? (
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs shrink-0">
                                                        {String.fromCharCode(65 + r.options.indexOf(r.correctAnswer))}
                                                    </span>
                                                ) : null}
                                                {r.correctAnswer}
                                                <CheckCircle2 className="w-5 h-5 ml-auto" />
                                            </div>
                                        </div>
                                    </div>
                                    {r.explanation && (
                                        <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200">
                                            <span className="font-bold block mb-1">Explanation:</span>
                                            {r.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {result.detailedResults && result.detailedResults.filter(r => !r.isCorrect).length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                                    <Trophy className="w-16 h-16 mb-4 text-yellow-500/50" />
                                    <p className="text-xl">No mistakes found!</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div >
            </div >
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
                            key={i}
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
