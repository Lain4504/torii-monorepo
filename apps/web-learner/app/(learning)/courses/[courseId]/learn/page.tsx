'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAcademyClass, useCurriculum, type CurriculumLesson, type CurriculumModule } from '@/lib/api/services/academy-classes';
import { useAcademyEnrollmentCheck } from '@/lib/api/services/academy-enrollment-api';
import { useAcademyCompletedLessonIds, academyLearningProgressApi } from '@/lib/api/services/academy-learning-progress-api';
import { useAcademyLesson } from '@/lib/api/services/academy-lesson-api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@workspace/ui/components/sonner';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import {
    ChevronLeft, ChevronDown, ChevronUp, Menu, X,
    CheckCircle2, PlayCircle, Lock, FileText, BookOpen,
    MessageSquare, ChevronRight, Download, Send,
    AlertCircle, Clock, Trophy, HelpCircle, Timer, RotateCcw,
    Paperclip, PenTool
} from 'lucide-react';
import type { AcademyLessonModel } from '@workspace/schemas';
import { StudyNotesPanel } from '@/components/courses/study-notes-panel';
import { useAppSelector } from '@/hooks/hooks';
import { RootState } from '@/store/store';

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(seconds?: number) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Lesson icon ──────────────────────────────────────────────────────────────

function LessonIcon({ lesson, isActive, isCompleted }: {
    lesson: CurriculumLesson; isActive: boolean; isCompleted: boolean;
}) {
    if (isCompleted) return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />;
    if (!lesson.isUnlocked) return <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />;
    if (isAssignmentItemKind(lesson.kind)) return <BookOpen className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-500' : 'text-muted-foreground/60'}`} />;
    if (isExamItemKind(lesson.kind)) return <HelpCircle className={`h-4 w-4 shrink-0 ${isActive ? 'text-violet-500' : 'text-muted-foreground/60'}`} />;
    if (isMaterialItemKind(lesson.kind) || isTopicItemKind(lesson.kind)) {
        return <FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-500' : 'text-muted-foreground/60'}`} />;
    }
    return <PlayCircle className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />;
}

function normalizeItemKind(kind?: string) {
    return (kind || '').toUpperCase();
}

function isVideoItemKind(kind?: string) {
    return normalizeItemKind(kind) === 'VIDEO';
}

function isExamItemKind(kind?: string) {
    return normalizeItemKind(kind) === 'EXAM';
}

function isAssignmentItemKind(kind?: string) {
    return normalizeItemKind(kind) === 'ASSIGNMENT';
}

function isMaterialItemKind(kind?: string) {
    return normalizeItemKind(kind) === 'MATERIAL';
}

function isTopicItemKind(kind?: string) {
    return normalizeItemKind(kind) === 'TOPIC';
}

function isTrackableItemKind(kind?: string) {
    // chỉ track tiến độ cho VIDEO
    return isVideoItemKind(kind);
}

function isLessonItemKind(kind?: string) {
    const k = normalizeItemKind(kind);
    return k === 'VIDEO' || k === 'MATERIAL' || k === 'TOPIC';
}

function isTrackableLessonKind(kind?: string) {
    return isTrackableItemKind(kind);
}

// ─── Video Player ─────────────────────────────────────────────────────────────

