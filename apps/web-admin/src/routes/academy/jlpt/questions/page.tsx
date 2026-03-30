import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import {
  Search,
  FileAudio,
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@workspace/ui/components/empty";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet";
import { PageHeader } from "@/components/common/page-header";
import {
  JlptQuestionsToolbar,
  JLPT_SECTIONS,
  jlptQuestionTypeLabel,
  jlptSectionLabel,
  jlptDifficultyLabel,
  formatJlptMondaiLabel,
  type JlptMondaiOption,
} from "@/components/academy/jlpt/jlpt-questions-toolbar";
import { academyJlptMockApi, type JlptBankQuestion } from "@/lib/api/services/academy-jlpt-mock";
import { JlptQuestionForm } from "@/components/academy/jlpt/jlpt-question-form";
import { SmartPagination } from "@/components/common/smart-pagination";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function JlptQuestionsPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<JlptBankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("all");
  const [section, setSection] = useState<string>("all");
  const [questionType, setQuestionType] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [mondaiCode, setMondaiCode] = useState<string>("all");
  const [mondaiOptions, setMondaiOptions] = useState<JlptMondaiOption[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Sheet states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<JlptBankQuestion | null>(null);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);


  const prevFilters = useRef({
    level,
    section,
    questionType,
    difficulty,
    mondaiCode,
  });

  useEffect(() => {
    if (level === "all" || section === "all") {
      setMondaiOptions([]);
      return;
    }
    let cancelled = false;
    academyJlptMockApi
      .listBankMondaiOptions({ level, sectionCode: section })
      .then((items) => {
        if (!cancelled) setMondaiOptions(items);
      })
      .catch(() => {
        if (!cancelled) setMondaiOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [level, section]);

  const fetchQuestions = async (pageOverride?: number) => {
    const p = pageOverride ?? page;
    try {
      setLoading(true);
      const data = await academyJlptMockApi.findAllBankQuestions({
        level: level === "all" ? undefined : level,
        sectionCode: section === "all" ? undefined : section,
        q: search || undefined,
        questionType: questionType === "all" ? undefined : questionType,
        difficulty: difficulty === "all" ? undefined : difficulty,
        mondaiCode: mondaiCode === "all" ? undefined : mondaiCode,
        page: p,
        limit: PAGE_SIZE,
      });
      setQuestions(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch {
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const prev = prevFilters.current;
    const filtersChanged =
      prev.level !== level ||
      prev.section !== section ||
      prev.questionType !== questionType ||
      prev.difficulty !== difficulty ||
      prev.mondaiCode !== mondaiCode;
    prevFilters.current = {
      level,
      section,
      questionType,
      difficulty,
      mondaiCode,
    };

    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }

    fetchQuestions();
  }, [level, section, questionType, difficulty, mondaiCode, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchQuestions(1);
  };

  const handleLevelChange = (v: string) => {
    setLevel(v);
    setMondaiCode("all");
  };

  const handleSectionChange = (v: string) => {
    setSection(v);
    setMondaiCode("all");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      await academyJlptMockApi.deleteBankQuestion(id);
      toast.success("Đã xóa câu hỏi");
      void fetchQuestions();
    } catch {
      toast.error("Không thể xóa câu hỏi");
    }
  };

  const handleOpenSheet = async (questionId?: string) => {
    if (questionId) {
      try {
        setIsFetchingQuestion(true);
        setIsSheetOpen(true);
        const q = await academyJlptMockApi.findBankQuestionById(questionId);
        if (q) {
          setCurrentQuestion(q);
        } else {
          toast.error("Không tìm thấy câu hỏi");
          setIsSheetOpen(false);
        }
      } catch {
        toast.error("Lỗi khi tải dữ liệu câu hỏi");
        setIsSheetOpen(false);
      } finally {
        setIsFetchingQuestion(false);
      }
    } else {
      setCurrentQuestion(null);
      setIsSheetOpen(true);
    }
  };

  const handleFormSuccess = () => {
    setIsSheetOpen(false);
    setCurrentQuestion(null);
    void fetchQuestions();
  };

  const questionsBySection = useMemo(() => {
    const map = new Map<string, JlptBankQuestion[]>();
    for (const q of questions) {
      const list = map.get(q.sectionCode) ?? [];
      list.push(q);
      map.set(q.sectionCode, list);
    }
    const orderedCodes = [
      ...JLPT_SECTIONS.map((s) => s.code).filter((c) => map.has(c)),
      ...[...map.keys()].filter((c) => !JLPT_SECTIONS.some((s) => s.code === c)),
    ];
    return orderedCodes.map((sectionCode) => ({
      sectionCode,
      label: jlptSectionLabel(sectionCode),
      items: map.get(sectionCode)!,
    }));
  }, [questions]);

  return (
    <div className="flex flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-6">
      <PageHeader
        title="Ngân hàng Câu hỏi JLPT"
        subtitle="Ba phần lớn như đề JLPT: từ vựng & chữ Hán, ngữ pháp & đọc, nghe."
        actions={
          <Button onClick={() => handleOpenSheet()}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm câu hỏi
          </Button>
        }
      />

      <div className="space-y-4">
        <JlptQuestionsToolbar
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearch}
          level={level}
          onLevelChange={handleLevelChange}
          section={section}
          onSectionChange={handleSectionChange}
          questionType={questionType}
          onQuestionTypeChange={setQuestionType}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          mondaiCode={mondaiCode}
          onMondaiCodeChange={setMondaiCode}
          mondaiOptions={mondaiOptions}
          onRefresh={fetchQuestions}
          loading={loading}
        />

        <div className="-mx-1 overflow-hidden rounded-md border bg-background sm:mx-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1040px] w-full">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[72px]">Cấp độ</TableHead>
                  <TableHead>Nội dung (stem)</TableHead>
                  <TableHead className="w-[128px]">Dạng bài</TableHead>
                  <TableHead className="w-[140px]">Phần thi</TableHead>
                  <TableHead className="w-[200px]">Mondai</TableHead>
                  <TableHead className="w-[88px]">Độ khó</TableHead>
                  <TableHead className="w-[72px]">Media</TableHead>
                  <TableHead className="w-[100px] text-right pr-4">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 8 }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : questions.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="h-[400px] text-center">
                      <Empty>
                        <EmptyMedia>
                          <Search className="size-8 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyContent>
                          <EmptyTitle>Không tìm thấy câu hỏi nào</EmptyTitle>
                          <EmptyDescription>
                            Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm.
                          </EmptyDescription>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  questionsBySection.map(({ sectionCode, label, items }) => (
                    <Fragment key={sectionCode}>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableCell colSpan={8} className="py-2.5 text-sm font-semibold">
                          <span>{label}</span>
                          <span className="ml-2 font-normal text-muted-foreground">
                            ({items.length} câu) · <span className="font-mono text-xs">{sectionCode}</span>
                          </span>
                        </TableCell>
                      </TableRow>
                      {items.map((q) => (
                        <TableRow key={q.id} className="group transition-colors">
                          <TableCell>
                            <Badge variant="outline" className="font-bold">
                              {q.levelCode}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {/<[a-z][\s\S]*>/i.test(q.stemText) ? (
                              <div
                                className="line-clamp-2 max-w-[min(70vw,520px)] text-sm sm:max-w-[500px]"
                                dangerouslySetInnerHTML={{ __html: q.stemText }}
                              />
                            ) : (
                              <div className="line-clamp-2 max-w-[min(70vw,520px)] text-sm sm:max-w-[500px]">
                                {q.stemText}
                              </div>
                            )}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {q.options.map((o) => (
                                <Badge
                                  key={o.id || `${q.id}-${o.key}`}
                                  variant={o.isCorrect ? "default" : "secondary"}
                                  className="px-1.5 py-0 text-[10px]"
                                >
                                  {o.key}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-[11px] leading-tight text-muted-foreground sm:text-xs">
                              {jlptQuestionTypeLabel(q.questionType)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {jlptSectionLabel(q.sectionCode)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {q.mondai ? (
                              <div className="max-w-[220px] space-y-0.5">
                                <div className="text-xs font-medium leading-tight">
                                  {formatJlptMondaiLabel(q.mondai)}
                                </div>
                                <div className="font-mono text-[10px] text-muted-foreground">{q.mondai.code}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] font-normal">
                              {q.difficulty ? jlptDifficultyLabel(q.difficulty) : "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {q.audioAssetId && <FileAudio className="size-4 text-blue-500" />}
                              {q.imageAssetId && <ImageIcon className="size-4 text-emerald-500" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                                onClick={() => handleOpenSheet(q.id)}
                              >
                                <Edit2 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                onClick={() => handleDelete(q.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <SmartPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(p) => setPage(p)}
          itemName="câu hỏi"
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:!w-[70vw] sm:!max-w-none overflow-y-auto p-0 border-l shadow-2xl">
          <SheetHeader className="p-8 border-b sticky top-0 bg-background/95 backdrop-blur-md z-20">
             <SheetTitle>{currentQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}</SheetTitle>
             <SheetDescription>
               Hoàn thiện thông tin bên dưới để lưu câu hỏi vào ngân hàng.
             </SheetDescription>
          </SheetHeader>
          <div className="p-8 pb-12">
            {isFetchingQuestion ? (
               <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
               </div>
            ) : (
              <JlptQuestionForm
                initialData={currentQuestion}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsSheetOpen(false)}
                presetLevelCode={level !== "all" ? level : undefined}
                presetSectionCode={section !== "all" ? section : undefined}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
