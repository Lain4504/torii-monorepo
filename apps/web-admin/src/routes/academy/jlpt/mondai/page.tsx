import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldLabel } from "@workspace/ui/components/field";
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


  return (
    <div className="flex flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-6">
      <PageHeader
        title="Master Mondai (JLPT)"
        subtitle="Định nghĩa dạng bài theo cấp độ và phần thi; trang đang ở chế độ chỉ xem (read-only)."
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
              <TableHead className="w-[100px] text-right">Trạng thái</TableHead>
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
                  <TableCell className="text-right text-xs text-muted-foreground">Read-only</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
