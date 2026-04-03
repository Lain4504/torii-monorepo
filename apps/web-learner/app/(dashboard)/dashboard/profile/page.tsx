'use client'

import { useAppSelector } from '@/hooks/hooks'
import { useGamificationProfile, useAchievements, useStreak } from '@/lib/api/services/gamification-api'
import { useCertificates } from '@/lib/api/services/certificate-api'
import { useMyCoupons } from '@/lib/api/services/coupon-api'
import { useAcademyMyCourses } from '@/lib/api/services/academy-learning-progress-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import {
    Award,
    Trophy,
    Star,
    Ticket,
    BookOpen,
    GraduationCap,
    Flame,
    ChevronRight,
    MapPin,
    Calendar,
    Mail,
    User,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    Target
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDate, formatNumber } from '@/utils/format-utils'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth)
    const { data: gamification, isLoading: loadingGamification } = useGamificationProfile()
    const { data: streak } = useStreak()
    const { data: achievementsData, isLoading: loadingAchievements } = useAchievements()
    const { data: certsResp, isLoading: loadingCerts } = useCertificates({ limit: '3' })
    const { data: coupons, isLoading: loadingCoupons } = useMyCoupons()
    const { data: courses, isLoading: loadingCourses } = useAcademyMyCourses()

    const certificates = certsResp?.data || []

    // Calculate achievement stats
    const achievementStats = (() => {
        if (!achievementsData) return { total: 0, earned: 0 }
        return {
            total: achievementsData.length,
            earned: achievementsData.filter(a => a.isUnlocked).length
        }
    })()

    return (
        <div className="container max-w-6xl mx-auto py-8 sm:py-12 space-y-10">
            {/* Extended Profile Header */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card/50 backdrop-blur-xl shadow-2xl"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 -z-10" />
                <div className="relative px-8 sm:px-12 py-10 sm:py-14 flex flex-col md:flex-row items-center gap-8">
                    <Avatar className="size-36 sm:size-44 border-8 border-background shadow-2xl">
                        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-5xl font-black">
                            {user?.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{user?.displayName}</h1>
                            {gamification && (
                                <Badge className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-black">
                                    CẤP {gamification.level}
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground text-sm font-bold">
                            <span className="flex items-center gap-2"><Mail className="size-4 text-primary" /> {user?.email}</span>
                            <span className="flex items-center gap-2"><Calendar className="size-4 text-primary" /> Tham gia {user?.createdAt ? formatDate(user.createdAt) : '2024'}</span>
                        </div>
                    </div>


                </div>
            </motion.div>

            <Tabs defaultValue="overview" className="w-full space-y-10">
                <TabsList className="bg-muted/30 p-1.5 rounded-2xl border border-border/50 h-16 w-full overflow-hidden flex">
                    {[
                        { value: 'overview', label: 'TỔNG QUAN', icon: Trophy },
                        { value: 'courses', label: 'KHÓA HỌC', icon: BookOpen },
                        { value: 'achievements', label: 'THÀNH TỰU', icon: Award },
                        { value: 'coupons', label: 'ƯU ĐÃI', icon: Ticket },
                        { value: 'onboarding', label: 'LỘ TRÌNH', icon: Target },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex-1 px-4 py-3 rounded-xl font-black text-xs tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shrink-0"
                        >
                            <tab.icon className="size-4 mr-2" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* --- OVERVIEW TAB --- */}
                <TabsContent value="overview" className="outline-none">
                    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div variants={item} className="lg:col-span-2">
                            <Card className="rounded-[2.5rem] border-2 border-border bg-card/30 backdrop-blur-sm p-8 sm:p-12 h-full">
                                <div className="space-y-10">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black flex items-center gap-3"><Trophy className="size-7 text-amber-500" /> Hành trình học tập</h2>
                                        <Badge variant="outline" className="px-4 py-1.5 rounded-xl font-black text-primary border-primary/20">{gamification?.currentXp || 0} XP</Badge>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-10">
                                        <div className="relative size-40 shrink-0 flex flex-col items-center justify-center rounded-full bg-primary/5 border-4 border-primary/10">
                                            <span className="text-7xl font-black text-primary leading-none">{gamification?.level || 1}</span>
                                            <span className="text-[10px] font-black text-muted-foreground tracking-widest mt-1">CẤP ĐỘ</span>
                                        </div>
                                        <div className="flex-1 space-y-6 w-full">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-xs font-black text-muted-foreground uppercase tracking-wider">
                                                    <span>Tiến trình hiện tại</span>
                                                    <span className="text-foreground">{Math.floor(gamification ? (gamification.currentXp % 1000) / 10 : 0)}%</span>
                                                </div>
                                                <Progress value={gamification ? (gamification.currentXp % 1000) / 10 : 0} className="h-4 rounded-full bg-muted/50 border" />
                                            </div>
                                            <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
                                                * Bạn chỉ còn cách cấp độ tiếp theo <span className="text-primary font-black underline underline-offset-4">{gamification ? 1000 - (gamification.currentXp % 1000) : 0} XP</span>. Hãy bền bỉ nhé!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div variants={item} className="grid gap-6">
                            {[
                                { icon: Star, label: 'ĐIỂM TORII', value: gamification?.points || 0, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { icon: Flame, label: 'HỌC LIÊN TIẾP', value: streak?.currentStreak || 0, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                            ].map((stat, i) => (
                                <div key={i} className="p-8 rounded-[2rem] border-2 border-border bg-card shadow-lg flex items-center justify-between group hover:-translate-y-1 transition-transform">
                                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}><stat.icon className="size-8" /></div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-foreground">{stat.value}</p>
                                        <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mt-1">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </TabsContent>

                {/* --- COURSES TAB --- */}
                <TabsContent value="courses" className="outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
                        {loadingCourses ? (
                            [1, 2].map(i => <Skeleton key={i} className="h-56 w-full rounded-[2.5rem]" />)
                        ) : courses && courses.length > 0 ? (
                            courses.map((course: any) => (
                                <Card key={course.id} className="group rounded-[2.5rem] border-2 border-border bg-card/50 hover:border-primary/40 transition-all overflow-hidden flex flex-col sm:flex-row gap-6 p-6">
                                    <div className="size-36 sm:size-44 bg-muted rounded-2xl overflow-hidden shrink-0 shadow-lg relative">
                                        {course.thumbnailUrl ? (
                                            <img src={course.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20"><BookOpen className="size-12" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                        <div className="space-y-3">
                                            <h3 className="text-xl font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors">{course.courseTitle}</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                                    <span>Tiến độ</span>
                                                    <span className="text-primary">{course.progress}%</span>
                                                </div>
                                                <Progress value={course.progress} className="h-2 rounded-full" />
                                            </div>
                                        </div>
                                        <Link href={`/courses/${course.classId}/learn`} className="mt-6">
                                            <Button className="w-full rounded-xl font-black text-xs h-10 tracking-widest">HỌC TIẾP</Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="md:col-span-2 py-24 text-center bg-muted/10 rounded-[3rem] border-4 border-dashed border-border/50">
                                <BookOpen className="size-20 text-muted-foreground/20 mx-auto mb-6" />
                                <p className="text-xl font-black text-muted-foreground">Bạn chưa đăng ký khóa học nào.</p>
                            </div>
                        )}
                    </motion.div>
                </TabsContent>

                {/* --- ACHIEVEMENTS TAB --- */}
                <TabsContent value="achievements" className="outline-none">
                    <div className="grid lg:grid-cols-2 gap-10">
                        <Card className="rounded-[2.5rem] border-2 border-border bg-card p-10 space-y-10">
                            <h2 className="text-2xl font-black flex items-center gap-4"><Award className="size-6 text-purple-500" /> Huy hiệu vinh danh</h2>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-5">
                                {achievementsData?.filter(a => a.isUnlocked).map((achievement: any) => (
                                    <motion.div key={achievement.id} whileHover={{ scale: 1.1, rotate: 10 }} className="aspect-square rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg cursor-help" title={achievement.achievement.title}>
                                        <Trophy className="size-10 text-primary" />
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                        <Card className="rounded-[2.5rem] border-2 border-border bg-card p-10 space-y-10">
                            <h2 className="text-2xl font-black flex items-center gap-4"><GraduationCap className="size-6 text-primary" /> Chứng chỉ đã đạt</h2>
                            <div className="space-y-4">
                                {certificates.map((cert: any) => (
                                    <div key={cert.id} className="p-5 border border-border rounded-2xl bg-muted/20 flex items-center gap-5 hover:bg-muted/30 transition-colors">
                                        <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20"><CheckCircle2 className="size-6" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-foreground truncate">{cert.courseRun?.courseMaster?.title}</p>
                                            <p className="text-xs font-bold text-muted-foreground uppercase">{formatDate(cert.issueDate)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- COUPONS TAB --- */}
                <TabsContent value="coupons" className="outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="rounded-[3rem] border-2 border-border bg-card/40 backdrop-blur-md p-10 sm:p-14">
                            {loadingCoupons ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />)}
                                </div>
                            ) : coupons && coupons.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {coupons.map((coupon: any) => (
                                        <div key={coupon.id} className="group p-8 border-2 border-dashed border-primary/30 rounded-[2rem] bg-primary/5 flex flex-col items-center text-center space-y-6 hover:border-primary transition-all">
                                            <div className="size-16 rounded-full bg-white flex items-center justify-center text-primary shadow-xl relative overflow-hidden group-hover:scale-110 transition-transform">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Ticket className="size-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-black text-foreground tracking-tight">{coupon.code}</p>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-mono text-center">
                                                    {(() => {
                                                        const discType = String(coupon.discountType || '').toUpperCase();
                                                        const val = Number(coupon.discountValue || coupon.discountAmount || 0);
                                                        const isPerc = discType.includes('PERCENT');
                                                        const formattedVal = isPerc ? `${val}%` : `${formatNumber(val)}đ`;
                                                        return `${isPerc ? 'Giảm phần trăm' : 'Giảm trực tiếp'} • ${formattedVal}`;
                                                    })()}
                                                </p>
                                            </div>
                                            <Button variant="outline" className="w-full rounded-xl border-2 font-black text-xs h-10" onClick={() => navigator.clipboard.writeText(coupon.code)}>SAO CHÉP</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <Ticket className="size-20 text-muted-foreground/20 mx-auto mb-6" />
                                    <p className="text-xl font-black text-muted-foreground">Bạn chưa sở hữu mã ưu đãi nào.</p>
                                    <p className="text-sm font-bold text-muted-foreground/60 mt-2 italic">Tích lũy điểm Torii để đổi ưu đãi nhé!</p>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* --- ONBOARDING TAB --- */}
                <TabsContent value="onboarding" className="outline-none">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="rounded-[3rem] border-2 border-border bg-card/40 backdrop-blur-md p-10 sm:p-14">
                            {user?.onboardingSurvey ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[
                                        { icon: Target, label: 'Thời gian mục tiêu', value: user?.onboardingSurvey?.targetCompletionTime || 'Càng nhanh càng tốt' },
                                        {
                                            icon: Trophy,
                                            label: 'Lý do học tập',
                                            value: (() => {
                                                const p = user?.onboardingSurvey?.purpose;
                                                const map: any = {
                                                    'JLPT': 'Thi JLPT',
                                                    'Work': 'Đi làm IT / Công ty Nhật',
                                                    'Study': 'Du học',
                                                    'Travel': 'Sở thích / Du lịch',
                                                    'Communicate': 'Giao tiếp cơ bản',
                                                    'Others': 'Lý do khác'
                                                };
                                                return map[p || ''] || p || 'Khám phá';
                                            })()
                                        },
                                        { icon: Calendar, label: 'Dự kiến thi', value: user?.onboardingSurvey?.jlptTargetDate ? formatDate(user.onboardingSurvey.jlptTargetDate) : 'Chưa quyết định' },
                                        { icon: Clock, label: 'Thời lượng mỗi ngày', value: (user?.onboardingSurvey as any)?.studyTimePerSession || 'Chưa đặt' },
                                        {
                                            icon: Award,
                                            label: 'Trình độ xuất phát',
                                            value: (() => {
                                                const cl = user?.onboardingSurvey?.currentLevel;
                                                const map: any = {
                                                    'NEVER': 'Chưa biết gì',
                                                    'N5': 'Biết bảng chữ cái Hiragana/Katakana',
                                                    'N4': 'Đã học cơ bản (N5–N4)',
                                                    'N3': 'Trung cấp (N3)',
                                                    'N2': 'Nâng cao (N2–N1)',
                                                    'N1': 'Nâng cao (N2–N1)'
                                                };
                                                return map[cl || ''] || cl || 'Chưa biết gì';
                                            })()
                                        },
                                        {
                                            icon: Star,
                                            label: 'Mục tiêu học tập',
                                            value: (() => {
                                                const currentTechnical = user?.onboardingSurvey?.currentLevel || 'NEVER';
                                                const map: Record<string, string> = {
                                                    'NEVER': 'N5',
                                                    'N5': 'N5+',
                                                    'N4': 'N3',
                                                    'N3': 'N2',
                                                    'N2': 'N1',
                                                    'N1': 'N1+',
                                                };
                                                return map[currentTechnical] || 'N5';
                                            })()
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="p-8 rounded-[2rem] border-2 border-border bg-card shadow-lg flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform">
                                            <div className="p-4 rounded-2xl bg-primary/10 text-primary"><item.icon className="size-8" /></div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-black text-foreground line-clamp-1">{item.value}</p>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <Target className="size-20 text-muted-foreground/20 mx-auto mb-6" />
                                    <p className="text-xl font-black text-muted-foreground">Bạn chưa hoàn thành khảo sát lộ trình.</p>
                                    <Link href="/onboarding" className="mt-6 inline-block">
                                        <Button className="rounded-xl font-black px-8 py-6 h-auto text-lg hover:scale-105 transition-transform">XÂY DỰNG LỘ TRÌNH NGAY</Button>
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
