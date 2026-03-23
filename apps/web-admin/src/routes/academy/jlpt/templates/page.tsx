import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  LayoutTemplate,
  Play,
  Archive,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import {
  Empty,
  EmptyContent,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@workspace/ui/components/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Textarea } from "@workspace/ui/components/textarea";
import { PageHeader } from "@/components/common/page-header";
import { academyJlptMockApi, type JlptMockTemplate } from "@/lib/api/services/academy-jlpt-mock";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"];

export default function JlptTemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<JlptMockTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLevel, setNewLevel] = useState<string>("N5");
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await academyJlptMockApi.findAllTemplates({
        levelCode: level === "all" ? undefined : level,
        q: search || undefined,
      });
      setTemplates(data);
    } catch {
      toast.error("Không thể tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [level]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  const openCreate = () => {
    setNewLevel("N5");
    setNewCode("");
    setNewTitle("");
    setNewDescription("");
    setCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase().replace(/\s+/g, "_");
    const title = newTitle.trim();
    if (!code || !title) {
      toast.error("Nhập mã đề và tiêu đề");
      return;
    }
    try {
      setCreating(true);
      const item = await academyJlptMockApi.createTemplate({
        level: newLevel,
        code,
        title,
        description: newDescription.trim() || undefined,
        status: "DRAFT",
      });
      if (item?.id) {
        toast.success("Đã tạo đề thi (bản nháp)");
        setCreateOpen(false);
        await fetchTemplates();
        navigate(`/academy/jlpt/templates/${item.id}`);
      }
    } catch {
      toast.error("Không thể tạo đề thi (kiểm tra mã đề trùng hoặc dữ liệu JLPT trên server)");
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (tpl: JlptMockTemplate) => {
    try {
      await academyJlptMockApi.updateTemplate(tpl.id, { status: "PUBLISHED" });
      toast.success("Đã xuất bản đề thi");
      await fetchTemplates();
    } catch {
      toast.error("Không thể xuất bản đề thi");
    }
  };

  const handleArchive = async (tpl: JlptMockTemplate) => {
    try {
      await academyJlptMockApi.updateTemplate(tpl.id, { status: "ARCHIVED" });
      toast.success("Đã lưu trữ đề thi");
      await fetchTemplates();
    } catch {
      toast.error("Không thể lưu trữ đề thi");
    }
  };

  return (
    <div className="flex flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-6">
      <PageHeader
        title="Quản lý Đề thi JLPT (Templates)"
        subtitle="Tạo và cấu hình các bộ đề thi thử JLPT; sau khi tạo vào Builder để gắn câu hỏi."
        actions={
          <Button className="gap-2" size="lg" onClick={openCreate}>
            <Plus className="size-4" />
            Tạo đề thi mới
          </Button>
        }
      />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="sm:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Tạo đề thi JLPT mới</SheetTitle>
            <SheetDescription>
              Mã đề (code) là duy nhất; cấp độ dùng để chọn profile chấm điểm mặc định trên server.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <Field>
              <FieldLabel>Cấp độ</FieldLabel>
              <Select value={newLevel} onValueChange={setNewLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Mã đề (code)</FieldLabel>
              <Input
                placeholder="VD: MOCK_N5_2025_01"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel>Tiêu đề</FieldLabel>
              <Input
                placeholder="Tên hiển thị đề thi"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Mô tả (tuỳ chọn)</FieldLabel>
              <Textarea
                rows={3}
                placeholder="Ghi chú nội bộ…"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 size-4 animate-spin" />}
                Tạo & mở Builder
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tiêu đề hoặc mã đề..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp</SelectItem>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" className="gap-2" onClick={fetchTemplates} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Làm mới
            </Button>
          </div>
        </div>

        <div className="-mx-1 overflow-hidden rounded-md border bg-background sm:mx-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[720px] w-full">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Cấp độ</TableHead>
                  <TableHead>Thông tin đề thi</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[150px]">Tổng thời gian</TableHead>
                  <TableHead className="w-[100px] text-right">Thao tác</TableHead>
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
                ) : templates.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="h-[320px] text-center">
                      <Empty>
                        <EmptyMedia>
                          <LayoutTemplate className="size-8 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyContent>
                          <EmptyTitle>Không tìm thấy đề thi</EmptyTitle>
                          <EmptyDescription>
                            Thử đổi bộ lọc hoặc tạo đề thi mới.
                          </EmptyDescription>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((tpl) => (
                    <TableRow key={tpl.id} className="group transition-colors">
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          {tpl.levelCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{tpl.title}</div>
                        <div className="mt-1 font-mono text-xs uppercase tracking-tight text-muted-foreground">
                          CODE: {tpl.code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tpl.status === "PUBLISHED" ? "default" : "secondary"}>
                          {tpl.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{tpl.totalDurationMinutes ?? "?"} phút</span>
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
                            <DropdownMenuItem className="gap-2" asChild>
                              <Link to={`/academy/jlpt/templates/${tpl.id}`}>
                                <Edit className="size-4" /> Cấu hình đề (Builder)
                              </Link>
                            </DropdownMenuItem>
                            {tpl.status === "DRAFT" || tpl.status === "READY" ? (
                              <DropdownMenuItem
                                className="gap-2 text-emerald-600"
                                onClick={() => void handlePublish(tpl)}
                              >
                                <Play className="size-4" /> Xuất bản (Publish)
                              </DropdownMenuItem>
                            ) : null}
                            {tpl.status === "PUBLISHED" ? (
                              <DropdownMenuItem
                                className="gap-2 text-amber-600"
                                onClick={() => void handleArchive(tpl)}
                              >
                                <Archive className="size-4" /> Lưu trữ (Archive)
                              </DropdownMenuItem>
                            ) : null}
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
    </div>
  );
}
