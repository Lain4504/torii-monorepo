"use client"

import * as React from "react"
import { ArrowLeft, CheckCircle2, ChevronRight, XCircle, RotateCcw, BookCheck, ClipboardList, Target, Clock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@workspace/ui/components/item"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@workspace/ui/components/field"
import { cn } from "@workspace/ui/lib/utils"

// Types
interface TestConfig {
    level: string
    section: string
}

interface Question {
    id: string
    text: string
    options: string[]
    correctAnswer: string
    explanation: string
}

interface TestResult {
    score: number
    totalQuestions: number
    correctCount: number
    incorrectCount: number
    percentage: number
    questions: (Question & { userSelection: string | undefined; isCorrect: boolean })[]
}

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"]
const TEST_SECTIONS = [
    { value: "vocabulary", label: "Vocabulary & Kanji" },
    { value: "grammar", label: "Grammar" },
    { value: "reading", label: "Reading" },
    { value: "listening", label: "Listening" },
    { value: "full", label: "Full Simulation" }
]

export function TestRunner() {
    const [status, setStatus] = React.useState<"setup" | "running" | "result">("setup")
    const [config, setConfig] = React.useState<TestConfig>({ level: "N5", section: "vocabulary" })
    const [questionCount, setQuestionCount] = React.useState("10")
    const [timeLimitMinutes, setTimeLimitMinutes] = React.useState("10")
    const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
    const [questions, setQuestions] = React.useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [userAnswers, setUserAnswers] = React.useState<Record<string, string>>({})
    const [result, setResult] = React.useState<TestResult | null>(null)

    const startTest = async () => {
        // Mocking question fetch
        const mockQuestions: Question[] = [
            {
                id: "q1",
                text: "昨日、デパートへ（　）に行きました。",
                options: ["買い物", "買います", "買った", "買う"],
                correctAnswer: "買い物",
                explanation: "The structure 'V-stem/Noun + に行く' expresses purpose."
            },
            {
                id: "q2",
                text: "この料理は（　）ないです。",
                options: ["おいしく", "おいしい", "おいしいな", "おいしくく"],
                correctAnswer: "おいしく",
                explanation: "For i-adjectives, the negative form is stem + くない."
            },
            {
                id: "q3",
                text: "私は毎日、日本語を（　）います。",
                options: ["勉強して", "勉強する", "勉強した", "勉強し"],
                correctAnswer: "勉強して",
                explanation: "The -te form of a verb followed by 'います' indicates an ongoing action or state."
            },
            {
                id: "q4",
                text: "田中さんは（　）背が高いです。",
                options: ["とても", "あまり", "ぜんぜん", "少しも"],
                correctAnswer: "とても",
                explanation: "'とても' means 'very' and is used with positive adjectives. 'あまり' and 'ぜんぜん' are used with negative forms."
            },
            {
                id: "q5",
                text: "これは私の（　）です。",
                options: ["本", "ほん", "ブック", "書物"],
                correctAnswer: "本",
                explanation: "'本' (hon) is the common word for 'book' in Japanese."
            }
        ]

        // Trim questions based on requested count (simulating API parameters)
        const actualCount = questionCount === "all" ? mockQuestions.length : parseInt(questionCount, 10)
        setQuestions(mockQuestions.slice(0, actualCount))
        setStatus("running")
        setCurrentIndex(0)
        setUserAnswers({})
        setTimeLeft(timeLimitMinutes === "unlimited" ? null : parseInt(timeLimitMinutes, 10) * 60)
    }

    // Timer Effect
    React.useEffect(() => {
        if (status !== "running" || timeLeft === null || timeLeft <= 0) return

        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(timerId)
                    calculateResult()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerId)
        // NOTE: Intentionally missing calculateResult dependency to avoid re-triggering loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, timeLeft])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    const handleSelectOption = (value: string) => {
        const q = questions[currentIndex]
        if (q) {
            setUserAnswers(prev => ({ ...prev, [q.id]: value }))
        }
    }

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            calculateResult()
        }
    }

    const calculateResult = () => {
        const scoredQuestions = questions.map(q => {
            const userSelection = userAnswers[q.id]
            return {
                ...q,
                userSelection,
                isCorrect: userSelection === q.correctAnswer
            }
        })

        const correctCount = scoredQuestions.filter(q => q.isCorrect).length
        const total = questions.length

        setResult({
            score: correctCount,
            totalQuestions: total,
            correctCount,
            incorrectCount: total - correctCount,
            percentage: (correctCount / total) * 100,
            questions: scoredQuestions
        })
        setStatus("result")
    }

    if (status === "setup") {
        return (
            <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 pb-20 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Practice Test</h1>
                        <p className="text-muted-foreground font-medium">Select your targeted JLPT level and section to begin.</p>
                    </div>
                </div>

                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Target className="size-6 text-primary" />
                            Session Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={e => { e.preventDefault(); startTest(); }}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Test Parameters</FieldLegend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field>
                                            <FieldLabel>Target Level</FieldLabel>
                                            <Select value={config.level} onValueChange={v => setConfig(prev => ({ ...prev, level: v }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {JLPT_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>Choose your current training level.</FieldDescription>
                                        </Field>

                                        <Field>
                                            <FieldLabel>Focus Section</FieldLabel>
                                            <Select value={config.section} onValueChange={v => setConfig(prev => ({ ...prev, section: v }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TEST_SECTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>Select a specific area to focus on.</FieldDescription>
                                        </Field>

                                        <Field>
                                            <FieldLabel>Question Count</FieldLabel>
                                            <Select value={questionCount} onValueChange={setQuestionCount}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select count" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5 Questions</SelectItem>
                                                    <SelectItem value="10">10 Questions</SelectItem>
                                                    <SelectItem value="15">15 Questions</SelectItem>
                                                    <SelectItem value="20">20 Questions</SelectItem>
                                                    <SelectItem value="all">All Available</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>How many questions to practice today.</FieldDescription>
                                        </Field>

                                        <Field>
                                            <FieldLabel>Time Limit</FieldLabel>
                                            <Select value={timeLimitMinutes} onValueChange={setTimeLimitMinutes}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select time limit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5 Minutes</SelectItem>
                                                    <SelectItem value="10">10 Minutes</SelectItem>
                                                    <SelectItem value="15">15 Minutes</SelectItem>
                                                    <SelectItem value="20">20 Minutes</SelectItem>
                                                    <SelectItem value="30">30 Minutes</SelectItem>
                                                    <SelectItem value="unlimited">No Limit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FieldDescription>Enforce strict testing conditions.</FieldDescription>
                                        </Field>
                                    </div>
                                </FieldSet>
                            </FieldGroup>

                            <div className="flex justify-end pt-4">
                                <Button size="lg" className="w-full md:w-auto">
                                    Start Session
                                    <ChevronRight className="ml-2 size-5" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (status === "running" && questions.length > 0) {
        const q = questions[currentIndex]
        if (!q) return null
        const progress = ((currentIndex + 1) / questions.length) * 100

        return (
            <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 pb-20 animate-in fade-in duration-500 text-center">
                <div className="space-y-6 max-w-xl mx-auto">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1 text-left">
                            <div className="flex items-center gap-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-primary">Live Progress</p>
                                {timeLeft !== null && (
                                    <Badge variant="outline" className={cn(
                                        "font-mono font-bold font-lg tracking-wider",
                                        timeLeft <= 60 ? "text-destructive border-destructive animate-pulse" : "text-primary border-primary/30"
                                    )}>
                                        <Clock className="w-4 h-4 mr-2 inline" />
                                        {formatTime(timeLeft)}
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold">Question {currentIndex + 1} of {questions.length}</h3>
                        </div>
                        <span className="text-3xl font-bold text-primary/40">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-12">
                    <div className="space-y-6">
                        <Badge variant="secondary">
                            {config.section} drill • {config.level}
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight max-w-2xl mx-auto">
                            {q.text}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {q.options.map((option, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                onClick={() => handleSelectOption(option)}
                                className={cn(
                                    "h-auto p-6 rounded-xl transition-all text-left flex justify-start gap-4",
                                    userAnswers[q.id] === option
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "bg-card hover:bg-accent"
                                )}
                            >
                                <div className={cn(
                                    "size-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                                    userAnswers[q.id] === option ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                                )}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className={cn(
                                    "text-lg font-bold transition-colors",
                                    userAnswers[q.id] === option ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {option}
                                </span>
                            </Button>
                        ))}
                    </div>

                    <div className="pt-12 flex justify-center items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                            disabled={currentIndex === 0}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={nextQuestion}
                            disabled={!userAnswers[q.id]}
                        >
                            {currentIndex === questions.length - 1 ? "End Session" : "Next Question"}
                            <ChevronRight className="ml-2 size-5" />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === "result" && result) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8 pb-20 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-1">
                        <Badge variant="outline">Practice Results</Badge>
                        <h1 className="text-3xl font-bold tracking-tight">{config.level} {config.section.charAt(0).toUpperCase() + config.section.slice(1)} Performance</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setStatus("setup")}>
                            <RotateCcw className="mr-2 size-4" /> Try Different
                        </Button>
                        <Button onClick={startTest}>
                            Retry
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="md:col-span-1 bg-primary text-primary-foreground border-none flex flex-col justify-center items-center p-8 text-center space-y-2">
                        <div className="text-5xl font-bold leading-none">{Math.round(result.percentage)}%</div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80">Accuracy</div>
                    </Card>
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Total", val: result.totalQuestions, icon: ClipboardList, variant: "outline" },
                            { label: "Correct", val: result.correctCount, icon: CheckCircle2, variant: "outline" },
                            { label: "Review", val: result.incorrectCount, icon: XCircle, variant: "outline" }
                        ].map((stat, i) => (
                            <Card key={i} className="bg-muted/50 p-6 flex flex-col justify-between border-border/50">
                                <div className="p-2 bg-background rounded-lg flex items-center justify-center mb-4 w-fit">
                                    <stat.icon className="size-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{stat.val}</div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <BookCheck className="size-6 text-primary" />
                        Detailed Review
                    </h2>

                    <div className="space-y-4">
                        {result.questions.map((q, i) => (
                            <Item key={q.id} variant="outline" className={cn(
                                "p-6 rounded-xl border transition-all group",
                                q.isCorrect ? "hover:border-primary/30" : "border-destructive/20 hover:border-destructive/40 bg-destructive/[0.02]"
                            )}>
                                <ItemMedia className={cn(
                                    "p-3 rounded-lg",
                                    q.isCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                                )}>
                                    {q.isCorrect ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-lg font-bold mb-1">Q{i + 1}: {q.text}</ItemTitle>
                                    <ItemDescription className="text-base">
                                        Your answer: <span className={cn("font-bold px-2 py-0.5 rounded-md", q.isCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>{q.userSelection || "(No answer)"}</span>
                                        {!q.isCorrect && <span className="ml-2 text-muted-foreground">Correct: <span className="font-bold text-primary underline underline-offset-4 decoration-2">{q.correctAnswer}</span></span>}
                                    </ItemDescription>
                                    {!q.isCorrect && (
                                        <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium leading-relaxed italic text-muted-foreground">
                                            “{q.explanation}”
                                        </div>
                                    )}
                                </ItemContent>
                            </Item>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return null
}