function VideoPlayer({ lesson, onComplete }: { lesson: AcademyLessonModel | undefined; onComplete: () => void; }) {
    if (!lesson) {
        return (
            <div className="aspect-video bg-black flex items-center justify-center">
                <div className="text-white/30 flex flex-col items-center gap-2">
                    <PlayCircle className="h-16 w-16" />
                    <p className="text-sm">Đang tải bài học...</p>
                </div>
            </div>
        );
    }

    if (!lesson.videoUrl) {
        return (
            <div className="aspect-video bg-black flex items-center justify-center">
                <div className="text-white/50 flex flex-col items-center gap-3">
                    <AlertCircle className="h-12 w-12" />
                    <p className="text-sm">Video chưa được tải lên</p>
                    <button
                        onClick={onComplete}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
                    >
                        Đánh dấu hoàn thành
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="aspect-video bg-black w-full">
            <video
                key={lesson.id}
                src={lesson.videoUrl ?? undefined}
                controls
                controlsList="nodownload"
                className="w-full h-full"
                onEnded={onComplete}
            >
                Trình duyệt của bạn không hỗ trợ video.
            </video>
        </div>
    );
}

// ─── Article Viewer ───────────────────────────────────────────────────────────

function ArticleViewer({ lesson, onComplete }: { lesson: AcademyLessonModel; onComplete: () => void; }) {
    return (
        <div className="p-6 sm:p-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                <div className="p-3 rounded-xl bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">{lesson.title}</h2>
                    <p className="text-sm text-muted-foreground">Bài đọc</p>
                </div>
            </div>

            {lesson.content ? (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
            ) : (
                <div className="bg-muted/40 rounded-xl p-8 text-center text-muted-foreground border border-border">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>Nội dung bài đọc chưa được cập nhật.</p>
                </div>
            )}

            <div className="mt-10 pt-8 border-t border-border">
                <button
                    onClick={onComplete}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition flex items-center gap-2"
                >
                    <CheckCircle2 className="h-5 w-5" />
                    Đã đọc xong — Hoàn thành bài học
                </button>
            </div>
        </div>
    );
}



function ModuleItem({
    mod, isExpanded, onToggle, currentLessonId, completedIds, onSelectLesson
}: {
    mod: CurriculumModule;
    isExpanded: boolean;
    onToggle: () => void;
    currentLessonId: string | null;
    completedIds: Set<string>;
    onSelectLesson: (l: CurriculumLesson) => void;
}) {
    const hasActive = mod.lessons.some(l => l.id === currentLessonId);
    const doneCount = mod.lessons.filter((lesson) => {
        if (!isTrackableLessonKind(lesson.kind)) return false;
        const trackId = lesson.referenceId ?? lesson.id;
        return completedIds.has(trackId);
    }).length;

    return (
        <div className="border-b border-border last:border-0">
            <button
                className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors group ${hasActive ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
                onClick={onToggle}
            >
                <div className="min-w-0 pr-3">
                    <p className={`text-sm font-semibold truncate ${hasActive ? 'text-primary' : 'text-foreground'}`}>{mod.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{doneCount}/{mod.lessons.length} bài{mod.durationMinutes ? ` · ${mod.durationMinutes} phút` : ''}</p>
                </div>
                {isExpanded
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                }
            </button>

            {isExpanded && (
                <div className="bg-background/50">
                    {mod.lessons.map(lesson => {
                        const isActive = lesson.id === currentLessonId;
                        const isDone = isTrackableLessonKind(lesson.kind)
                            ? completedIds.has(lesson.referenceId ?? lesson.id)
                            : false;
                        return (
                            <button
                                key={lesson.id}
                                disabled={!lesson.isUnlocked}
                                onClick={() => lesson.isUnlocked && onSelectLesson(lesson)}
                                className={`w-full px-5 py-3 flex items-center gap-3 text-left border-l-4 transition-colors
                                    ${isActive ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/30'}
                                    ${!lesson.isUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                <LessonIcon lesson={lesson} isActive={isActive} isCompleted={isDone} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm truncate ${isActive ? 'font-bold text-foreground' : isDone ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                                        {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                        {isActive && <span className="text-primary font-semibold">Đang học</span>}
                                        {isDone && !isActive && <span className="text-emerald-500">Hoàn thành</span>}
                                        {!isActive && !isDone && lesson.isUnlocked && <span>Chưa học</span>}
                                        {!lesson.isUnlocked && <span>Đã khóa</span>}
                                        {lesson.videoDuration && <span>· {fmtDuration(lesson.videoDuration)}</span>}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseLearnPage() {
    const params = useParams<{ courseId: string }>();
    const classId = params.courseId;
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const hasHandledForbiddenRef = useRef(false);

    // ── API ────────────────────────────────────────────────────────────────
    // 1. Fetch the class (V2 Class model)
    const { data: classData, isLoading: classLoading, error: classError } = useAcademyClass(classId);

    // 2. Fetch curriculum & enrollment / progress based on classId
    const { data: curriculum, isLoading: curriculumLoading, error: curriculumError } = useCurriculum(classId);
    const { data: enrollmentData, error: enrollmentError } = useAcademyEnrollmentCheck(classId);
    const { data: completedContentItemIds = [] } = useAcademyCompletedLessonIds(classId ?? '');

    // ── State ──────────────────────────────────────────────────────────────
    const [currentLesson, setCurrentLesson] = useState<CurriculumLesson | null>(null);
    // expandedModules: null means "not yet initialized" so we expand all after curriculum loads
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');

    useEffect(() => {
        const err = (classError || curriculumError || enrollmentError) as any;
        const status = err?.response?.status;
        if (!hasHandledForbiddenRef.current && status === 403) {
            hasHandledForbiddenRef.current = true;
            toast.error(err?.userMessage || 'Bạn không có quyền truy cập nội dung lớp học này.');
            router.replace('/dashboard/my-courses');
            return;
        }

        if (!hasHandledForbiddenRef.current && enrollmentData && !enrollmentData.isEnrolled) {
            hasHandledForbiddenRef.current = true;
            toast.error('Bạn chưa được ghi danh vào lớp học này.');
            router.replace('/dashboard/my-courses');
        }
    }, [enrollmentData, router]);

    const completedIds = new Set(completedContentItemIds);
    const currentLessonKind = normalizeItemKind(currentLesson?.kind);
    const shouldFetchLessonDetail = !!currentLesson?.referenceId && (isVideoItemKind(currentLessonKind) || currentLessonKind === 'READING');

    // ── Load curriculum → pick first uncompleted lesson + expand all ───────
    useEffect(() => {
        if (!curriculum) return;
        // Expand all modules
        setExpandedModules(new Set(curriculum.modules.map((m: any) => m.id)));

        // Pick first unlocked uncompleted lesson
        if (currentLesson) return; // already selected
        const requestedLessonId = searchParams.get('lesson');
        if (requestedLessonId) {
            for (const mod of curriculum.modules) {
                const requested = mod.lessons.find((lesson: CurriculumLesson) => lesson.id === requestedLessonId);
                if (requested?.isUnlocked) {
                    setCurrentLesson(requested);
                    return;
                }
            }
        }
        let pick: CurriculumLesson | null = null;
        for (const mod of curriculum.modules) {
            for (const lesson of mod.lessons) {
                const completed = isTrackableItemKind(lesson.kind)
                    ? completedIds.has(lesson.id)
                    : false;
                if (lesson.isUnlocked && !completed) {
                    pick = lesson; break;
                }
            }
            if (pick) break;
        }
        // fallback: first lesson at all
        if (!pick) pick = curriculum.modules[0]?.lessons[0] ?? null;
        setCurrentLesson(pick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curriculum?.courseId, searchParams]);

    // ── Fetch current lesson details (video url, article content etc.) ─────
    const { data: lessonDetail, isLoading: lessonLoading } = useAcademyLesson(
        currentLesson?.referenceId ?? '',
        { enabled: shouldFetchLessonDetail },
    );

    // ── Progress ───────────────────────────────────────────────────────────
    const markLessonComplete = useCallback(async () => {
        if (!currentLesson) return;
        if (!isTrackableItemKind(currentLesson.kind)) {
            toast.info('Loại nội dung này không được tính vào tiến độ học.');
            return;
        }
        if (completedIds.has(currentLesson.id)) { toast.info('Nội dung này đã được hoàn thành!'); return; }
        try {
            await academyLearningProgressApi.trackProgress({
                lessonId: currentLesson.id,
                classId: classId!,
            });
            queryClient.invalidateQueries({ queryKey: ['academy-learning', 'completed-lessons', classId] });
            toast.success('Đã hoàn thành nội dung! 🎉');
        } catch (e: any) {
            toast.error(e?.userMessage || 'Không thể cập nhật tiến độ.');
        }
    }, [currentLesson, completedIds, queryClient, classId]);

    // ── Nav ────────────────────────────────────────────────────────────────
    const allLessons: CurriculumLesson[] = curriculum?.modules.flatMap((m: any) => m.lessons) ?? [];
    const currentIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1;
    const prevLesson = currentIndex > 0 ? (allLessons[currentIndex - 1] ?? null) : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? (allLessons[currentIndex + 1] ?? null) : null;

    const goTo = (lesson: CurriculumLesson | null) => {
        if (!lesson?.isUnlocked) return;
        setCurrentLesson(lesson);
        setSidebarOpen(false);
        setActiveTab('content');
    };

    const toggleModule = (id: string) => setExpandedModules(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    // ── Computed ───────────────────────────────────────────────────────────
    const progressLessons = allLessons.filter((lesson) => isTrackableItemKind(lesson.kind));
    const totalLessons = progressLessons.length || allLessons.length;
    const completedCount = (progressLessons.length
        ? progressLessons.filter((lesson) => completedIds.has(lesson.id))
        : []
    ).length;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const radius = 24, circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPct / 100) * circumference;
    const isCurrentDone = !!currentLesson &&
        isTrackableItemKind(currentLesson.kind) &&
        completedIds.has(currentLesson.id);

    // ── Loading ────────────────────────────────────────────────────────────
    if (classLoading || curriculumLoading) {
        return (
            <div className="bg-background h-screen flex flex-col">
                <div className="h-16 border-b border-border bg-card flex items-center px-6 gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 p-8 space-y-4">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                    <div className="hidden xl:block w-[380px] border-l border-border p-4 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                    </div>
                </div>
            </div>
        );
    }

    // If forbidden handled, avoid flicker / crashes while redirecting
    const firstError: any = (classError || curriculumError || enrollmentError) as any;
    if (firstError?.response?.status === 403) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-3">
                    <p className="text-lg font-bold text-foreground">Bạn không có quyền truy cập</p>
                    <p className="text-sm text-muted-foreground">Đang chuyển hướng về khóa học của bạn...</p>
                </div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <p className="text-2xl font-bold text-foreground">Không tìm thấy khóa học</p>
                    <button onClick={() => router.push('/dashboard/my-courses')} className="text-primary hover:underline font-semibold">Về danh sách khóa học</button>
                </div>
            </div>
        );
    }

    const isVideoLesson = isLessonItemKind(currentLessonKind) && lessonDetail?.type === 'VIDEO';
    const isArticleLesson = isLessonItemKind(currentLessonKind) && lessonDetail?.type === 'READING';


    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="bg-background text-foreground font-sans antialiased h-screen flex flex-col overflow-hidden">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 z-50 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors shrink-0" title="Quay lại">
                        <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                            <div className="hidden sm:block min-w-0">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                                    {classData?.name}
                                </p>
                        {currentLesson && <p className="text-sm font-bold text-foreground truncate">{currentLesson.title}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Tiến độ: {progressPct}%</span>
                        <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {(classData?.name ?? 'T')[0] ?? 'T'}
                    </div>
                </div>
            </header>

            {/* ── BODY ───────────────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── MAIN ─────────────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto no-scrollbar">

                    {/* Content area */}
                    {isVideoLesson && (
                        <VideoPlayer lesson={lessonDetail} onComplete={markLessonComplete} />
                    )}

                    {/* Lesson details & meta */}
                    {(
                        <section className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto">
                            {/* Title + nav */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                                <div className="min-w-0">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                                        {currentLesson?.title ?? 'Chọn bài học'}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        {currentLesson?.videoDuration && <span>⏱ {fmtDuration(currentLesson.videoDuration)}</span>}
                                        {isCurrentDone && (
                                            <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 shrink-0">
                                    <button onClick={() => goTo(prevLesson)} disabled={!prevLesson?.isUnlocked}
                                        className="px-4 py-2.5 border border-border rounded-lg font-semibold text-sm hover:bg-muted transition disabled:opacity-40 flex items-center gap-1">
                                        <ChevronLeft className="h-4 w-4" /> Bài trước
                                    </button>
                                    {!isCurrentDone && currentLesson && (
                                        <button onClick={markLessonComplete}
                                            className="px-4 py-2.5 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-lg font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4" /> Hoàn thành
                                        </button>
                                    )}
                                    <button onClick={() => goTo(nextLesson)} disabled={!nextLesson?.isUnlocked}
                                        className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40 flex items-center gap-1 shadow-lg shadow-primary/20">
                                        Bài tiếp theo <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-border mb-8 overflow-x-auto no-scrollbar">
                                <nav className="flex whitespace-nowrap">
                                    {([
                                        { key: 'content' as const, label: 'Nội dung', icon: BookOpen },
                                        { key: 'discussion' as const, label: 'Thảo luận', icon: MessageSquare },
                                    ]).map(tab => (
                                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-1.5 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                            <tab.icon className="h-4 w-4" />{tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {activeTab === 'content' && (
                                <div className="space-y-5">
                                    <h3 className="text-xl font-bold text-foreground">Tổng quan bài học</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {(lessonDetail as any)?.description || (currentLesson
                                            ? `Bài học "${currentLesson.title}" thuộc khóa học ${classData?.name}.`
                                            : 'Chọn một bài học để bắt đầu.')}
                                    </p>
                                </div>
                            )}

                            {activeTab === 'discussion' && (
                                <div className="text-center py-12 text-muted-foreground space-y-2">
                                    <MessageSquare className="h-12 w-12 mx-auto opacity-40" />
                                    <p className="font-medium">Chưa có thảo luận nào.</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Article lesson */}
                    {isArticleLesson && currentLesson && !lessonLoading && (
                        <>
                            <div className="border-b border-border px-5 sm:px-10 pt-10 pb-0 max-w-3xl mx-auto flex flex-wrap gap-2 mb-0">
                                <button onClick={() => goTo(prevLesson)} disabled={!prevLesson?.isUnlocked}
                                    className="px-4 py-2 border border-border rounded-lg font-semibold text-sm hover:bg-muted transition disabled:opacity-40 flex items-center gap-1">
                                    <ChevronLeft className="h-4 w-4" /> Bài trước
                                </button>
                                <button onClick={() => goTo(nextLesson)} disabled={!nextLesson?.isUnlocked}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40 flex items-center gap-1">
                                    Bài tiếp theo <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <ArticleViewer lesson={lessonDetail!} onComplete={markLessonComplete} />
                        </>
                    )}

                    {/* Loading lesson detail */}
                    {lessonLoading && (
                        <div className="p-8 space-y-4 max-w-3xl mx-auto">
                            <Skeleton className="h-8 w-2/3" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    )}
                </main>

                {/* ── SIDEBAR ──────────────────────────────────────────── */}
                <aside
                    className={`
                        flex-col w-full xl:w-[380px] bg-card border-l border-border
                        fixed xl:static inset-0 xl:inset-auto z-40 xl:z-auto
                        transition-transform duration-300
                        ${sidebarOpen ? 'flex' : 'hidden xl:flex'}
                    `}
                >
                    {/* Mobile close */}
                    <div className="flex items-center justify-between p-4 border-b border-border xl:hidden shrink-0">
                        <span className="font-bold text-foreground">Nội dung khoá học</span>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-muted rounded-full">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Header */}
                    <div className="p-5 border-b border-border shrink-0">
                        <h3 className="text-base font-bold text-foreground mb-4 hidden xl:block">Nội dung khoá học</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative h-14 w-14 shrink-0">
                                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
                                    <circle className="text-muted" cx="32" cy="32" fill="transparent" r={radius} stroke="currentColor" strokeWidth="5" />
                                    <circle className="text-primary" cx="32" cy="32" fill="transparent" r={radius} stroke="currentColor"
                                        strokeLinecap="round" strokeWidth="5"
                                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{progressPct}%</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{completedCount}/{totalLessons} bài học</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {progressPct > 0
                                        ? `Đã hoàn thành ${progressPct}%`
                                        : 'Đang học'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Module list — fix: pass per-module isExpanded so each module controls independently */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {curriculum?.modules.map((mod: any) => (
                            <ModuleItem
                                key={mod.id}
                                mod={mod}
                                isExpanded={expandedModules.has(mod.id)}
                                onToggle={() => toggleModule(mod.id)}
                                currentLessonId={currentLesson?.id ?? null}
                                completedIds={completedIds}
                                onSelectLesson={lesson => { setCurrentLesson(lesson); setSidebarOpen(false); }}
                            />
                        ))}
                    </div>
                </aside>
            </div>

            {/* ── MOBILE FAB ─────────────────────────────────────────────── */}
            <button
                className="xl:hidden fixed bottom-6 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center z-[60] hover:scale-105 active:scale-95 transition-transform"
                onClick={() => setSidebarOpen(true)}
                aria-label="Mở danh sách bài học"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* ── STUDY NOTES PANEL ─────────────────────────────────────────── */}
            {lessonDetail?.id && (
                <StudyNotesPanel lessonId={lessonDetail.id} />
            )}
        </div>
    );
}
