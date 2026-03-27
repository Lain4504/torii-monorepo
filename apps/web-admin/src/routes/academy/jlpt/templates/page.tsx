import { useState, useEffect } from "react";
import {
  Search,
  LayoutTemplate,
  RefreshCw,
  Loader2,
  Plus,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { PageHeader } from "@/components/common/page-header";
import { academyJlptMockApi, type JlptMockTemplate } from "@/lib/api/services/academy-jlpt-mock";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const LEVELS = ["N1", "N2", "N3", "N4", "N5"];

export default function JlptTemplatesPage() {
  const [templates, setTemplates] = useState<JlptMockTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("all");

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

  return (
    <div className="flex flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-6">
      <PageHeader
        title="Quản lý Đề thi JLPT (Templates)"
        subtitle="Danh sách đề thi JLPT."
        actions={
          <Button onClick={() => toast.info("Tính năng tạo đề thi mới đang được phát triển")}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo đề thi
          </Button>
        }
      />

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
                  <TableHead className="w-[100px] text-right">Trạng thái</TableHead>
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
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/academy/jlpt/templates/${tpl.id}`}>Xem</Link>
                        </Button>
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
