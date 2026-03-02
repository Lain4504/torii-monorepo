import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourseRun } from '@/lib/api/services/course-runs';
import { useCourse } from '@/lib/api/services/courses';
import { useEnrollmentsByCourse } from '@/lib/api/services/enrollments';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ArrowLeft, Users, Calendar, Clock, BookOpen, Settings, LayoutDashboard, Video, Banknote } from 'lucide-react';
import { CourseRunStatus } from '@workspace/schemas';
import { formatCurrency, formatDateTime } from '@/lib/format-utils';

export default function CourseRunDetailPage() {
    const { runId } = useParams<{ runId: string }>();
    const navigate = useNavigate();
    const { data: run, isLoading: isLoadingRun } = useCourseRun(runId!);
    const { data: course, isLoading: isLoadingCourse } = useCourse(run?.courseMasterId || '');
    const { data: allEnrollments } = useEnrollmentsByCourse(run?.courseMasterId || '');
    
    // Filter enrollments by this specific run
    const enrollments = allEnrollments?.filter(e => e.courseRun?.id === runId) || [];

    const isLoading = isLoadingRun || isLoadingCourse;

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-3 gap-6">
                    <Skeleton className="h-32 col-span-2" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        );
    }

    if (!run) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin lớp học.</div>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case CourseRunStatus.PLANNING:
                return <Badge variant="outline">Đang lập kế hoạch</Badge>;
            case CourseRunStatus.ENROLLING:
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Đang tuyển sinh</Badge>;
            case CourseRunStatus.IN_PROGRESS:
                return <Badge className="bg-green-100 text-green-700">Đang diễn ra</Badge>;
            case CourseRunStatus.COMPLETED:
                return <Badge variant="secondary">Đã kết thúc</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={course ? `/courses/${course.id}` : '/courses'}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(run.status)}
                            <span className="text-sm text-muted-foreground">ID: {run.id.slice(0, 8)}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{run.title}</h1>
                        <p className="text-muted-foreground mt-1">
                            Thuộc khung chương trình:{' '}
                            {course ? (
                                <Link to={`/courses/${course.id}`} className="font-medium text-primary hover:underline">
                                    {course.title}
                                </Link>
                            ) : (
                                <span className="font-medium text-foreground">—</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Cấu hình
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted/30 border-b border-border rounded-none p-0 h-auto">
                    <TabsTrigger value="overview" className="rounded-none data-[state=active]:bg-background border-b-2 border-b-transparent data-[state=active]:border-b-primary">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger value="live-sessions" className="rounded-none data-[state=active]:bg-background border-b-2 border-b-transparent data-[state=active]:border-b-primary">
                        <Video className="mr-2 h-4 w-4" />
                        Buổi học ({enrollments.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="enrollments" className="rounded-none data-[state=active]:bg-background border-b-2 border-b-transparent data-[state=active]:border-b-primary">
                        <Users className="mr-2 h-4 w-4" />
                        Học viên ({enrollments.length || 0})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-tight font-bold">
                                        <LayoutDashboard className="h-5 w-5 text-primary" />
                                        Thông tin đợt khai giảng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Thời gian khai giảng</p>
                                                <p className="font-semibold">{run.startDate ? formatDateTime(run.startDate) : 'Chưa định ngày'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Ngày kết thúc dự kiến</p>
                                                <p className="font-semibold">{run.endDate ? formatDateTime(run.endDate) : 'Chưa định ngày'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Users className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Sĩ số hiện tại</p>
                                                <p className="font-semibold">{(run as any).totalEnrolled || 0} / {run.maxStudents || '∞'} học viên</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Giảng viên</p>
                                                <p className="font-semibold">{run.lecturer?.displayName || 'Chưa phân công'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Banknote className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Học phí</p>
                                                <p className="font-semibold">
                                                    {(run as any).price != null && Number((run as any).price) > 0
                                                        ? formatCurrency(Number((run as any).price))
                                                        : 'Miễn phí'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Trạng thái tuyển sinh</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Mở đăng ký:</span>
                                        <span className="font-medium">{run.enrollmentStart ? formatDateTime(run.enrollmentStart) : 'Không giới hạn'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Đóng đăng ký:</span>
                                        <span className="font-medium">{run.enrollmentEnd ? formatDateTime(run.enrollmentEnd) : 'Không giới hạn'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tối thiểu để mở lớp:</span>
                                        <span className="font-medium">{run.minStudents} học viên</span>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <Button className="w-full" variant="secondary">Cập nhật trạng thái</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="live-sessions" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Video className="h-5 w-5 text-primary" />
                                    Buổi học Trực tuyến
                                </CardTitle>
                                <CardDescription>Quản lý tất cả các buổi học live của lớp này</CardDescription>
                            </div>
                            <Button 
                                onClick={() => navigate(`/courses/runs/${runId}/live-sessions`)}
                                className="font-bold uppercase tracking-widest text-xs"
                            >
                                Xem chi tiết
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="py-12 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                <Video className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground font-medium mb-4">Nhấn nút "Xem chi tiết" để quản lý buổi học</p>
                                <Button 
                                    variant="outline"
                                    onClick={() => navigate(`/courses/runs/${runId}/live-sessions`)}
                                >
                                    <Video className="mr-2 h-4 w-4" />
                                    Quản lý buổi học
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="enrollments" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Danh sách Học viên
                                </CardTitle>
                                <CardDescription>Quản lý học viên đã đăng ký vào lớp này</CardDescription>
                            </div>
                            <Button 
                                onClick={() => navigate(`/courses/runs/${runId}/enrollments`)}
                                className="font-bold uppercase tracking-widest text-xs"
                            >
                                Xem chi tiết
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="py-12 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                <Users className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground font-medium mb-4">Tổng cộng: {enrollments.length} học viên</p>
                                <Button 
                                    variant="outline"
                                    onClick={() => navigate(`/courses/runs/${runId}/enrollments`)}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Xem danh sách chi tiết
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
