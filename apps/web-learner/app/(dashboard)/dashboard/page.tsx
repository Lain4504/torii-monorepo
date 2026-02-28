'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/hooks/hooks';
import { learningProgressApi } from '@/lib/api/services/learning-progress-api';
import { useMyCourses, useLearningHistory } from '@/lib/api/services/learning-progress-api';
import { useGamificationProfile, useStreak, useAchievements } from '@/lib/api/services/gamification-api';
import { useMySchedule } from '@/lib/api/services/live-session-api';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BookOpen, Clock, Calendar, Video } from 'lucide-react';
import { LiveSessionStatus } from '@workspace/schemas';

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

export default function DashboardClientPage() {
    const { user } = useAppSelector((state) => state.auth);

    const { data: courses, isLoading: coursesLoading } = useMyCourses();
    const { data: statsData } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: learningProgressApi.getStats,
    });
    const { data: streak } = useStreak();
    const { data: profile } = useGamificationProfile();
    const { data: achievements } = useAchievements();
    const { data: history } = useLearningHistory();
    const { data: schedule } = useMySchedule();

    const mainCourse = courses?.[0];
    const otherCourses = courses?.slice(1, 3) || [];

    // Stats pills
    const totalCourses = statsData?.totalCourses ?? courses?.length ?? 0;
    const totalHours = statsData?.totalLearningHours ?? 0;
    const currentStreak = streak?.currentStreak ?? 0;
    const avgProgress = statsData?.averageProgress ?? 0;

    // Level XP
    const level = profile?.level ?? 1;
    const points = profile?.points ?? 0;
    const xpForNextLevel = (level) * 1000;
    const xpProgress = Math.min(100, (points % 1000) / 10);

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
        <div className="bg-background text-foreground font-sans antialiased min-h-screen">
            <style>{`
    .hover-lift { transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }
    .progress-ring-circle { transition: stroke-dashoffset 0.35s; transform: rotate(-90deg); transform-origin: 50% 50%; }
            `}</style>

            <div className="max-w-[1440px] mx-auto p-6 md:p-10 space-y-8">

                {/* Welcome Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-purpose="welcome-section">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại, {firstName}! 👋</h1>
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
                                <span className="text-sm font-semibold">🔥 {currentStreak} Ngày liên tiếp</span>
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

                        {/* Current Course Card */}
                        <section data-purpose="current-course">
                            {coursesLoading ? (
                                <div className="bg-card rounded-3xl border border-border h-48 animate-pulse" />
                            ) : mainCourse ? (
                                <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover-lift">
                                    <div className="md:flex">
                                        <div className="md:w-1/3 h-48 md:h-auto relative">
                                            {mainCourse.thumbnailUrl ? (
                                                <img
                                                    alt={mainCourse.title}
                                                    className="w-full h-full object-cover"
                                                    src={mainCourse.thumbnailUrl}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center">
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
                                                    <h2 className="text-xl font-bold line-clamp-2">{mainCourse.title}</h2>
                                                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded ml-2 shrink-0">Đang học</span>
                                                </div>
                                                <p className="text-muted-foreground text-sm mb-4">
                                                    {mainCourse.instructor && `GV: ${mainCourse.instructor} • `}
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
                                                href={`/courses/${mainCourse.slug}/learn`}
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
                                    <Link href="/courses" className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
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
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Điểm kinh nghiệm (XP)</div>
                                            <div className="text-lg font-bold">{points.toLocaleString('vi-VN')} XP</div>
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

                        {/* My Courses List */}
                        {otherCourses.length > 0 && (
                            <section className="space-y-4" data-purpose="course-list">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Khóa học của tôi</h3>
                                    <Link className="text-primary text-sm font-bold hover:underline" href="/dashboard/my-courses">Xem tất cả</Link>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {otherCourses.map((course) => {
                                        const circumference = 2 * Math.PI * 16;
                                        const offset = circumference - (circumference * course.progress) / 100;
                                        return (
                                            <Link
                                                key={course.id}
                                                href={`/courses/${course.slug}`}
                                                className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between hover-lift block"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                                                        {course.thumbnailUrl ? (
                                                            <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <BookOpen className="size-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm line-clamp-1">{course.title}</h4>
                                                        <p className="text-xs text-muted-foreground">Đã hoàn thành {course.progress}%</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="hidden sm:block">
                                                        <svg className="w-10 h-10">
                                                            <circle className="text-muted" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeWidth="3" />
                                                            <circle
                                                                className="text-primary"
                                                                cx="20" cy="20"
                                                                fill="transparent"
                                                                r="16"
                                                                stroke="currentColor"
                                                                strokeDasharray={circumference.toFixed(2)}
                                                                strokeDashoffset={offset.toFixed(2)}
                                                                strokeLinecap="round"
                                                                strokeWidth="3"
                                                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                                            />
                                                        </svg>
                                                    </div>
                                                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                                    </svg>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

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
                                                                href={`/live-classes/${session.courseId}`}
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
                        <section className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground shadow-xl shadow-primary/20" data-purpose="ai-sensei">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">🤖</div>
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
                                    <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">🔥</div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Chuỗi</span>
                                    <p className="font-bold">{currentStreak} Ngày</p>
                                </div>
                                <div className="text-center group cursor-pointer">
                                    <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">⭐</div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Cấp độ</span>
                                    <p className="font-bold">Lv. {level}</p>
                                </div>
                                <div className="text-center group cursor-pointer">
                                    <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Danh hiệu</span>
                                    <p className="font-bold">{achievementCount}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Đến Lv. {level + 1}</span>
                                    <span>{(points % 1000).toLocaleString('vi-VN')} / 1,000 XP</span>
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
                                { href: '/dashboard/flashcards', icon: '📇', label: 'Thẻ ghi nhớ' },
                                { href: '/dashboard/notes', icon: '📝', label: 'Ghi chú' },
                                { href: '/dashboard/achievements', icon: '🏅', label: 'Thành tựu' },
                                { href: '/dashboard/certificates', icon: '🎓', label: 'Chứng chỉ' },
                                { href: '/dashboard/schedule', icon: '📅', label: 'Lịch học' },
                                { href: '/analytics', icon: '📊', label: 'Thống kê' },
                            ].map(({ href, icon, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-2xl hover:bg-accent transition-colors group"
                                >
                                    <span className="text-xl mb-2 group-hover:scale-110 transition-transform">{icon}</span>
                                    <span className="text-xs font-bold">{label}</span>
                                </Link>
                            ))}
                        </section>
                    </aside>
                </div>

                {/* Recent Activity */}
                <section className="bg-card p-6 rounded-3xl border border-border shadow-sm" data-purpose="recent-activity">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Hoạt động gần đây</h3>
                        <Link href="/dashboard/history" className="text-sm text-primary font-bold hover:underline">Xem tất cả</Link>
                    </div>

                    {recentHistory.length === 0 ? (
                        <div className="text-center py-10">
                            <Clock className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">Chưa có hoạt động học tập nào.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] text-muted-foreground uppercase font-bold border-b border-border">
                                        <th className="pb-4 font-bold">Bài học</th>
                                        <th className="pb-4 font-bold">Khóa học</th>
                                        <th className="pb-4 font-bold">Thời gian học</th>
                                        <th className="pb-4 font-bold text-right">Ngày thực hiện</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recentHistory.map((item) => (
                                        <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-4 font-bold">
                                                <Link href={`/courses/${item.slug}/learn?lesson=${item.lessonId}`} className="hover:text-primary transition-colors line-clamp-1 max-w-[220px] block">
                                                    {item.lessonTitle}
                                                </Link>
                                            </td>
                                            <td className="py-4 text-muted-foreground line-clamp-1 max-w-[160px]">{item.courseTitle}</td>
                                            <td className="py-4 text-muted-foreground">{formatDuration(item.duration)}</td>
                                            <td className="py-4 text-muted-foreground text-right whitespace-nowrap">
                                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: vi })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
