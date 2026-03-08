'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAcademyCourseById } from '@/lib/api/services/academy-course-api';
import { useAcademyClass, useCurriculum } from '@/lib/api/services/academy-classes';
import { useAcademyEnrollmentCheck } from '@/lib/api/services/academy-enrollment-api';
import { useAcademyCompletedLessonIds, academyLearningProgressApi } from '@/lib/api/services/academy-learning-progress-api';
import { useAcademyLesson } from '@/lib/api/services/academy-lesson-api';
import {
    useAcademyAssignmentSubmissions, useCreateAcademyAssignmentSubmission, useUpdateAcademyAssignmentSubmission,
    useAcademyAssignmentTemplates
} from '@/lib/api/services/academy-assignment-api';
import {
    useAcademyQuizTemplate
} from '@/lib/api/services/academy-quiz-api';
import {
    useStartAcademyExamAttempt, useSaveAcademyExamAnswers, useSubmitAcademyExamAttempt
} from '@/lib/api/services/academy-exam-api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@workspace/ui/components/sonner';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import {
    ChevronLeft, ChevronDown, ChevronUp, Menu, X,
    CheckCircle2, PlayCircle, Lock, FileText, BookOpen,
    MessageSquare, ChevronRight, Save, Download, Send,
    AlertCircle, Clock, Trophy, HelpCircle, Timer, RotateCcw,
    Paperclip, PenTool
} from 'lucide-react';
import { MultiFileUpload } from '@/components/common/multi-file-upload';
import type { CurriculumLesson, CurriculumModule } from '@/lib/api/services/academy-classes';
import { StudyNotesPanel } from '@/components/courses/study-notes-panel';

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
    if (lesson.contentType === 'document') return <FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />;
    if (lesson.contentType === 'assignment') return <BookOpen className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-500' : 'text-muted-foreground/60'}`} />;
    if (lesson.contentType === 'quiz') return <HelpCircle className={`h-4 w-4 shrink-0 ${isActive ? 'text-violet-500' : 'text-muted-foreground/60'}`} />;
    return <PlayCircle className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />;
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

    if (!lesson.contentUrl) {
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
                src={lesson.contentUrl}
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

            {lesson.contentBody ? (
                <div
                    className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: lesson.contentBody }}
                />
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

// ─── Assignment Panel ─────────────────────────────────────────────────────────

function AssignmentPanel({
    lessonId, templateId, classId, classAssessmentId, onComplete
}: { lessonId: string; templateId: string; classId?: string; classAssessmentId?: string; onComplete: () => void; }) {
    const { data: assignment, isLoading: assignmentLoading } = useAcademyAssignmentTemplate(templateId);

    const { data: submissions } = useAcademyAssignmentSubmissions({
        assignmentTemplateId: templateId,
        ...(classId ? { classId: classId } : {}),
        ...(classAssessmentId ? { classAssessmentId: classAssessmentId } : {})
    }, { enabled: !!templateId });
    const submission = submissions?.[0];

    const submitMutation = useCreateAcademyAssignmentSubmission();
    const updateMutation = useUpdateAcademyAssignmentSubmission();

    const [textAnswer, setTextAnswer] = useState('');
    const [fileUrls, setFileUrls] = useState<string[]>([]);

    useEffect(() => {
        if (submission?.content) {
            const content = typeof submission.content === 'string' ? JSON.parse(submission.content) : submission.content;
            if (content?.textAnswer) setTextAnswer(content.textAnswer);
            if (content?.fileUrls) setFileUrls(content.fileUrls);
        }
    }, [submission?.content]);

    if (assignmentLoading) {
        return (
            <div className="p-8 space-y-4 max-w-3xl mx-auto">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Bài tập đang được chuẩn bị.</p>
            </div>
        );
    }

    const isSubmitted = submission?.status === 'SUBMITTED' || submission?.status === 'GRADED';
    const isGraded = submission?.status === 'GRADED';

    return (
        <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-border">
                <div className="p-3 rounded-xl bg-amber-500/10 shrink-0">
                    <BookOpen className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">{assignment.title}</h2>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> {assignment.defaultMaxScore} điểm</span>
                    </div>
                </div>
            </div>

            {/* Description / Instructions */}
            {assignment.description && (
                <div className="bg-muted/40 rounded-xl p-5 border border-border">
                    <h3 className="font-bold text-foreground mb-2 text-sm uppercase tracking-wider">Hướng dẫn</h3>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {assignment.description}
                    </p>
                </div>
            )}

            {/* Graded result */}
            {isGraded && submission && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Đã chấm điểm</span>
                    </div>
                    <p className="text-3xl font-black text-foreground">{submission.score ?? 0} <span className="text-lg font-normal text-muted-foreground">/ {assignment.defaultMaxScore}</span></p>
                </div>
            )}

            {/* Submission form */}
            {(assignment.defaultType === 'TEXT' || assignment.defaultType === 'BOTH') && (
                <div>
                    <label className="block font-semibold text-foreground mb-3 text-sm uppercase tracking-widest">Câu trả lời bài viết</label>
                    <textarea
                        className="w-full h-48 p-4 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none transition"
                        placeholder="Nhập nội dung bài làm của bạn tại đây..."
                        value={textAnswer}
                        onChange={e => setTextAnswer(e.target.value)}
                        disabled={isSubmitted}
                        readOnly={isSubmitted}
                    />
                </div>
            )}

            {(assignment.defaultType === 'FILE' || assignment.defaultType === 'BOTH') && (
                <div className="space-y-3">
                    <label className="block font-semibold text-foreground text-sm uppercase tracking-widest">Tệp đính kèm bài làm</label>
                    <MultiFileUpload
                        currentUrls={fileUrls}
                        onUploadChange={setFileUrls}
                        disabled={isSubmitted}
                        maxFiles={5}
                        label="Tải lên tệp bài làm của bạn"
                    />
                </div>
            )}

            {/* Action buttons */}
            {!isSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => {
                            const content = { textAnswer, fileUrls };
                            if (submission) {
                                updateMutation.mutate({ id: submission.id, dto: { content, status: 'DRAFT' } }, { onSuccess: () => toast.success('Đã lưu nháp!') });
                            } else {
                                submitMutation.mutate({ assignmentTemplateId: templateId, classId, classAssessmentId, content, status: 'DRAFT', userId: 'me' }, { onSuccess: () => toast.success('Đã lưu nháp!') });
                            }
                        }}
                        disabled={submitMutation.isPending || updateMutation.isPending}
                        className="flex-1 sm:flex-none px-6 py-3 border border-border rounded-xl font-semibold text-sm hover:bg-muted/50 transition flex items-center justify-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {submitMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu nháp'}
                    </button>
                    <button
                        onClick={() => {
                            const content = { textAnswer, fileUrls };
                            if (submission) {
                                updateMutation.mutate({ id: submission.id, dto: { content, status: 'SUBMITTED' } }, {
                                    onSuccess: () => { toast.success('Đã nộp bài!'); onComplete(); },
                                    onError: () => toast.error('Lỗi khi nộp bài.')
                                });
                            } else {
                                submitMutation.mutate({ assignmentTemplateId: templateId, classId, classAssessmentId, content, status: 'SUBMITTED', userId: 'me' }, {
                                    onSuccess: () => { toast.success('Đã nộp bài!'); onComplete(); },
                                    onError: () => toast.error('Lỗi khi nộp bài.')
                                });
                            }
                        }}
                        disabled={submitMutation.isPending || updateMutation.isPending || (assignment.defaultType !== 'FILE' && !textAnswer.trim()) || (assignment.defaultType === 'FILE' && fileUrls.length === 0)}
                        className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Send className="h-4 w-4" />
                        {submitMutation.isPending || updateMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-xl p-4">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Đã nộp vào {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : ''}
                </div>
            )}
        </div>
    );
}

