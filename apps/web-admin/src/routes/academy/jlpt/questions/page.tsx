import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FileAudio,
  Image as ImageIcon,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
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

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<JlptBankQuestion | null>(null);

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

  const openAdd = () => {
    setEditingQuestion(null);
    setIsSheetOpen(true);
  };

  const openEdit = (question: JlptBankQuestion) => {
    setEditingQuestion(question);
    setIsSheetOpen(true);
  };

  /** Nhóm theo phần thi (section) — đúng với cấu trúc JLPT: mỗi section chứa nhiều mondai/câu. */
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
        subtitle="Ba phần lớn như đề JLPT: từ vựng & chữ Hán, ngữ pháp & đọc, nghe; chi tiết từng dạng (漢字読み, 内容理解…) lọc bằng Mondai."
        actions={
          <Button className="gap-2" size="lg" onClick={openAdd}>
            <Plus className="size-4" />
            Thêm câu hỏi
          </Button>
        }
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex h-full !w-full flex-col p-0 sm:!max-w-[800px]">
          <SheetHeader className="shrink-0 border-b p-4 sm:p-6">
            <SheetTitle>{editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</SheetTitle>
            <SheetDescription>
              Nhập nội dung câu hỏi, tùy chọn ngữ cảnh / media và các đáp án.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="p-3 pb-6 sm:p-6">
              <JlptQuestionForm
                key={editingQuestion?.id ?? "new"}
                initialData={editingQuestion}
                onSuccess={() => {
                  setIsSheetOpen(false);
                  fetchQuestions();
                }}
                onCancel={() => setIsSheetOpen(false)}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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
                  <TableHead className="w-[88px] text-right">Lệnh</TableHead>
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
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1 border-slate-500/30 bg-transparent px-2 text-slate-700 hover:bg-slate-50 hover:text-slate-700 sm:gap-2 sm:px-3"
                                >
                                  <MoreHorizontal className="size-4 shrink-0" />
                                  <span className="hidden sm:inline">Thao tác</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2" onClick={() => openEdit(q)}>
                                  <Edit className="size-4" /> Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive">
                                  <Trash2 className="size-4" /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
    </div>
  );
}
