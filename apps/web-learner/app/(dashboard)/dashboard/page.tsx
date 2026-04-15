'use client';

import { useAppSelector } from '@/hooks/hooks';
import { useAcademyMyCourses, useAcademyLearningStats } from '@/lib/api/services/academy-learning-progress-api';

import { useGamificationProfile, useStreak, useAchievements } from '@/lib/api/services/gamification-api';
import { useMySchedule } from '@/lib/api/services/academy-live-session-api';
import Link from 'next/link';
import { subDays } from 'date-fns';
import {
    BookOpen,
    Bot,
    Calendar,
    CalendarDays,
    Clock,
    Flame,
    Hand,
    Medal,
    Award,
    BarChart3,
    Shield,
    Star,
    Trophy,
    Video,
    BookMarked,
    Gift,
} from 'lucide-react';
import { LiveSessionStatus } from '@workspace/schemas';
import { StreakWelcomeModal } from '@/components/dashboard/streak-welcome-modal';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { RecommendedCoursesSection } from '@/components/dashboard/recommended-courses-section';


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

function AuthenticatedDashboardPage() {
    const { user } = useAppSelector((state) => state.auth);

    const { data: courses, isLoading: coursesLoading } = useAcademyMyCourses();
    const { data: statsData } = useAcademyLearningStats();
    const { data: streak } = useStreak();
    const { data: profile } = useGamificationProfile();
    const { data: achievements } = useAchievements();
    const { data: schedule } = useMySchedule();

    const mainCourse = courses?.[0];

    // Stats mapping for Academy
    const totalCourses = statsData?.totalCourses ?? courses?.length ?? 0;
    const totalHours = statsData?.totalLearningHours ?? 0;
    const currentStreak = streak?.currentStreak ?? 0;
    const streakSavedByFreeze = (streak as any)?.streakSavedByFreeze === true;
    const avgProgress = statsData?.averageProgress ?? 0;

    // Level XP
    const level = profile?.level ?? 1;
    const currentXpInLevel = profile?.currentXp ?? 0;
    const xpNeededForNextLevel = 100 * (level + 1);
    const xpProgress = Math.min(100, (currentXpInLevel / xpNeededForNextLevel) * 100);

    // Upcoming sessions (non-ended, scheduled/live, sorted by scheduledAt)
    const upcomingSessions = (schedule ?? [])
        .filter(s => s.status === LiveSessionStatus.SCHEDULED || s.status === LiveSessionStatus.LIVE)
        .slice(0, 3);
    // Achievements count
    const achievementCount = achievements?.length ?? 0;

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
                            <div className="space-y-6">
                                <RecommendedCoursesSection jlptTarget={jlptTarget} />

                                <div className="bg-card rounded-2xl border border-border border-dashed p-10 text-center flex flex-col items-center">
                                    <BookOpen className="size-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Bạn chưa mua khóa học nào</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Hãy chọn một khóa học phù hợp để bắt đầu. Sau khi ghi danh, hệ thống sẽ gợi ý học tập đơn giản cho bạn ngay trên dashboard.
                                    </p>
                                    <Link href="/dashboard/available-courses" className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                                        Khám phá khóa học
                                    </Link>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* (Đã lược bỏ block \"Mục tiêu\" & kỹ năng chi tiết theo yêu cầu) */}

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
                                                            href={`/dashboard/my-courses/${session.liveClassId}`}
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

export default AuthenticatedDashboardPage;
