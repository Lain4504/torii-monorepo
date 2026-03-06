'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourseById, useCurriculum } from '@/lib/api/services/course-api';
import { useCourseRun } from '@/lib/api/services/course-run-api';
import { useCheckEnrollment } from '@/lib/api/services/enrollment-api';
import { useCompletedLessons, learningProgressApi } from '@/lib/api/services/learning-progress-api';
import { useLesson, type LessonResponse } from '@/lib/api/services/lesson-api';
import {
    useAssignmentByLesson, useMySubmission, useSubmitAssignment, useSaveDraft,
    type AssignmentResponseDTO, type SubmissionResponseDTO
} from '@/lib/api/services/assignment-api';
import {
    useQuizByLesson, useStartQuiz, useSaveQuizAnswers, useSubmitQuiz,
    type QuizResponseDTO, type QuizSessionDTO, type QuizQuestionDTO,
} from '@/lib/api/services/quiz-lesson-api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@workspace/ui/components/sonner';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import {
    ChevronLeft, ChevronDown, ChevronUp, Menu, X,
    CheckCircle2, PlayCircle, Lock, FileText, BookOpen,
    MessageSquare, ChevronRight, Save, Download, Send,
    AlertCircle, Clock, Trophy, HelpCircle, Timer, RotateCcw,
    Paperclip
} from 'lucide-react';
import { MultiFileUpload } from '@/components/common/multi-file-upload';
import type { CurriculumLesson, CurriculumModule } from '@/lib/api/services/course-api';

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

