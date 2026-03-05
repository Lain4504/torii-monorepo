import { useParams, useNavigate } from 'react-router-dom';
import { useCourseRun } from '@/lib/api/services/course-runs';
import { useEnrollmentsByCourse } from '@/lib/api/services/enrollments';
import { PageHeader } from '@/components/common/page-header';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, Users } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { EnrollmentStatus } from '@workspace/schemas';
import { formatDateTime, formatCurrency } from '@/lib/format-utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';

export default function CourseRunEnrollmentsPage() {
    const { runId } = useParams<{ runId: string }>();
    const navigate = useNavigate();

    const { data: run, isLoading: isLoadingRun } = useCourseRun(runId || '');
    // TODO: Replace with useEnrollmentsByRun once API supports it
    const { data: allEnrollments, isLoading: isLoadingEnrollments } = useEnrollmentsByCourse(run?.courseMasterId || '');

    if (isLoadingRun) {
        return <PageLoading text="Đang tải thông tin lớp học..." />;
    }

    if (!run) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <p className="text-muted-foreground">Không tìm thấy lớp học</p>
                <Button onClick={() => navigate('/course-master')}>Quay lại danh sách</Button>
            </div>
        );
    }

    // Filter enrollments by this specific run
    // TODO: When API is updated to filter by runId directly, remove this client-side filter
    const enrollments = allEnrollments?.filter(e => e.courseRun?.id === runId) || [];

    const getEnrollmentBadge = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đang học</Badge>;
            case 'PENDING_PAYMENT':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Chờ thanh toán</Badge>;
            case 'COMPLETED':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Hoàn thành</Badge>;
            case 'DROPPED':
                return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">Bỏ cuộc</Badge>;
            case 'EXPIRED':
                return <Badge variant="outline">Hết hạn</Badge>;
            case 'TRIAL':
                return <Badge variant="outline">Dùng thử</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-muted-foreground hover:text-foreground gap-2 transition-colors hover:bg-transparent -ml-2 w-fit"
                    onClick={() => navigate(`/course/${runId}`)}
                >
                    <ChevronLeft className="size-4" />
                    <span className="text-xs font-sans font-bold italic uppercase tracking-wider">Quay lại chi tiết lớp học</span>
                </Button>
                <PageHeader
                    title="Danh sách Học viên"
                    subtitle={`Lớp học: ${run.title}`}
                    stats={[
                        {
                            label: 'Tổng số học viên',
                            value: enrollments?.length || 0,
                        },
                        {
                            label: 'Đang học',
                            value: enrollments?.filter(e => e.completionStatus === EnrollmentStatus.IN_PROGRESS).length || 0,
                        },
                        {
                            label: 'Hoàn thành',
                            value: enrollments?.filter(e => e.completionStatus === EnrollmentStatus.COMPLETED).length || 0,
                        }
                    ]}
                />
            </div>
            <Card>
                <CardContent>
                    {isLoadingEnrollments ? (
                        <PageLoading text="Đang tải danh sách học viên..." />
                    ) : enrollments && enrollments.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold text-xs uppercase tracking-widest">#</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-widest">Họ và tên</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-widest">Email</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-widest text-center">Tiến độ</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-widest text-center">Ngày tham gia</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-widest text-center">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-widest text-right">Giá thanh toán</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.map((enrollment, idx) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                                        <TableCell className="font-medium">{enrollment.user?.displayName || '-'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{enrollment.user?.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 w-[120px] mx-auto">
                                                <div className="flex justify-between text-[10px] font-medium">
                                                    <span>{enrollment.completionPercentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{ width: `${enrollment.completionPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-center tabular-nums">{formatDateTime(enrollment.enrollmentDate, 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell className="text-center">{getEnrollmentBadge(enrollment.completionStatus)}</TableCell>
                                        <TableCell className="font-medium text-sm text-right tabular-nums">
                                            {enrollment.finalPrice ? formatCurrency(enrollment.finalPrice) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                            <div className="p-6 rounded-full bg-muted/10">
                                <Users className="size-16 text-muted-foreground/20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-sans font-bold italic text-muted-foreground/50 uppercase tracking-tight">Chưa có học viên nào</h3>
                                <p className="text-sm text-muted-foreground/40 max-w-sm mx-auto">Lớp học này hiện chưa có học viên đăng ký.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
