"use client"

import * as React from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { useGamificationProfile, useAchievements, useStreak } from '@/lib/api/services/gamification-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import Link from 'next/link'
import {
    Award,
    Trophy,
    Calendar,
    Target,
    GraduationCap,
    Clock,
    Flag,
    User,
    Shield
} from 'lucide-react'
import { formatDate, formatNumber } from '@/utils/format-utils'

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

    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-6 animate-in fade-in duration-500">
            {/* Standard Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b">
                <Avatar className="size-20 rounded-md border border-border">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                        {user?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-4 w-full">
                    <div className="space-y-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h1 className="text-2xl font-semibold">{user?.displayName}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Badge variant="secondary">Level {gamification?.level || 1}</Badge>
                                {user?.role === 'admin' && <Badge className="bg-destructive/10 text-destructive border-none"><Shield className="size-3 mr-1" /> Admin</Badge>}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {user?.email} • Hoạt động từ {user?.createdAt ? formatDate(user.createdAt) : '2024'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3 rounded-md border bg-card space-y-1">
                            <p className="text-[11px] text-muted-foreground">Kinh nghiệm</p>
                            <p className="text-lg font-medium">{formatNumber(gamification?.currentXp || 0)} <span className="text-[10px] text-muted-foreground">XP</span></p>
                        </div>
                        <div className="p-3 rounded-md border bg-card space-y-1">
                            <p className="text-[11px] text-muted-foreground">Điểm thưởng</p>
                            <p className="text-lg font-medium">{formatNumber(gamification?.points || 0)} <span className="text-[10px] text-muted-foreground">PTS</span></p>
                        </div>
                        <div className="p-3 rounded-md border bg-card space-y-1">
                            <p className="text-[11px] text-muted-foreground">Chuỗi học tập</p>
                            <p className="text-lg font-medium">{streak?.currentStreak || 0} <span className="text-[10px] text-muted-foreground">Ngày</span></p>
                        </div>
                        <div className="p-3 rounded-md border bg-card space-y-1">
                            <p className="text-[11px] text-muted-foreground">Thành tựu</p>
                            <p className="text-lg font-medium">{achievementsData?.filter(a => a.isUnlocked).length || 0} <span className="text-[10px] text-muted-foreground">Huy hiệu</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full space-y-4">
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList>
                        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                        <TabsTrigger value="achievements">Bộ sưu tập huy hiệu</TabsTrigger>
                        <TabsTrigger value="onboarding">Lộ trình học tập</TabsTrigger>
                    </TabsList>
                </ScrollArea>

                {/* --- OVERVIEW TAB --- */}
                <TabsContent value="overview" className="focus-visible:outline-none">
                    <ScrollArea className="max-h-[65vh] pr-3">
                    <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-none">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Target className="size-4 text-primary" />
                                        Mục tiêu Cấp {(gamification?.level || 1) + 1}
                                    </CardTitle>
                                    <Badge variant="outline">{currentXpProgress}%</Badge>
                                </div>
                                <CardDescription className="text-xs">Tiến trình đạt cấp độ tiếp theo</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Progress value={currentXpProgress} className="h-2" />
                                <p className="text-[11px] text-muted-foreground text-center">
                                    Cần tích lũy thêm {(100 * ((gamification?.level || 1) + 1)) - (gamification?.currentXp || 0)} XP
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-none flex flex-col justify-center p-6">
                            <div className="flex items-center gap-5">
                                <div className="size-12 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <Award className="size-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Thành tích học tập</p>
                                    <p className="text-xs text-muted-foreground">
                                        Bạn đã xuất sắc mở khóa {achievementsData?.filter(a => a.isUnlocked).length || 0} huy hiệu danh dự trong quá trình rèn luyện tại Torii.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    </div>
                    </ScrollArea>
                </TabsContent>

                {/* --- ACHIEVEMENTS TAB --- */}
                <TabsContent value="achievements" className="focus-visible:outline-none">
                    <ScrollArea className="max-h-[65vh] pr-3">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Huy hiệu đã đạt được</CardTitle>
                            <CardDescription>Các cột mốc quan trọng bạn đã vượt qua</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                {achievementsData?.filter(a => a.isUnlocked).length ? (
                                    achievementsData?.filter(a => a.isUnlocked).map((achievement: any) => (
                                        <div key={achievement.id} className="aspect-square bg-muted/20 rounded-md flex items-center justify-center border group relative cursor-help transition-all hover:bg-primary/5 hover:border-primary/20" title={achievement.achievement.title}>
                                            <Trophy className="size-7 text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-3 opacity-30">
                                        <Trophy className="size-10" />
                                        <p className="text-xs">Chưa có huy hiệu nào</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    </ScrollArea>
                </TabsContent>

                {/* --- ONBOARDING TAB --- */}
                <TabsContent value="onboarding" className="focus-visible:outline-none">
                    <ScrollArea className="max-h-[65vh] pr-3">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Lộ trình học cá nhân</CardTitle>
                            <CardDescription>Các thông số mục tiêu bạn đã thiết lập</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user?.onboardingSurvey ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Thời gian mục tiêu', value: user?.onboardingSurvey?.targetCompletionTime || 'Linh hoạt', icon: <Clock className="size-4" /> },
                                        { 
                                            label: 'Mục đích chính', 
                                            value: (() => {
                                                const p = user?.onboardingSurvey?.purpose;
                                                const map: any = { 'JLPT': 'Lấy bằng JLPT', 'Work': 'Việc làm / Sự nghiệp', 'Study': 'Học thuật / Du học', 'Travel': 'Du lịch / Sở thích', 'Communicate': 'Giao tiếp', 'Others': 'Khác' };
                                                return map[p || ''] || p || 'Khám phá';
                                            })(),
                                            icon: <Flag className="size-4" />
                                        },
                                        { label: 'Dự kiến thi', value: user?.onboardingSurvey?.jlptTargetDate ? formatDate(user.onboardingSurvey.jlptTargetDate) : 'Chưa đặt', icon: <Calendar className="size-4" /> },
                                        { 
                                            label: 'Trình độ nền', 
                                            value: (() => {
                                                const cl = user?.onboardingSurvey?.currentLevel;
                                                const map: any = { 'NEVER': 'Mới bắt đầu', 'N5': 'Cơ bản (N5)', 'N4': 'Sơ cấp (N4)', 'N3': 'Trung cấp (N3)', 'N2': 'Cao cấp (N2)', 'N1': 'Nâng cao (N1)' };
                                                return map[cl || ''] || cl || 'Khởi đầu';
                                            })(),
                                            icon: <GraduationCap className="size-4" />
                                        }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-md border bg-card hover:bg-muted/5 transition-all group">
                                            <div className="size-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground/60 group-hover:text-primary group-hover:bg-primary/5 transition-all border border-border/10">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                                                <p className="text-sm font-medium">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
                                    <div className="size-16 rounded-md bg-muted/20 flex items-center justify-center text-muted-foreground/20">
                                        <Target className="size-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Chưa thiết lập lộ trình</p>
                                        <p className="text-xs text-muted-foreground max-w-[200px]">Hoàn thành khảo sát để Torii đề xuất lộ trình phù hợp với bạn.</p>
                                    </div>
                                    <Button asChild variant="default" size="sm">
                                        <Link href="/onboarding">Bắt đầu ngay</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    )
}
