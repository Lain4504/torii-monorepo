"use client"

import * as React from "react"
import { ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { agentApi, PlacementTestResponse, PlacementEvaluationResponse } from "@/apis/services/agent-api"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

export function PlacementTest() {
    const [step, setStep] = React.useState<"intro" | "test" | "result">("intro")
    const [isLoading, setIsLoading] = React.useState(false)
    const [testData, setTestData] = React.useState<PlacementTestResponse | null>(null)
    const [answers, setAnswers] = React.useState<Record<string, string>>({})
    const [result, setResult] = React.useState<PlacementEvaluationResponse | null>(null)

    const handleStart = async () => {
        setIsLoading(true)
        try {
            const data = await agentApi.assessment.generatePlacementTest(15) // Fixed 15 questions
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
        // Ideally save this to user profile
        console.log("Selected level:", level)
    }

    if (step === "intro") {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-8">
                <div className="space-y-4">
                    <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                        <Sparkles className="size-10" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Placement Test</h1>
                    <p className="text-xl text-muted-foreground text-pretty max-w-lg mx-auto">
                        Discover your current Japanese level in just 10 minutes.
                        Our AI will adapt to your answers to find the perfect starting point.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-left max-w-md mx-auto py-6">
                    <div className="p-4 rounded-lg bg-card border shadow-sm">
                        <div className="font-bold text-lg mb-1">15</div>
                        <div className="text-xs text-muted-foreground uppercase">Questions</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card border shadow-sm">
                        <div className="font-bold text-lg mb-1">~10</div>
                        <div className="text-xs text-muted-foreground uppercase">Minutes</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card border shadow-sm">
                        <div className="font-bold text-lg mb-1">AI</div>
                        <div className="text-xs text-muted-foreground uppercase">Powered</div>
                    </div>
                </div>

                <Button size="lg" onClick={handleStart} disabled={isLoading} className="px-8 h-12 text-lg">
                    {isLoading ? <><Loader2 className="mr-2 size-5 animate-spin" /> Preparing...</> : "Start Assessment"}
                </Button>
            </div>
        )
    }

    if (step === "test" && testData) {
        const progress = (Object.keys(answers).length / testData.questions.length) * 100

        return (
            <div className="max-w-3xl mx-auto py-8 space-y-8">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{Object.keys(answers).length} / {testData.questions.length}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="space-y-8">
                    {testData.questions.map((q, i) => (
                        <Card key={q.id || i} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4">
                                <CardTitle className="text-lg font-medium leading-relaxed flex gap-4">
                                    <span className="flex-none bg-background border size-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm text-muted-foreground">
                                        {i + 1}
                                    </span>
                                    {q.content}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <RadioGroup value={answers[q.id]} onValueChange={(val) => handleAnswer(q.id, val)} className="space-y-3">
                                    {q.options?.map((opt: string, idx: number) => (
                                        <div key={idx} className={cn(
                                            "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-all",
                                            answers[q.id] === opt ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" : "border-border"
                                        )}>
                                            <RadioGroupItem value={opt} id={`${q.id}-${idx}`} />
                                            <Label htmlFor={`${q.id}-${idx}`} className="flex-1 cursor-pointer font-normal">{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end pt-4 pb-20">
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={isLoading || Object.keys(answers).length < testData.questions.length}
                        className="min-w-[160px]"
                    >
                        {isLoading ? <><Loader2 className="mr-2 size-5 animate-spin" /> Analyzing...</> : "Submit Answers"}
                    </Button>
                </div>
            </div>
        )
    }

    if (step === "result" && result) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Assessment Complete!</h2>
                    <p className="text-muted-foreground">Here is our recommendation based on your performance.</p>
                </div>

                <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <CardHeader>
                        <CardDescription className="uppercase tracking-widest text-xs font-semibold text-primary">Recommended Level</CardDescription>
                        <CardTitle className="text-6xl font-black text-primary py-2">{result.suggestedLevel}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p className="text-lg leading-relaxed text-foreground/80 max-w-lg mx-auto">
                            {result.analysis}
                        </p>
                    </CardContent>
                    <CardFooter className="justify-center pb-8 relative z-10">
                        <Button
                            size="lg"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20"
                            onClick={() => handleSelectLevel(result.suggestedLevel ?? 'N5')}
                            asChild
                        >
                            <Link href="/dashboard">
                                Accept & Start Learning <ArrowRight className="ml-2 size-5" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <div className="pt-8">
                    <Button variant="ghost" asChild>
                        <Link href="/assessment">Back to Assessments</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return null
}
