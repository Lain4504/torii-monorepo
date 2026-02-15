"use client"

import * as React from "react"
import { CheckCircle2, Loader2, Timer, AlertCircle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select"
import { agentApi, TestGenerationResponse, TestEvaluationResponse } from "@/apis/services/agent-api"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

export function TestRunner() {
    const [step, setStep] = React.useState<"setup" | "test" | "result">("setup")
    const [level, setLevel] = React.useState<string>("N5")
    const [section, setSection] = React.useState<string>("full")
    const [isLoading, setIsLoading] = React.useState(false)
    const [testData, setTestData] = React.useState<TestGenerationResponse | null>(null)
    const [answers, setAnswers] = React.useState<Record<string, string>>({})
    const [evaluation, setEvaluation] = React.useState<TestEvaluationResponse | null>(null)

    // Generate Test
    const handleStart = async () => {
        setIsLoading(true)
        try {
            const data = await agentApi.assessment.generateTest(level, section, 10)
            setTestData(data)
            setStep("test")
            setAnswers({})
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    // Submit Test
    const handleSubmit = async () => {
        if (!testData) return
        setIsLoading(true)
        try {
            // Format answers for API
            const formattedAnswers = Object.entries(answers).map(([qId, answer]) => ({
                questionId: qId,
                answer: answer
            }))

            const result = await agentApi.assessment.evaluateTest(testData.testId, formattedAnswers)
            setEvaluation(result)
            setStep("result")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle Answer Selection
    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }))
    }

    // --- Renders ---

    if (step === "setup") {
        return (
            <div className="max-w-xl mx-auto py-12 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Start Practice Test</h1>
                    <p className="text-muted-foreground">Customize your test parameters</p>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label>JLPT Level</Label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="N5">N5</SelectItem>
                                    <SelectItem value="N4">N4</SelectItem>
                                    <SelectItem value="N3">N3</SelectItem>
                                    <SelectItem value="N2">N2</SelectItem>
                                    <SelectItem value="N1">N1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Section</Label>
                            <Select value={section} onValueChange={setSection}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full">Full Test (Mixed)</SelectItem>
                                    <SelectItem value="vocabulary">Vocabulary</SelectItem>
                                    <SelectItem value="grammar">Grammar</SelectItem>
                                    <SelectItem value="reading">Reading</SelectItem>
                                    <SelectItem value="listening">Listening</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleStart} className="w-full" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Generating...</> : "Start Test"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (step === "test" && testData) {
        return (
            <div className="max-w-3xl mx-auto py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Test: {level} - {section}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Timer className="size-4" />
                        <span>--:--</span>
                    </div>
                </div>

                <div className="space-y-6 mb-8">
                    {testData.questions.map((q, i) => (
                        <Card key={q.id}>
                            <CardHeader>
                                <CardTitle className="text-base flex gap-3">
                                    <span className="flex-none bg-muted size-6 flex items-center justify-center rounded text-sm">{i + 1}</span>
                                    {q.content}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={answers[q.id]} onValueChange={(val) => handleAnswer(q.id, val)}>
                                    {q.options?.map((opt, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 py-2">
                                            <RadioGroupItem value={opt} id={`${q.id}-${idx}`} />
                                            <Label htmlFor={`${q.id}-${idx}`} className="font-normal cursor-pointer">{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={isLoading || Object.keys(answers).length < testData.questions.length}>
                        {isLoading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Submitting...</> : "Submit Test"}
                    </Button>
                </div>
            </div>
        )
    }

    if (step === "result" && evaluation) {
        const percentage = Math.round((evaluation.score / evaluation.maxScore) * 100)

        return (
            <div className="max-w-3xl mx-auto py-12 space-y-8">
                <div className="text-center space-y-4">
                    <div className={cn(
                        "size-32 rounded-full flex items-center justify-center border-8 text-4xl font-bold mx-auto",
                        percentage >= 80 ? "border-green-500 text-green-600" :
                            percentage >= 60 ? "border-yellow-500 text-yellow-600" : "border-red-500 text-red-600"
                    )}>
                        {percentage}%
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Test Complete</h2>
                        <p className="text-muted-foreground">Score: {evaluation.score} / {evaluation.maxScore}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{evaluation.feedback}</p>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Detailed Review</h3>
                    {evaluation.details.map((detail, i) => (
                        <Card key={i} className={cn("border-l-4", detail.isCorrect ? "border-l-green-500" : "border-l-red-500")}>
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    {detail.isCorrect ? <CheckCircle2 className="size-5 text-green-500 mt-1" /> : <AlertCircle className="size-5 text-red-500 mt-1" />}
                                    <div className="space-y-1">
                                        <p className="font-medium">Question {i + 1}</p>
                                        <p className="text-sm text-muted-foreground">{detail.explanation}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => setStep("setup")}>Take Another Test</Button>
                    <Button asChild><Link href="/assessment">Back to Dashboard</Link></Button>
                </div>
            </div>
        )
    }

    return null
}
