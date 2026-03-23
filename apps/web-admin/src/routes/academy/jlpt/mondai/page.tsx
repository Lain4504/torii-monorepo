import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { PageHeader } from "@/components/common/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Textarea } from "@workspace/ui/components/textarea";
import { academyJlptMockApi } from "@/lib/api/services/academy-jlpt-mock";
import { jlptSectionLabel } from "@/components/academy/jlpt/jlpt-questions-toolbar";
import { toast } from "sonner";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
const SECTIONS = [
  "LANGUAGE_VOCAB",
  "LANGUAGE_GRAMMAR_READING",
  "LISTENING",
] as const;

type MondaiRow = {
  id: string;
  code: string;
  titleVi: string | null;
  titleJa: string | null;
  descriptionVi?: string | null;
  orderIndex?: number;
  recommendedQuestionCount?: number | null;
};

export default function JlptMondaiMasterPage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<string>("N5");
  const [sectionCode, setSectionCode] = useState<string>("LANGUAGE_VOCAB");
  const [items, setItems] = useState<MondaiRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    titleVi: "",
    titleJa: "",
    descriptionVi: "",
    orderIndex: 0,
    recommendedQuestionCount: "" as string,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await academyJlptMockApi.listBankMondaiOptions({
        level,
        sectionCode,
      });
      setItems(rows as MondaiRow[]);
    } catch {
      toast.error("Không thể tải danh sách mondai");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [level, sectionCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      code: "",
      titleVi: "",
      titleJa: "",
      descriptionVi: "",
      orderIndex: items.length,
      recommendedQuestionCount: "",
    });
    setSheetOpen(true);
  };

  const openEdit = (row: MondaiRow) => {
    setEditingId(row.id);
    setForm({
      code: row.code,
      titleVi: row.titleVi ?? "",
      titleJa: row.titleJa ?? "",
      descriptionVi: row.descriptionVi ?? "",
      orderIndex: row.orderIndex ?? 0,
      recommendedQuestionCount:
        row.recommendedQuestionCount != null ? String(row.recommendedQuestionCount) : "",
    });
    setSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = form.code.trim();
    if (!code) {
      toast.error("Nhập mã mondai (code)");
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await academyJlptMockApi.updateMondai(editingId, {
          code,
          titleVi: form.titleVi.trim() || undefined,
          titleJa: form.titleJa.trim() || undefined,
          descriptionVi: form.descriptionVi.trim() || undefined,
          orderIndex: form.orderIndex,
          recommendedQuestionCount:
            form.recommendedQuestionCount === ""
              ? undefined
              : Number(form.recommendedQuestionCount),
        });
        toast.success("Đã cập nhật mondai");
      } else {
        await academyJlptMockApi.createMondai({
          level,
          sectionCode,
          code,
          titleVi: form.titleVi.trim() || undefined,
          titleJa: form.titleJa.trim() || undefined,
          descriptionVi: form.descriptionVi.trim() || undefined,
          orderIndex: form.orderIndex,
          recommendedQuestionCount:
            form.recommendedQuestionCount === ""
              ? undefined
              : Number(form.recommendedQuestionCount),
        });
        toast.success("Đã tạo mondai");
      }
      setSheetOpen(false);
      await load();
    } catch {
      toast.error("Lưu thất bại (kiểm tra mã trùng hoặc dữ liệu)");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa mondai này? Chỉ xóa được khi không còn câu/đề đang tham chiếu.")) return;
    try {
      await academyJlptMockApi.deleteMondai(id);
      toast.success("Đã xóa mondai");
      await load();
    } catch {
      toast.error("Không xóa được (mondai đang được sử dụng)");
    }
  };

  return (
    <div className="flex flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-6">
      <PageHeader
        title="Master Mondai (JLPT)"
        subtitle="Định nghĩa dạng bài theo cấp độ và phần thi; ngân hàng câu và đề mock tham chiếu mondai này."
        actions={
          <Button className="gap-2" size="lg" onClick={openCreate}>
            <Plus className="size-4" />
            Thêm mondai
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-4">
        <Field className="w-full sm:w-40">
          <FieldLabel>Cấp độ</FieldLabel>
          <Select value={level} onValueChange={setLevel}>
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
        <Field className="min-w-[240px] flex-1">
          <FieldLabel>Phần thi</FieldLabel>
          <Select value={sectionCode} onValueChange={setSectionCode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {jlptSectionLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button type="button" variant="outline" className="gap-2" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Làm mới
        </Button>
      </div>

      <div className="rounded-md border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Mã (code)</TableHead>
              <TableHead>Tiêu đề (VI)</TableHead>
              <TableHead className="w-[140px]">Tiêu đề (JA)</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Chưa có mondai cho bộ lọc này. Nếu DB chưa có `JlptLevel/Section`, bạn hãy tạo cấu hình trước tại trang{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="px-1 h-auto text-muted-foreground"
                    onClick={() => navigate("/academy/jlpt/config")}
                  >
                    JLPT Config
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-sm font-medium">{row.code}</TableCell>
                  <TableCell className="max-w-md truncate">{row.titleVi ?? "—"}</TableCell>
                  <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">
                    {row.titleJa ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Sửa">
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => void handleDelete(row.id)}
                        aria-label="Xóa"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:!max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Sửa mondai" : "Thêm mondai"}</SheetTitle>
            <SheetDescription>
              Mã (code) ổn định theo phần thi; trùng code trong cùng phần sẽ bị từ chối.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <Field>
              <FieldLabel>Mã (code)</FieldLabel>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="VD: KANJI_READING"
                disabled={!!editingId}
                required
              />
            </Field>
            <Field>
              <FieldLabel>Tiêu đề tiếng Việt</FieldLabel>
              <Input
                value={form.titleVi}
                onChange={(e) => setForm((f) => ({ ...f, titleVi: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>Tiêu đề tiếng Nhật</FieldLabel>
              <Input
                value={form.titleJa}
                onChange={(e) => setForm((f) => ({ ...f, titleJa: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>Mô tả (tuỳ chọn)</FieldLabel>
              <Textarea
                rows={3}
                value={form.descriptionVi}
                onChange={(e) => setForm((f) => ({ ...f, descriptionVi: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Thứ tự</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={form.orderIndex}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, orderIndex: Number(e.target.value) || 0 }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Gợi ý số câu</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  placeholder="Tuỳ chọn"
                  value={form.recommendedQuestionCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, recommendedQuestionCount: e.target.value }))
                  }
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Lưu
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
