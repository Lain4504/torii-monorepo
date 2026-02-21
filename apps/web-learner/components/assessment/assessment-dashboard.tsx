"use client"

import * as React from "react"
import { BookCheck, GraduationCap, Clock, BarChart3, ArrowRight, Calendar, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import Link from "next/link"
import { agentApi } from "@/apis/services/agent-api"
import { AgentReadinessProfileResponseDTO as ReadinessProfileResponse } from "@workspace/schemas"

export function AssessmentDashboard() {
    const [profile, setProfile] = React.useState<ReadinessProfileResponse | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchProfile = async () => {
            // Example: defaulting to N5 for demo. Ideally this comes from user profile.
            try {
                const data = await agentApi.analytics.getReadinessProfile("N5")
                setProfile(data)
            } catch (error) {
                console.error("Failed to fetch readiness profile", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [])

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assessment Center</h1>
                    <p className="text-muted-foreground mt-1">Đánh giá năng lực và theo dõi lộ trình JLPT</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/assessment/placement">
                            <GraduationCap className="mr-2 size-4" />
                            Placement Test
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/assessment/test">
                            <BookCheck className="mr-2 size-4" />
                            Take Practice Test
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">JLPT Readiness</CardTitle>
                        <GraduationCap className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile?.targetLevel || "N5"}</div>
                        <p className="text-xs text-muted-foreground">
                            Đánh giá mức độ sẵn sàng cho kỳ thi
                        </p>
                        <div className="mt-4">
                            <Progress value={profile?.readinessPercentage || 0} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2 text-right">{profile?.readinessPercentage || 0}% Ready</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Performance</CardTitle>
                        <BarChart3 className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile?.recentPerformance?.averageScore || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            Average Score ({profile?.recentPerformance?.testsTaken || 0} tests)
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {profile?.skillGaps && (
                                <>
                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        Vocab: {profile.skillGaps.vocabulary}%
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-[10px] font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                        Grammar: {profile.skillGaps.grammar}%
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20">
                                        Reading: {profile.skillGaps.reading}%
                                    </span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
                        <Sparkles className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-foreground line-clamp-2">
                            {profile?.recommendations?.[0] || "Take more tests to get personalized insights."}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {profile?.nextSteps?.[0] || "Start with a practice test."}
                        </p>
                        <Button variant="link" className="p-0 h-auto mt-4 text-xs" asChild>
                            <Link href="/ai-analytics">
                                View Full Analysis <ArrowRight className="ml-1 size-3" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Recommended Tests */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recommended For You</CardTitle>
                        <CardDescription>Based on your recent activity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <BookCheck className="size-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">N5 Vocabulary Drill</h4>
                                    <p className="text-sm text-muted-foreground">10 Questions • 5 Mins</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost"><ArrowRight className="size-4" /></Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-orange-500/10 rounded-full text-orange-500">
                                    <Clock className="size-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Speed Reading Challenge</h4>
                                    <p className="text-sm text-muted-foreground">3 Texts • 8 Mins</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost"><ArrowRight className="size-4" /></Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback / Insights */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>AI Insights</CardTitle>
                        <CardDescription>Analysis from your learning patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50 text-sm space-y-2">
                            <p>{profile?.recommendations?.[0] || "You're doing great! Try focusing on your weak areas to improve further."}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">View Detailed Report</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
