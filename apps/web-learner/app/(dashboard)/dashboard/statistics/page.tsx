'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { TrendingUp, Clock, BookOpen, Award, Target, Calendar, ChevronRight } from 'lucide-react'
import { Progress } from '@workspace/ui/components/progress'
import { Button } from "@workspace/ui/components/button"
import { CheckCircle2 } from 'lucide-react'

export default function StatisticsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 max-w-6xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Thống kê học tập</h1>
                <p className="text-sm text-muted-foreground opacity-70">Phân tích chi tiết quá trình phát triển của bạn</p>
            </div>

            {/* Top Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng giờ học', value: '156h', change: '+12% tuần này', icon: Clock, color: 'text-emerald-500' },
                    { label: 'Bài học hoàn thành', value: '84', change: '+5 hôm nay', icon: BookOpen, color: 'text-blue-500' },
                    { label: 'Ngày học liên tiếp', value: '12', change: 'Kỷ lục: 30 ngày', icon: Target, color: 'text-amber-500' },
                    { label: 'Trung bình điểm', value: '8.5', change: '+0.2 so với tháng trước', icon: TrendingUp, color: 'text-purple-500' },
                ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <div key={i} className="p-5 rounded-3xl border border-border/50 bg-muted/5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className={`p-2.5 rounded-2xl bg-background border border-border/50 shadow-sm ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{stat.label}</p>
                            </div>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">{stat.change}</p>
                        </div>
                    )
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Visual Chart Placeholder Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-border/50 shadow-none bg-card/30 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between px-6 py-6 border-b border-border/50">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Phân bổ thời gian (7 ngày qua)</CardTitle>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary tracking-widest uppercase">
                                <span>Thứ 2 - Chủ nhật</span>
                                <Calendar className="w-3 h-3 ml-1" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-64 flex items-end justify-between gap-2 px-8 py-8">
                            {/* Simple Mock Bar Chart with CSS */}
                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                                    <div
                                        className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-all duration-500 ease-out border-t-2 border-primary/40"
                                        style={{ height: `${h}%` }}
                                    />
                                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter mt-3">
                                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}
                                    </span>
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-6 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(h / 10).toFixed(1)}h
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Skill Radar / Strengths Section */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Card className="border-border/50 shadow-none bg-card/30">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kỹ năng ngôn ngữ</CardTitle>
                                <Award className="w-4 h-4 text-primary" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { label: 'Từ vựng (Vocabulary)', value: 85 },
                                    { label: 'Hán tự (Kanji)', value: 60 },
                                    { label: 'Ngữ pháp (Grammar)', value: 75 },
                                    { label: 'Nghe hiểu (Listening)', value: 45 },
                                ].map((skill, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                            <span>{skill.label}</span>
                                            <span>{skill.value}%</span>
                                        </div>
                                        <Progress value={skill.value} className="h-1 bg-primary/5" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 shadow-none bg-card/30 flex flex-col justify-center items-center text-center p-8 space-y-4">
                            <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                                <span className="text-xl font-extrabold text-foreground">A+</span>
                                {/* Animated ring could go here */}
                                <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin-slow duration-3000" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">Xếp hạng học tập</h4>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Tiến trình vượt bậc</p>
                            </div>
                            <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-transparent group">
                                Xem chi tiết chứng năng <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Card>
                    </div>
                </div>

                {/* Sidebar - Badges & Achievements highlights */}
                <div className="space-y-8">
                    <Card className="border-border/50 shadow-none bg-primary border-none text-primary-foreground overflow-hidden relative">
                        {/* Decorative background circle */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Gợi ý tuần này</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 relative z-10">
                            <p className="text-sm font-bold leading-tight">Bạn đang học Kanji rất tốt, hãy dành thêm thời gian luyện nghe để cân bằng kỹ năng.</p>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-primary bg-white/20" />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">Cùng 1,200 người khác</span>
                            </div>
                            <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-full h-9 text-xs font-bold uppercase tracking-widest cursor-pointer">
                                Luyện Nghe Ngay
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 px-1">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hoạt động gần đây</h3>
                        <div className="space-y-4">
                            {[
                                { action: 'Hoàn thành bài KT N4', time: '2 giờ trước', icon: CheckCircle2 },
                                { action: 'Học 30 từ vựng Kanji', time: '5 giờ trước', icon: BookOpen },
                                { action: 'Duy trì chuỗi 12 ngày', time: '12 giờ trước', icon: Target },
                            ].map((act, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <act.icon className="w-3.5 h-3.5 text-primary/60" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-foreground leading-none">{act.action}</p>
                                        <p className="text-[9px] text-muted-foreground font-medium uppercase">{act.time}</p>
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

