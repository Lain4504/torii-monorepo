'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/hooks/hooks';
import { academyLearningProgressApi, useAcademyMyCourses, useAcademyLearningHistory, useAcademyLearningStats } from '@/lib/api/services/academy-learning-progress-api';

import { useGamificationProfile, useStreak, useAchievements } from '@/lib/api/services/gamification-api';
import { useMySchedule } from '@/lib/api/services/academy-live-session-api';
import Link from 'next/link';
import { formatDistanceToNow, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
    BookOpen, Clock, Calendar, CalendarDays, Video, Shield,
    Sparkles, ArrowRight, Users,
    Trophy, Newspaper, HelpCircle, GraduationCap,
    Star, Bot, Hand, Flame, BookMarked, Gift, Medal, Award, BarChart3
} from 'lucide-react';
import { LiveSessionStatus, UserRole } from '@workspace/schemas';
import { StreakWelcomeModal } from '@/components/dashboard/streak-welcome-modal';
import { LearnerRoadmapSection } from '@/components/dashboard/learner-roadmap-section';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { cn } from '@workspace/ui/lib/utils';


function formatDuration(seconds: number): string {
    if (!seconds) return '0 phút';
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} phút`;
    return `${Math.floor(m / 60)}h ${m % 60}p`;
}

function formatScheduledAt(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('vi-VN', { weekday: 'short', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

function getSessionLiveClassId(session: { liveClassId?: string; classId?: string }): string | undefined {
    return session.liveClassId || session.classId;
}

function GuestLandingPage() {
    return (
        <div className="space-y-24 pb-20 -mt-6">
            {/* 1. Hero Section - Stunning & Bold */}
            <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden rounded-2xl border shadow-2xl shadow-primary/5">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop"
                        alt="Torii Nihongo Hero" 
                        className="w-full h-full object-cover transition-transform duration-[20s] hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                </div>
                
                <div className="relative z-10 w-full px-8 md:px-16 py-20">
                    <div className="max-w-3xl space-y-8">
                        <div className="space-y-4">
                            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md px-4 py-1.5 rounded-lg font-semibold text-[10px]">
                                🌟 Nền tảng học tiếng Nhật 4.0
                            </Badge>
                            <h1 className="text-4xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                                Chinh phục JLPT <br />
                                <span className="text-primary">vượt trội cùng AI.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed max-w-2xl">
                                Lộ trình học toàn diện N5-N1 kết hợp cùng gia sư AI Sensei hỗ trợ 24/7. 
                                Cùng <span className="text-white font-bold underline underline-offset-4 decoration-primary">5,000+ học viên</span> bắt đầu hành trình ngay hôm nay.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button size="lg" className="h-16 px-10 rounded-xl font-bold text-lg shadow-2xl shadow-primary/40 group bg-primary hover:bg-primary/90" asChild>
                                <Link href="/register">
                                    Bắt đầu miễn phí <ArrowRight className="ml-2 size-6 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 px-10 rounded-xl font-bold text-lg bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-black transition-all" asChild>
                                <Link href="/dashboard/available-courses">Khám phá khóa học</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Trust & Numbers Section */}
            <section className="px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {[
                        { label: 'Học viên tin dùng', value: '5,000+', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Bài giảng chất lượng', value: '1,200+', icon: BookOpen, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                        { label: 'Tỷ lệ đỗ JLPT', value: '98%', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                        { label: 'Gia sư AI hỗ trợ', value: '24/7', icon: Bot, color: 'text-primary', bg: 'bg-primary/10' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center text-center space-y-3 group cursor-default">
                            <div className={cn("p-5 rounded-2xl border border-transparent group-hover:border-border group-hover:bg-muted/30 transition-all duration-500", stat.bg, stat.color)}>
                                <stat.icon className="size-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl md:text-4xl font-bold tracking-tight">{stat.value}</p>
                                <p className="text-[10px] font-semibold text-muted-foreground/50">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Core Features - High Impact Grid */}
            <section className="space-y-12 px-4">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">Tại sao chọn Torii Academy?</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">Sự kết hợp hoàn hảo giữa phương pháp đào tạo truyền thống và công nghệ trí tuệ nhân tạo đột phá.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'Lộ trình chuẩn quốc tế',
                            desc: 'Hệ thống bài giảng từ N5 đến N1 được tinh gọn, tập trung vào thực hành và phản xạ tự nhiên.',
                            icon: GraduationCap,
                            color: 'bg-orange-500',
                            img: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=1936&auto=format&fit=crop'
                        },
                        {
                            title: 'AI Sensei Đồng hành',
                            desc: 'Giải đáp mọi thắc mắc ngữ pháp, chỉnh sửa phát âm và luyện hội thoại bất kỳ lúc nào bạn muốn.',
                            icon: Bot,
                            color: 'bg-primary',
                            img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop'
                        },
                        {
                            title: 'Học mọi lúc, mọi nơi',
                            desc: 'Đồng bộ hóa tiến trình học trên mọi thiết bị. Học qua Web hoặc App mobile cực kỳ tiện lợi.',
                            icon: Sparkles,
                            color: 'bg-blue-500',
                            img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop'
                        }
                    ].map((feature, i) => (
                        <Card key={i} className="group overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-lg shadow-primary/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                            <div className="relative h-56 overflow-hidden">
                                <img src={feature.img} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                <div className={cn("absolute bottom-6 left-6 p-4 rounded-2xl text-white shadow-2xl", feature.color)}>
                                    <feature.icon className="size-6" />
                                </div>
                            </div>
                            <CardHeader className="pt-4 flex-1">
                                <CardTitle className="text-2xl font-bold mb-2">{feature.title}</CardTitle>
                                <CardDescription className="text-md leading-relaxed text-muted-foreground font-medium">
                                    {feature.desc}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <Button variant="ghost" className="p-0 font-bold text-primary hover:bg-transparent group/btn" asChild>
                                    <Link href="/register">Xem chi tiết <ArrowRight className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" /></Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 4. Testimonials Section - Social Proof */}
            <section className="py-24 -mx-4 px-8 rounded-2xl space-y-16 bg-muted/30">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-1 text-yellow-500">
                                {[...Array(5)].map((_, i) => <Star key={i} className="size-5 fill-yellow-500" />)}
                            </div>
                            <h2 className="text-3xl md:text-6xl font-bold tracking-tight leading-tight">Học viên nói gì về Torii?</h2>
                            <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl font-medium">Hàng ngàn phản hồi tích cực từ cộng đồng học tập tiếng Nhật lớn nhất hiện nay.</p>
                        </div>
                        <Button size="lg" variant="outline" className="rounded-xl font-bold h-16 px-10 border-border bg-card shadow-sm hover:shadow-md transition-all shrink-0" asChild>
                            <Link href="/dashboard/available-courses">Đăng ký tham gia ngay</Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Hoàng Minh',
                                role: 'Học viên N3',
                                content: 'Giao diện cực kỳ hiện đại và chuyên nghiệp. Đặc biệt là AI Sensei trả lời ngữ pháp rất thông minh, giúp mình học nhanh hơn gấp 2 lần.',
                                avatar: 'https://i.pravatar.cc/150?u=1'
                            },
                            {
                                name: 'Linh Chi',
                                role: 'Học viên N2',
                                content: 'Các buổi Live session rất thú vị, giảng viên tận tâm và giáo trình tinh gọn. Mình đã đỗ N2 ngay lần thi đầu tiên nhờ Torii.',
                                avatar: 'https://i.pravatar.cc/150?u=2'
                            },
                            {
                                name: 'Duy Anh',
                                role: 'Học viên N4',
                                content: 'Hệ thống học liệu phong phú và lộ trình rõ ràng. Phù hợp cho những người bận rộn muốn học tiếng Nhật linh hoạt.',
                                avatar: 'https://i.pravatar.cc/150?u=3'
                            }
                        ].map((review, i) => (
                            <Card key={i} className="p-10 rounded-2xl border-none bg-card shadow-xl shadow-primary/5 relative group hover:shadow-primary/10 transition-shadow">
                                <Star className="absolute top-10 right-10 size-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <Avatar className="h-14 w-14 ring-4 ring-primary/5">
                                            <AvatarImage src={review.avatar} />
                                            <AvatarFallback className="font-bold">{review.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-xl leading-none">{review.name}</p>
                                            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-2">{review.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-lg leading-relaxed font-medium italic">"{review.content}"</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Final CTA - Converting Section */}
            <section className="px-4">
                <div className="relative overflow-hidden rounded-2xl bg-foreground p-12 md:p-24 text-center space-y-10 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute -top-20 -left-20 size-96 bg-primary rounded-full blur-[120px]" />
                        <div className="absolute -bottom-20 -right-20 size-[30rem] bg-indigo-500 rounded-full blur-[150px]" />
                    </div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-7xl font-bold text-background leading-[1.1] tracking-tight">
                            Sẵn sàng khởi đầu <br className="hidden md:block" /> hành trình của bạn?
                        </h2>
                        <p className="text-xl md:text-2xl text-background/70 font-medium max-w-2xl mx-auto">
                            Đăng ký ngay để nhận lộ trình tư vấn miễn phí và trải nghiệm hệ sinh thái học tập thông minh bậc nhất.
                        </p>
                        <div className="pt-6">
                            <Button size="lg" className="h-20 px-16 rounded-xl font-bold text-2xl shadow-2xl group bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all" asChild>
                                <Link href="/register">
                                    Khám phá ngay <ArrowRight className="ml-3 size-8 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}


function AuthenticatedDashboardPage() {
    const { user } = useAppSelector((state) => state.auth);

    const { data: courses, isLoading: coursesLoading } = useAcademyMyCourses();
    const { data: statsData } = useAcademyLearningStats();
    const { data: streak } = useStreak();
    const { data: profile } = useGamificationProfile();
    const { data: achievements } = useAchievements();
    const { data: history } = useAcademyLearningHistory();
    const { data: schedule } = useMySchedule();

    const startDate = subDays(new Date(), 365);
    const endDate = new Date();

    const mainCourse = courses?.[0];

    // Stats mapping for Academy
    const totalCourses = statsData?.totalCourses ?? courses?.length ?? 0;
    const totalHours = statsData?.totalLearningHours ?? 0;
    const currentStreak = streak?.currentStreak ?? 0;
    const streakSavedByFreeze = (streak as any)?.streakSavedByFreeze === true;
    const avgProgress = statsData?.averageProgress ?? 0;

    // Level XP
    const level = profile?.level ?? 1;
    const totalXp = profile?.totalXp ?? 0;
    const points = profile?.points ?? 0;
    const currentXpInLevel = profile?.currentXp ?? 0;
    const xpNeededForNextLevel = 100 * (level + 1);
    const xpProgress = Math.min(100, (currentXpInLevel / xpNeededForNextLevel) * 100);

    // Achievements count
    const achievementCount = achievements?.length ?? 0;

    // Upcoming sessions (non-ended, scheduled/live, sorted by scheduledAt)
    const upcomingSessions = (schedule ?? [])
        .filter(s => s.status === LiveSessionStatus.SCHEDULED || s.status === LiveSessionStatus.LIVE)
        .slice(0, 3);

    // Recent history (last 3 items)
    const recentHistory = (history ?? []).slice(0, 3);

    // Progress ring for avg progress
    const progressPercent = avgProgress;
    const ringRadius = 54;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference - (ringCircumference * progressPercent) / 100;

    const jlptTarget = (user?.userMetadata as Record<string, string>)?.jlptTarget || 'N3';
    const firstName = user?.displayName?.split(' ').at(-1) || 'Học viên';

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <style jsx>{`
                .hover-lift { transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; }
                .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }
                .progress-ring-circle { transition: stroke-dashoffset 0.35s; transform: rotate(-90deg); transform-origin: 50% 50%; }
            `}</style>

            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-purpose="welcome-section">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Chào mừng trở lại, {firstName}! <Hand className="inline-block size-6 translate-y-0.5" />
                    </h1>
                    <p className="text-muted-foreground">Hôm nay là một ngày tuyệt vời để học tiếng Nhật.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-semibold">{totalCourses} Khóa học</span>
                    </div>
                    <div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="text-sm font-semibold">{totalHours}h Giờ học</span>
                    </div>
                    {currentStreak > 0 && (
                        <div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <Flame className="size-4 text-red-500" />
                                {currentStreak} Ngày liên tiếp
                            </span>
                        </div>
                    )}
                    {avgProgress > 0 && (
                        <div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-semibold">{avgProgress}% Tiến độ</span>
                        </div>
                    )}
                </div>
            </header>

            {(courses?.length ?? 0) > 0 && (
                <LearnerRoadmapSection hasEnrollment />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <main className="lg:col-span-2 space-y-8">
                    {streakSavedByFreeze && (
                        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-2xl animate-in slide-in-from-top duration-500">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 fill-blue-500/10" />
                            <AlertTitle className="text-blue-800 dark:text-blue-300 font-bold ml-2">Lá chắn đã được kích hoạt!</AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-400 ml-2">
                                Hôm nay chuỗi <strong>{currentStreak} ngày streak</strong> của bạn đã được bảo vệ thành công. Hãy học tập ngay để duy trì phong độ nhé!
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Current Course Card */}
                    <section data-purpose="current-course">
                        {coursesLoading ? (
                            <div className="bg-card rounded-2xl border border-border h-48 animate-pulse" />
                        ) : mainCourse ? (
                            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover-lift">
                                <div className="md:flex">
                                    <div className="md:w-1/3 relative aspect-video md:aspect-[4/3] overflow-hidden bg-muted">
                                        {mainCourse.thumbnailUrl ? (
                                            <img
                                                alt={mainCourse.courseTitle}
                                                className="w-full h-full object-cover"
                                                src={mainCourse.thumbnailUrl}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="size-12 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                                            {jlptTarget}
                                        </span>
                                    </div>
                                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-xl font-bold line-clamp-2">{mainCourse.courseTitle}</h2>
                                                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded ml-2 shrink-0">Đang học</span>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-4">
                                                {mainCourse.instructorName && `GV: ${mainCourse.instructorName} • `}
                                                {mainCourse.completedLessons}/{mainCourse.totalLessons} bài học
                                            </p>
                                            <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                                                <div
                                                    className="bg-primary h-2.5 rounded-full transition-all duration-700"
                                                    style={{ width: `${mainCourse.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                                                <span>{mainCourse.progress}% Hoàn thành</span>
                                                <span>{mainCourse.completedLessons}/{mainCourse.totalLessons} bài học</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={(mainCourse as any).liveClassId 
                                                ? `/dashboard/my-courses/${(mainCourse as any).liveClassId}` 
                                                : `/courses/${(mainCourse as any).liveClassId ?? (mainCourse as any).vodPackageId ?? (mainCourse as any).courseProfileId ?? mainCourse.id}/learn`}
                                            className="mt-6 w-full md:max-w-max px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] text-center text-sm"
                                        >
                                            Tiếp tục học tập
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center flex flex-col items-center">
                                <BookOpen className="size-12 text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Bạn chưa bắt đầu khóa học nào</h3>
                                <p className="text-muted-foreground mb-6">Khám phá kho khóa học để bắt đầu hành trình chinh phục tiếng Nhật.</p>
                                <Link href="/dashboard/available-courses" className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                                    Khám phá khóa học
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Analytics & Progress */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6" data-purpose="analytics">
                        {/* Circular Goal Tracker */}
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                            <h3 className="font-bold mb-6">Mục tiêu {jlptTarget}</h3>
                            <div className="flex items-center justify-around">
                                <div className="relative flex items-center justify-center">
                                    <svg className="w-32 h-32">
                                        <circle className="text-muted" cx="64" cy="64" fill="transparent" r={ringRadius} stroke="currentColor" strokeWidth="8" />
                                        <circle
                                            className="text-primary progress-ring-circle"
                                            cx="64" cy="64"
                                            fill="transparent"
                                            r={ringRadius}
                                            stroke="currentColor"
                                            strokeDasharray={ringCircumference.toFixed(2)}
                                            strokeDashoffset={ringOffset.toFixed(2)}
                                            strokeLinecap="round"
                                            strokeWidth="8"
                                        />
                                    </svg>
                                    <div className="absolute text-center">
                                        <span className="block text-2xl font-bold">{progressPercent}%</span>
                                        <span className="text-[10px] text-muted-foreground font-semibold">Sẵn sàng</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-semibold">Giờ học</div>
                                        <div className="text-lg font-bold">{totalHours}h</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-semibold">Kinh nghiệm (XP)</div>
                                        <div className="text-lg font-bold">{totalXp.toLocaleString('vi-VN')} XP</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-semibold">Điểm thưởng (Point)</div>
                                        <div className="text-lg font-bold text-primary">{points.toLocaleString('vi-VN')} P</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skill bars — giữ nguyên UI, data từ averageProgress */}
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                            <h3 className="font-bold mb-2">Kỹ năng chi tiết</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Từ vựng</span>
                                    <span>{Math.min(100, avgProgress + 15)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, avgProgress + 15)}%` }} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Ngữ pháp</span>
                                    <span>{avgProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${avgProgress}%` }} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Hán tự (Kanji)</span>
                                    <span>{Math.max(0, avgProgress - 15)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.max(0, avgProgress - 15)}%` }} />
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground pt-2">
                                * Dựa trên tiến độ khóa học tổng quát
                            </p>
                        </div>
                    </section>

                    {/* Upcoming Live Sessions (nếu có) */}
                    {upcomingSessions.length > 0 && (
                        <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm" data-purpose="upcoming-sessions">
                            <div className="p-5 border-b border-border flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                                        <Video className="size-4" />
                                    </div>
                                    <h3 className="font-bold">Lớp học trực tuyến sắp tới</h3>
                                </div>
                                <Link href="/dashboard/schedule" className="p-2 hover:bg-accent rounded-full transition-colors">
                                    <Calendar className="size-4" />
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-muted/30">
                                            <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground/60">Chủ đề</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground/60">Giảng viên</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground/60">Thời gian</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold text-muted-foreground/60 text-right">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {upcomingSessions.map((session) => (
                                            <tr key={session.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-2 rounded-full ${session.status === LiveSessionStatus.LIVE ? 'bg-green-500 animate-pulse' : 'bg-primary'}`} />
                                                        <span className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-1">{session.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {session.lecturer?.avatarUrl && (
                                                            <img src={session.lecturer.avatarUrl} alt="" className="size-6 rounded-full object-cover ring-2 ring-border" />
                                                        )}
                                                        <span className="text-sm text-muted-foreground">{session.lecturer?.displayName ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium">{formatScheduledAt(session.scheduledAt)}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {session.status === LiveSessionStatus.LIVE ? (
                                                        <Link
                                                            href={`/dashboard/my-courses/${getSessionLiveClassId(session)}`}
                                                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-xs transition-colors"
                                                        >
                                                            Tham gia ngay
                                                        </Link>
                                                    ) : (
                                                        <span className="px-3 py-1.5 bg-muted text-muted-foreground font-bold rounded-lg text-xs">
                                                            Sắp diễn ra
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                    {/* Recent Activity (Moved from bottom to fit on the left of quick links) */}
                    <section className="bg-card p-5 rounded-2xl border border-border shadow-sm" data-purpose="recent-activity">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold">Hoạt động gần đây</h3>
                        </div>

                        {recentHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-muted-foreground text-xs">Chưa có hoạt động học tập nào.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] text-muted-foreground/60 font-semibold border-b border-border">
                                            <th className="pb-3 px-2">Bài học</th>
                                            <th className="pb-3 px-2">Khóa học</th>
                                            <th className="pb-3 px-2">Tiến độ</th>
                                            <th className="pb-3 px-2 text-right">Ngày thực hiện</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs">
                                        {recentHistory.map((item: any) => (
                                            <tr key={item.id} className="border-b last:border-0 border-border hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-2 font-bold">
                                                    <Link href={`/courses/${item.classId}/learn?lesson=${item.lessonId}`} className="hover:text-primary transition-colors line-clamp-1 max-w-[180px] block">
                                                        {item.lessonTitle}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-2 text-muted-foreground">
                                                    <span className="line-clamp-1 max-w-[120px]">{item.courseTitle}</span>
                                                </td>
                                                <td className="py-3 px-2 text-muted-foreground">{item.progressPercent}%</td>
                                                <td className="py-3 px-2 text-muted-foreground text-right whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: vi })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </main>

                {/* Sidebar */}
                <aside className="space-y-8">
                    {/* AI Sensei CTA */}
                    <section className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-2xl text-primary-foreground shadow-xl shadow-primary/20" data-purpose="ai-sensei">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Bot className="size-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">Trợ lý AI Sensei</h3>
                                <p className="text-xs text-white/80">Giải đáp ngữ pháp 24/7</p>
                            </div>
                        </div>
                        <p className="text-sm mb-6 leading-relaxed">Bạn gặp khó khăn với ngữ pháp tiếng Nhật? Hãy hỏi Sensei ngay!</p>
                        <Link
                            href="/ai-sensei/chat"
                            className="block w-full py-3 bg-background text-primary font-bold rounded-xl hover:bg-accent transition-colors text-center text-sm"
                        >
                            Hỏi ngay bây giờ
                        </Link>
                    </section>

                    {/* Gamification Card */}
                    <section className="bg-card p-6 rounded-2xl border border-border shadow-sm" data-purpose="gamification">
                        <h3 className="font-bold mb-6">Thành tích học tập</h3>
                        <div className="flex justify-between mb-8">
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Flame className="size-5 text-orange-600 dark:text-orange-300" />
                                </div>
                                <span className="text-[10px] font-semibold text-muted-foreground/50">Chuỗi</span>
                                <p className="font-bold">{currentStreak} Ngày</p>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Star className="size-5 text-yellow-600 dark:text-yellow-300" />
                                </div>
                                <span className="text-[10px] font-semibold text-muted-foreground/50">Cấp độ</span>
                                <p className="font-bold">Lv. {level}</p>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Trophy className="size-5 text-blue-600 dark:text-blue-300" />
                                </div>
                                <span className="text-[10px] font-semibold text-muted-foreground/50">Danh hiệu</span>
                                <p className="font-bold">{achievementCount}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span>Đến Lv. {level + 1}</span>
                                <span>{currentXpInLevel.toLocaleString('vi-VN')} / {xpNeededForNextLevel.toLocaleString('vi-VN')} XP</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-yellow-400 h-2 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all"
                                    style={{ width: `${xpProgress}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Quick Links Grid */}
                    <section className="grid grid-cols-2 gap-3" data-purpose="quick-links">
                        {[
                            { href: '/dashboard/study-sets', Icon: BookMarked, label: 'Thẻ ghi nhớ' },
                            { href: '/dashboard/rewards', Icon: Gift, label: 'Quà tặng' },
                            { href: '/dashboard/achievements', Icon: Medal, label: 'Thành tựu' },
                            { href: '/dashboard/certificates', Icon: Award, label: 'Chứng chỉ' },
                            { href: '/dashboard/schedule', Icon: CalendarDays, label: 'Lịch học' },
                            { href: '/dashboard/analytics', Icon: BarChart3, label: 'Thống kê' },
                        ].map(({ href, Icon, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-2xl hover:bg-accent transition-colors group"
                            >
                                <Icon className="size-5 mb-2 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold">{label}</span>
                            </Link>
                        ))}
                    </section>
                </aside>
            </div>
            <StreakWelcomeModal />
        </div>
    );
}

export default function DashboardClientPage() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <GuestLandingPage />;
    }

    return <AuthenticatedDashboardPage />;
}
