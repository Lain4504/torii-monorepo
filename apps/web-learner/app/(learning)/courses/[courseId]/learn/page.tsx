'use client';

import { useState, useCallback, useEffect, useRef, useMemo, type SyntheticEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAcademyClass, useCurriculum, type CurriculumLesson, type CurriculumModule } from '@/lib/api/services/academy-classes';
import { useAcademyVodPackage, useAcademyVodCurriculum, useAcademyVodEnrollmentCheck, useAcademyVodCompletedLessonIds, academyVodLearningProgressApi } from '@/lib/api/services/academy-vod';
import { useAcademyEnrollmentCheck } from '@/lib/api/services/academy-enrollment-api';
import { useAcademyCompletedLessonIds, academyLearningProgressApi } from '@/lib/api/services/academy-learning-progress-api';
import { useAcademyLesson } from '@/lib/api/services/academy-lesson-api';
import { useAcademyLearnerAssessmentStatus, type AcademyAssessmentStatus } from '@/lib/api/services/academy-assessment-plan-api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@workspace/ui/components/sonner';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
    ChevronLeft, ChevronDown, ChevronUp, Menu, X,
    CheckCircle2, PlayCircle, Lock, FileText, BookOpen,
    MessageSquare, ChevronRight, Download, Send,
    AlertCircle, Clock, Trophy, HelpCircle, Timer, RotateCcw,
    Paperclip, PenTool
} from 'lucide-react';
import type { AcademyLessonModel } from '@workspace/schemas';
import { useAppSelector } from '@/hooks/hooks';
import { RootState } from '@/store/store';
import { LessonDiscussion } from '@/components/courses/lesson-discussion';

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(seconds?: number) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Lesson icon ──────────────────────────────────────────────────────────────

function LessonIcon({ lesson, isActive, isCompleted, unlocked }: {
    lesson: CurriculumLesson; isActive: boolean; isCompleted: boolean; unlocked: boolean;
}) {
    if (isCompleted) return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />;
    if (!unlocked) return <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />;
    if (normalizeItemKind(lesson.kind) === 'READING') {
        return <FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-500' : 'text-muted-foreground/60'}`} />;
    }
    return <PlayCircle className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />;
}

function normalizeItemKind(kind?: string) {
    return (kind || '').toUpperCase();
}

function isTrackableLessonKind(kind?: string) {
    const k = normalizeItemKind(kind);
    return k === 'VIDEO' || k === 'READING';
}

/** ID lưu trong tiến độ server — dùng node curriculum id */
function lessonProgressId(lesson: { id: string; referenceId?: string | null }) {
    return lesson.id;
}

// ─── Video Player — tự đánh dấu hoàn thành khi xem ≥95% hoặc khi video kết thúc (READING: không dùng component này) ─

function VideoPlayer({ lesson, onComplete }: { lesson: AcademyLessonModel | undefined; onComplete: () => void; }) {
    const autoMarkedRef = useRef(false);

    useEffect(() => {
        autoMarkedRef.current = false;
    }, [lesson?.id]);

    const markOnce = useCallback(() => {
        if (autoMarkedRef.current) return;
        autoMarkedRef.current = true;
        onComplete();
    }, [onComplete]);

    const onTimeUpdate = useCallback(
        (e: SyntheticEvent<HTMLVideoElement>) => {
            const v = e.currentTarget;
            const d = v.duration;
            if (!d || !Number.isFinite(d) || d <= 0) return;
            if (v.currentTime / d >= 0.95) {
                markOnce();
            }
        },
        [markOnce],
    );

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
                <div className="text-white/50 flex flex-col items-center gap-3 text-center px-4">
                    <AlertCircle className="h-12 w-12" />
                    <p className="text-sm">Video chưa được tải lên</p>
                    <p className="text-xs text-white/40 max-w-sm">Nhấn bên dưới để đánh dấu hoàn thành thủ công.</p>
                    <Button type="button" size="sm" onClick={onComplete}>
                        Đánh dấu hoàn thành
                    </Button>
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
                playsInline
                preload="metadata"
                className="w-full h-full"
                onEnded={markOnce}
                onTimeUpdate={onTimeUpdate}
            >
                Trình duyệt của bạn không hỗ trợ video.
            </video>
        </div>
    );
}

// ─── Article Viewer ───────────────────────────────────────────────────────────

