"use client"

import * as React from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { useGamificationProfile, useAchievements, useStreak } from '@/lib/api/services/gamification-api'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import {
    Award,
    Trophy,
    Star,
    GraduationCap,
    Flame,
    Mail,
    Calendar,
    Target,
    User,
    Flag,
    Clock,
    Zap,
    MapPin,
    LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatNumber } from '@/utils/format-utils'
import { cn } from '@workspace/ui/lib/utils'

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth)
    const { data: gamification } = useGamificationProfile()
    const { data: streak } = useStreak()
    const { data: achievementsData } = useAchievements()

    const currentXpProgress = React.useMemo(() => {
        if (!gamification) return 0
        const max = 100 * (gamification.level + 1)
        return Math.floor((gamification.currentXp / max) * 100)
    }, [gamification])

    const stats = [
        { 
            label: 'Điểm tích lũy', 
            value: formatNumber(gamification?.points || 0), 
            icon: Star, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/5' 
        },
        { 
            label: 'Chuỗi học tập', 
            value: `${streak?.currentStreak || 0} ngày`, 
            icon: Flame, 
            color: 'text-orange-500', 
            bg: 'bg-orange-500/5' 
        },
        { 
            label: 'Cấp độ', 
            value: `Level ${gamification?.level || 1}`, 
            icon: Zap, 
            color: 'text-indigo-500', 
            bg: 'bg-indigo-500/5' 
        },
        { 
            label: 'Huy hiệu', 
            value: achievementsData?.filter(a => a.isUnlocked).length || 0, 
            icon: Trophy, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-500/5' 
        },
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 px-2 sm:px-6">
            {/* Minimalist Profile Header */}
            <div className="flex flex-col items-center text-center space-y-6 pt-4 pb-2">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
                    <Avatar className="size-24 sm:size-32 rounded-[2rem] border-2 border-background shadow-2xl relative z-10 transition-transform group-hover:scale-[1.02]">
                        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName} />
                        <AvatarFallback className="bg-muted text-muted-foreground/30 text-3xl font-bold">
                            {user?.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 z-20 size-8 sm:size-10 bg-primary shadow-xl rounded-2xl flex items-center justify-center border-4 border-background">
                        <Zap className="size-4 sm:size-5 text-white fill-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground/90">{user?.displayName}</h1>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {user?.email}</span>
                        <span className="hidden sm:inline opacity-30">•</span>
                        <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> gia nhập {user?.createdAt ? formatDate(user.createdAt) : '2024'}</span>
                    </div>
                </div>
            </div>

            {/* Performance Grid Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-border/40 bg-card hover:bg-muted/5 transition-all duration-300 rounded-3xl shadow-none p-5 sm:p-6 group">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={cn("size-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", stat.bg, stat.color)}>
                                <stat.icon className="size-5 sm:size-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">{stat.label}</p>
                                <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/80">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Tabs Area */}
            <Tabs defaultValue="progress" className="w-full space-y-10">
                <div className="flex justify-center">
                    <TabsList className="bg-muted/30 p-1.5 rounded-[1.25rem] border border-border/40 h-10 sm:h-12 w-full sm:w-auto shadow-sm">
                        <TabsTrigger value="progress" className="px-5 sm:px-10 h-full rounded-xl text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">Tổng quan</TabsTrigger>
                        <TabsTrigger value="achievements" className="px-5 sm:px-10 h-full rounded-xl text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">Thành tựu</TabsTrigger>
                        <TabsTrigger value="goals" className="px-5 sm:px-10 h-full rounded-xl text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">Lộ trình</TabsTrigger>
                    </TabsList>
                </div>

                {/* --- PROGRESS TAB --- */}
                <TabsContent value="progress" className="focus-visible:outline-none animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="max-w-3xl mx-auto">
                        <Card className="border-border/40 bg-card/50 backdrop-blur-sm rounded-[2rem] shadow-none p-8 sm:p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            
                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/80 flex items-center gap-3">
                                        <Target className="size-6 text-primary" />
                                        Tiến trình thăng hạng
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                                        Bạn đang tiến rất gần đến bậc trình độ tiếp theo. <br className="hidden sm:block" />
                                        Tích lũy thêm <span className="font-bold text-primary/80">{(100 * ((gamification?.level || 1) + 1)) - (gamification?.currentXp || 0)} XP</span> để thăng hạng Level {(gamification?.level || 1) + 1}.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end px-1">
                                        <span className="text-xs font-bold text-primary/60">{currentXpProgress}% hoàn thành</span>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/30 tabular-nums">
                                            <span className="text-foreground/60">{gamification?.currentXp || 0}</span>
                                            <span>/</span>
                                            <span>{100 * ((gamification?.level || 1) + 1)} XP</span>
                                        </div>
                                    </div>
                                    <Progress value={currentXpProgress} className="h-3 bg-muted/60 rounded-full" indicatorClassName="bg-gradient-to-r from-primary/80 to-primary" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <div className="p-5 rounded-2xl bg-muted/20 border border-border/20 flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-background flex items-center justify-center text-primary border shadow-sm">
                                            <Award className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Danh hiệu</p>
                                            <p className="text-sm font-bold">Học viên tiên phong</p>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-muted/20 border border-border/20 flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-background flex items-center justify-center text-primary border shadow-sm">
                                            <Trophy className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Rank hiện tại</p>
                                            <p className="text-sm font-bold">Đồng hạng I</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- ACHIEVEMENTS TAB --- */}
                <TabsContent value="achievements" className="focus-visible:outline-none animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-center space-y-2 mb-10">
                            <h2 className="text-2xl font-bold tracking-tight">Huy hiệu & Khen thưởng</h2>
                            <p className="text-sm text-muted-foreground font-medium">Tất cả những cột mốc quan trọng bạn đã vượt qua.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {achievementsData?.filter(a => a.isUnlocked).length ? (
                                achievementsData?.filter(a => a.isUnlocked).map((achievement: any) => (
                                    <Card key={achievement.id} className="border-border/40 bg-card hover:bg-primary/5 transition-all duration-300 rounded-[1.5rem] shadow-none p-4 text-center group cursor-default">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary shadow-inner group-hover:scale-110 transition-transform">
                                                <Trophy className="size-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold leading-tight line-clamp-1">{achievement.achievement.title}</p>
                                                <p className="text-[9px] font-medium text-muted-foreground opacity-50 uppercase tracking-tighter">Đã đạt được</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-24 flex flex-col items-center justify-center text-center gap-6 bg-muted/5 border border-dashed border-border/40 rounded-[2.5rem]">
                                    <div className="size-20 rounded-3xl bg-muted/10 flex items-center justify-center text-muted-foreground/10 group">
                                        <Award className="size-10 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-foreground/40">Chưa có huy hiệu nào</p>
                                        <p className="text-xs text-muted-foreground/30 font-medium">Hãy học tập chăm chỉ để nhận được huy hiệu đầu tiên nhé!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* --- GOALS / ONBOARDING TAB --- */}
                <TabsContent value="goals" className="focus-visible:outline-none animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="max-w-4xl mx-auto">
                        <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-[2rem] shadow-none p-8 sm:p-12 space-y-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold tracking-tight text-foreground/80 flex items-center gap-3">
                                        <Flag className="size-7 text-primary" />
                                        Mục tiêu học tập
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                                        Lộ trình được thiết kế cá nhân hóa dựa trên khảo sát của bạn.
                                    </p>
                                </div>
                                {user?.onboardingSurvey && (
                                    <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-border/60 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all shadow-none">
                                        <Link href="/onboarding">Thiết lập lại</Link>
                                    </Button>
                                )}
                            </div>

                            {user?.onboardingSurvey ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { 
                                            label: 'Thời gian mục tiêu', 
                                            value: user?.onboardingSurvey?.targetCompletionTime || 'Linh hoạt',
                                            icon: Clock,
                                            color: 'text-blue-500'
                                        },
                                        {
                                            label: 'Mục đích chính',
                                            value: (() => {
                                                const p = user?.onboardingSurvey?.purpose;
                                                const map: any = {
                                                    'JLPT': 'Lấy bằng JLPT',
                                                    'Work': 'Việc làm / Sự nghiệp',
                                                    'Study': 'Học thuật / Du học',
                                                    'Travel': 'Du lịch / Sở thích',
                                                    'Communicate': 'Giao tiếp',
                                                    'Others': 'Khác'
                                                };
                                                return map[p || ''] || p || 'Khám phá';
                                            })(),
                                            icon: Target,
                                            color: 'text-red-500'
                                        },
                                        { 
                                            label: 'Dự kiến thi', 
                                            value: user?.onboardingSurvey?.jlptTargetDate ? formatDate(user.onboardingSurvey.jlptTargetDate) : 'Chưa đặt',
                                            icon: Calendar,
                                            color: 'text-amber-500'
                                        },
                                        { 
                                            label: 'Trình độ nền', 
                                            value: (() => {
                                                const cl = user?.onboardingSurvey?.currentLevel;
                                                const map: any = {
                                                    'NEVER': 'Mới bắt đầu',
                                                    'N5': 'Cơ bản (N5)',
                                                    'N4': 'Sơ cấp (N4)',
                                                    'N3': 'Trung cấp (N3)',
                                                    'N2': 'Cao cấp (N2)',
                                                    'N1': 'Nâng cao (N1)'
                                                };
                                                return map[cl || ''] || cl || 'Khởi đầu';
                                            })(),
                                            icon: GraduationCap,
                                            color: 'text-emerald-500'
                                        }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-5 p-6 bg-card/40 border border-border/40 rounded-3xl transition-all hover:bg-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 group">
                                            <div className={cn("size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border", item.color, "bg-white dark:bg-slate-900 border-border/10")}>
                                                <item.icon className="size-5" />
                                            </div>
                                            <div className="flex flex-col justify-center space-y-1">
                                                <p className="text-[10px] text-muted-foreground opacity-40 font-bold uppercase tracking-widest leading-none">{item.label}</p>
                                                <p className="text-base font-bold text-foreground/80 tracking-tight leading-tight">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center text-center gap-8 bg-muted/5 border border-dashed border-border/40 rounded-[2.5rem]">
                                    <div className="size-20 rounded-3xl bg-muted/10 flex items-center justify-center text-muted-foreground/10 group">
                                        <Target className="size-10 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="space-y-2 px-6">
                                        <h3 className="text-base font-bold text-foreground/60">Chưa có lộ trình học tập</h3>
                                        <p className="text-sm font-medium text-muted-foreground/30">Hãy hoàn thành khảo sát ngắn để Torii giúp bạn lên kế hoạch nhé!</p>
                                    </div>
                                    <Button asChild className="px-10 h-12 rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                        <Link href="/onboarding">Khởi hành ngay</Link>
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
