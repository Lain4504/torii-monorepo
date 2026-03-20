import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileAudio, 
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu";
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from "@workspace/ui/components/empty";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { academyJlptMockApi, type JlptBankQuestion } from "@/lib/api/services/academy-jlpt-mock";
import { JlptQuestionForm } from "@/components/academy/jlpt/jlpt-question-form";
import { toast } from "sonner";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"];
const SECTIONS = [
  { code: "LANGUAGE_VOCAB", label: "Từ vựng (Vocab)" },
  { code: "LANGUAGE_GRAMMAR_READING", label: "Ngữ pháp & Đọc (Grammar/Reading)" },
  { code: "LISTENING", label: "Nghe hiểu (Listening)" },
];

export default function JlptQuestionsPage() {
  const [questions, setQuestions] = useState<JlptBankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("all");
  const [section, setSection] = useState<string>("all");
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<JlptBankQuestion | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await academyJlptMockApi.findAllBankQuestions({
        level: level === "all" ? undefined : level,
        sectionCode: section === "all" ? undefined : section,
        q: search || undefined,
      });
      setQuestions(data);
    } catch (error) {
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [level, section]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const openAdd = () => {
    setEditingQuestion(null);
    setIsSheetOpen(true);
  };

  const openEdit = (question: JlptBankQuestion) => {
    setEditingQuestion(question);
    setIsSheetOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ngân hàng Câu hỏi JLPT</h1>
          <p className="text-muted-foreground">Quản lý các câu hỏi lẻ trong hệ thống JLPT Question Bank.</p>
        </div>
        <div className="flex gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin self-center mr-2 text-muted-foreground" />}
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Thêm câu hỏi
          </Button>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</SheetTitle>
          </SheetHeader>
          <JlptQuestionForm 
            initialData={editingQuestion} 
            onSuccess={() => {
              setIsSheetOpen(false);
              fetchQuestions();
            }}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="space-y-4">
        <div className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <form onSubmit={handleSearch} className="flex-1 space-y-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nội dung câu hỏi..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
            <div className="flex gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium px-1">Cấp độ</label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium px-1">Phần thi</label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Phần thi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={fetchQuestions}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md bg-background border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">Cấp độ</TableHead>
                <TableHead>Nội dung câu hỏi</TableHead>
                <TableHead className="w-[150px]">Phần thi</TableHead>
                <TableHead className="w-[100px]">Asset</TableHead>
                <TableHead className="w-[80px] text-right">Lệnh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : questions.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="h-[400px] text-center">
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
                questions.map((q) => (
                  <TableRow key={q.id} className="group transition-colors">
                    <TableCell>
                      <Badge variant="outline" className="font-bold">
                        {q.levelCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-[500px] truncate"
                        dangerouslySetInnerHTML={{ __html: q.stemText }}
                      />
                      <div className="flex gap-1 mt-1">
                        {q.options.map((o) => (
                          <Badge
                            key={o.id}
                            variant={o.isCorrect ? "default" : "secondary"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {o.key}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {SECTIONS.find((s) => s.code === q.sectionCode)?.label || q.sectionCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {q.audioAssetId && <FileAudio className="w-4 h-4 text-blue-500" />}
                        {q.imageAssetId && <ImageIcon className="w-4 h-4 text-emerald-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 border-slate-500/30 text-slate-700 bg-transparent hover:bg-slate-50 hover:text-slate-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            Thao tác
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => openEdit(q)}>
                            <Edit className="w-4 h-4" /> Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
