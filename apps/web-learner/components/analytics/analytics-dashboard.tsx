'use client';

import React, { useState, useMemo } from 'react';
import {
    TrendingUp, Award, Flame, BookOpen, Sparkles, Lock, Check,
    ChevronRight, RefreshCcw, AlertCircle, Clock,
    BarChart3, Target, BookMarked, Calendar, Zap, ArrowUpRight
} from 'lucide-react';
import { useAcademyLearningStats as useLearningStats, useAcademyMyCourses as useMyCourses } from '@/lib/api/services/academy-learning-progress-api';
import { useAnalyticsSnapshot, useGenerateAnalyticsSnapshot } from '@/lib/api/services/agent-api';
import type { AnalyticsSnapshot } from '@/lib/api/services/agent-api';
import { useAppSelector } from '@/hooks/hooks';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { toast } from '@workspace/ui/components/sonner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
type JlptLevel = typeof JLPT_LEVELS[number];

function fmtHours(hours: number | undefined | null) {
    if (hours === undefined || hours === null || isNaN(hours)) return '0 m';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
}

function fmtRelTime(iso: string | undefined | null) {
    if (!iso) return 'N/A';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return 'N/A';
    const diff = Date.now() - date.getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Vừa xong';
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
}

// ─── AI Loading Dialog ────────────────────────────────────────────────────────

