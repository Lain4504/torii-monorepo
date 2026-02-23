"use client"

import * as React from "react"
import { BookCheck, GraduationCap, Clock, BarChart3, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@workspace/ui/components/item"
import Link from "next/link"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentReadinessProfileResponseDTO as ReadinessProfileResponse } from "@workspace/schemas"
import { cn } from "@workspace/ui/lib/utils"

export function AssessmentDashboard() {
    const [profile, setProfile] = React.useState<ReadinessProfileResponse | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchProfile = async () => {
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
        <div className="max-w-6xl mx-auto space-y-10 p-6 md:p-10 pb-24 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Assessment Center</h1>
                    <p className="text-muted-foreground font-medium text-lg">Đánh giá năng lực và theo dõi lộ trình JLPT</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="lg" className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 shadow-sm">
                        <Link href="/assessment/placement">
                            <GraduationCap className="mr-2.5 size-4" />
                            Placement Test
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-primary/20">
                        <Link href="/assessment/test">
                            <BookCheck className="mr-2.5 size-4" />
                            Take Practice Test
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-border/50 shadow-none hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">JLPT Readiness</CardTitle>
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <GraduationCap className="size-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-bold tracking-tighter">{profile?.targetLevel || "N5"}</span>
                            <Badge variant="secondary" className="font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Active Target
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                                <span>Progress</span>
                                <span className="text-primary">{profile?.readinessPercentage || 0}%</span>
                            </div>
                            <Progress value={profile?.readinessPercentage || 0} className="h-2 rounded-full" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-none hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Performance</CardTitle>
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <BarChart3 className="size-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-5xl font-bold tracking-tighter">{profile?.recentPerformance?.averageScore || 0}%</div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            Avg Score ({profile?.recentPerformance?.testsTaken || 0} recent tests)
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {profile?.skillGaps && (
                                <>
                                    <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider px-2 border-border/60">
                                        Vocab: {profile.skillGaps.vocabulary}%
                                    </Badge>
                                    <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider px-2 border-border/60">
                                        Grammar: {profile.skillGaps.grammar}%
                                    </Badge>
                                    <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider px-2 border-border/60">
                                        Reading: {profile.skillGaps.reading}%
                                    </Badge>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-none hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">AI Recommendation</CardTitle>
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <Sparkles className="size-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-sm leading-relaxed text-muted-foreground font-medium line-clamp-2">
                            {profile?.recommendations?.[0] || "Take more tests to get personalized insights."}
                        </div>
                        <Button variant="link" className="p-0 h-auto font-bold text-xs uppercase tracking-widest text-primary group" asChild>
                            <Link href="/ai-analytics">
                                Full Analysis <ArrowRight className="ml-1.5 size-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">Recommended For You</h2>
                        <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase tracking-widest">
                            View All
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <Item variant="outline" className="group cursor-pointer hover:border-primary/50 transition-all duration-300 rounded-2xl p-4">
                            <ItemMedia className="bg-primary/5 p-4 rounded-xl group-hover:bg-primary/10 transition-colors">
                                <BookCheck className="size-6 text-primary" />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">N5 Vocabulary Drill</ItemTitle>
                                <ItemDescription className="text-sm font-medium">Perfect for strengthening your daily word bank.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-widest px-2.5">Quick</Badge>
                                <div className="p-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <ArrowRight className="size-5" />
                                </div>
                            </ItemActions>
                        </Item>

                        <Item variant="outline" className="group cursor-pointer hover:border-primary/50 transition-all duration-300 rounded-2xl p-4">
                            <ItemMedia className="bg-muted p-4 rounded-xl group-hover:bg-muted/80 transition-colors">
                                <Clock className="size-6 text-muted-foreground" />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">Speed Reading Challenge</ItemTitle>
                                <ItemDescription className="text-sm font-medium">Improve your reading comprehension speed.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-widest px-2.5">Medium</Badge>
                                <div className="p-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <ArrowRight className="size-5" />
                                </div>
                            </ItemActions>
                        </Item>
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-foreground">AI Insights</h2>
                    <Card className="bg-foreground text-background border-none shadow-2xl shadow-foreground/10 overflow-hidden rounded-2xl">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2.5">
                                <Sparkles className="size-5 text-primary" />
                                Dynamic Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed opacity-80 font-medium">
                                {profile?.recommendations?.[1] || "Based on your activity, we suggest starting with vocabulary drills to improve your foundational knowledge."}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-6">
                            <Button variant="secondary" className="w-full font-bold uppercase tracking-widest text-[10px] h-11 rounded-xl">
                                View Detailed Report
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
