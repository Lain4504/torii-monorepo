import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuiz } from '@/lib/api/services/quizzes';
import { useCourseRun } from '@/lib/api/services/course-runs';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  ArrowLeft,
  HelpCircle,
  Clock,
  BookOpen,
  Target,
  RefreshCcw,
  BrainCircuit,
  BarChart2,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useQuestionPools } from '@/lib/api/services/question-pools';
import { QuestionJlptLevel } from '@workspace/schemas';
import { useEffect, useMemo, useState } from 'react';
import { useUpdateQuiz, useQuizQuestions } from '@/lib/api/services/quizzes';
import { toast } from '@workspace/ui/components/sonner';
import { QuestionSelectionDialog } from '@/components/quizzes/question-selection-dialog';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Nháp', className: 'bg-muted/30 text-muted-foreground border-border' },
  published: { label: 'Đã công bố', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  archived: { label: 'Lưu trữ', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Dễ', className: 'text-emerald-500' },
  medium: { label: 'TB', className: 'text-amber-500' },
  hard: { label: 'Khó', className: 'text-rose-500' },
};

const typeConfig: Record<string, string> = {
  multiple_choice: 'Trắc nghiệm',
  true_false: 'Đúng / Sai',
  fill_blank: 'Điền khuyết',
  matching: 'Nối thẻ',
  essay: 'Tự luận',
  listening: 'Nghe hiểu',
};

export default function QuizDetailPage() {
  const { runId, quizId } = useParams<{ runId: string; quizId: string }>();
  const navigate = useNavigate();
  const { data: run, isLoading: loadingRun } = useCourseRun(runId || '');
  const { data: quiz, isLoading: loadingQuiz } = useQuiz(quizId || '');
  const updateMutation = useUpdateQuiz();
  const { data: frozenQuestions = [], isLoading: loadingFrozen } = useQuizQuestions(
    quiz?.status === 'published' ? (quiz?.id || '') : ''
  );

  const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('GLOBAL');
  const [sections, setSections] = useState<
    {
      id: string;
      type: string;
      timeLimit: number;
      questionCount: number;
      poolId?: string;
      questionIds?: string[];
    }[]
  >([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (quiz) {
      setJlptLevelFilter(quiz.jlptLevel || 'GLOBAL');
      setSections(
        (quiz.sections || []).map((s) => ({
          id: s.id,
          type: s.type,
          timeLimit: s.timeLimit,
          questionCount: s.questionCount,
          poolId: s.poolId,
          questionIds: s.questionIds || [],
        }))
      );
    }
  }, [quiz]);

  const { data: poolsData } = useQuestionPools({
    page: 1,
    limit: 100,
    jlptLevel: jlptLevelFilter === 'GLOBAL' ? undefined : (jlptLevelFilter as QuestionJlptLevel),
  });
  const pools = useMemo(() => poolsData?.data || [], [poolsData]);

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        type: 'vocab',
        timeLimit: 10,
        questionCount: 10,
        poolId: '',
        questionIds: [],
      },
    ]);
  };

  const removeSection = (id: string) => {
    setSections((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  };

  const updateSection = (id: string, data: Partial<(typeof sections)[number]>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const handleSave = async () => {
    if (!quiz) return;
    if (sections.length === 0) {
      toast.error('Quiz phải có ít nhất một nhóm câu hỏi.');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: quiz.id,
        data: {
          sections: sections.map((s) => ({
            type: s.type,
            timeLimit: s.timeLimit,
            questionCount: s.questionCount,
            poolId: s.poolId || undefined,
            questionIds: s.questionIds && s.questionIds.length > 0 ? s.questionIds : undefined,
          })),
        },
      });
      toast.success('Đã lưu cấu hình câu hỏi cho quiz.');
    } catch (e: any) {
      toast.error(e?.message || 'Lưu cấu hình quiz thất bại');
    }
  };

  if (loadingRun || loadingQuiz) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!quiz || !run) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Không tìm thấy quiz.
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[quiz.status] || statusConfig.draft;
  const isPublished = quiz.status === 'published';

  const infoItems = [
    { icon: Clock, label: 'Thời gian', value: quiz.totalTime ? `${quiz.totalTime} phút` : 'Không giới hạn' },
    { icon: BookOpen, label: 'Số câu hỏi', value: quiz.totalQuestions },
    { icon: Target, label: 'Điểm đạt', value: `${quiz.passingScore ?? 60}%` },
    { icon: RefreshCcw, label: 'Số lần làm', value: quiz.maxAttempts },
    { icon: BarChart2, label: 'Cấp độ', value: quiz.jlptLevel || 'N/A' },
    { icon: Layers, label: 'Loại Quiz', value: quiz.quizType || 'lesson' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border',
                  status.className,
                )}
              >
                {status.label}
              </Badge>
              <span className="text-xs text-muted-foreground">Run: {run.title}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Quiz: {quiz.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Thuộc lớp{' '}
              <Link
                to={`/course/${run.id}`}
                className="font-medium text-primary hover:underline"
              >
                {run.title}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ScrollArea className="h-[540px]">
              <div className="space-y-6 p-6">
                {/* DETAILS */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      Thông tin quiz
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tổng quan về thời lượng, số câu hỏi và điều kiện đạt của bài quiz này.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {infoItems.map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/40"
                      >
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Icon className="size-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {label}
                          </span>
                        </div>
                        <span className="text-sm font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SETTINGS */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      Cài đặt hiển thị
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Kiểm soát việc xáo trộn thứ tự câu hỏi và hiển thị giải thích sau khi nộp bài.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge
                      variant={quiz.shuffleQuestions ? 'default' : 'outline'}
                      className="text-[9px] font-black uppercase tracking-wider"
                    >
                      {quiz.shuffleQuestions ? '✓ Xáo trộn câu hỏi' : '✗ Không xáo trộn'}
                    </Badge>
                    <Badge
                      variant={quiz.showExplanation ? 'default' : 'outline'}
                      className="text-[9px] font-black uppercase tracking-wider"
                    >
                      {quiz.showExplanation ? '✓ Hiện giải thích' : '✗ Ẩn giải thích'}
                    </Badge>
                  </div>
                </div>

                {/* QUESTIONS CONFIG / QUESTION POOL */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-1">
                        Câu hỏi & Question Pool
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xl">
                        Thêm câu hỏi cho quiz này. Bạn có thể rút ngẫu nhiên từ Question Pool hoặc dùng
                        <span className="font-semibold"> Search Question Pool </span>
                        để chọn thủ công từng câu hỏi giống giao diện LMS mẫu.
                      </p>
                    </div>
                    {!isPublished && (
                      <Button type="button" variant="outline" size="sm" onClick={addSection}>
                        <Layers className="size-3 mr-1.5" />
                        Thêm nhóm câu hỏi
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Lọc Question Pool theo JLPT
                      </Label>
                      <Select
                        value={jlptLevelFilter}
                        onValueChange={setJlptLevelFilter}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N1">N1</SelectItem>
                          <SelectItem value="N2">N2</SelectItem>
                          <SelectItem value="N3">N3</SelectItem>
                          <SelectItem value="N4">N4</SelectItem>
                          <SelectItem value="N5">N5</SelectItem>
                          <SelectItem value="GLOBAL">Tất cả</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-background text-[10px] font-bold">
                              Nhóm {idx + 1}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-[9px] font-black uppercase tracking-widest"
                            >
                              {section.type}
                            </Badge>
                          </div>
                          {!isPublished && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSection(section.id)}
                            >
                              <AlertTriangle className="size-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Cách lấy câu hỏi
                            </Label>
                            <div className="flex bg-muted rounded-lg p-1">
                              <Button
                                type="button"
                                variant={
                                  !section.questionIds || section.questionIds.length === 0
                                    ? 'secondary'
                                    : 'ghost'
                                }
                                size="sm"
                                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-wider rounded-md"
                                disabled={isPublished}
                                onClick={() =>
                                  updateSection(section.id, {
                                    questionIds: [],
                                  })
                                }
                              >
                                <RefreshCcw className="size-3 mr-1.5" />
                                Ngẫu nhiên từ Pool
                              </Button>
                              <Button
                                type="button"
                                variant={
                                  section.questionIds && section.questionIds.length > 0
                                    ? 'secondary'
                                    : 'ghost'
                                }
                                size="sm"
                                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-wider rounded-md"
                                disabled={isPublished}
                                onClick={() => {
                                  setActiveSectionId(section.id);
                                  setSelectorOpen(true);
                                }}
                              >
                                <BrainCircuit className="size-3 mr-1.5" />
                                Search Question Pool
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Loại nhóm
                            </Label>
                            <Select
                              value={section.type}
                              disabled={isPublished}
                              onValueChange={(v) =>
                                updateSection(section.id, { type: v })
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vocab">Từ vựng</SelectItem>
                                <SelectItem value="grammar">Ngữ pháp</SelectItem>
                                <SelectItem value="reading">Đọc hiểu</SelectItem>
                                <SelectItem value="listening">Nghe hiểu</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Question Pool
                            </Label>
                            <Select
                              value={section.poolId || ''}
                              disabled={isPublished}
                              onValueChange={(v) =>
                                updateSection(section.id, { poolId: v })
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Chọn Question Pool..." />
                              </SelectTrigger>
                              <SelectContent>
                                {pools.length > 0 ? (
                                  pools.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    Không có Question Pool nào
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Số câu hỏi
                              </Label>
                              <div className="relative">
                                <BookOpen className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  min={1}
                                  className="pl-9 h-9"
                                  disabled={isPublished}
                                  value={section.questionCount}
                                  onChange={(e) =>
                                    updateSection(section.id, {
                                      questionCount: Number(e.target.value || '0'),
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Thời gian (phút)
                              </Label>
                              <div className="relative">
                                <Clock className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  min={1}
                                  className="pl-9 h-9"
                                  disabled={isPublished}
                                  value={section.timeLimit}
                                  onChange={(e) =>
                                    updateSection(section.id, {
                                      timeLimit: Number(e.target.value || '0'),
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {section.questionIds && section.questionIds.length > 0 && (
                          <p className="text-[11px] text-muted-foreground">
                            Đang chọn thủ công
                            <span className="font-semibold"> {section.questionIds.length} </span>
                            câu hỏi từ Question Pool.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frozen questions preview when published */}
                {isPublished && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
                        <HelpCircle className="size-3.5 text-emerald-500" />
                        Câu hỏi đã đóng băng ({frozenQuestions.length} câu)
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-black text-emerald-600 border-emerald-500/30 bg-emerald-500/5"
                      >
                        Frozen
                      </Badge>
                    </div>

                    {loadingFrozen ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : frozenQuestions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-none bg-muted/30">
                            <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-10">
                              #
                            </TableHead>
                            <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                              Câu hỏi
                            </TableHead>
                            <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-24">
                              Loại
                            </TableHead>
                            <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-16">
                              Độ khó
                            </TableHead>
                            <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-16 text-right">
                              Điểm
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {frozenQuestions.map((qq: any, idx: number) => {
                            const diff =
                              difficultyConfig[qq.difficulty] || {
                                label: 'N/A',
                                className: 'text-muted-foreground',
                              };
                            return (
                              <TableRow
                                key={qq.id || idx}
                                className="border-b border-border/30 hover:bg-muted/20"
                              >
                                <TableCell className="py-2 text-center text-[9px] font-black italic text-muted-foreground/40">
                                  L{String(idx + 1).padStart(2, '0')}
                                </TableCell>
                                <TableCell className="py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                                      <BrainCircuit className="size-3 text-primary" />
                                    </div>
                                    <span className="text-xs font-medium truncate max-w-[280px]">
                                      {qq.questionText ||
                                        qq.question?.questionText ||
                                        `Câu hỏi #${idx + 1}`}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                    {typeConfig[qq.questionType || qq.question?.questionType] ||
                                      qq.questionType ||
                                      '—'}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2">
                                  <span className={cn('text-[9px] font-black', diff.className)}>
                                    {diff.label}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2 text-right">
                                  <span className="text-xs font-bold">{qq.points ?? 1}</span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600">
                        <AlertTriangle className="size-4 shrink-0" />
                        <p className="text-xs font-medium">
                          Không có câu hỏi đóng băng. Thử publish lại quiz để tạo snapshot.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-[0.18em]">
                Hành động
              </CardTitle>
              <CardDescription className="text-xs">
                Lưu cấu hình câu hỏi và quay lại trang lớp học.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleSave}
                disabled={updateMutation.isPending || isPublished}
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình quiz'}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate(`/course/${runId}`)}
              >
                Quay lại Course Run Detail
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <QuestionSelectionDialog
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={(ids) => {
          if (!activeSectionId) return;
          updateSection(activeSectionId, { questionIds: ids });
        }}
        initialSelectedIds={
          activeSectionId
            ? sections.find((s) => s.id === activeSectionId)?.questionIds || []
            : []
        }
        jlptLevel={jlptLevelFilter}
      />
    </div>
  );
}

