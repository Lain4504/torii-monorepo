"use client"

import * as React from "react"
import { TrendingUp, Target, AlertTriangle, FileText, Download, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ProgressChart } from "./progress-chart"
import { StudyPath } from "./study-path"
import { agentApi } from "@/apis/services/agent-api"
import type { AgentProgressTrackResponseDTO, AgentStudyPathResponseDTO, AgentWeaknessResponseDTO } from "@workspace/schemas"


export function AnalyticsDashboard() {
    const [progress, setProgress] = React.useState<AgentProgressTrackResponseDTO | null>(null)
    const [studyPath, setStudyPath] = React.useState<AgentStudyPathResponseDTO | null>(null)
    const [weaknesses, setWeaknesses] = React.useState<AgentWeaknessResponseDTO | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [progressData, pathData, weakData] = await Promise.all([
                    agentApi.analytics.trackProgress('month'),
                    agentApi.analytics.suggestStudyPath('N5'), // Default target
                    agentApi.analytics.identifyWeaknesses()
                ])
                setProgress(progressData)
                setStudyPath(pathData)
                setWeaknesses(weakData)
            } catch (error) {
                console.error("Failed to fetch analytics data", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Learning Analytics</h1>
                    <p className="text-muted-foreground mt-1">Sâu sát tiến độ học tập và đề xuất lộ trình tối ưu</p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 size-4" />
                    Export Report
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Progress</CardTitle>
                        <TrendingUp className="size-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{Math.round(progress?.metrics?.averageScore || 0)}%</div>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                        <Target className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress?.metrics?.streak || 0} Days</div>
                        <p className="text-xs text-muted-foreground">Keep it up!</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weak Areas</CardTitle>
                        <AlertTriangle className="size-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{weaknesses?.weaknesses?.length || 0} Topics</div>
                        <p className="text-xs text-muted-foreground">Requires review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
                        <FileText className="size-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress?.metrics?.completedLessons || 0}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ProgressChart data={progress?.chartData} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Focus Areas</CardTitle>
                            <CardDescription>Topics identified as weaknesses by AI</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {weaknesses?.weaknesses?.map((weakness: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-orange-700 dark:text-orange-400">{weakness.topic}</h4>
                                            <p className="text-sm text-orange-600/80 dark:text-orange-400/70">{weakness.description}</p>
                                        </div>
                                        <Button size="sm" variant="secondary" className="bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">Review</Button>
                                    </div>
                                ))}
                                {(!weaknesses?.weaknesses || weaknesses.weaknesses.length === 0) && (
                                    <p className="text-center text-muted-foreground py-4">No significant weaknesses detected. Great job!</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <StudyPath roadmap={studyPath?.studyPathRecommendation?.roadmap} />
                </div>
            </div>
        </div>
    )
}
