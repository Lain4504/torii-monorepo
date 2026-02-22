import { useStaffDashboard } from '@/api/services/staff-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Link } from 'react-router-dom';
import { cn } from '@workspace/ui/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { getGreeting } from '@/lib/format-utils';
import { useAuth } from '@/hooks/use-auth';
import { Zap, BookOpen, Users, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export default function StaffDashboardPage() {
    const { data: metrics, isLoading, error } = useStaffDashboard();
    const { user } = useAuth();

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center text-destructive py-8">
                    Lỗi: {error.message}
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Tổng số Khóa học',
            value: metrics?.totalCourses || 0,
            icon: BookOpen,
            description: 'Tất cả khóa học trong hệ thống',
            gradient: 'bg-blue-500/10 text-blue-500',
        },
        {
            title: 'Khóa học Đang hoạt động',
            value: metrics?.activeCourses || 0,
            icon: CheckCircle2,
            description: 'Đã xuất bản và đang vận hành',
            gradient: 'bg-emerald-500/10 text-emerald-500',
        },
        {
            title: 'Tổng số Học viên',
            value: metrics?.totalStudents || 0,
            icon: Users,
            description: 'Học viên đã đăng ký',
            gradient: 'bg-purple-500/10 text-purple-500',
        },
        {
            title: 'Tổng số Giảng viên',
            value: metrics?.totalLecturers || 0,
            icon: GraduationCap,
            description: 'Giảng viên đang hoạt động',
            gradient: 'bg-orange-500/10 text-orange-500',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title={`${getGreeting()}, ${user?.displayName?.split(' ')[0] || 'ADMIN'}`}
                subtitle={`Bảng chỉ huy trung tâm Torii Admin • v4.2.0-stable`}
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex bg-muted p-1 rounded-xl border">
                            <Button variant="ghost" asChild size="sm">
                                <Link to="/analytics/revenue">Tài chính</Link>
                            </Button>
                            <Button variant="ghost" asChild size="sm">
                                <Link to="/analytics/learning">Học tập</Link>
                            </Button>
                            <Button variant="ghost" asChild size="sm">
                                <Link to="/analytics/users">Học viên</Link>
                            </Button>
                        </div>
                        <Button size="lg" className="group">
                            <Zap className="size-4 mr-2" />
                            Lệnh nhanh
                        </Button>
                    </div>
                }
            />

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="border border-border/40 shadow-sm transition-all duration-300 rounded-xl hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold text-muted-foreground/70">
                                    {stat.title}
                                </CardTitle>
                                <div className={cn("p-2 rounded-lg", stat.gradient)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-20" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stat.description}
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Additional Dashboard Content */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border border-border/40 shadow-sm transition-all duration-300 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Thao tác nhanh</CardTitle>
                        <CardDescription className="text-xs font-medium">Các tác vụ và lối tắt phổ biến</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link
                            to="/courses"
                            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="text-sm font-semibold">Quản lý khóa học</div>
                            <div className="text-xs text-muted-foreground">Tạo, chỉnh sửa và xuất bản khóa học</div>
                        </Link>
                        <Link
                            to="/users"
                            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="text-sm font-semibold">Quản lý người dùng</div>
                            <div className="text-xs text-muted-foreground">Thêm hoặc cập nhật tài khoản người dùng</div>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border border-border/40 shadow-sm transition-all duration-300 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Trạng thái hệ thống</CardTitle>
                        <CardDescription className="text-xs font-medium">Tổng quan sức khỏe nền tảng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Trạng thái nền tảng</span>
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                    <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                                    Đang hoạt động
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Cơ sở dữ liệu</span>
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                    <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                                    Đã kết nối
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
