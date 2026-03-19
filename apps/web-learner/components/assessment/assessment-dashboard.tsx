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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs-scrollable"
import { SkillDrill } from "@/components/ai-sensei/skill-drill"

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
        <div className="max-w-6xl mx-auto space-y-8 p-6 md:p-10 pb-24 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Assessment Center</h1>
                    <p className="text-muted-foreground font-medium text-sm">Theo dõi tiến độ và chinh phục kỳ thi JLPT của bạn</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild size="sm" className="font-bold uppercase tracking-wider text-[10px] h-9 px-5 rounded-lg shadow-md shadow-primary/10">
                        <Link href="/assessment/test">
                            <BookCheck className="mr-2 size-3.5" />
                            Bắt đầu Thi thử JLPT
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full space-y-8">
                <TabsList className="bg-muted/50 p-1 rounded-xl w-full h-11 border">
                    <TabsTrigger value="overview" className="rounded-lg px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:shadow-sm">
                        Tổng quan năng lực
                    </TabsTrigger>
                    <TabsTrigger value="drills" className="rounded-lg px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:shadow-sm">
                        Luyện tập Trọng tâm
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-10 focus-visible:outline-none">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="border-border shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">JLPT Readiness</CardTitle>
                                <div className="p-2 bg-primary/5 rounded-lg border shadow-sm">
                                    <GraduationCap className="size-4 text-primary/70" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tight">{profile?.targetLevel || "N5"}</span>
                                    <Badge variant="secondary" className="font-bold text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider h-5">
                                        Active Target
                                    </Badge>
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">
                                        <span>Progress</span>
                                        <span className="text-primary">{profile?.readinessPercentage || 0}%</span>
                                    </div>
                                    <Progress value={profile?.readinessPercentage || 0} className="h-1.5 rounded-full" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Performance</CardTitle>
                                <div className="p-2 bg-primary/5 rounded-lg border shadow-sm">
                                    <BarChart3 className="size-4 text-primary/70" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="text-4xl font-black tracking-tight">{profile?.recentPerformance?.averageScore || 0}%</div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    Avg Score ({profile?.recentPerformance?.testsTaken || 0} tests)
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {profile?.skillGaps && (
                                        <>
                                            <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-wider border-border/60 rounded-sm">
                                                Vocab: {profile.skillGaps.vocabulary}%
                                            </Badge>
                                            <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-wider border-border/60 rounded-sm">
                                                Grammar: {profile.skillGaps.grammar}%
                                            </Badge>
                                            <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-wider border-border/60 rounded-sm">
                                                Reading: {profile.skillGaps.reading}%
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">AI Recommendation</CardTitle>
                                <div className="p-2 bg-primary/5 rounded-lg border shadow-sm">
                                    <Sparkles className="size-4 text-primary/70" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-xs leading-relaxed text-muted-foreground font-medium line-clamp-2">
                                    {profile?.recommendations?.[0] || "Take more tests to get personalized insights."}
                                </div>
                                <Button variant="link" className="p-0 h-auto font-bold text-[10px] uppercase tracking-widest text-primary group" asChild>
                                    <Link href="/analytics">
                                        Full Analysis <ArrowRight className="ml-1.5 size-3 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-foreground">Gợi ý cho bạn</h2>
                            </div>
                            <div className="space-y-3">
                                <Item variant="outline" className="group cursor-pointer hover:bg-muted/50 transition-colors rounded-xl p-3 border-border">
                                    <ItemMedia className="bg-primary/5 p-3 rounded-lg group-hover:bg-primary/10 transition-colors">
                                        <BookCheck className="size-5 text-primary/70" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-sm font-bold text-foreground transition-colors">N5 Vocabulary Drill</ItemTitle>
                                        <ItemDescription className="text-xs font-medium">Perfect for strengthening your daily word bank.</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-widest px-2 h-5 rounded-sm">Quick</Badge>
                                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </ItemActions>
                                </Item>

                                <Item variant="outline" className="group cursor-pointer hover:bg-muted/50 transition-colors rounded-xl p-3 border-border">
                                    <ItemMedia className="bg-muted/30 p-3 rounded-lg group-hover:bg-muted/50 transition-colors">
                                        <Clock className="size-5 text-muted-foreground" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-sm font-bold text-foreground transition-colors">Speed Reading Challenge</ItemTitle>
                                        <ItemDescription className="text-xs font-medium">Improve your reading comprehension speed.</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-widest px-2 h-5 rounded-sm">Medium</Badge>
                                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </ItemActions>
                                </Item>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-base font-bold text-foreground">AI Insights</h2>

                            <Card className="border border-primary/20 bg-primary/5 shadow-none rounded-xl overflow-hidden">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <GraduationCap className="size-4 text-primary" />
                                        Placement Test
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                                        Bạn không chắc mình nên bắt đầu từ đâu? Hãy thực hiện bài test nhanh để AI xác định cấp độ JLPT phù hợp nhất với bạn.
                                    </p>
                                    <Button asChild variant="default" className="w-full font-bold uppercase tracking-widest text-[9px] h-9 rounded-lg shadow-sm">
                                        <Link href="/assessment/placement">Kiểm tra trình độ ngay</Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border shadow-none rounded-xl overflow-hidden">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Sparkles className="size-4 text-primary" />
                                        Phân tích Động
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                                        {profile?.recommendations?.[1] || "Dựa trên hoạt động của bạn, chúng tôi gợi ý tập trung vào các bài luyện từ vựng để củng cố kiến thữ nền tảng."}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-4">
                                    <Button variant="outline" className="w-full font-bold uppercase tracking-widest text-[9px] h-9 rounded-lg">
                                        Chi tiết báo cáo
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="drills" className="focus-visible:outline-none">
                    <SkillDrill embed />
                </TabsContent>
            </Tabs>
        </div>
    )
}
