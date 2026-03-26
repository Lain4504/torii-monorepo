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
    Star, Bot, HandWave, Flame, BookMarked, Gift, Medal, Award, BarChart3
} from 'lucide-react';
import { LiveSessionStatus, UserRole } from '@workspace/schemas';
import { StreakWelcomeModal } from '@/components/dashboard/streak-welcome-modal';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';

function formatDuration(seconds: number): string {
    if (!seconds) return '0 phút';
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} phút`;
    return `${Math.floor(m / 60)}h ${m % 60}p`;
}

function formatScheduledAt(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('vi-VN', { weekday: 'short', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}function GuestDashboardPreview() {
    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Minimal Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Cổng thông tin Torii</h1>
                    <p className="text-muted-foreground text-sm">Trung tâm Nhật ngữ thông minh hỗ trợ bởi AI Sensei.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/register">Tham gia ngay</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area (Matches Dashboard Column 1&2 style) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Welcome Announcement Card */}
                    <Card className="bg-muted/10 border-primary/20 shadow-none">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 text-primary font-bold mb-1">
                                <Sparkles className="size-4" />
                                <span className="text-xs uppercase tracking-widest">Tin mới nhất</span>
                            </div>
                            <CardTitle className="text-xl">Chào mừng bạn đến với Torii Nihongo!</CardTitle>
                            <CardDescription>
                                Khám phá lộ trình học tiếng Nhật toàn diện từ N5 đến N1. Đăng ký tài khoản để bắt đầu lưu lại tiến trình học tập của bạn.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button className="font-bold gap-2" variant="ghost" asChild>
                                <Link href="/dashboard/blogs">Tìm hiểu về lộ trình học <ArrowRight className="size-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Featured Tracks Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:border-primary/50 transition-colors shadow-sm">
                            <CardHeader>
                                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 w-fit mb-2">
                                    <GraduationCap className="size-5" />
                                </div>
                                <CardTitle className="text-lg">Khóa học JLPT</CardTitle>
                                <CardDescription className="text-xs">Lộ trình được thiết kế chuẩn kỳ thi quốc tế.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm">
                                Các khóa học từ sơ cấp đến cao cấp với hơn 500+ bài giảng video chất lượng cao và quiz tương tác.
                            </CardContent>
                            <CardFooter>
                                <Button variant="link" className="p-0 text-primary font-bold h-fit" asChild>
                                    <Link href="/dashboard/available-courses">Xem danh mục <ArrowRight className="ml-1 size-3" /></Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card className="hover:border-primary/50 transition-colors shadow-sm">
                            <CardHeader>
                                <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit mb-2">
                                    <Bot className="size-5" />
                                </div>
                                <CardTitle className="text-lg">Gia sư AI Sensei</CardTitle>
                                <CardDescription className="text-xs">Hỗ trợ học tập 24/7 bất kỳ lúc nào.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm">
                                Công nghệ AI trí tuệ nhân tạo độc quyền giúp bạn luyện phản xạ giao tiếp và giải đáp ngữ pháp tức thì.
                            </CardContent>
                            <CardFooter>
                                <Button variant="link" className="p-0 text-primary font-bold h-fit" asChild>
                                    <Link href="/login">Trò chuyện thử <ArrowRight className="ml-1 size-3" /></Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Simple Data Table (Example Class Schedule) */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Lịch khai giảng dự kiến</CardTitle>
                            <CardDescription>Các lớp học tương tác trực tuyến sắp tới.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Lớp học</TableHead>
                                        <TableHead className="font-bold">Trình độ</TableHead>
                                        <TableHead className="font-bold">Khai giảng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { class: 'N5 Cấp tốc', level: 'Sơ cấp', start: '01/04/2026' },
                                        { class: 'N4 Giao tiếp', level: 'Sơ trung', start: '15/04/2026' },
                                        { class: 'N3 Đọc hiểu', level: 'Trung cấp', start: '20/04/2026' },
                                    ].map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{row.class}</TableCell>
                                            <TableCell><Badge variant="outline">{row.level}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground">{row.start}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar inside Dashboard Content Area */}
                <div className="space-y-6">
                    {/* Quick Community Card */}
                    <Card className="bg-primary text-primary-foreground border-none shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Users className="size-6 opacity-80" />
                                <Badge variant="secondary" className="bg-white/20 text-white border-none">5k+ Thành viên</Badge>
                            </div>
                            <CardTitle className="text-xl">Tham gia cộng đồng học tập</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm opacity-90 leading-relaxed">
                            Cùng hàng ngàn học viên chinh phục tiếng Nhật mỗi ngày. Đặc quyền nhận ngay tài liệu học tập miễn phí khi đăng ký!
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" className="w-full font-bold shadow-md" asChild>
                                <Link href="/register">Đăng ký thành viên</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Resources List Card */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">Tài nguyên công khai</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y text-sm">
                                <Link href="/dashboard/blogs" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Newspaper className="size-4 text-muted-foreground" />
                                        <span>Blog kiến thức</span>
                                    </div>
                                    <ArrowRight className="size-3 text-muted-foreground/40" />
                                </Link>
                                <Link href="/dashboard/faq" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="size-4 text-muted-foreground" />
                                        <span>Giải đáp FAQs</span>
                                    </div>
                                    <ArrowRight className="size-3 text-muted-foreground/40" />
                                </Link>
                                <Link href="/dashboard/available-courses" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="size-4 text-muted-foreground" />
                                        <span>Thư viện tài liệu</span>
                                    </div>
                                    <ArrowRight className="size-3 text-muted-foreground/40" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Minimal Info Card */}
                    <div className="mx-2 p-4 rounded-2xl bg-muted/30 border border-dashed flex flex-col items-center text-center gap-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Cần hỗ trợ?</Badge>
                        <p className="text-xs text-muted-foreground">Torii Learning Center sẵn sàng giải đáp thắc mắc của bạn.</p>
                        <Button variant="link" size="sm" className="h-6 p-0 text-xs font-bold">Liên hệ ngay</Button>
                    </div>
                </div>
            </div>
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
    const xpForNextLevel = (level) * 1000;
    const xpProgress = Math.min(100, (totalXp % 1000) / 10);

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
                    <h1 className="text-3xl font-bold tracking-tight">
                        Chào mừng trở lại, {firstName}! <HandWave className="inline-block size-6 translate-y-0.5" />
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
                            <div className="bg-card rounded-3xl border border-border h-48 animate-pulse" />
                        ) : mainCourse ? (
                            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover-lift">
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
                                            <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                <span>{mainCourse.progress}% Hoàn thành</span>
                                                <span>{mainCourse.completedLessons}/{mainCourse.totalLessons} Bài học</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/courses/${mainCourse.liveClassId ?? mainCourse.vodPackageId ?? mainCourse.courseProfileId ?? mainCourse.id}/learn`}
                                            className="mt-6 w-full md:max-w-max px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] text-center text-sm"
                                        >
                                            Tiếp tục học tập
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-card rounded-3xl border border-border border-dashed p-12 text-center flex flex-col items-center">
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
                        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
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
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Sẵn sàng</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Giờ học</div>
                                        <div className="text-lg font-bold">{totalHours}h</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Kinh nghiệm (XP)</div>
                                        <div className="text-lg font-bold">{totalXp.toLocaleString('vi-VN')} XP</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Điểm thưởng (Point)</div>
                                        <div className="text-lg font-bold text-primary">{points.toLocaleString('vi-VN')} P</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skill bars — giữ nguyên UI, data từ averageProgress */}
                        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
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
                        <section className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm" data-purpose="upcoming-sessions">
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
                                            <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Chủ đề</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Giảng viên</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thời gian</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Trạng thái</th>
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
                                                            href={`/courses/${session.classId}/learn`}
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
                    <section className="bg-card p-5 rounded-3xl border border-border shadow-sm" data-purpose="recent-activity">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold">Hoạt động gần đây</h3>
                            <Link href="/dashboard/history" className="text-xs text-primary font-bold hover:underline">Xem tất cả</Link>
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
                                        <tr className="text-[10px] text-muted-foreground uppercase font-bold border-b border-border">
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
                    <section className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground shadow-xl shadow-primary/20" data-purpose="ai-sensei">
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
                    <section className="bg-card p-6 rounded-3xl border border-border shadow-sm" data-purpose="gamification">
                        <h3 className="font-bold mb-6">Thành tích học tập</h3>
                        <div className="flex justify-between mb-8">
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Flame className="size-5 text-orange-600 dark:text-orange-300" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Chuỗi</span>
                                <p className="font-bold">{currentStreak} Ngày</p>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Star className="size-5 text-yellow-600 dark:text-yellow-300" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Cấp độ</span>
                                <p className="font-bold">Lv. {level}</p>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Trophy className="size-5 text-blue-600 dark:text-blue-300" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Danh hiệu</span>
                                <p className="font-bold">{achievementCount}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span>Đến Lv. {level + 1}</span>
                                <span>{(totalXp % 1000).toLocaleString('vi-VN')} / 1,000 XP</span>
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
        return <GuestDashboardPreview />;
    }

    return <AuthenticatedDashboardPage />;
}