function AILoadingDialog({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center ring-1 ring-primary/20">
                <div className="relative mb-6 mx-auto w-20 h-20">
                    <span className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                    <span className="absolute inset-2 rounded-full border-2 border-primary/40 animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">AI đang phân tích...</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Gemini đang xử lý dữ liệu học tập của bạn.<br />
                    Quá trình này có thể mất 10–30 giây.
                </p>
                <div className="space-y-2 text-left mb-6">
                    {['Đang tổng hợp tiến độ học tập...', 'Đang phân tích điểm mạnh & yếu...', 'Đang tạo lộ trình cá nhân...'].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                            <Zap className="h-3.5 w-3.5 text-primary animate-pulse shrink-0" style={{ animationDelay: `${i * 0.3}s` }} />
                            <span className="text-muted-foreground">{step}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="text-xs text-muted-foreground hover:text-foreground underline transition"
                >
                    Đóng (tiếp tục chạy nền)
                </button>
            </div>
        </div>
    );
}

// ─── AI Insights Panel ───────────────────────────────────────────────────────

function AIInsightsPanel({ snapshot, targetLevel }: { snapshot: AnalyticsSnapshot; targetLevel: JlptLevel }) {
    const profile = snapshot.profileData;
    const studyPath = snapshot.studyPathData;

    const roadmap: Array<{ title: string; status: string; description?: string }> =
        studyPath?.studyPathRecommendation?.roadmap ?? [];
    const strengths: any[] = profile?.strengths ?? [];
    const weaknesses: any[] = profile?.weaknesses ?? [];
    const recommendations: string[] = profile?.recommendations ?? [];
    const readinessScore: number = profile?.readinessScore ?? profile?.readinessPercentage ?? 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Phân tích chuyên sâu (AI)
                </h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Lần cuối: {fmtRelTime(snapshot.generatedAt)}</span>
                </div>
            </div>

            {readinessScore > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Award className="h-24 w-24 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-foreground">Mức độ sẵn sàng {targetLevel}</h3>
                                <p className="text-sm text-muted-foreground">Dựa trên kết quả bài tập và bài test</p>
                            </div>
                            <span className="text-4xl font-bold text-primary">{readinessScore}%</span>
                        </div>
                        <div className="w-full bg-muted h-3 rounded-full overflow-hidden mb-3">
                            <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${readinessScore}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {readinessScore >= 85 ? 'Xuất sắc! Bạn hoàn toàn có thể tự tin tham gia kỳ thi sắp tới.' :
                                readinessScore >= 65 ? 'Khá tốt! Hãy tập trung hoàn thiện các điểm yếu để đảm bảo kết quả.' :
                                    'Bạn cần dành thêm thời gian ôn luyện các chủ đề trọng tâm bên dưới.'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <h3 className="font-semibold text-sm text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="p-1 rounded bg-emerald-500/10"><TrendingUp className="h-4 w-4" /></div>
                        Điểm mạnh
                    </h3>
                    <ul className="space-y-3">
                        {strengths.slice(0, 4).map((s, i) => {
                            const topic = typeof s === 'string' ? s : (s?.topic ?? s?.title ?? '');
                            const desc = typeof s === 'object' ? s?.description : null;
                            return (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <div className="mt-0.5"><Check className="h-4 w-4 text-emerald-500" /></div>
                                    <div>
                                        <span className="text-foreground/90 font-semibold">{topic}</span>
                                        {desc && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <h3 className="font-semibold text-sm text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-500/10"><AlertCircle className="h-4 w-4" /></div>
                        Cần cải thiện
                    </h3>
                    <ul className="space-y-3">
                        {weaknesses.slice(0, 4).map((w, i) => {
                            const topic = typeof w === 'string' ? w : (w?.topic ?? w?.title ?? '');
                            const desc = typeof w === 'object' ? (w?.description ?? w?.suggestedReview) : null;
                            return (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <div className="mt-0.5 text-amber-500 font-bold">•</div>
                                    <div>
                                        <span className="text-foreground/90 font-semibold">{topic}</span>
                                        {desc && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {recommendations.length > 0 && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm border-l-4 border-l-primary">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" /> Chiến lược ôn luyện
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="text-sm text-foreground/80 bg-muted/30 p-3 rounded-xl flex items-start gap-3">
                                <ArrowUpRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
    const [targetLevel, setTargetLevel] = useState<JlptLevel>('N5');
    const [showAIDialog, setShowAIDialog] = useState(false);

    const { data: stats, isLoading: statsLoading } = useLearningStats();
    const { data: courses = [], isLoading: coursesLoading } = useMyCourses();
    const { data: snapshotData, refetch: refetchSnapshot } = useAnalyticsSnapshot(targetLevel);
    const snapshot = snapshotData?.snapshot ?? null;
    const generateMutation = useGenerateAnalyticsSnapshot();

    const { user } = useAppSelector((state) => state.auth);

    const onboardingData = useMemo(() => {
        if (!user?.onboardingSurvey) return null;
        
        const currentLevel = user.onboardingSurvey.currentLevel || 'NEVER';
        
        // Match logic in dashboard/profile/page.tsx
        const targetMap: Record<string, string> = {
            'NEVER': 'N5',
            'N5': 'N5+',
            'N4': 'N3',
            'N3': 'N2',
            'N2': 'N1',
            'N1': 'N1+',
        };
        
        const startLevelMap: Record<string, string> = {
            'NEVER': 'Chưa biết gì',
            'N5': 'Cơ bản (N5)',
            'N4': 'Sơ cấp (N4)',
            'N3': 'Trung cấp (N3)',
            'N2': 'Nâng cao (N2)',
            'N1': 'Thượng cấp (N1)',
        };

        // Parse studyTimePerSession (e.g. "60 minutes" -> 3)
        let dailyGoal = 3;
        const minutesMatch = (user.onboardingSurvey as any).studyTimePerSession?.match(/(\d+)/);
        if (minutesMatch) {
            const mins = parseInt(minutesMatch[1], 10);
            if (mins <= 10) dailyGoal = 1;
            else if (mins <= 30) dailyGoal = 2;
            else if (mins <= 60) dailyGoal = 3;
            else dailyGoal = 5;
        }

        return {
            targetLevel: targetMap[currentLevel] || 'N5',
            currentLevel: startLevelMap[currentLevel] || 'N/A',
            dailyGoal
        };
    }, [user]);

    const displayGoal = onboardingData?.dailyGoal || 3;
    const displayTarget = onboardingData?.targetLevel || 'N5';
    const displayStart = onboardingData?.currentLevel || 'N/A';

    const handleRequestAI = async () => {
        setShowAIDialog(true);
        try {
            await generateMutation.mutateAsync(targetLevel);
            toast.success('AI đã phân tích xong! 🎉');
            refetchSnapshot();
        } catch (err: any) {
            toast.error(err.message || 'AI phân tích thất bại. Vui lòng thử lại.');
        } finally {
            setShowAIDialog(false);
        }
    };

    const chartData = useMemo<Array<{ name: string; value: number }>>(() => {
        if (!stats?.weeklyActivity) return [];
        const days = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];
        return stats.weeklyActivity.map((val: number, i: number) => ({
            name: days[i],
            value: val
        }));
    }, [stats]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {showAIDialog && <AILoadingDialog onClose={() => setShowAIDialog(false)} />}

            {/* ── Header ──────────────────────── */}
            {/* ── Header ──────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                <div className="space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Phân tích tiến độ</h1>
                    <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                        Cá nhân hóa lộ trình và theo dõi mục tiêu JLPT của bạn qua hệ thống phân tích dữ liệu thông minh.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border">
                    {JLPT_LEVELS.map(lv => (
                        <button
                            key={lv}
                            onClick={() => setTargetLevel(lv)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${targetLevel === lv ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            {lv}
                        </button>
                    ))}
                    <div className="w-[1px] h-4 bg-border mx-1" />
                    <button
                        onClick={handleRequestAI}
                        disabled={generateMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider hover:bg-primary/20 transition disabled:opacity-50"
                    >
                        <Sparkles className="w-3 h-3" />
                        AI Analysis
                    </button>
                </div>
            </div>

            {/* ── Hero Stats ────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Chart */}
                <section className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="font-bold text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary" /> Hoạt động học tập
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Số bài học hoàn thành trong 7 ngày qua</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Weekly Trend
                        </div>
                    </div>

                    <div className="h-[240px] w-full mt-auto">
                        {statsLoading ? (
                            <Skeleton className="w-full h-full rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderRadius: '12px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 6 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </section>

                {/* Gamification & Goals Sidebar */}
                <section className="space-y-6">
                    <div className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute -top-6 -right-6 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
                        <div className="relative z-10 flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Flame className="w-6 h-6 fill-current" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Study Streak</p>
                                    <p className="text-2xl font-bold text-foreground line-height-1 mt-0.5">{stats?.streak ?? 0} Ngày</p>
                                </div>
                            </div>
                            {stats?.streak > 0 && <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-lg">🔥 ON FIRE</span>}
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Cấp độ {stats?.level ?? 1}</span>
                                <span className="font-bold text-primary">{stats?.xp ?? 0} XP</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all" style={{ width: '65%' }} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-primary text-primary-foreground p-6 shadow-lg shadow-primary/20 relative overflow-hidden group">
                        <Zap className="absolute -bottom-4 -right-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10">
                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Mục tiêu hôm nay</p>
                            <h3 className="text-2xl font-bold mt-1">{chartData[6]?.value ?? 0} / {displayGoal}</h3>
                            <p className="text-xs mt-2 opacity-80 leading-relaxed font-medium">
                                {Number(chartData[6]?.value) >= displayGoal
                                    ? "Thật tuyệt vời! Bạn đã hoàn thành mục tiêu ngày hôm nay. 🎉"
                                    : `Cố lên! Bạn chỉ còn thiếu ${Math.max(0, displayGoal - (chartData[6]?.value || 0))} bài học nữa.`}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min(100, ((chartData[6]?.value || 0) / displayGoal) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── Status Cards ──────────────── */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatMetric
                    icon={<Target className="w-5 h-5 text-blue-500" />}
                    label="Mục tiêu"
                    value={displayTarget}
                    sub={`Lúc bắt đầu: ${displayStart}`}
                />
                <StatMetric
                    icon={<Award className="w-5 h-5 text-emerald-500" />}
                    label="Tiến độ trung bình"
                    value={`${stats?.averageProgress ?? 0}%`}
                    sub={`${stats?.completedCourses ?? 0} khóa đã xong`}
                    progress={stats?.averageProgress}
                />
                <StatMetric
                    icon={<Clock className="w-5 h-5 text-purple-500" />}
                    label="Tổng thời gian"
                    value={fmtHours(stats?.totalLearningHours)}
                    sub="Tích lũy từ khi bắt đầu"
                />
            </section>

            {/* ── Courses section ───────────── */}
            <div className="space-y-10">
                <section className="rounded-2xl border bg-card shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-bold text-xl flex items-center gap-3">
                                <BookMarked className="h-6 w-6 text-primary" /> Khóa học của bạn
                            </h2>
                            <button className="text-xs font-bold text-primary hover:underline underline-offset-4">Xem tất cả</button>
                        </div>
                        <div className="space-y-6">
                            {coursesLoading ? <Skeleton className="h-40 w-full" /> : courses.slice(0, 4).map(course => (
                                <div key={course.id} className="group cursor-pointer hover:bg-muted/30 p-4 -mx-4 rounded-2xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 border relative">
                                            {course.thumbnailUrl ? (
                                                <img src={course.thumbnailUrl} alt={course.courseTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <BookOpen className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-bold text-foreground truncate">{course.courseTitle}</p>
                                                <span className="text-sm font-bold text-primary ml-2">{Math.round(course.progress ?? 0)}%</span>
                                            </div>
                                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${course.progress ?? 0}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-[10px] text-muted-foreground font-medium">
                                                    Bài {course.completedLessons} / {course.totalLessons}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-medium">
                                                    {course.updatedAt ? `Học lần cuối: ${fmtRelTime(course.updatedAt.toISOString())}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {courses.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm font-medium">Bạn chưa tham gia khóa học nào.</div>}
                        </div>
                    </section>
                </div>

                <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                    <header className="mb-6">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                             <Sparkles className="h-6 w-6 text-primary" /> Phân Tích Chuyên Sâu
                        </h2>
                        <p className="text-muted-foreground text-sm">Hiểu rõ năng lực và nhận lộ trình tối ưu từ chuyên gia AI.</p>
                    </header>
                    <section className="[&>div]:bg-card/50 [&>div]:backdrop-blur-sm [&>div]:border-primary/10">
                        {snapshot ? (
                            <AIInsightsPanel snapshot={snapshot} targetLevel={targetLevel} />
                        ) : (
                            <AICallToAction
                                targetLevel={targetLevel}
                                onRequest={handleRequestAI}
                                isLoading={generateMutation.isPending}
                            />
                        )}
                    </section>
                </div>
            </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatMetric({ icon, label, value, sub, progress }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; progress?: number;
}) {
    return (
        <div className="rounded-2xl border bg-card shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-muted/50 border shrink-0">{icon}</div>
                <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
                </div>
            </div>
            {progress !== undefined && (
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-3">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
            )}
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 italic">
                {sub}
            </p>
        </div>
    );
}

function AICallToAction({ targetLevel, onRequest, isLoading }: {
    targetLevel: string; onRequest: () => void; isLoading: boolean;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] pointer-events-none" />
            <div className="p-5 rounded-2xl bg-primary shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-foreground mb-3">Phân tích AI Sensei</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed font-medium">
                    Để AI phân tích dữ liệu học tập của bạn và đưa ra lộ trình tối ưu nhất cho mục tiêu <strong>{targetLevel}</strong>.
                </p>
            </div>
            <button
                onClick={onRequest}
                disabled={isLoading}
                className="relative z-10 mt-2 flex items-center gap-3 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:scale-100 disabled:opacity-60"
            >
                <Sparkles className="h-5 w-5" />
                {isLoading ? 'Đang phân tích...' : `Phân tích dữ liệu ${targetLevel}`}
            </button>
            <div className="flex flex-wrap gap-2 justify-center mt-2 relative z-10">
                {['Điểm mạnh & yếu', 'Lộ trình cá nhân', 'Dự đoán kết quả'].map(f => (
                    <span key={f} className="text-[10px] font-bold px-3 py-1.5 bg-card border rounded-full text-muted-foreground shadow-sm">{f}</span>
                ))}
            </div>
        </div>
    );
}
