"use client"

import * as React from "react"
import { ArrowRight, Sparkles, BookCheck, Clock, Trophy } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentTestGenerationResponseDTO as PlacementTestResponse, AgentTestEvaluationResponseDTO as PlacementEvaluationResponse } from "@workspace/schemas"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"

export function PlacementTest() {
    const [step, setStep] = React.useState<"intro" | "test" | "result">("intro")
    const [isLoading, setIsLoading] = React.useState(false)
    const [testData, setTestData] = React.useState<PlacementTestResponse | null>(null)
    const [answers, setAnswers] = React.useState<Record<string, string>>({})
    const [result, setResult] = React.useState<PlacementEvaluationResponse | null>(null)

    const handleStart = async () => {
        setIsLoading(true)
        try {
            const data = await agentApi.assessment.generatePlacementTest(15)
            setTestData(data)
            setStep("test")
            setAnswers({})
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!testData) return
        setIsLoading(true)
        try {
            const evaluation = await agentApi.assessment.evaluatePlacementTest(testData.testId, answers)
            setResult(evaluation)
            setStep("result")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }))
    }

    const handleSelectLevel = (level: string) => {
        console.log("Selected level:", level)
    }

    if (step === "intro") {
        return (
            <div className="max-w-4xl mx-auto py-24 px-6 text-center space-y-16 animate-in fade-in duration-700">
                <div className="space-y-8">
                    <div className="size-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
                        <Sparkles className="size-10" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">Placement Test</h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            Discover your current Japanese level in just 10 minutes.
                            Our AI will adapt to your answers to find the perfect starting point.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    {[
                        { icon: BookCheck, val: "15", label: "Questions" },
                        { icon: Clock, val: "~10", label: "Minutes" },
                        { icon: Sparkles, val: "AI", label: "Powered" },
                    ].map((item, i) => (
                        <Card key={i} className="border-border/50 bg-muted/30 shadow-none rounded-2xl">
                            <CardContent className="flex flex-col items-center p-8 space-y-3">
                                <div className="p-3 bg-primary/10 rounded-xl mb-1">
                                    <item.icon className="size-6 text-primary" />
                                </div>
                                <div className="font-bold text-3xl tracking-tight">{item.val}</div>
                                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{item.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button size="lg" onClick={handleStart} disabled={isLoading} className="h-14 px-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20">
                    {isLoading ? <><Spinner className="mr-3 size-5" /> Preparing...</> : "Start Assessment"}
                </Button>
            </div>
        )
    }

    if (step === "test" && testData) {
        const progress = (Object.keys(answers).length / testData.questions.length) * 100

        return (
            <div className="max-w-4xl mx-auto py-16 px-6 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Progress Counter</p>
                            <h3 className="text-2xl font-bold text-foreground">
                                Question {Object.keys(answers).length} <span className="text-muted-foreground/40 text-lg font-medium mx-1">/</span> {testData.questions.length}
                            </h3>
                        </div>
                        <span className="text-4xl font-bold text-primary/30 tracking-tighter">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 rounded-full" />
                </div>

                <div className="space-y-10">
                    {testData.questions.map((q, i) => (
                        <Card key={q.id || i} className="border-border/50 overflow-hidden shadow-none rounded-3xl">
                            <CardHeader className="bg-muted/30 p-8">
                                <CardTitle className="text-2xl font-bold leading-tight flex gap-6 items-start">
                                    <span className="flex-none bg-foreground text-background size-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                                        {i + 1}
                                    </span>
                                    {q.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <RadioGroup value={answers[q.id]} onValueChange={(val) => handleAnswer(q.id, val)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options?.map((opt: string, idx: number) => (
                                        <div key={idx} className="relative">
                                            <RadioGroupItem value={opt} id={`${q.id}-${idx}`} className="sr-only" />
                                            <Label
                                                htmlFor={`${q.id}-${idx}`}
                                                className={cn(
                                                    "group flex items-center gap-4 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300",
                                                    answers[q.id] === opt
                                                        ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "size-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all shrink-0",
                                                    answers[q.id] === opt ? "bg-primary text-primary-foreground shadow-lg scale-110" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                                )}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className={cn(
                                                    "flex-1 font-bold text-base transition-colors",
                                                    answers[q.id] === opt ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                                )}>{opt}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center pt-8 pb-16">
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={isLoading || Object.keys(answers).length < testData.questions.length}
                        className="h-14 px-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20"
                    >
                        {isLoading ? <><Spinner className="mr-3 size-5" /> Analyzing Performance...</> : "Submit Assessment"}
                    </Button>
                </div>
            </div>
        )
    }

    if (step === "result" && result) {
        return (
            <div className="max-w-4xl mx-auto py-24 px-6 text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="space-y-4">
                    <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5">
                        Assessment Deep Dive Complete
                    </Badge>
                    <h2 className="text-3xl font-bold text-foreground">Your Personalized Learning Roadmap</h2>
                </div>

                <Card className="bg-foreground text-background border-none overflow-hidden rounded-[3rem] shadow-2xl shadow-foreground/20">
                    <CardHeader className="space-y-6 pt-16">
                        <p className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-60">Verified JLPT Equivalence</p>
                        <CardTitle className="text-[7rem] md:text-[9rem] font-bold leading-none tracking-tighter text-primary">
                            {result.assessedLevel}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="py-10 px-8">
                        <div className="relative p-8 bg-background/5 border border-background/10 rounded-3xl backdrop-blur-sm">
                            <div className="absolute -top-3 left-8 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                AI Insights
                            </div>
                            <p className="text-lg md:text-xl font-bold leading-relaxed italic opacity-95 text-background">
                                "{result.feedback}"
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="justify-center pb-16">
                        <Button
                            size="lg"
                            className="h-14 px-12 font-bold uppercase tracking-[0.2em] text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-2xl shadow-primary/30"
                            onClick={() => handleSelectLevel(result.assessedLevel ?? 'N5')}
                            asChild
                        >
                            <Link href="/dashboard">
                                Start Your {result.assessedLevel} Path <ArrowRight className="ml-2.5 size-5" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <div className="pt-6">
                    <Button variant="ghost" asChild className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                        <Link href="/assessment">Back to Assessment Center</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return null
}
