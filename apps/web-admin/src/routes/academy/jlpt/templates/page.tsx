import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Edit, LayoutTemplate, Play, Archive } from "lucide-react";
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
    } catch (error) {
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Đề thi JLPT (Templates)</h1>
          <p className="text-muted-foreground">Tạo và cấu hình các bộ đề thi thử JLPT.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Tạo đề thi mới
        </Button>
      </div>

      <div className="space-y-4">
        <div className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <form onSubmit={handleSearch} className="flex-1 space-y-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tiêu đề hoặc mã đề..."
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
            </div>
            <Button variant="outline" size="icon" onClick={fetchTemplates}>
              <LayoutTemplate className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md bg-background border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Cấp độ</TableHead>
                <TableHead>Thông tin đề thi</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[150px]">Tổng thời gian</TableHead>
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
              ) : templates.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="h-[400px] text-center">
                    <Empty>
                      <EmptyMedia>
                        <LayoutTemplate className="size-8 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyContent>
                        <EmptyTitle>Không tìm thấy đề thi</EmptyTitle>
                        <EmptyDescription>
                          Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm.
                        </EmptyDescription>
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((tpl) => (
                  <TableRow key={tpl.id} className="group transition-colors">
                    <TableCell>
                      <Badge variant="outline" className="font-bold border-2">
                        {tpl.levelCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-base">{tpl.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 uppercase font-mono tracking-tighter">
                        CODE: {tpl.code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tpl.status === "PUBLISHED" ? "default" : "secondary"}>
                        {tpl.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{tpl.totalDurationMinutes || "?"} phút</span>
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
                          <DropdownMenuItem className="gap-2" asChild>
                            <Link to={`/academy/jlpt/templates/${tpl.id}`}>
                              <Edit className="w-4 h-4" /> Cấu hình đề (Builder)
                            </Link>
                          </DropdownMenuItem>
                          {tpl.status === "DRAFT" ? (
                            <DropdownMenuItem className="gap-2 text-emerald-600">
                              <Play className="w-4 h-4" /> Xuất bản (Publish)
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="gap-2 text-amber-600">
                              <Archive className="w-4 h-4" /> Đóng lại (Archive)
                            </DropdownMenuItem>
                          )}
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

