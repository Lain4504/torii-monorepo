import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '@/lib/api/services/courses';
import { useEnrollmentsByCourse } from '@/lib/api/services/enrollments';
import { PageHeader } from '@/components/common/page-header';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { formatDate } from '@/lib/format-utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';

export default function CourseMasterEnrollmentsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: enrollments, isLoading: isLoadingEnrollments } = useEnrollmentsByCourse(id || '');

    if (isLoadingCourse) {
        return <PageLoading text="Đang tải thông tin khóa học..." />;
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <p className="text-muted-foreground">Không tìm thấy khóa học</p>
                <Button onClick={() => navigate('/course-master')}>Quay lại danh sách</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-muted-foreground hover:text-foreground gap-2 transition-colors hover:bg-transparent -ml-2 w-fit"
                    onClick={() => navigate(`/course-master/${id}`)}
                >
                    <ChevronLeft className="size-4" />
                    <span className="text-xs font-sans font-bold italic uppercase tracking-wider">Quay lại chi tiết khóa học</span>
                </Button>
                <PageHeader
                    title="Danh sách học viên"
                    subtitle={`Khóa học: ${course.title}`}
                    stats={[
                        {
                            label: 'Tổng số học viên',
                            value: enrollments?.length || 0,
                        }
                    ]}
                />
            </div>
            <Card>
                <CardContent>
                    {isLoadingEnrollments ? (
                        <PageLoading text="Đang tải danh sách học viên..." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Họ và tên</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Ngày tham gia</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments?.map(enrollment => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell>{enrollment.user?.displayName}</TableCell>
                                        <TableCell>{enrollment.user?.email}</TableCell>
                                        <TableCell>{formatDate(enrollment.enrollmentDate)}</TableCell>
                                        <TableCell>{enrollment.completionStatus}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
