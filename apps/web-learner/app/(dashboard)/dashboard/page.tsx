'use client';

import { RecommendedCoursesSection } from '@/components/dashboard/recommended-courses-section';
import { StreakWelcomeModal } from '@/components/dashboard/streak-welcome-modal';
import { useAppSelector } from '@/hooks/hooks';
import {
    useAcademyLearningStats,
    useAcademyMyCourses,
} from '@/lib/api/services/academy-learning-progress-api';
import {
    useAchievements,
    useGamificationProfile,
    useStreak,
} from '@/lib/api/services/gamification-api';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Progress } from '@workspace/ui/components/progress';
import { cn } from '@workspace/ui/lib/utils';
import {
    ArrowRight,
    Award,
    BookMarked,
    BookOpen,
    Bot,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Flame,
    Gift,
    Hand,
    Medal,
    Shield,
    Sparkles,
    Star,
    Trophy,
} from 'lucide-react';
import Link from 'next/link';

function getCourseHref(mainCourse: any) {
    if (mainCourse?.liveClassId) {
        return `/dashboard/my-courses/${mainCourse.liveClassId}`;
    }

    return `/courses/${mainCourse?.liveClassId ?? mainCourse?.vodPackageId ?? mainCourse?.courseProfileId ?? mainCourse?.id}/learn`;
}

