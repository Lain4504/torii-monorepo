import { useState } from 'react';
import { useCourseRuns } from "@/lib/api/services/course-runs";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Button } from '@workspace/ui/components/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { formatDateTime, formatCurrency } from '@/lib/format-utils';
import { CourseRunStatus } from '@workspace/schemas';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";

export default function CourseRunsPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const { data: runsData, isLoading } = useCourseRuns({
        page,
        limit: 10,
        search: debouncedSearch,
        ...(statusFilter !== 'all' ? { status: statusFilter as any } : {}),
        ...(typeFilter !== 'all' ? { type: typeFilter as any } : {})
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case CourseRunStatus.PLANNING:
                return <Badge variant="outline">Đang lập kế hoạch</Badge>;
            case CourseRunStatus.ENROLLING:
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Đang tuyển sinh</Badge>;
            case CourseRunStatus.IN_PROGRESS:
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đang diễn ra</Badge>;
            case CourseRunStatus.COMPLETED:
                return <Badge variant="secondary">Đã kết thúc</Badge>;
            case CourseRunStatus.CANCELLED:
                return <Badge variant="destructive">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const runs = runsData?.data || [];
    const meta = runsData ? {
        total: runsData.total,
        totalPages: runsData.totalPages,
        page: runsData.page,
        limit: runsData.limit
    } : null;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Quản lý Lớp học"
                subtitle="Danh sách tất cả các đợt khai giảng (Course Runs) trên hệ thống"
                stats={[
                    { label: "Tổng số lớp học", value: meta?.total || 0 }
                ]}
            />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên lớp, mã lớp hoặc khung chương trình..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-background"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value={CourseRunStatus.PLANNING}>Đang lập kế hoạch</SelectItem>
                            <SelectItem value={CourseRunStatus.ENROLLING}>Đang tuyển sinh</SelectItem>
                            <SelectItem value={CourseRunStatus.IN_PROGRESS}>Đang diễn ra</SelectItem>
                            <SelectItem value={CourseRunStatus.COMPLETED}>Đã kết thúc</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[150px] bg-background">
                            <SelectValue placeholder="Loại hình" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại hình</SelectItem>
                            <SelectItem value="live">Live (Trực tiếp)</SelectItem>
                            <SelectItem value="vod">VOD (Video)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card className="overflow-hidden border-border/50 shadow-sm">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin size-6 border-2 border-primary border-t-transparent rounded-full mb-4" />
                                <p className="text-muted-foreground animate-pulse">Đang tải danh sách lớp học...</p>
                            </div>
                        ) : runs.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <LayoutDashboard className="mx-auto size-12 opacity-10 mb-4" />
                                <p>Không tìm thấy lớp học nào phù hợp với tiêu chí tìm kiếm.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="py-4 font-bold uppercase text-[10px] tracking-widest">Thông tin lớp học</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Khung chương trình</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Trạng thái</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Khai giảng</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Sĩ số</TableHead>
                                        <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {runs.map((run) => (
                                        <TableRow key={run.id} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">{run.title}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-60">{run.id.split('-')[0]}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-medium text-muted-foreground">{run.courseMaster?.title || '-'}</span>
                                                    <div className="flex gap-2">
                                                        {(run.courseMaster as any)?.type === 'live' ? (
                                                            <Badge variant="outline" className="text-[9px] h-4 bg-indigo-50 text-indigo-700 border-indigo-200">LIVE</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[9px] h-4 bg-slate-50 text-slate-700">VOD</Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-[9px] h-4">{(run.courseMaster as any)?.jlptLevel || 'N/A'}</Badge>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(run.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm">{run.startDate ? formatDateTime(run.startDate) : 'Chưa định ngày'}</span>
                                                    <span className="text-[10px] text-muted-foreground italic">
                                                        Giá: {run.price ? formatCurrency(run.price) : 'Miền phí'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 rounded-full bg-primary/5 flex items-center justify-center">
                                                        <Users className="size-4 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">{(run as any).totalStudents || 0}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Học viên</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 pr-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                                                        onClick={() => navigate(`/course/${run.id}`)}
                                                        title="Quản lý chi tiết"
                                                    >
                                                        <LayoutDashboard className="size-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {meta && meta.totalPages > 1 && (
                    <div className="flex justify-center pt-4">
                        <SmartPagination
                            page={meta.page}
                            totalPages={meta.totalPages}
                            totalItems={meta.total}
                            onPageChange={setPage}
                            itemName="lớp học"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
