import { useState } from 'react';
import { useMyCourseRuns } from "@/lib/api/services/course-runs";
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
import { formatDateTime } from '@/lib/format-utils';
import { CourseRunStatus } from '@workspace/schemas';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Video } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";

export default function MyCourseRunsPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: runsData, isLoading } = useMyCourseRuns({
        page,
        limit: 10,
        search: debouncedSearch,
        ...(statusFilter !== 'all' ? { status: statusFilter as any } : {})
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
                title="Lớp học của tôi"
                subtitle="Danh sách các lớp học (Course Runs) mà bạn được phân công giảng dạy"
                stats={[
                    { label: "Tổng số lớp học", value: meta?.total || 0 }
                ]}
            />

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="max-w-xs w-full">
                        <Input
                            placeholder="Tìm kiếm lớp học..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
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
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">Đang tải danh sách lớp học...</div>
                        ) : runs.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">Không tìm thấy lớp học nào thuộc quyền quản lý của bạn.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Tên Lớp</TableHead>
                                        <TableHead>Khung chương trình</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày khai giảng</TableHead>
                                        <TableHead>Sĩ số</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {runs.map((run) => (
                                        <TableRow key={run.id}>
                                            <TableCell className="font-medium">{run.title}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {run.courseMaster?.title || '-'}
                                                {(run.courseMaster as any)?.type === 'live' ? (
                                                    <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700">Live</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="ml-2 bg-slate-50 text-slate-700">VOD</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(run.status)}</TableCell>
                                            <TableCell>
                                                {run.startDate ? formatDateTime(run.startDate) : 'Chưa định ngày'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-foreground">
                                                    <Users className="size-4 text-muted-foreground" />
                                                    <span>{(run as any).totalStudents || 0} / {run.maxStudents || '∞'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-8 gap-2 font-semibold"
                                                        onClick={() => navigate(`/course-master/runs/${run.id}`)}
                                                    >
                                                        <LayoutDashboard className="size-3.5" />
                                                        Tổng quan
                                                    </Button>
                                                    {(run.courseMaster as any)?.type === 'live' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-2"
                                                            onClick={() => navigate(`/course-master/runs/${run.id}/live-sessions`)}
                                                        >
                                                            <Video className="size-3.5" />
                                                            Buổi học
                                                        </Button>
                                                    )}
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
                    <SmartPagination
                        page={meta.page}
                        totalPages={meta.totalPages}
                        totalItems={meta.total}
                        onPageChange={setPage}
                        itemName="lớp học"
                    />
                )}
            </div>
        </div>
    );
}