function AuthenticatedDashboardPage() {
    const { user } = useAppSelector((state) => state.auth);

    const { data: courses, isLoading: coursesLoading } = useAcademyMyCourses();
    const { data: statsData } = useAcademyLearningStats();
    const { data: streak } = useStreak();
    const { data: profile } = useGamificationProfile();
    const { data: achievements } = useAchievements();

    const mainCourse = courses?.[0];
    const totalCourses = statsData?.totalCourses ?? courses?.length ?? 0;
    const totalHours = statsData?.totalLearningHours ?? 0;
    const inProgressCourses = statsData?.inProgressCourses ?? 0;
    const completedCourses = statsData?.completedCourses ?? 0;
    const avgProgress = statsData?.averageProgress ?? 0;
    const currentStreak = streak?.currentStreak ?? 0;
    const streakSavedByFreeze = (streak as any)?.streakSavedByFreeze === true;

    const level = profile?.level ?? 1;
    const currentXpInLevel = profile?.currentXp ?? 0;
    const xpNeededForNextLevel = 100 * (level + 1);
    const xpProgress = Math.min(100, (currentXpInLevel / xpNeededForNextLevel) * 100);
    const achievementCount = achievements?.length ?? 0;
    const completedLessons = mainCourse?.completedLessons ?? 0;
    const totalLessons = mainCourse?.totalLessons ?? 0;
    const remainingLessons = Math.max(0, totalLessons - completedLessons);

    const jlptTarget =
        ((user as any)?.jlptTarget as string | undefined) ||
        ((user?.userMetadata as Record<string, string>)?.jlptTarget as string | undefined) ||
        'N3';
    const firstName = user?.displayName?.split(' ').at(-1) || 'Học viên';

    const statCards = [
        {
            label: 'Khóa học',
            value: totalCourses,
            helper: `${inProgressCourses} đang học`,
            Icon: BookOpen,
            tint: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        },
        {
            label: 'Giờ học',
            value: `${totalHours}h`,
            helper: 'Tổng thời lượng tích lũy',
            Icon: Clock3,
            tint: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        },
        {
            label: 'Chuỗi học',
            value: `${currentStreak} ngày`,
            helper: currentStreak > 0 ? 'Đang giữ nhịp ổn định' : 'Bắt đầu lại hôm nay',
            Icon: Flame,
            tint: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        },
        {
            label: 'Hoàn thành',
            value: `${completedCourses}`,
            helper: `${avgProgress}% tiến độ trung bình`,
            Icon: CheckCircle2,
            tint: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        },
    ];

    const quickLinks = [
        { href: '/dashboard/my-courses', Icon: BookOpen, label: 'Khóa học của tôi' },
        { href: '/dashboard/schedule', Icon: CalendarDays, label: 'Lịch học' },
        { href: '/dashboard/study-sets', Icon: BookMarked, label: 'Thẻ ghi nhớ' },
        { href: '/dashboard/achievements', Icon: Medal, label: 'Thành tựu' },
        { href: '/dashboard/rewards', Icon: Gift, label: 'Quà tặng' },
        { href: '/dashboard/certificates', Icon: Award, label: 'Chứng chỉ' },
    ];

    return (
        <div className="space-y-8 pb-8 animate-in fade-in duration-700">
            {streakSavedByFreeze && (
                <Alert className="rounded-2xl border-blue-200 bg-blue-50/90 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    <AlertTitle className="text-sm font-bold">Lá chắn streak đã được kích hoạt</AlertTitle>
                    <AlertDescription className="text-xs opacity-90">
                        Chuỗi học {currentStreak} ngày của bạn đã được bảo vệ. Chỉ cần hoàn thành một phiên học ngắn hôm nay để giữ nhịp.
                    </AlertDescription>
                </Alert>
            )}

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                        <Sparkles className="size-7" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Chào mừng trở lại, {firstName}!
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground/70">
                            Tiếp tục hành trình chinh phục tiếng Nhật của bạn ngay hôm nay.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Main Content Column */}
                <div className="space-y-6">
                    {coursesLoading ? (
                        <div className="h-64 rounded-3xl border border-border bg-muted/40 animate-pulse" />
                    ) : mainCourse ? (
                        <div className="group relative overflow-hidden rounded-[32px] border border-border bg-card shadow-sm transition-all hover:shadow-md">
                            <div className="grid gap-0 sm:grid-cols-[240px_1fr] md:grid-cols-[280px_1fr]">
                                <div className="relative aspect-[4/3] sm:aspect-auto">
                                    {mainCourse.thumbnailUrl ? (
                                        <img
                                            src={mainCourse.thumbnailUrl}
                                            alt={mainCourse.courseTitle}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-muted">
                                            <BookOpen className="size-12 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute left-4 top-4 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                                        {jlptTarget}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between p-6 sm:p-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                                Khóa học đang học
                                            </span>
                                            <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                                                {mainCourse.type?.toLowerCase() === 'live' ? 'Lớp trực tiếp' : 'Khóa tự học'}
                                            </Badge>
                                        </div>
                                        <h2 className="line-clamp-2 text-2xl font-bold leading-tight text-foreground md:text-3xl">
                                            {mainCourse.courseTitle}
                                        </h2>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <div className="flex size-7 items-center justify-center rounded-full bg-muted overflow-hidden">
                                                <User className="size-4" />
                                            </div>
                                            <span className="font-medium">Giảng viên: {mainCourse.instructorName || 'Torii Academy'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            href={getCourseHref(mainCourse)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
                                        >
                                            Tiếp tục học
                                            <ArrowRight className="size-4" />
                                        </Link>
                                        <Link
                                            href="/dashboard/my-courses"
                                            className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-accent hover:border-border/80 active:scale-[0.98]"
                                        >
                                            Danh sách khóa học
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-border bg-muted/20 p-12 text-center">
                            <div className="size-16 rounded-2xl bg-background flex items-center justify-center text-muted-foreground/30 border border-border mb-4">
                                <BookOpen className="size-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Chưa có khóa học nào</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                Khám phá các khóa học hấp dẫn và bắt đầu hành trình của bạn.
                            </p>
                            <Link
                                href="/dashboard/available-courses"
                                className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                            >
                                Khám phá ngay
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-foreground">Hồ sơ học tập</h3>
                            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-primary">
                                <span className="text-[10px] font-bold uppercase">Level</span>
                                <span className="text-sm font-bold">{level}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[
                                { icon: Flame, value: currentStreak, label: 'streak', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                { icon: Trophy, value: achievementCount, label: 'cúp', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { icon: Star, value: `${avgProgress}%`, label: 'tiến độ', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            ].map((stat, i) => (
                                <div key={i} className={cn("flex flex-col items-center justify-center rounded-2xl py-4", stat.bg)}>
                                    <stat.icon className={cn("size-4 mb-2", stat.color)} />
                                    <span className="text-lg font-bold text-foreground">{stat.value}</span>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                <span>XP LEVEL TIẾP THEO</span>
                                <span className="text-foreground">{currentXpInLevel} / {xpNeededForNextLevel}</span>
                            </div>
                            <Progress value={xpProgress} className="h-2 rounded-full" />
                        </div>
                    </div>

                    {/* AI Sensei Card */}
                    <div className="group relative overflow-hidden rounded-[32px] bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20">
                        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:scale-125" />
                        <div className="relative space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Bot className="size-5" />
                                </div>
                                <h3 className="text-lg font-bold">AI Sensei</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-primary-foreground/80">
                                Giải đáp ngữ pháp và luyện tập hội thoại 24/7 cùng trợ lý AI.
                            </p>
                            <Link
                                href="/ai-sensei/chat"
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.98]"
                            >
                                Bắt đầu trò chuyện
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ label, value, helper, Icon, tint }) => (
                    <div key={label} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                    {label}
                                </p>
                                <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
                            </div>
                            <div className={cn('rounded-2xl p-3', tint)}>
                                <Icon className="size-5" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">{helper}</p>
                    </div>
                ))}
            </section>

            <section className="rounded-[32px] border border-border bg-card p-6 shadow-sm lg:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                            Khám phá thêm
                        </p>
                        <h3 className="mt-1 text-2xl font-bold">Lối tắt truy cập nhanh</h3>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {quickLinks.map(({ href, Icon, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-background px-5 py-5 transition hover:border-primary/30 hover:bg-accent"
                        >
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <Icon className="size-5 transition group-hover:scale-110" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold">{label}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <RecommendedCoursesSection jlptTarget={jlptTarget} />

            <StreakWelcomeModal />
        </div>
    );
}

export default AuthenticatedDashboardPage;
