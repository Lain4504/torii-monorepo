'use client';

import React, { useState } from 'react';
import {
    TrendingUp, Award, Flame, BookOpen, Sparkles, Lock, Check,
    ChevronRight, RefreshCcw, AlertCircle, X, Loader2, Clock,
    BarChart3, Target, BookMarked, Calendar,
} from 'lucide-react';
import { useLearningStats, useMyCourses } from '@/lib/api/services/learning-progress-api';
import { useAnalyticsSnapshot, useGenerateAnalyticsSnapshot } from '@/lib/api/services/agent-api';
import type { AnalyticsSnapshot } from '@/lib/api/services/agent-api';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { toast } from '@workspace/ui/components/sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
type JlptLevel = typeof JLPT_LEVELS[number];

function fmtHours(hours: number) {
    if (hours < 1) return `${Math.round(hours * 60)} phút`;
    return `${hours.toFixed(1)} giờ`;
}

function fmtRelTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Vừa xong';
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
}

// ─── AI Loading Dialog ────────────────────────────────────────────────────────

function AILoadingDialog({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                <div className="relative mb-6 mx-auto w-20 h-20">
                    {/* Animated orbit rings */}
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
                            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" style={{ animationDelay: `${i * 0.3}s` }} />
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

// ─── AI Insights Panel (shown after snapshot loaded) ─────────────────────────

function AIInsightsPanel({ snapshot, targetLevel }: { snapshot: AnalyticsSnapshot; targetLevel: JlptLevel }) {
    const profile = snapshot.profileData;
    const studyPath = snapshot.studyPathData;
    const progress = snapshot.progressData;

    const roadmap: Array<{ title: string; status: string; description?: string }> =
        studyPath?.studyPathRecommendation?.roadmap ?? [];
    const strengths: string[] = profile?.strengths ?? [];
    const weaknesses: string[] = profile?.weaknesses ?? [];
    const recommendations: string[] = profile?.recommendations ?? [];
    const readinessScore: number = profile?.readinessScore ?? 0;
    const metrics = progress?.metrics;

    return (
        <div className="space-y-6">
            {/* Generated At badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>AI phân tích lần cuối: {fmtRelTime(snapshot.generatedAt)}</span>
            </div>

            {/* Readiness score */}
            {readinessScore > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" /> Mức độ sẵn sàng {targetLevel}
                        </h3>
                        <span className="text-3xl font-black text-primary">{readinessScore}%</span>
                    </div>
                    <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-700"
                            style={{ width: `${readinessScore}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {readinessScore >= 80 ? 'Bạn gần như sẵn sàng thi!' :
                            readinessScore >= 60 ? 'Tiếp tục luyện tập, bạn đang tiến bộ tốt!' :
                                'Còn nhiều điểm cần cải thiện — hãy theo lộ trình bên dưới.'}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Strengths */}
                {strengths.length > 0 && (
                    <div className="rounded-xl border bg-card p-5">
                        <h3 className="font-semibold text-sm text-emerald-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4" /> Điểm mạnh
                        </h3>
                        <ul className="space-y-2">
                            {strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-foreground/80">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Weaknesses */}
                {weaknesses.length > 0 && (
                    <div className="rounded-xl border bg-card p-5">
                        <h3 className="font-semibold text-sm text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4" /> Cần cải thiện
                        </h3>
                        <ul className="space-y-2">
                            {weaknesses.map((w, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-red-400 shrink-0 mt-0.5">•</span>
                                    <span className="text-foreground/80">{w}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Study Path Roadmap */}
            {roadmap.length > 0 && (
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="p-5 border-b border-border">
                        <h3 className="font-bold text-foreground">Lộ trình học {targetLevel} (AI gợi ý)</h3>
                        {studyPath?.studyPathRecommendation?.estimatedWeeks && (
                            <p className="text-xs text-muted-foreground mt-1">Ước tính {studyPath.studyPathRecommendation.estimatedWeeks} tuần</p>
                        )}
                    </div>
                    <div className="p-5 space-y-6 relative">
                        <div className="absolute left-9 top-8 bottom-8 w-0.5 bg-border" />
                        {roadmap.map((step, i) => (
                            <div key={i} className="flex gap-4 relative z-10">
                                <div className={`shrink-0 w-6 h-6 rounded-full ring-4 ring-card flex items-center justify-center
                                    ${step.status === 'completed' ? 'bg-emerald-500' :
                                        step.status === 'in-progress' ? 'bg-primary' : 'bg-border'}`}>
                                    {step.status === 'completed' ? <Check className="w-3 h-3 text-white" /> :
                                        step.status === 'in-progress' ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> :
                                            <Lock className="w-3 h-3 text-muted-foreground" />}
                                </div>
                                <div className={step.status === 'locked' ? 'opacity-50' : ''}>
                                    <p className={`text-sm font-bold ${step.status === 'in-progress' ? 'text-primary' : 'text-foreground'}`}>
                                        {step.title}
                                    </p>
                                    {step.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="rounded-xl border bg-card p-5">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                        <RefreshCcw className="h-4 w-4 text-primary" /> Lời khuyên từ AI
                    </h3>
                    <ul className="space-y-2">
                        {recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                                <span className="text-primary shrink-0">→</span> {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Metrics from trackProgress */}
            {metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Bài đã học (tháng)', value: metrics.completedLessons, icon: BookOpen },
                        { label: 'Điểm trung bình', value: `${metrics.averageScore}%`, icon: Target },
                        { label: 'Giờ học', value: fmtHours(metrics.studyHours), icon: Clock },
                        { label: 'Streak', value: `${metrics.streak ?? 0} ngày`, icon: Flame },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-xl border bg-card p-4">
                            <Icon className="h-4 w-4 text-primary mb-2" />
                            <p className="text-xl font-bold text-foreground">{value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
    const [targetLevel, setTargetLevel] = useState<JlptLevel>('N5');
    const [showAIDialog, setShowAIDialog] = useState(false);

    // ── Non-AI data (always fetched) ─────────────────────────────
    const { data: stats, isLoading: statsLoading } = useLearningStats();
    const { data: courses = [], isLoading: coursesLoading } = useMyCourses();

    // ── AI Snapshot (Redis cache check, no AI call) ───────────────
    const { data: snapshotData } = useAnalyticsSnapshot(targetLevel);
    const snapshot = snapshotData?.snapshot ?? null;

    // ── AI Generation mutation ────────────────────────────────────
    const generateMutation = useGenerateAnalyticsSnapshot();

    const handleRequestAI = async () => {
        setShowAIDialog(true);
        try {
            await generateMutation.mutateAsync(targetLevel);
            toast.success('AI đã phân tích xong! 🎉');
        } catch (err: any) {
            toast.error(err.message || 'AI phân tích thất bại. Vui lòng thử lại.');
        } finally {
            setShowAIDialog(false);
        }
    };

    return (
        <div className="bg-background text-foreground min-h-screen font-sans antialiased">
            {showAIDialog && <AILoadingDialog onClose={() => setShowAIDialog(false)} />}

            <div className="flex flex-col w-full max-w-[1440px] mx-auto p-6 space-y-8">

                {/* ── Header ──────────────────────── */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <nav aria-label="Breadcrumb" className="flex text-sm text-muted-foreground mb-2">
                            <ol className="flex items-center space-x-2">
                                <li>Dashboard</li>
                                <li className="flex items-center space-x-2">
                                    <ChevronRight className="w-4 h-4" />
                                    <span className="text-foreground font-medium">Phân tích học tập</span>
                                </li>
                            </ol>
                        </nav>
                        <h1 className="text-3xl font-bold tracking-tight">Phân Tích Học Tập</h1>
                        <p className="text-muted-foreground">Tổng quan tiến độ và lộ trình chinh phục JLPT của bạn.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* JLPT Target picker */}
                        <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 border border-border">
                            {JLPT_LEVELS.map(lv => (
                                <button
                                    key={lv}
                                    onClick={() => setTargetLevel(lv)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${targetLevel === lv ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {lv}
                                </button>
                            ))}
                        </div>
                        {/* AI Analysis button */}
                        <button
                            onClick={handleRequestAI}
                            disabled={generateMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-60"
                        >
                            <Sparkles className="w-4 h-4" />
                            {snapshot ? 'Làm mới phân tích AI' : 'Phân tích bằng AI'}
                        </button>
                    </div>
                </header>

                {/* ── Quick Stats (Non-AI, always shown) ─────────── */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
                    ) : stats ? (
                        <>
                            <StatCard icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} label="Tổng khóa học"
                                value={stats.totalCourses} sub={`${stats.inProgressCourses} đang học`} />
                            <StatCard icon={<Award className="w-4 h-4 text-primary" />} label="Tiến độ trung bình"
                                value={`${Math.round(stats.averageProgress)}%`}
                                progress={stats.averageProgress}
                                sub={`${stats.completedCourses} khóa hoàn thành`} />
                            <StatCard icon={<Flame className="w-4 h-4 text-orange-500" />} label="Streak học tập"
                                value={`${stats.currentStreak} ngày`}
                                sub={stats.currentStreak > 0 ? 'Hôm nay đã học' : 'Chưa học hôm nay'} />
                            <StatCard icon={<BookOpen className="w-4 h-4 text-blue-500" />} label="Giờ học tích lũy"
                                value={fmtHours(stats.totalLearningHours)}
                                sub="Tổng thời gian học" />
                        </>
                    ) : null}
                </section>

                {/* ── My Courses Progress (Non-AI) ───────────────── */}
                {!coursesLoading && courses.length > 0 && (
                    <section className="rounded-xl border bg-card shadow p-6">
                        <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                            <BookMarked className="h-5 w-5 text-primary" /> Khóa học đang học
                        </h2>
                        <div className="space-y-4">
                            {courses.slice(0, 5).map(course => (
                                <div key={course.id} className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-foreground truncate">{course.title}</p>
                                            <span className="text-xs text-muted-foreground shrink-0 ml-2">{Math.round(course.progress)}%</span>
                                        </div>
                                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full rounded-full transition-all duration-500"
                                                style={{ width: `${course.progress}%` }} />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {course.completedLessons}/{course.totalLessons} bài{' '}
                                            {course.lastAccessed ? `· ${fmtRelTime(course.lastAccessed)}` : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── AI Insights section ─────────────────────────── */}
                <section>
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

function StatCard({ icon, label, value, sub, progress }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; progress?: number;
}) {
    return (
        <div className="rounded-xl border bg-card shadow p-6">
            <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium">{label}</p>
                {icon}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {progress !== undefined && (
                <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
            )}
            {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
        </div>
    );
}

function AICallToAction({ targetLevel, onRequest, isLoading }: {
    targetLevel: string; onRequest: () => void; isLoading: boolean;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-10 flex flex-col items-center text-center gap-5">
            <div className="p-4 rounded-2xl bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Phân tích AI chuyên sâu</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                    AI sẽ phân tích toàn bộ lịch sử học tập của bạn để đưa ra thông tin về điểm mạnh, điểm yếu,
                    và lộ trình chinh phục <strong>{targetLevel}</strong> được cá nhân hóa.
                    Kết quả sẽ được lưu lại <strong>24 giờ</strong> — không gọi lại API nếu chưa hết hạn.
                </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
                {['📊 Tiến độ theo tháng', '🎯 Điểm mạnh & yếu', '🗺️ Lộ trình cá nhân', '💡 Lời khuyên học tập'].map(f => (
                    <span key={f} className="px-3 py-1.5 bg-card border border-border rounded-full">{f}</span>
                ))}
            </div>
            <button
                onClick={onRequest}
                disabled={isLoading}
                className="mt-2 flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/25 disabled:opacity-60"
            >
                <Sparkles className="h-5 w-5" />
                {isLoading ? 'Đang phân tích...' : `Phân tích ngay với ${targetLevel}`}
            </button>
        </div>
    );
}
