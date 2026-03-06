import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreVertical, Edit, Plus, Calendar, Users, LayoutDashboard, Trash } from 'lucide-react';
import { useCourseRuns, useDeleteCourseRun, useUpdateCourseRunStatus } from '@/lib/api/services/course-runs';
import { CourseRunStatus } from '@workspace/schemas';
import { formatCurrency, formatDateTime } from '@/lib/format-utils';
import { toast } from '@workspace/ui/components/sonner';
import { CreateCourseRunSheet } from './create-course-run-sheet';
import { EditCourseRunSheet } from './edit-course-run-sheet';
import { useNavigate } from 'react-router-dom';

interface CourseRunsTableProps {
    courseId: string;
    courseType?: 'vod' | 'live';
}

export function CourseRunsTable({ courseId, courseType }: CourseRunsTableProps) {
    const navigate = useNavigate();
    const { data: runsData, isLoading } = useCourseRuns({ courseMasterId: courseId, page: 1, limit: 100 });
    const deleteMutation = useDeleteCourseRun();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRun, setSelectedRun] = useState<any | null>(null);
    const updateStatusMutation = useUpdateCourseRunStatus();

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Đã xóa lớp học');
            } catch (error) {
                toast.error('Xóa thất bại');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case CourseRunStatus.DRAFT:
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Bản nháp</Badge>;
            case CourseRunStatus.PENDING_REVIEW:
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Chờ kiểm duyệt nội dung</Badge>;
            case CourseRunStatus.CHANGES_REQUIRED:
                return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Cần chỉnh sửa</Badge>;
            case CourseRunStatus.APPROVED:
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Đã duyệt nội dung</Badge>;
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

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách lớp...</div>;

    const runs = runsData?.data || [];
    const isVod = courseType === 'vod';
    const hasVodRun = isVod && runs.length >= 1;

    const handleOpenRun = async (id: string, status: string) => {
        if (status !== CourseRunStatus.PLANNING) return;
        try {
            await updateStatusMutation.mutateAsync({ id, status: CourseRunStatus.ENROLLING });
            toast.success('Đã mở đợt khai giảng cho học viên');
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái đợt khai giảng');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold uppercase tracking-tight">Các đợt khai giảng (Course Runs)</h3>
                    <p className="text-sm text-muted-foreground">
                        {isVod
                            ? 'Khóa VOD: chỉ cần một đợt khai giảng duy nhất để học viên đăng ký và bắt đầu học ngay.'
                            : 'Khóa Live: có thể mở nhiều đợt khai giảng (cohort) khác nhau.'}
                    </p>
                    {hasVodRun && (
                        <p className="text-xs font-semibold text-amber-600 mt-1">
                            Khóa VOD này đã có một Course Run. Nên chỉnh sửa run hiện tại thay vì tạo thêm run mới.
                        </p>
                    )}
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    size="sm"
                    className="font-bold"
                    disabled={hasVodRun}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Mở đợt khai giảng mới
                </Button>
            </div>

            {runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/5">
                    <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground">Chưa có đợt khai giảng nào được khởi tạo cho khung chương trình này.</p>
                    <Button variant="link" onClick={() => setIsCreateOpen(true)} className="font-bold uppercase text-[10px] tracking-widest text-primary">Bắt đầu mở đợt khai giảng đầu tiên</Button>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[200px]">Tên Lớp</TableHead>
                                <TableHead>Trạng Thái</TableHead>
                                <TableHead>Học Phí</TableHead>
                                <TableHead>Khai Giảng</TableHead>
                                {!isVod && <TableHead>Sĩ Số</TableHead>}
                                <TableHead>Giảng Viên</TableHead>
                                <TableHead className="text-right">Thao Tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {runs.map((run) => (
                                <TableRow key={run.id}>
                                    <TableCell className="font-medium">
                                        {run.title}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                                    <TableCell>
                                        {(run as any).price != null && Number((run as any).price) > 0
                                            ? formatCurrency(Number((run as any).price))
                                            : <span className="text-primary italic">Miễn phí</span>}
                                    </TableCell>
                                    <TableCell>
                                        {run.startDate ? formatDateTime(run.startDate) : 'Chưa định ngày'}
                                    </TableCell>
                                    {!isVod && (
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{(run as any).totalStudents || 0} / {run.maxStudents || '∞'}</span>
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {run.lecturer?.displayName || <span className="text-muted-foreground italic">Chưa phân công</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/course/${run.id}`)} className="h-8 text-xs font-bold gap-2">
                                                <LayoutDashboard className="h-3.5 w-3.5" />
                                                Quản lý
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="p-1.5 rounded-xl border-border/40 shadow-xl min-w-[160px]">
                                                    <DropdownMenuItem onClick={() => navigate(`/course/${run.id}`)} className="rounded-lg gap-2 py-2">
                                                        <LayoutDashboard className="h-4 w-4 opacity-50" />
                                                        <span className="font-bold text-xs uppercase">Tổng quan</span>
                                                    </DropdownMenuItem>
                                                    {!isVod && (
                                                        <DropdownMenuItem onClick={() => navigate(`/course/${run.id}/live-sessions`)} className="rounded-lg gap-2 py-2">
                                                            <Users className="h-4 w-4 opacity-50" />
                                                            <span className="font-bold text-xs uppercase">Buổi học</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => navigate(`/course/${run.id}/enrollments`)} className="rounded-lg gap-2 py-2">
                                                        <Users className="h-4 w-4 opacity-50" />
                                                        <span className="font-bold text-xs uppercase">Học viên</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedRun(run);
                                                            setIsEditOpen(true);
                                                        }}
                                                        className="rounded-lg gap-2 py-2"
                                                    >
                                                        <Edit className="h-4 w-4 opacity-50" />
                                                        <span className="font-bold text-xs uppercase">Sửa nhanh</span>
                                                    </DropdownMenuItem>
                                                    {run.status === CourseRunStatus.PLANNING && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleOpenRun(run.id, run.status)}
                                                            className="rounded-lg gap-2 py-2 text-emerald-700 focus:text-emerald-800 focus:bg-emerald-500/10"
                                                        >
                                                            <Calendar className="h-4 w-4 opacity-50" />
                                                            <span className="font-bold text-xs uppercase">Mở cho học viên</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDelete(run.id)} className="rounded-lg gap-2 py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-500/10">
                                                        <Trash className="h-4 w-4 opacity-50" />
                                                        <span className="font-bold text-xs uppercase">Hủy đợt</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <CreateCourseRunSheet
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                courseId={courseId}
                courseType={courseType}
            />
            <EditCourseRunSheet
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                run={selectedRun}
                courseType={courseType}
            />
        </div>
    );
}
