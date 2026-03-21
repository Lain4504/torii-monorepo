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
    CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDate } from '@/utils/format-utils'

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
        <div className="container max-w-7xl mx-auto py-8 space-y-8">
            {/* Profile Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
                <div className="relative px-8 pt-12 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
                    <Avatar className="size-32 border-4 border-background shadow-xl">
                        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                            {user?.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-black text-foreground">{user?.displayName}</h1>
                            {gamification && (
                                <Badge className="bg-primary text-white border-none px-3 py-1 font-bold">
                                    Cấp {gamification.level}
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm font-medium">
                            <span className="flex items-center gap-1.5"><Mail className="size-4" /> {user?.email}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="size-4" /> Tham gia {user?.createdAt ? formatDate(user.createdAt) : '2024'}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href="/dashboard/settings">
                            <Button variant="outline" className="rounded-xl font-bold">Chỉnh sửa hồ sơ</Button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & XP */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-8"
                >
                    {/* Level & XP */}
                    <motion.div variants={item}>
                        <Card className="rounded-2xl border-border shadow-sm overflow-hidden group">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Trophy className="size-5 text-amber-500" /> Cấp độ hiện tại
                                    </CardTitle>
                                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                        {gamification?.currentXp || 0} XP
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-primary">{gamification?.level || 1}</span>
                                    <span className="text-sm font-bold text-muted-foreground">LVL</span>
                                </div>
                                <Progress value={gamification ? (gamification.currentXp % 1000) / 10 : 0} className="h-3 bg-muted" />
                                <p className="text-xs text-muted-foreground font-medium">
                                    Cần thêm <span className="text-foreground font-bold">{gamification ? 1000 - (gamification.currentXp % 1000) : 0} XP</span> để lên cấp tiếp theo.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Stats Grid */}
                    <motion.div variants={item} className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 w-fit">
                                <Star className="size-4" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-foreground">{gamification?.points || 0}</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Điểm Torii</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 w-fit">
                                <Flame className="size-4" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-foreground">{streak?.currentStreak || 0}</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ngày học liên tiếp</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Coupons Section */}
                    <motion.div variants={item}>
                        <Card className="rounded-2xl border-border shadow-sm">
                            <CardHeader className="pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Ticket className="size-5 text-purple-500" /> Mã giảm giá ({coupons?.length || 0})
                                </CardTitle>
                                <Link href="/dashboard/rewards">
                                    <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Xem shop</Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {loadingCoupons ? (
                                    [1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
                                ) : coupons && coupons.length > 0 ? (
                                    coupons.slice(0, 3).map((coupon: any) => (
                                        <div key={coupon.id} className="p-3 border border-dashed border-border rounded-xl bg-muted/30 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-foreground">{coupon.code}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Giảm {coupon.discountValue}% • {coupon.type}</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold" onClick={() => {
                                                navigator.clipboard.writeText(coupon.code)
                                            }}>
                                                Sao chép
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 space-y-2">
                                        <p className="text-sm text-muted-foreground">Bạn chưa có mã giảm giá nào.</p>
                                        <Link href="/dashboard/rewards">
                                            <Button variant="outline" size="sm" className="rounded-lg text-xs font-bold">Đổi thưởng ngay</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Right Column: Courses, Certificates, Achievements */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="lg:col-span-2 space-y-8"
                >
                    {/* Courses Summary */}
                    <motion.div variants={item}>
                        <Card className="rounded-3xl border-border shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border pb-4 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <BookOpen className="size-5 text-blue-500" /> Khóa học đang tham gia
                                    </CardTitle>
                                    <CardDescription>Tiếp tục hành trình học tập của bạn</CardDescription>
                                </div>
                                <Link href="/dashboard/my-courses">
                                    <Button variant="ghost" size="sm" className="font-bold">Xem tất cả <ChevronRight className="size-4 ml-1" /></Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-6">
                                {loadingCourses ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                                    </div>
                                ) : courses && courses.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {courses.slice(0, 2).map((course: any) => (
                                            <div key={course.id} className="group p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all flex gap-4">
                                                <div className="size-20 bg-muted rounded-xl overflow-hidden shrink-0">
                                                    {course.thumbnailUrl ? (
                                                        <img src={course.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <BookOpen className="size-10 text-muted-foreground/30 m-auto mt-5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{course.courseTitle}</h3>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                                            <span>Tiến độ</span>
                                                            <span>{course.progress}%</span>
                                                        </div>
                                                        <Progress value={course.progress} className="h-1.5" />
                                                    </div>
                                                    <Link href={`/courses/${course.classId}/learn`}>
                                                        <Button variant="ghost" size="sm" className="h-7 px-0 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                                                            Học tiếp <ArrowUpRight className="size-3 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground mb-4">Bạn chưa đăng ký khóa học nào.</p>
                                        <Link href="/courses">
                                            <Button className="rounded-xl font-bold">Khám phá khóa học</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Middle Row: Certificates & Achievements summary */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Achievements Summary */}
                        <motion.div variants={item}>
                            <Card className="rounded-3xl border-border shadow-sm h-full">
                                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Award className="size-5 text-purple-500" /> Thành tích
                                    </CardTitle>
                                    <Link href="/dashboard/achievements">
                                        <Button variant="ghost" size="sm" className="font-bold">Tất cả</Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Đã mở khóa</span>
                                        <span className="text-foreground font-black">{achievementStats.earned} / {achievementStats.total}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {achievementsData?.filter(a => a.isUnlocked).slice(0, 4).map((achievement: any) => (
                                            <div key={achievement.id} className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm" title={achievement.achievement.title}>
                                                <Trophy className="size-6 text-primary" />
                                            </div>
                                        ))}
                                        {achievementsData?.filter(a => !a.isUnlocked).slice(0, 1).map((achievement: any) => (
                                            <div key={achievement.id} className="size-12 rounded-xl bg-muted flex items-center justify-center opacity-40 grayscale" title="Chưa mở khóa">
                                                <Star className="size-6 text-muted-foreground" />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                                        Bắt đầu học tập tích cực để mở khóa thêm nhiều huy hiệu danh giá!
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Certificates Summary */}
                        <motion.div variants={item}>
                            <Card className="rounded-3xl border-border shadow-sm h-full">
                                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <GraduationCap className="size-5 text-primary" /> Chứng chỉ
                                    </CardTitle>
                                    <Link href="/dashboard/certificates">
                                        <Button variant="ghost" size="sm" className="font-bold">Xem hết</Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loadingCerts ? (
                                        <Skeleton className="h-24 w-full rounded-2xl" />
                                    ) : certificates && certificates.length > 0 ? (
                                        <div className="space-y-3">
                                            {certificates.slice(0, 2).map((cert: any) => (
                                                <div key={cert.id} className="p-3 border border-border rounded-xl bg-muted/20 flex items-center gap-3">
                                                    <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                        <CheckCircle2 className="size-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-foreground truncate">{cert.courseRun?.courseMaster?.title}</p>
                                                        <p className="text-[10px] text-muted-foreground">{formatDate(cert.issueDate)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                                            <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-1">
                                                <Award className="size-6 text-muted-foreground/30" />
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium">Bạn chưa nhận được chứng chỉ nào.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