function VideoPlayer({ lesson, onComplete }: { lesson: LessonResponse | undefined; onComplete: () => void; }) {
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
                src={lesson.videoUrl}
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

function ArticleViewer({ lesson, onComplete }: { lesson: LessonResponse; onComplete: () => void; }) {
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

            {lesson.articleContent ? (
                <div
                    className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: lesson.articleContent }}
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
    lessonId, courseId, courseRunId, onComplete
}: { lessonId: string; courseId: string; courseRunId?: string; onComplete: () => void; }) {
    const { data: assignment, isLoading: assignmentLoading } = useAssignmentByLesson(lessonId, courseRunId);

    const { data: submission } = useMySubmission(assignment?.id ?? '');
    const submitMutation = useSubmitAssignment();
    const saveDraftMutation = useSaveDraft();
    const [textAnswer, setTextAnswer] = useState(submission?.textAnswer ?? '');
    const [fileUrls, setFileUrls] = useState<string[]>(submission?.fileUrls ?? []);

    useEffect(() => {
        if (submission?.textAnswer) setTextAnswer(submission.textAnswer);
        if (submission?.fileUrls) setFileUrls(submission.fileUrls);
    }, [submission?.textAnswer, submission?.fileUrls]);

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
                        <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> {assignment.maxScore} điểm</span>
                        {assignment.dueDate && (
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />
                                Hạn: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Description / Instructions */}
            {(assignment.description || assignment.instructions) && (
                <div className="bg-muted/40 rounded-xl p-5 border border-border">
                    <h3 className="font-bold text-foreground mb-2 text-sm uppercase tracking-wider">Hướng dẫn</h3>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {assignment.instructions || assignment.description}
                    </p>
                </div>
            )}

            {/* Attachment downloads */}
            {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
                <div>
                    <h3 className="font-semibold text-foreground mb-3 text-sm">Tài liệu đính kèm</h3>
                    <div className="space-y-2">
                        {assignment.attachmentUrls.map((url: string, i: number) => {
                            const name = url.split('/').pop() ?? `file_${i + 1}`;
                            return (
                                <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-muted/40 transition group"
                                >
                                    <Download className="h-4 w-4 text-primary shrink-0" />
                                    <span className="text-sm text-foreground group-hover:text-primary transition truncate">{name}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Graded result */}
            {isGraded && submission && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Đã chấm điểm</span>
                    </div>
                    <p className="text-3xl font-black text-foreground">{submission.score ?? 0} <span className="text-lg font-normal text-muted-foreground">/ {assignment.maxScore}</span></p>
                    {submission.feedback && (
                        <p className="mt-3 text-sm text-muted-foreground bg-background/60 rounded-lg p-3">{submission.feedback}</p>
                    )}
                </div>
            )}

            {/* Submission form */}
            {(assignment.type === 'TEXT' || assignment.type === 'BOTH') && (
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

            {(assignment.type === 'FILE' || assignment.type === 'BOTH') && (
                <div className="space-y-3">
                    <label className="block font-semibold text-foreground text-sm uppercase tracking-widest">Tệp đính kèm bài làm</label>
                    <MultiFileUpload
                        currentUrls={fileUrls}
                        onUploadChange={setFileUrls}
                        disabled={isSubmitted}
                        maxFiles={assignment.maxFiles}
                        label="Tải lên tệp bài làm của bạn"
                    />
                </div>
            )}

            {/* Action buttons */}
            {!isSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => saveDraftMutation.mutate({ assignmentId: assignment.id, dto: { textAnswer, fileUrls } }, {
                            onSuccess: () => toast.success('Đã lưu nháp!'),
                        })}
                        disabled={saveDraftMutation.isPending}
                        className="flex-1 sm:flex-none px-6 py-3 border border-border rounded-xl font-semibold text-sm hover:bg-muted/50 transition flex items-center justify-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {saveDraftMutation.isPending ? 'Đang lưu...' : 'Lưu nháp'}
                    </button>
                    <button
                        onClick={() => submitMutation.mutate({ assignmentId: assignment.id, dto: { textAnswer, fileUrls } }, {
                            onSuccess: () => { toast.success('Đã nộp bài!'); onComplete(); },
                            onError: () => toast.error('Không thể nộp bài. Vui lòng thử lại.'),
                        })}
                        disabled={submitMutation.isPending || (assignment.type !== 'FILE' && !textAnswer.trim()) || (assignment.type === 'FILE' && fileUrls.length === 0)}
                        className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Send className="h-4 w-4" />
                        {submitMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
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
    lessonId, courseId, courseRunId, onComplete
}: { lessonId: string; courseId: string; courseRunId?: string; onComplete: () => void; }) {
    const { data: quiz, isLoading: quizLoading } = useQuizByLesson(lessonId, courseRunId);
    const startMutation = useStartQuiz();
    const saveAnswersMutation = useSaveQuizAnswers();
    const submitMutation = useSubmitQuiz();

    const [panelState, setPanelState] = useState<QuizPanelState>('intro');
    const [session, setSession] = useState<QuizSessionDTO | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [result, setResult] = useState<any>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-save every 15s while in_progress
    const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Clear timers on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        };
    }, []);

    // Countdown timer
    useEffect(() => {
        if (panelState !== 'in_progress') return;
        if (!session?.timeLimit) return;
        setTimeLeft(session.timeRemaining ?? session.timeLimit);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current!); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panelState, session?.sessionId]);

    // Auto-save
    useEffect(() => {
        if (panelState !== 'in_progress' || !session) return;
        autoSaveRef.current = setInterval(() => {
            saveAnswersMutation.mutate({
                sessionId: session.sessionId,
                data: { answers, timeRemaining: timeLeft, currentQuestion: currentQIdx + 1 },
            });
        }, 15_000);
        return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current!); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panelState, session?.sessionId, answers, timeLeft, currentQIdx]);

    const handleStart = async () => {
        if (!quiz) return;
        try {
            const sess = await startMutation.mutateAsync(quiz.id);
            setSession(sess);
            setAnswers(sess.answers ?? {});
            setCurrentQIdx((sess.currentQuestion ?? 1) - 1);
            setPanelState('in_progress');
        } catch (e: any) {
            toast.error(e?.message || 'Không thể bắt đầu quiz. Thử lại sau.');
        }
    };

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!session) return;
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        try {
            const res = await submitMutation.mutateAsync(session.sessionId);
            setResult(res);
            setPanelState('result');
            if (res.isPassed) { onComplete(); }
        } catch (e: any) {
            toast.error(e?.message || 'Không thể nộp bài. Thử lại.');
        }
    };

    const fmtTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${String(sec).padStart(2, '0')}`;
    };

    // ── Loading
    if (quizLoading) {
        return (
            <div className="p-8 space-y-4 max-w-3xl mx-auto">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    // ── No quiz found
    if (!quiz) {
        return (
            <div className="p-8 text-center text-muted-foreground max-w-3xl mx-auto">
                <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Quiz chưa được thiết lập cho bài học này.</p>
                <p className="text-sm mt-1">Vui lòng liên hệ giảng viên.</p>
            </div>
        );
    }

    const questions = session?.questions ?? [];
    const currentQ = questions[currentQIdx];
    const answeredCount = Object.keys(answers).length;

    // ── Intro screen
    if (panelState === 'intro') {
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
                        <p className="text-2xl font-black text-foreground">{quiz.totalQuestions}</p>
                        <p className="text-xs text-muted-foreground mt-1">Câu hỏi</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
                        <p className="text-2xl font-black text-foreground">{quiz.totalTime ?? '∞'}</p>
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

                {/* Sections preview if available */}
                {(quiz as any).sections && (quiz as any).sections.length > 0 && (
                    <div className="mb-8 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấu trúc bài thi</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(quiz as any).sections.map((s: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <div className="size-8 rounded-lg bg-background flex items-center justify-center text-xs font-bold text-primary border border-border">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate">{SectionTypeMap[s.type] || s.type}</p>
                                        <p className="text-[10px] text-muted-foreground">{s.questionCount} câu · {s.timeLimit} phút</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleStart}
                    disabled={startMutation.isPending}
                    className="w-full py-4 bg-violet-500 hover:bg-violet-600 text-white rounded-2xl font-bold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                >
                    <PlayCircle className="h-5 w-5" />
                    {startMutation.isPending ? 'Đang chuẩn bị...' : 'Bắt đầu làm bài'}
                </button>
            </div>
        );
    }

    // ── Result screen
    if (panelState === 'result' && result) {
        const pct = result.percentage ?? 0;
        const passed = result.isPassed;

        return (
            <div className="p-6 sm:p-10 max-w-2xl mx-auto">
                {/* Result header */}
                <div className={`rounded-2xl p-8 text-center mb-8 ${passed
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-red-500/10 border border-red-500/20'}`}>
                    <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl
                        ${passed ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        {passed ? '🎉' : '😔'}
                    </div>
                    <p className={`text-2xl font-black mb-1 ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                        {passed ? 'Xuất sắc! Đã vượt qua!' : 'Chưa đạt — cố lên!'}
                    </p>
                    <p className="text-muted-foreground text-sm">{quiz.title}</p>
                </div>

                {/* Score */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
                        <p className="text-2xl font-black text-foreground">{Number(result.score ?? 0).toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Điểm đạt</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
                        <p className="text-2xl font-black text-foreground">{Number(result.maxScore ?? 0).toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Tổng điểm</p>
                    </div>
                    <div className={`rounded-xl p-4 text-center border ${passed
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-red-500/10 border-red-500/20'}`}>
                        <p className={`text-2xl font-black ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                            {Number(pct).toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Tỉ lệ đúng</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {!passed && quiz.maxAttempts !== 1 && (
                        <button
                            onClick={() => { setPanelState('intro'); setSession(null); setAnswers({}); setResult(null); }}
                            className="w-full py-3 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="h-4 w-4" /> Làm lại
                        </button>
                    )}
                    <button
                        onClick={onComplete}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                        <ChevronRight className="h-4 w-4" /> Tiếp tục học
                    </button>
                </div>
            </div>
        );
    }

    // ── In-progress screen
    if (panelState === 'in_progress' && session && currentQ) {
        const timePercent = session.timeLimit > 0 ? (timeLeft / session.timeLimit) * 100 : 100;
        const isTimeLow = timeLeft < 60;
        const options = (currentQ.options ?? {}) as Record<string, string>;
        const optionKeys = Object.keys(options).filter(k => k !== 'audioUrl');

        return (
            <div className="flex flex-col h-full">
                {/* Timer bar */}
                {session.timeLimit > 0 && (
                    <div className="w-full h-1.5 bg-muted shrink-0">
                        <div
                            className={`h-full transition-all duration-1000 ${isTimeLow ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${timePercent}%` }}
                        />
                    </div>
                )}

                <div className="p-5 sm:p-8 max-w-2xl mx-auto w-full flex flex-col gap-6">
                    {/* Top bar */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-medium">
                            Câu {currentQIdx + 1}/{questions.length}
                            {answeredCount > 0 && <span className="ml-2 text-xs text-emerald-500">({answeredCount} đã trả lời)</span>}
                        </span>
                        {session.timeLimit > 0 && (
                            <span className={`flex items-center gap-1.5 text-sm font-bold tabular-nums
                                ${isTimeLow ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}>
                                <Timer className="h-4 w-4" />
                                {fmtTime(timeLeft)}
                            </span>
                        )}
                    </div>

                    {/* Progress dots */}
                    <div className="flex flex-wrap gap-1.5">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQIdx(idx)}
                                className={`h-6 w-6 rounded-md text-[10px] font-bold transition
                                    ${idx === currentQIdx ? 'bg-primary text-primary-foreground scale-110' :
                                        answers[q.id] ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' :
                                            'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    {/* Current Section & Question */}
                    <div className="space-y-1">
                        {currentQ.section && (
                            <Badge variant="outline" className="bg-violet-500/5 text-violet-600 border-violet-500/20 text-[10px] uppercase font-bold tracking-widest px-2 py-0">
                                Phần: {SectionTypeMap[currentQ.section] || currentQ.section}
                            </Badge>
                        )}
                        <div className="bg-muted/40 rounded-2xl p-5 border border-border">
                            <p className="text-foreground font-medium leading-relaxed">{currentQ.questionText}</p>
                        </div>
                    </div>

                    {/* Options */}
                    {(currentQ.questionType === 'multiple_choice' || currentQ.questionType === 'true_false') && (
                        <div className="space-y-3">
                            {optionKeys.map(key => {
                                const isSelected = answers[currentQ.id] === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleAnswer(currentQ.id, key)}
                                        className={`w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition
                                            ${isSelected
                                                ? 'border-primary bg-primary/10 text-foreground'
                                                : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40 text-foreground/80'}`}
                                    >
                                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black mr-3
                                            ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            {key.toUpperCase()}
                                        </span>
                                        {options[key]}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Fill blank */}
                    {currentQ.questionType === 'fill_blank' && (
                        <input
                            type="text"
                            value={answers[currentQ.id] ?? ''}
                            onChange={e => handleAnswer(currentQ.id, e.target.value)}
                            placeholder="Nhập câu trả lời..."
                            className="w-full p-4 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                        />
                    )}

                    {/* Nav buttons */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={() => setCurrentQIdx(i => Math.max(0, i - 1))}
                            disabled={currentQIdx === 0}
                            className="px-5 py-2.5 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition disabled:opacity-40 flex items-center gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" /> Câu trước
                        </button>

                        {currentQIdx < questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQIdx(i => Math.min(questions.length - 1, i + 1))}
                                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition flex items-center gap-1"
                            >
                                Câu tiếp <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitMutation.isPending}
                                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition flex items-center gap-1 disabled:opacity-60"
                            >
                                <Send className="h-4 w-4" />
                                {submitMutation.isPending ? 'Đang nộp...' : `Nộp bài (${answeredCount}/${questions.length})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
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
    const courseRunId = params.courseId;
    const router = useRouter();
    const queryClient = useQueryClient();

    // ── API ────────────────────────────────────────────────────────────────
    // 1. Fetch the course run first
    const { data: courseRun, isLoading: courseRunLoading } = useCourseRun(courseRunId);
    const courseMasterId = courseRun?.courseMasterId;

    // 2. Fetch other details using courseMasterId
    const { data: course, isLoading: courseLoading } = useCourseById(courseMasterId);
    const { data: curriculum, isLoading: curriculumLoading } = useCurriculum(courseMasterId);
    const { data: enrollmentData } = useCheckEnrollment(courseRunId);
    const { data: completedLessonIds = [] } = useCompletedLessons(courseRunId ?? '');

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
        setExpandedModules(new Set(curriculum.modules.map(m => m.id)));

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
    const { data: lessonDetail, isLoading: lessonLoading } = useLesson(currentLesson?.id ?? '');

    // ── Progress ───────────────────────────────────────────────────────────
    const markLessonComplete = useCallback(async () => {
        if (!currentLesson) return;
        if (completedIds.has(currentLesson.id)) { toast.info('Bài học này đã được hoàn thành!'); return; }
        try {
            await learningProgressApi.trackProgress(currentLesson.id, courseRunId, 'COMPLETED', 100);
            queryClient.invalidateQueries({ queryKey: ['completed-lessons', courseMasterId] });
            toast.success('Đã hoàn thành bài học! 🎉');
        } catch {
            toast.error('Không thể cập nhật tiến độ.');
        }
    }, [currentLesson, completedIds, courseMasterId, queryClient]);

    // ── Nav ────────────────────────────────────────────────────────────────
    const allLessons: CurriculumLesson[] = curriculum?.modules.flatMap(m => m.lessons) ?? [];
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
    if (courseRunLoading || courseLoading || curriculumLoading) {
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

    if (!courseRun) {
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
                            {course?.title ?? courseRun.title}
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
                        {(course?.title ?? courseRun.title)?.[0] ?? 'T'}
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
                                            {lessonDetail?.description || (currentLesson
                                                ? `Bài học "${currentLesson.title}" thuộc khóa học ${course?.title ?? courseRun.title}.`
                                                : 'Chọn một bài học để bắt đầu.')}
                                        </p>
                                        {course?.learningOutcomes && Array.isArray(course.learningOutcomes) && (course.learningOutcomes as string[]).length > 0 && (
                                            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl">
                                                <h4 className="text-primary font-bold mb-3 uppercase text-sm tracking-widest">Mục tiêu khóa học</h4>
                                                <ul className="space-y-2">
                                                    {(course.learningOutcomes as string[]).slice(0, 4).map((item, i) => (
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
                                            onClick={() => { setSavingNote(true); setTimeout(() => { setSavingNote(false); toast.success('Đã lưu ghi chú!'); }, 600); }} disabled={savingNote}>
                                            <Save className="h-4 w-4" /> {savingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
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
                                courseId={courseMasterId ?? ''}
                                courseRunId={courseRunId}
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
                                courseId={courseMasterId ?? ''}
                                courseRunId={courseRunId}
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
                                    {enrollmentData?.enrollment?.completionPercentage != null
                                        ? `Đã hoàn thành ${Math.round(enrollmentData.enrollment.completionPercentage)}%`
                                        : 'Đang học'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Module list — fix: pass per-module isExpanded so each module controls independently */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {curriculum?.modules.map(mod => (
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
        </div>
    );
}
