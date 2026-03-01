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
import { MoreVertical, Edit, Plus, Calendar, Users, LayoutDashboard } from 'lucide-react';
import { useCourseRuns, useDeleteCourseRun } from '@/lib/api/services/course-runs';
import { CourseRunStatus } from '@workspace/schemas';
import { formatDateTime } from '@/lib/format-utils';
import { toast } from '@workspace/ui/components/sonner';
import { CreateCourseRunSheet } from './create-course-run-sheet';
import { useNavigate } from 'react-router-dom';

interface CourseRunsTableProps {
    courseId: string;
}

export function CourseRunsTable({ courseId }: CourseRunsTableProps) {
    const navigate = useNavigate();
    const { data: runsData, isLoading } = useCourseRuns({ courseId, page: 1, limit: 100 });
    const deleteMutation = useDeleteCourseRun();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Danh sách lớp học (Course Runs)</h3>
                    <p className="text-sm text-muted-foreground">Quản lý các khóa khai giảng cụ thể cho Master Course này.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Lớp Mới
                </Button>
            </div>

            {runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/5">
                    <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground">Chưa có lớp học nào được tạo.</p>
                    <Button variant="link" onClick={() => setIsCreateOpen(true)}>Bắt đầu tạo lớp khai giảng đầu tiên</Button>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[200px]">Tên Lớp</TableHead>
                                <TableHead>Trạng Thái</TableHead>
                                <TableHead>Khai Giảng</TableHead>
                                <TableHead>Sĩ Số</TableHead>
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
                                        {run.startDate ? formatDateTime(run.startDate) : 'Chưa định ngày'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{(run as any).totalEnrolled || 0} / {run.maxStudents || '∞'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {run.lecturer?.displayName || <span className="text-muted-foreground italic">Chưa phân công</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => navigate(`/courses/runs/${run.id}`)}>
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    Quản lý lớp
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Chỉnh sửa nhanh
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(run.id)} className="text-destructive">
                                                    Xóa lớp
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
            />
        </div>
    );
}