function ArticleViewer({
    lesson,
    onComplete,
    onPrev,
    onNext,
    navDisabledPrev,
    navDisabledNext,
    courseClassId,
}: {
    lesson: AcademyLessonModel;
    onComplete: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    navDisabledPrev?: boolean;
    navDisabledNext?: boolean;
    courseClassId: string;
}) {
    return (
        <div className="p-6 sm:p-10 max-w-3xl mx-auto">
            {(onPrev || onNext) && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {onPrev && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onPrev}
                            disabled={navDisabledPrev}
                            className="font-semibold"
                        >
                            <ChevronLeft className="h-4 w-4" /> Bài trước
                        </Button>
                    )}
                    {onNext && (
                        <Button
                            type="button"
                            onClick={onNext}
                            disabled={navDisabledNext}
                            className="font-semibold"
                        >
                            Bài tiếp theo <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
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

            <p className="mt-8 text-sm text-muted-foreground">
                Bài đọc chỉ được lưu tiến độ khi bạn nhấn nút hoàn thành bên dưới.
            </p>
            <div className="mt-4 pt-4 border-t border-border">
                <Button type="button" size="sm" onClick={onComplete} className="gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    Hoàn thành bài học
                </Button>
            </div>

            {/* Lesson discussion */}
            <div className="mt-10">
                <LessonDiscussion
                    classId={courseClassId}
                    lessonId={(lesson as any).id}
                    moduleId={(lesson as any).moduleId}
                />
            </div>
        </div>
    );
}



function MilestoneItem({
    milestone,
    onClick
}: {
    milestone: AcademyAssessmentStatus;
    onClick: () => void;
}) {
    const isLocked = milestone.status === 'LOCKED';
    const isPassed = milestone.status === 'PASSED';
    const isInProgress = milestone.status === 'IN_PROGRESS';

    return (
        <Button
            variant="ghost"
            disabled={isLocked}
            onClick={() => !isLocked && onClick()}
            className={`w-full h-auto rounded-none px-5 py-4 flex items-center gap-3 text-left font-normal border-l-4 transition-all
                ${isInProgress ? 'border-amber-500 bg-amber-50/50' : isPassed ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent hover:bg-muted/30'}
                ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
            `}
        >
            <div className={`p-2 rounded-lg shrink-0 ${isPassed ? 'bg-emerald-100 text-emerald-600' : isLocked ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary'}`}>
                {isPassed ? <Trophy className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isPassed ? 'text-emerald-700' : isLocked ? 'text-slate-500' : 'text-slate-800'}`}>
                    [KIỂM TRA] {milestone.examTitle || 'Bài kiểm tra'}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                    {isLocked ? (
                        <span className="text-slate-400 flex items-center gap-1"><Lock className="h-3 w-3" /> Hoàn thành bài trước để mở</span>
                    ) : isPassed ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Đã vượt qua ({Math.round(milestone.percentage || 0)}%)</span>
                    ) : isInProgress ? (
                        <span className="text-amber-600 font-bold flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Đang làm dở</span>
                    ) : (
                        <span className="text-primary font-bold">Sẵn sàng để thi</span>
                    )}
                </div>
            </div>
            {!isLocked && !isPassed && (
                <ChevronRight className="h-4 w-4 text-slate-300" />
            )}
        </Button>
    );
}

function ModuleItem({
    mod, isExpanded, onToggle, currentLessonId, completedIds, onSelectLesson, isLessonUnlocked, milestones, onSelectMilestone
}: {
    mod: CurriculumModule;
    isExpanded: boolean;
    onToggle: () => void;
    currentLessonId: string | null;
    completedIds: Set<string>;
    onSelectLesson: (l: CurriculumLesson) => void;
    isLessonUnlocked: (l: CurriculumLesson) => boolean;
    milestones?: AcademyAssessmentStatus[];
    onSelectMilestone?: (m: AcademyAssessmentStatus) => void;
}) {
    const hasActive = mod.lessons.some(l => l.id === currentLessonId);
    const trackableInMod = mod.lessons.filter((l) => isTrackableLessonKind(l.kind));
    const denom = trackableInMod.length > 0 ? trackableInMod.length : mod.lessons.length;
    const doneCount = mod.lessons.filter((lesson) => {
        if (!isTrackableLessonKind(lesson.kind)) return false;
        return completedIds.has(lessonProgressId(lesson));
    }).length;

    return (
        <div className="border-b border-border last:border-0">
            <Button
                variant="ghost"
                className={`w-full h-auto rounded-none px-5 py-3.5 flex items-center justify-between text-left font-normal transition-colors group ${hasActive ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
                onClick={onToggle}
            >
                <div className="min-w-0 pr-3">
                    <p className={`text-sm font-semibold truncate ${hasActive ? 'text-primary' : 'text-foreground'}`}>{mod.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{doneCount}/{denom} bài{mod.durationMinutes ? ` · ${mod.durationMinutes} phút` : ''}</p>
                </div>
                {isExpanded
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                }
            </Button>

            {isExpanded && (
                <div className="bg-background/50">
                    {mod.lessons.map(lesson => {
                        const isActive = lesson.id === currentLessonId;
                        const unlocked = isLessonUnlocked(lesson);
                        const isDone = isTrackableLessonKind(lesson.kind)
                            ? completedIds.has(lessonProgressId(lesson))
                            : false;

                        const lessonMilestones = milestones?.filter(m => m.triggerLessonId === lesson.id) || [];

                        return (
                            <div key={lesson.id}>
                                <Button
                                    variant="ghost"
                                    disabled={!unlocked}
                                    onClick={() => unlocked && onSelectLesson(lesson)}
                                    className={`w-full h-auto rounded-none px-5 py-3 flex items-center gap-3 text-left font-normal border-l-4 transition-colors
                                        ${isActive ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/30'}
                                        ${!unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <LessonIcon lesson={lesson} isActive={isActive} isCompleted={isDone} unlocked={unlocked} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${isActive ? 'font-bold text-foreground' : isDone ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                                            {lesson.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                            {isActive && <span className="text-primary font-semibold">Đang học</span>}
                                            {isDone && !isActive && <span className="text-emerald-500">Hoàn thành</span>}
                                            {!isActive && !isDone && unlocked && <span>Chưa học</span>}
                                            {!unlocked && <span>Đã khóa</span>}
                                            {lesson.videoDuration && <span>· {fmtDuration(lesson.videoDuration)}</span>}
                                        </div>
                                    </div>
                                </Button>
                                {lessonMilestones.map(m => (
                                    <MilestoneItem
                                        key={m.assessmentId}
                                        milestone={m}
                                        onClick={() => onSelectMilestone?.(m)}
                                    />
                                ))}
                            </div>
                        );
                    })}

                    {milestones?.filter(m => !m.triggerLessonId).map(m => (
                        <MilestoneItem
                            key={m.assessmentId}
                            milestone={m}
                            onClick={() => onSelectMilestone?.(m)}
                        />
                    ))}
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
    const requestedMode = searchParams.get('mode')?.toUpperCase();
    const queryClient = useQueryClient();
    const hasHandledForbiddenRef = useRef(false);

    const { data: enrollmentData, error: enrollmentError } = useAcademyEnrollmentCheck(classId);

    // ── API (Smart Bridge) ────────────────────────────────────────────────
    // 1. Try to fetch as a Live Class
    const { data: liveClassData, isLoading: liveClassLoading, error: liveClassError } = useAcademyClass(classId);
    const { data: liveCurriculum, isLoading: liveCurriculumLoading, error: liveCurriculumError } = useCurriculum(classId);

    // 2. Determine mode (VOD vs LIVE)
    // - Check Gateway's Smart Bridge fallback (returns mode: 'VOD' for liveClassId)
    // - Check explicit enrollment type
    // - Check for 404/403 errors that suggest the class is not of this type
    const liveMode = String((liveClassData as any)?.mode ?? '').toUpperCase();
    const isVodCandidateAuto =
        liveMode === 'VOD' ||
        enrollmentData?.enrollment?.type === 'vod' ||
        (liveClassError as any)?.response?.status === 404 ||
        (liveClassError as any)?.response?.status === 403 ||
        (liveCurriculumError as any)?.response?.status === 404 ||
        (liveCurriculumError as any)?.response?.status === 403;

    // `?mode=LIVE`/`?mode=VOD` override
    const isVodCandidate = requestedMode === 'LIVE' ? false : (requestedMode === 'VOD' ? true : isVodCandidateAuto);

    const { data: vodPackageData, isLoading: vodLoading } = useAcademyVodPackage(classId, { enabled: isVodCandidate });
    const { data: vodCurriculum, isLoading: vodCurriculumLoading } = useAcademyVodCurriculum(classId, { enabled: isVodCandidate });

    // 3. Consolidated Data
    const classData = liveClassData || vodPackageData;
    const curriculum = liveCurriculum || vodCurriculum;
    const isLoading = (liveClassLoading && liveCurriculumLoading) || (isVodCandidate && (vodLoading || vodCurriculumLoading));

    // 4. Completed Lessons check
    // Original hook doesn't support options object, so we call it simply
    const { data: liveCompletedIds = [] } = useAcademyCompletedLessonIds(classId ?? '');
    const { data: vodCompletedIds = [] } = useAcademyVodCompletedLessonIds(classId ?? '', { enabled: isVodCandidate });
    const completedContentItemIds = isVodCandidate ? vodCompletedIds : liveCompletedIds;

    // ── Milestones ────────────────────────────────────────────────────────
    const { data: milestones = [] } = useAcademyLearnerAssessmentStatus({ classId });

    // ── State ──────────────────────────────────────────────────────────────
    const [currentLesson, setCurrentLesson] = useState<CurriculumLesson | null>(null);
    // expandedModules: null means "not yet initialized" so we expand all after curriculum loads
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');

    useEffect(() => {
        // Handle explicit forbidden/unauthorized from enrollment check
        const isForbiddenEnrollment = (enrollmentError as any)?.response?.status === 403 ||
            (!isLoading && enrollmentData && !enrollmentData.isEnrolled);

        if (!hasHandledForbiddenRef.current && isForbiddenEnrollment) {
            hasHandledForbiddenRef.current = true;
            toast.error('Bạn không có quyền truy cập hoặc chưa được ghi danh vào lớp học này.');
            router.replace('/dashboard/my-courses');
            return;
        }

        // Handle case where course is truly not found in both modes (only if not loading)
        const isNotFound = !isLoading && !classData &&
            (liveClassError as any)?.response?.status === 404 &&
            (isVodCandidate ? (vodLoading || !vodPackageData) : true);

        if (!hasHandledForbiddenRef.current && isNotFound) {
            hasHandledForbiddenRef.current = true;
            toast.error('Không tìm thấy thông tin lớp học.');
            router.replace('/dashboard/my-courses');
        }
    }, [enrollmentData, enrollmentError, liveClassError, isLoading, classData, isVodCandidate, vodLoading, vodPackageData, router]);

    const completedIds = useMemo(() => new Set(completedContentItemIds), [completedContentItemIds]);

    const allLessons: CurriculumLesson[] = curriculum?.modules.flatMap((m: any) => m.lessons) ?? [];
    const trackableOrdered = useMemo(
        () => allLessons.filter((l) => isTrackableLessonKind(l.kind)),
        [allLessons],
    );

    const isSequentialUnlocked = useCallback(
        (lesson: CurriculumLesson) => {
            if (!isTrackableLessonKind(lesson.kind)) return true;
            const idx = trackableOrdered.findIndex((l) => l.id === lesson.id);
            if (idx <= 0) return true;
            const prev = trackableOrdered[idx - 1];
            return prev ? completedIds.has(lessonProgressId(prev)) : true;
        },
        [trackableOrdered, completedIds],
    );

    const effectiveLessonUnlocked = useCallback(
        (lesson: CurriculumLesson) => lesson.isUnlocked && isSequentialUnlocked(lesson),
        [isSequentialUnlocked],
    );

    const currentLessonKind = normalizeItemKind(currentLesson?.kind);
    const shouldFetchLessonDetail = !!currentLesson?.referenceId;

    // ── Load curriculum → pick first uncompleted lesson + expand all ───────
    useEffect(() => {
        if (!curriculum) return;
        // Expand all modules
        setExpandedModules(new Set(curriculum.modules.map((m: any) => m.id)));

        // Pick first unlocked uncompleted lesson
        if (currentLesson) return; // already selected
        const flat = curriculum.modules.flatMap((m: any) => m.lessons) as CurriculumLesson[];
        const requestedLessonId = searchParams.get('lesson');
        if (requestedLessonId) {
            for (const mod of curriculum.modules) {
                const requested = mod.lessons.find((lesson: CurriculumLesson) => lesson.id === requestedLessonId);
                if (requested && effectiveLessonUnlocked(requested)) {
                    setCurrentLesson(requested);
                    return;
                }
            }
        }
        let pick: CurriculumLesson | null = null;
        for (const lesson of flat) {
            const completed = isTrackableLessonKind(lesson.kind)
                ? completedIds.has(lessonProgressId(lesson))
                : false;
            if (effectiveLessonUnlocked(lesson) && !completed) {
                pick = lesson;
                break;
            }
        }
        // fallback: first lesson at all
        if (!pick) pick = curriculum.modules[0]?.lessons[0] ?? null;
        setCurrentLesson(pick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curriculum?.courseId, searchParams, completedContentItemIds]);

    // ── Fetch current lesson details (video url, article content etc.) ─────
    const { data: lessonDetail, isLoading: lessonLoading } = useAcademyLesson(
        currentLesson?.referenceId ?? '',
        { enabled: shouldFetchLessonDetail },
    );

    // ── Progress ───────────────────────────────────────────────────────────
    const markLessonComplete = useCallback(async () => {
        if (!currentLesson) return;
        if (!isTrackableLessonKind(currentLesson.kind)) {
            toast.info('Loại nội dung này không được tính vào tiến độ học.');
            return;
        }
        if (completedIds.has(lessonProgressId(currentLesson))) { toast.info('Nội dung này đã được hoàn thành!'); return; }
        try {
            if (isVodCandidate) {
                await academyVodLearningProgressApi.trackProgress({
                    lessonId: currentLesson.id,
                    packageId: classId!,
                });
                await queryClient.invalidateQueries({
                    queryKey: ['academy-vod-learning', 'completed-lessons', classId],
                });
            } else {
                await academyLearningProgressApi.trackProgress({
                    lessonId: currentLesson.id,
                    classId: classId!,
                });
                await queryClient.invalidateQueries({
                    queryKey: ['academy-learning', 'completed-lessons', classId],
                });
            }
            // Refresh My Courses progress bar & stats after lesson completion
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['academy-learning', 'my-courses'] }),
                queryClient.invalidateQueries({ queryKey: ['academy-learning', 'stats'] }),
                queryClient.invalidateQueries({ queryKey: ['academy-enrollments', 'me'] }),
            ]);
            toast.success('Đã hoàn thành nội dung! 🎉');
        } catch (e: any) {
            toast.error(e?.userMessage || 'Không thể cập nhật tiến độ.');
        }
    }, [currentLesson, completedIds, queryClient, classId, isVodCandidate]);

    // ── Nav ────────────────────────────────────────────────────────────────
    const currentIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1;
    const prevLesson = currentIndex > 0 ? (allLessons[currentIndex - 1] ?? null) : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? (allLessons[currentIndex + 1] ?? null) : null;

    const goTo = (lesson: CurriculumLesson | null) => {
        if (!lesson || !effectiveLessonUnlocked(lesson)) return;
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
    const progressLessons = allLessons.filter((lesson) => isTrackableLessonKind(lesson.kind));
    const totalLessons = progressLessons.length || allLessons.length;
    const completedCount = (progressLessons.length
        ? progressLessons.filter((lesson) => completedIds.has(lessonProgressId(lesson)))
        : []
    ).length;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const radius = 24, circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPct / 100) * circumference;
    const isCurrentDone = !!currentLesson &&
        isTrackableLessonKind(currentLesson.kind) &&
        completedIds.has(lessonProgressId(currentLesson));

    // ── Loading ────────────────────────────────────────────────────────────
    if (isLoading) {
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
    const firstError: any = (liveClassError || liveCurriculumError || enrollmentError) as any;
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
                    <Button variant="link" className="font-semibold" onClick={() => router.push('/dashboard/my-courses')}>
                        Về danh sách khóa học
                    </Button>
                </div>
            </div>
        );
    }

    const isVideoLesson = currentLessonKind === 'VIDEO';
    const isArticleLesson = currentLessonKind === 'READING';


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
                    <Button variant="ghost" size="icon-sm" className="shrink-0 rounded-full" onClick={() => router.back()} title="Quay lại">
                        <ChevronLeft className="h-5 w-5 text-foreground" />
                    </Button>
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
                        <>
                            <VideoPlayer lesson={lessonDetail} onComplete={markLessonComplete} />
                            {!isCurrentDone && lessonDetail?.videoUrl && (
                                <p className="border-b border-border bg-muted/25 px-3 py-2 text-center text-xs text-muted-foreground sm:px-4">
                                    Video được lưu tiến độ tự động khi bạn xem đến cuối hoặc đã xem ít nhất 95% thời lượng.
                                </p>
                            )}
                        </>
                    )}

                    {/* Lesson details & meta — ẩn với bài READING để tránh trùng tiêu đề/tab với ArticleViewer */}
                    {!isArticleLesson && (
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
                                    <Button
                                        variant="outline"
                                        className="font-semibold shadow-none"
                                        onClick={() => goTo(prevLesson)}
                                        disabled={!prevLesson || !effectiveLessonUnlocked(prevLesson)}
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Bài trước
                                    </Button>
                                    {/* VIDEO: tự động khi xem xong / ≥95%; READING & loại khác: người học bấm Hoàn thành */}
                                    {!isCurrentDone && currentLesson && !isVideoLesson && (
                                        <Button type="button" size="sm" onClick={markLessonComplete} className="gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                                            Hoàn thành
                                        </Button>
                                    )}
                                    <Button
                                        className="font-semibold shadow-lg shadow-primary/20"
                                        onClick={() => goTo(nextLesson)}
                                        disabled={!nextLesson || !effectiveLessonUnlocked(nextLesson)}
                                    >
                                        Bài tiếp theo <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <Tabs
                                value={activeTab}
                                onValueChange={(v) => setActiveTab(v as 'content' | 'discussion')}
                                className="w-full"
                            >
                                <div className="border-b border-border mb-8 overflow-x-auto no-scrollbar">
                                    <TabsList variant="line" className="w-full min-h-0 justify-start rounded-none border-0 bg-transparent p-0 h-auto gap-0">
                                        <TabsTrigger value="content" className="py-4 px-4 gap-1.5 data-[state=active]:text-primary">
                                            <BookOpen className="h-4 w-4" />
                                            Nội dung
                                        </TabsTrigger>
                                        <TabsTrigger value="discussion" className="py-4 px-4 gap-1.5 data-[state=active]:text-primary">
                                            <MessageSquare className="h-4 w-4" />
                                            Thảo luận
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="content" className="mt-0 space-y-5 outline-none">
                                    <h3 className="text-xl font-bold text-foreground">Tổng quan bài học</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {(lessonDetail as any)?.description || (currentLesson
                                            ? `Bài học "${currentLesson.title}" thuộc khóa học ${classData?.name}.`
                                            : 'Chọn một bài học để bắt đầu.')}
                                    </p>
                                </TabsContent>

                                <TabsContent value="discussion" className="mt-0 outline-none">
                                    <LessonDiscussion
                                        classId={classId as string}
                                        lessonId={(currentLesson as any)?.id ?? ''}
                                        moduleId={(currentLesson as any)?.moduleId}
                                    />
                                </TabsContent>
                            </Tabs>
                        </section>
                    )}

                    {/* Article lesson — một luồng duy nhất: điều hướng nằm trong ArticleViewer */}
                    {isArticleLesson && currentLesson && !lessonLoading && (
                        <ArticleViewer
                            lesson={lessonDetail!}
                            onComplete={markLessonComplete}
                            onPrev={() => goTo(prevLesson)}
                            onNext={() => goTo(nextLesson)}
                            navDisabledPrev={!prevLesson || !effectiveLessonUnlocked(prevLesson)}
                            navDisabledNext={!nextLesson || !effectiveLessonUnlocked(nextLesson)}
                            courseClassId={classId as string}
                        />
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
                        <Button variant="ghost" size="icon-sm" className="rounded-full" onClick={() => setSidebarOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
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
                                isLessonUnlocked={effectiveLessonUnlocked}
                                milestones={milestones.filter(m =>
                                    m.kind !== 'FINAL_EXAM' && (
                                        m.moduleId === mod.id ||
                                        (m.triggerLessonId && mod.lessons?.some((l: any) => l.id === m.triggerLessonId))
                                    )
                                )}
                                onSelectMilestone={m => router.push(`/exams/${m.examId}${m.latestAttemptId ? `?attemptId=${m.latestAttemptId}` : ''}`)}
                                onSelectLesson={lesson => { setCurrentLesson(lesson); setSidebarOpen(false); }}
                            />
                        ))}
                        {/* Final Exams at the bottom */}
                        {milestones.filter(m => m.kind === 'FINAL_EXAM').map(m => (
                            <MilestoneItem
                                key={m.assessmentId}
                                milestone={m}
                                onClick={() => router.push(`/exams/${m.examId}${m.latestAttemptId ? `?attemptId=${m.latestAttemptId}` : ''}`)}
                            />
                        ))}
                    </div>
                </aside>
            </div>

            {/* ── MOBILE FAB ─────────────────────────────────────────────── */}
            <Button
                size="icon-lg"
                className="xl:hidden fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
                onClick={() => setSidebarOpen(true)}
                aria-label="Mở danh sách bài học"
            >
                <Menu className="h-6 w-6" />
            </Button>

        </div>
    );
}
