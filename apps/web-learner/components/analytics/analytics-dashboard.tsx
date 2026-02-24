"use client"

import * as React from "react"
import { TrendingUp, Target, AlertTriangle, FileText, Download, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ProgressChart } from "./progress-chart"
import { StudyPath } from "./study-path"
import { cn } from "@workspace/ui/lib/utils"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentReadinessProfileResponseDTO as ReadinessProfileResponse } from "@workspace/schemas"

import { Badge } from "@workspace/ui/components/badge"

export function AnalyticsDashboard() {
    const [progress, setProgress] = React.useState<any>(null)
    const [studyPath, setStudyPath] = React.useState<any>(null)
    const [profile, setProfile] = React.useState<ReadinessProfileResponse | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [progressData, pathData, profileData] = await Promise.all([
                    agentApi.analytics.trackProgress('month'),
                    agentApi.analytics.suggestStudyPath('N5'), // Default target
                    agentApi.analytics.getReadinessProfile('N5')
                ])
                setProgress(progressData)
                setStudyPath(pathData)
                setProfile(profileData)
            } catch (error) {
                console.error("Failed to fetch analytics data", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Spinner className="size-8 text-muted-foreground" /></div>
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
                        <TrendingUp className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{Math.round(progress?.metrics?.averageScore || 0)}%</div>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">JLPT Readiness</CardTitle>
                        <Sparkles className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile?.readinessPercentage || 0}%</div>
                        <p className="text-xs text-muted-foreground">Target: {profile?.targetLevel || "N5"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weak Areas</CardTitle>
                        <AlertTriangle className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile?.weaknesses?.length || 0} Topics</div>
                        <p className="text-xs text-muted-foreground">Requires review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
                        <FileText className="size-4 text-primary" />
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
                            <CardTitle>Weaknesses & Focus Areas</CardTitle>
                            <CardDescription>Knowledge gaps identified from your performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {profile?.weaknesses?.map((weakness: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 border-border/50">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{weakness.topic}</h4>
                                                <Badge variant="secondary" className="uppercase text-[10px] font-bold">
                                                    {weakness.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{weakness.description}</p>
                                            <p className="text-xs font-medium text-muted-foreground italic">Gợi ý: {weakness.suggestedReview}</p>
                                        </div>
                                        <Button size="sm" variant="secondary">Review</Button>
                                    </div>
                                ))}
                                {(!profile?.weaknesses || profile.weaknesses.length === 0) && (
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
