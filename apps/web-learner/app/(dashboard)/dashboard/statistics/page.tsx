'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { TrendingUp, Clock, BookOpen, Award, Target, Calendar, ChevronRight } from 'lucide-react'
import { Progress } from '@workspace/ui/components/progress'
import { Button } from "@workspace/ui/components/button"
import { CheckCircle2 } from 'lucide-react'

export default function StatisticsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-6xl animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="space-y-4 pb-2 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground">
                    Thống kê học tập
                </h1>
                <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                    Phân tích chi tiết quá trình phát triển Torii Learner.
                </p>
            </div>

            {/* Top Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng giờ học', value: '156h', change: '+12% tuần này', icon: Clock, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Bài học hoàn thành', value: '84', change: '+5 hôm nay', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
                    { label: 'Ngày học liên tiếp', value: '12', change: 'Kỷ lục: 30 ngày', icon: Target, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Trung bình điểm', value: '8.5', change: '+0.2 so với tháng trước', icon: TrendingUp, color: 'text-purple-500 bg-purple-500/10' },
                ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <Card key={i} className="p-5 flex flex-col justify-between shadow-sm border-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            </div>
                            <p className="text-xs font-medium text-emerald-600 mt-2">{stat.change}</p>
                        </Card>
                    )
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Visual Chart Placeholder Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="shadow-sm border-border bg-card overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between px-6 py-6 border-b border-border">
                            <CardTitle className="text-base font-bold text-foreground">Phân bổ thời gian (7 ngày qua)</CardTitle>
                            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                <span>Thứ 2 - Chủ nhật</span>
                                <Calendar className="w-3.5 h-3.5 ml-1" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-64 flex items-end justify-between gap-2 px-8 py-8">
                            {/* Simple Mock Bar Chart with CSS */}
                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                                    <div
                                        className="w-full bg-primary/20 rounded-md group-hover:bg-primary/40 transition-all duration-300 ease-out"
                                        style={{ height: `${h}%` }}
                                    />
                                    <span className="text-xs font-medium text-muted-foreground mt-3">
                                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}
                                    </span>
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-8 bg-foreground text-background text-xs font-bold px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {(h / 10).toFixed(1)}h
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Skill Radar / Strengths Section */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Card className="shadow-sm border-border bg-card">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-bold text-foreground">Kỹ năng ngôn ngữ</CardTitle>
                                <Award className="w-4 h-4 text-primary" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { label: 'Từ vựng (Vocabulary)', value: 85 },
                                    { label: 'Hán tự (Kanji)', value: 60 },
                                    { label: 'Ngữ pháp (Grammar)', value: 75 },
                                    { label: 'Nghe hiểu (Listening)', value: 45 },
                                ].map((skill, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>{skill.label}</span>
                                            <span className="text-muted-foreground">{skill.value}%</span>
                                        </div>
                                        <Progress value={skill.value} className="h-1.5" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-border bg-card flex flex-col justify-center items-center text-center p-8 space-y-4">
                            <div className="relative">
                                <div className="size-24 rounded-full border-[6px] border-muted flex items-center justify-center relative">
                                    <span className="text-3xl font-extrabold text-foreground">A+</span>
                                    <svg className="absolute inset-0 -rotate-90 text-primary" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="44" // radius matches visual size
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            strokeDasharray="280" // Approx circumference
                                            strokeDashoffset="40" // Partial fill
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-base font-bold">Xếp hạng học tập</h4>
                                <p className="text-xs text-muted-foreground font-medium mt-1">Tiến trình vượt bậc</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-primary/80 rounded-lg">
                                Xem chi tiết <ChevronRight className="ml-1 w-3.5 h-3.5" />
                            </Button>
                        </Card>
                    </div>
                </div>

                {/* Sidebar - Badges & Achievements highlights */}
                <div className="space-y-8">
                    <Card className="shadow-md border-none bg-primary text-primary-foreground overflow-hidden relative">
                        {/* Decorative background circle */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold opacity-90">Gợi ý tuần này</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 relative z-10 pt-2">
                            <p className="text-sm font-medium leading-relaxed opacity-95">Bạn đang học Kanji rất tốt, hãy dành thêm thời gian luyện nghe để cân bằng kỹ năng.</p>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-primary bg-background/20" />
                                    ))}
                                </div>
                                <span className="text-xs font-semibold opacity-80">Cùng 1,200 người khác</span>
                            </div>
                            <Button className="w-full bg-background text-primary hover:bg-background/90 rounded-xl font-bold shadow-sm">
                                Luyện Nghe Ngay
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 px-1">
                        <h3 className="text-sm font-bold text-foreground">Hoạt động gần đây</h3>
                        <div className="space-y-4">
                            {[
                                { action: 'Hoàn thành bài KT N4', time: '2 giờ trước', icon: CheckCircle2 },
                                { action: 'Học 30 từ vựng Kanji', time: '5 giờ trước', icon: BookOpen },
                                { action: 'Duy trì chuỗi 12 ngày', time: '12 giờ trước', icon: Target },
                            ].map((act, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary">
                                        <act.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground leading-none">{act.action}</p>
                                        <p className="text-xs text-muted-foreground">{act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