// ─── Quiz Panel ───────────────────────────────────────────────────────────────

type QuizPanelState = 'intro' | 'in_progress' | 'result';

const SectionTypeMap: Record<string, string> = {
    'vocab': 'Từ vựng',
    'grammar': 'Ngữ pháp',
    'reading': 'Đọc hiểu',
    'listening': 'Nghe hiểu'
};

function QuizPanel({
    lessonId, templateId, classId, onComplete
}: { lessonId: string; templateId: string; classId?: string; onComplete: () => void; }) {
    const { data: quiz, isLoading: quizLoading } = useAcademyQuizTemplate(templateId);

    // We will just show the info and a "Mark Complete" button for now
    // until the Quiz taking UI is fully integrated with Exam attempts.

    if (quizLoading) {
        return (
            <div className="p-8 space-y-4 max-w-3xl mx-auto">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="p-8 text-center text-muted-foreground max-w-3xl mx-auto">
                <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Quiz chưa được thiết lập cho bài học này.</p>
                <p className="text-sm mt-1">Vui lòng liên hệ giảng viên.</p>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-10 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-border mb-8">
                <div className="p-4 rounded-2xl bg-violet-500/10 shrink-0">
                    <HelpCircle className="h-8 w-8 text-violet-500" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-1">Quiz</p>
                    <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>
                    {quiz.description && <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
                    <p className="text-2xl font-black text-foreground">{'?'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Câu hỏi</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
                    <p className="text-2xl font-black text-foreground">{quiz.timeLimit ?? '∞'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Phút</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
                    <p className="text-2xl font-black text-foreground">{quiz.passingScore ?? 60}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Đạt</p>
                </div>
            </div>

            {quiz.maxAttempts > 0 && (
                <p className="text-sm text-muted-foreground mb-6">
                    Số lần làm tối đa: <strong>{quiz.maxAttempts}</strong>
                </p>
            )}

            <div className="space-y-4 bg-muted/30 border border-border rounded-xl p-6 text-center">
                <p className="text-sm text-foreground font-medium">
                    Hệ thống làm bài thi đang được nâng cấp.
                </p>
                <button
                    onClick={onComplete}
                    className="w-full py-4 bg-violet-500 hover:bg-violet-600 text-white rounded-2xl font-bold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                >
                    <CheckCircle2 className="h-5 w-5" /> Đánh dấu hoàn thành
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
    const doneCount = mod.lessons.filter(l => completedIds.has(l.id)).length;

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
                        const isDone = completedIds.has(lesson.id);
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
    const queryClient = useQueryClient();

    // ── API ────────────────────────────────────────────────────────────────
    // 1. Fetch the class first
    const { data: classData, isLoading: classLoading } = useAcademyClass(classId);
    const courseProfileId = classData?.courseProfileId;

    // 2. Fetch other details using courseProfileId
    const { data: course, isLoading: courseLoading } = useAcademyCourseById(courseProfileId ?? '');
    const { data: curriculum, isLoading: curriculumLoading } = useCurriculum(classId);
    const { data: enrollmentData } = useAcademyEnrollmentCheck(classId);
    const { data: completedLessonIds = [] } = useAcademyCompletedLessonIds(classId ?? '');

    // ── State ──────────────────────────────────────────────────────────────
    const [currentLesson, setCurrentLesson] = useState<CurriculumLesson | null>(null);
    // expandedModules: null means "not yet initialized" so we expand all after curriculum loads
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');
    const [note, setNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    const completedIds = new Set(completedLessonIds);

    // ── Load curriculum → pick first uncompleted lesson + expand all ───────
    useEffect(() => {
        if (!curriculum) return;
        // Expand all modules
        setExpandedModules(new Set(curriculum.modules.map((m: any) => m.id)));

        // Pick first unlocked uncompleted lesson
        if (currentLesson) return; // already selected
        let pick: CurriculumLesson | null = null;
        for (const mod of curriculum.modules) {
            for (const lesson of mod.lessons) {
                if (lesson.isUnlocked && !completedIds.has(lesson.id)) {
                    pick = lesson; break;
                }
            }
            if (pick) break;
        }
        // fallback: first lesson at all
        if (!pick) pick = curriculum.modules[0]?.lessons[0] ?? null;
        setCurrentLesson(pick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curriculum?.courseId]);

    // ── Fetch current lesson details (video url, article content etc.) ─────
    const { data: lessonDetail, isLoading: lessonLoading } = useAcademyLesson(currentLesson?.referenceId ?? '');

    // ── Progress ───────────────────────────────────────────────────────────
    const markLessonComplete = useCallback(async () => {
        if (!currentLesson) return;
        if (completedIds.has(currentLesson.id)) { toast.info('Bài học này đã được hoàn thành!'); return; }
        try {
            await academyLearningProgressApi.trackProgress({
                lessonId: currentLesson.id,
                classId: classId!,
                status: 'COMPLETED',
                progressPercent: 100
            });
            queryClient.invalidateQueries({ queryKey: ['academy-learning', 'completed-lessons', classId] });
            toast.success('Đã hoàn thành bài học! 🎉');
        } catch {
            toast.error('Không thể cập nhật tiến độ.');
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
    const totalLessons = allLessons.length;
    const completedCount = allLessons.filter(l => completedIds.has(l.id)).length;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const radius = 24, circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPct / 100) * circumference;
    const isCurrentDone = !!currentLesson && completedIds.has(currentLesson.id);

    // ── Loading ────────────────────────────────────────────────────────────
    if (classLoading || courseLoading || curriculumLoading) {
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

    const contentType = lessonDetail?.contentType ?? currentLesson?.contentType ?? 'video';
    const isVideoLesson = contentType === 'video';
    const isArticleLesson = contentType === 'article';
    const isAssignmentLesson = contentType === 'assignment';
    const isQuizLesson = contentType === 'quiz';


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
                            {course?.title ?? classData?.name}
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
                        {(course?.title ?? classData?.name)?.[0] ?? 'T'}
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

                    {/* Lesson details below video (or full page for article/assignment) */}
                    {(isVideoLesson || !currentLesson) && (
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
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-5">
                                        <h3 className="text-xl font-bold text-foreground">Tổng quan bài học</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {(lessonDetail as any)?.description || (currentLesson
                                                ? `Bài học "${currentLesson.title}" thuộc khóa học ${course?.title ?? classData?.name}.`
                                                : 'Chọn một bài học để bắt đầu.')}
                                        </p>
                                        {(course as any)?.learningOutcomes && Array.isArray((course as any).learningOutcomes) && ((course as any).learningOutcomes as string[]).length > 0 && (
                                            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl">
                                                <h4 className="text-primary font-bold mb-3 uppercase text-sm tracking-widest">Mục tiêu khóa học</h4>
                                                <ul className="space-y-2">
                                                    {((course as any).learningOutcomes as string[]).slice(0, 4).map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm">
                                                            <span className="text-primary mt-0.5 shrink-0">•</span><span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    {/* Quick notes */}
                                    <div className="bg-muted/40 p-6 rounded-xl border border-border">
                                        <h3 className="font-bold text-foreground mb-4 text-sm">Ghi chú nhanh</h3>
                                        <textarea className="w-full h-40 p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
                                            placeholder="Ghi chú cho bài học này..." value={note} onChange={e => setNote(e.target.value)} />
                                        <button className="mt-3 w-full bg-foreground text-background py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                                            onClick={async () => {
                                                setSavingNote(true);
                                                try {
                                                    const { StudyNoteApi } = await import('@/lib/api/services/study-note-api');
                                                    if (currentLesson?.id) {
                                                        await StudyNoteApi.create({ content: note, lessonId: currentLesson.id });
                                                        toast.success('Đã lưu ghi chú!');
                                                    }
                                                } catch (e: any) {
                                                    toast.error('Lỗi khi lưu ghi chú');
                                                } finally {
                                                    setSavingNote(false);
                                                }
                                            }}
                                            disabled={savingNote}
                                        >
                                            <Save className="h-4 w-4" /> {savingNote ? 'Đang lưu...' : 'Lưu ghi chú nhanh'}
                                        </button>
                                    </div>
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

                    {/* Assignment lesson */}
                    {isAssignmentLesson && currentLesson && !lessonLoading && (
                        <>
                            <div className="px-5 sm:px-10 pt-8 max-w-3xl mx-auto flex flex-wrap gap-2">
                                <button onClick={() => goTo(prevLesson)} disabled={!prevLesson?.isUnlocked}
                                    className="px-4 py-2 border border-border rounded-lg font-semibold text-sm hover:bg-muted transition disabled:opacity-40 flex items-center gap-1">
                                    <ChevronLeft className="h-4 w-4" /> Bài trước
                                </button>
                                <button onClick={() => goTo(nextLesson)} disabled={!nextLesson?.isUnlocked}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40 flex items-center gap-1">
                                    Bài tiếp theo <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <AssignmentPanel
                                lessonId={currentLesson.id}
                                templateId={currentLesson.referenceId!}
                                classId={classId}
                                onComplete={markLessonComplete}
                            />
                        </>
                    )}

                    {/* Quiz lesson */}
                    {isQuizLesson && currentLesson && !lessonLoading && (
                        <>
                            <div className="px-5 sm:px-10 pt-8 max-w-3xl mx-auto flex flex-wrap gap-2">
                                <button onClick={() => goTo(prevLesson)} disabled={!prevLesson?.isUnlocked}
                                    className="px-4 py-2 border border-border rounded-lg font-semibold text-sm hover:bg-muted transition disabled:opacity-40 flex items-center gap-1">
                                    <ChevronLeft className="h-4 w-4" /> Bài trước
                                </button>
                                <button onClick={() => goTo(nextLesson)} disabled={!nextLesson?.isUnlocked}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40 flex items-center gap-1">
                                    Bài tiếp theo <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <QuizPanel
                                lessonId={currentLesson.id}
                                templateId={currentLesson.referenceId!}
                                classId={classId}
                                onComplete={markLessonComplete}
                            />
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
            {currentLesson && (
                <StudyNotesPanel lessonId={currentLesson.id} />
            )}
        </div>
    );
}
