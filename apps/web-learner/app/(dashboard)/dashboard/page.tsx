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
        <div className="space-y-8 pb-4 animate-in fade-in duration-500">
            {streakSavedByFreeze && (
                <Alert className="rounded-3xl border-blue-200 bg-blue-50/90 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    <AlertTitle>Lá chắn streak đã được kích hoạt</AlertTitle>
                    <AlertDescription>
                        Chuỗi học {currentStreak} ngày của bạn đã được bảo vệ. Chỉ cần hoàn thành một phiên học ngắn hôm nay để giữ nhịp.
                    </AlertDescription>
                </Alert>
            )}

            <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_28%)]" />
                <div className="relative grid gap-8 p-6 lg:grid-cols-[minmax(0,1.5fr)_380px] lg:p-8 xl:p-10">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                <Sparkles className="size-3.5 text-primary" />
                                Dashboard học tập
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl xl:text-[2.65rem] xl:leading-tight">
                                    Chào mừng trở lại, {firstName} <Hand className="inline-block size-6 -translate-y-0.5" />
                                </h1>
                                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                                    Bắt đầu ngày mới với những bài học bổ ích. Sensei đã chuẩn bị lộ trình học tập tối ưu nhất dành cho bạn.
                                </p>
                            </div>
                        </div>

                        {coursesLoading ? (
                            <div className="h-80 rounded-3xl border border-border bg-muted/40 animate-pulse" />
                        ) : mainCourse ? (
                            <div className="grid gap-6 rounded-3xl border border-border/70 bg-background/90 p-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-muted">
                                    {mainCourse.thumbnailUrl ? (
                                        <img
                                            src={mainCourse.thumbnailUrl}
                                            alt={mainCourse.courseTitle}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <BookOpen className="size-16 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                                        {jlptTarget}
                                    </div>
                                </div>

                                <div className="flex min-w-0 flex-col justify-between gap-6">
                                    <div className="space-y-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                                    Khóa học đang ưu tiên
                                                </p>
                                                <h2 className="line-clamp-2 text-2xl font-bold leading-tight text-foreground xl:text-[2rem]">
                                                    {mainCourse.courseTitle}
                                                </h2>
                                            </div>
                                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                                Đang học
                                            </span>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                                                    Giảng viên
                                                </p>
                                                <p className="mt-2 font-semibold text-foreground">
                                                    {mainCourse.instructorName || 'Đang cập nhật'}
                                                </p>
                                            </div>
                                            {!mainCourse.liveClassId && (
                                                <div className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                                                        Bài học
                                                    </p>
                                                    <p className="mt-2 font-semibold text-foreground">
                                                        {completedLessons}/{totalLessons} đã hoàn thành
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {!mainCourse.liveClassId && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm font-semibold">
                                                    <span>Tiến độ khóa học</span>
                                                    <span className="text-primary">{mainCourse.progress}%</span>
                                                </div>
                                                <Progress value={mainCourse.progress} className="h-2.5 rounded-full" />
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Tiếp tục từ bài gần nhất</span>
                                                    <span>{remainingLessons} bài còn lại</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            href={getCourseHref(mainCourse)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                                        >
                                            Tiếp tục học
                                            <ArrowRight className="size-4" />
                                        </Link>
                                        <Link
                                            href="/dashboard/my-courses"
                                            className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            Xem toàn bộ khóa học
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-border/80 bg-background/90 p-8">
                                <div className="max-w-2xl space-y-4">
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <BookOpen className="size-7" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold">Chưa có khóa học nào được ghi danh</h2>
                                        <p className="text-sm leading-7 text-muted-foreground">
                                            Hãy khám phá kho khóa học đa dạng của chúng tôi để bắt đầu hành trình chinh phục tiếng Nhật ngay hôm nay.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            href="/dashboard/available-courses"
                                            className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                                        >
                                            Khám phá khóa học
                                        </Link>
                                        <Link
                                            href="/dashboard/my-courses"
                                            className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-accent"
                                        >
                                            Xem khu vực học tập
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                        Hồ sơ học tập
                                    </p>
                                    <h3 className="mt-2 text-xl font-bold">Mục tiêu {jlptTarget}</h3>
                                </div>
                                <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right text-primary">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em]">Level</div>
                                    <div className="text-lg font-bold">Lv. {level}</div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-3 gap-3">
                                <div className="rounded-2xl bg-amber-500/10 px-3 py-4 text-center">
                                    <Flame className="mx-auto size-4 text-amber-600 dark:text-amber-300" />
                                    <div className="mt-2 text-lg font-bold">{currentStreak}</div>
                                    <div className="text-[11px] text-muted-foreground">ngày streak</div>
                                </div>
                                <div className="rounded-2xl bg-sky-500/10 px-3 py-4 text-center">
                                    <Trophy className="mx-auto size-4 text-sky-600 dark:text-sky-300" />
                                    <div className="mt-2 text-lg font-bold">{achievementCount}</div>
                                    <div className="text-[11px] text-muted-foreground">thành tựu</div>
                                </div>
                                <div className="rounded-2xl bg-emerald-500/10 px-3 py-4 text-center">
                                    <Star className="mx-auto size-4 text-emerald-600 dark:text-emerald-300" />
                                    <div className="mt-2 text-lg font-bold">{avgProgress}%</div>
                                    <div className="text-[11px] text-muted-foreground">tiến độ</div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <div className="flex items-center justify-between text-sm font-semibold">
                                    <span>XP tới level tiếp theo</span>
                                    <span>
                                        {currentXpInLevel.toLocaleString('vi-VN')} / {xpNeededForNextLevel.toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <Progress value={xpProgress} className="h-2.5 rounded-full" />
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground shadow-lg shadow-primary/15">
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                                    <Bot className="size-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                                        Trợ lý học tập
                                    </p>
                                    <h3 className="text-xl font-bold">AI Sensei</h3>
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-white/85">
                                Hỏi ngữ pháp, xin giải thích bài học hoặc luyện hội thoại ngay trong cùng một hệ thống giao diện.
                            </p>
                            <Link
                                href="/ai-sensei/chat"
                                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-primary transition hover:bg-white/90"
                            >
                                Mở AI Sensei
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            Điều hướng nhanh
                        </p>
                        <h3 className="mt-1 text-2xl font-bold">Những khu vực bạn dùng thường xuyên</h3>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        Truy cập nhanh vào các tính năng quan trọng để tối ưu hóa quá trình học tập của bạn.
                    </p>
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
