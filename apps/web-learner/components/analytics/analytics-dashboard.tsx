"use client"

import * as React from "react"
import { TrendingUp, AlertTriangle, FileText, Download, Sparkles, Flame } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ProgressChart } from "./progress-chart"
import { StudyPath } from "./study-path"
import { cn } from "@workspace/ui/lib/utils"
import { agentApi } from "@/lib/api/services/agent-api"
import { gamificationApi } from "@/lib/api/services/gamification-api"
import { AgentReadinessProfileResponseDTO as ReadinessProfileResponse, StreakStatusDto } from "@workspace/schemas"

import { Badge } from "@workspace/ui/components/badge"

export function AnalyticsDashboard() {
    const [progress, setProgress] = React.useState<any>(null)
    const [studyPath, setStudyPath] = React.useState<any>(null)
    const [profile, setProfile] = React.useState<ReadinessProfileResponse | null>(null)
    const [streak, setStreak] = React.useState<StreakStatusDto | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [progressData, pathData, profileData, streakData] = await Promise.all([
                    agentApi.analytics.trackProgress('month'),
                    agentApi.analytics.suggestStudyPath('N5'), // Default target
                    agentApi.analytics.getReadinessProfile('N5'),
                    gamificationApi.getStreak().catch(() => null)
                ])
                setProgress(progressData)
                setStudyPath(pathData)
                setProfile(profileData)
                setStreak(streakData)
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
                        <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                        <Flame className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{streak?.currentStreak ?? 0} Days</div>
                        <p className="text-xs text-muted-foreground">
                            {streak?.isActiveToday ? "Active today ✓" : `Best: ${streak?.longestStreak ?? 0} days`}
                        </p>
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

                    {/* Skill Analysis + Insights 2-col */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Skill Analysis Bars */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skill Analysis</CardTitle>
                                <CardDescription>Proficiency breakdown by area</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {([
                                        { label: 'Ngữ pháp (Grammar)', key: 'grammar' },
                                        { label: 'Từ vựng (Vocabulary)', key: 'vocabulary' },
                                        { label: 'Đọc hiểu (Reading)', key: 'reading' },
                                        { label: 'Nghe hiểu (Listening)', key: 'listening' },
                                    ] as const).map(({ label, key }) => {
                                        const val = profile?.skillGaps?.[key] ?? 0
                                        return (
                                            <div key={key} className="space-y-1.5">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span>{label}</span>
                                                    <span className="text-primary font-bold">{val}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Strengths & Weaknesses Insights */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Strengths & Weaknesses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Performance trend */}
                                    {profile?.recentPerformance && (
                                        <div className={cn(
                                            "flex gap-3 p-3 rounded-lg border",
                                            profile.recentPerformance.trend === 'improving'
                                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50"
                                                : profile.recentPerformance.trend === 'declining'
                                                    ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50"
                                                    : "bg-muted/50 border-border"
                                        )}>
                                            <TrendingUp className={cn(
                                                "size-4 mt-0.5 shrink-0",
                                                profile.recentPerformance.trend === 'improving' ? "text-emerald-600" : "text-muted-foreground"
                                            )} />
                                            <div>
                                                <p className={cn(
                                                    "text-sm font-bold capitalize",
                                                    profile.recentPerformance.trend === 'improving' ? "text-emerald-900 dark:text-emerald-400" : ""
                                                )}>
                                                    Trend: {profile.recentPerformance.trend}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Avg {profile.recentPerformance.averageScore}% over {profile.recentPerformance.testsTaken} test(s)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Top 2 weaknesses */}
                                    {profile?.weaknesses?.slice(0, 2).map((w: any, i: number) => (
                                        <div key={i} className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/50">
                                            <AlertTriangle className="size-4 mt-0.5 text-amber-600 shrink-0" />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-amber-900 dark:text-amber-400">{w.topic}</p>
                                                    <Badge variant="secondary" className="uppercase text-[10px] font-bold">{w.severity}</Badge>
                                                </div>
                                                <p className="text-xs text-amber-800 dark:text-amber-500 mt-0.5">{w.description}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Recommendations */}
                                    {profile?.recommendations && profile.recommendations.length > 0 && (
                                        <div className="pt-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Recommended for you</p>
                                            <div className="space-y-1">
                                                {profile.recommendations.slice(0, 2).map((rec: string, i: number) => (
                                                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                                                        <span className="text-sm text-foreground truncate mr-2">{rec}</span>
                                                        <Button size="sm" variant="ghost" className="text-primary text-xs h-auto py-0.5 px-2 shrink-0">Start →</Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!profile && (
                                        <p className="text-center text-muted-foreground py-4 text-sm">No data available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <StudyPath roadmap={studyPath?.studyPathRecommendation?.roadmap} />
                </div>
            </div>
        </div>
    )
}
