import { useStaffDashboard } from '@/api/services/staff-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { BookOpen, Users, GraduationCap, CheckCircle2, LayoutDashboard } from 'lucide-react';

export default function StaffDashboardPage() {
    const { data: metrics, isLoading, error } = useStaffDashboard();

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
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'Khóa học Đang hoạt động',
            value: metrics?.activeCourses || 0,
            icon: CheckCircle2,
            description: 'Đã xuất bản và đang vận hành',
            gradient: 'from-green-500 to-emerald-500',
        },
        {
            title: 'Tổng số Học viên',
            value: metrics?.totalStudents || 0,
            icon: Users,
            description: 'Học viên đã đăng ký',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            title: 'Tổng số Giảng viên',
            value: metrics?.totalLecturers || 0,
            icon: GraduationCap,
            description: 'Giảng viên đang hoạt động',
            gradient: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Header */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-serif font-bold italic uppercase tracking-wide">
                    <LayoutDashboard className="size-3.5" />
                    Tổng quan
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                    Bảng điều khiển <span className="text-primary not-italic">Nhân viên</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                    Tổng quan về hệ thống quản lý học tập Torii của bạn
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl border-border/40">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                                    <Icon className="h-4 w-4 text-white" />
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
                <Card className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl">
                    <CardHeader>
                        <CardTitle>Thao tác Nhanh</CardTitle>
                        <CardDescription>Các tác vụ và lối tắt phổ biến</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <a
                            href="/courses"
                            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="font-medium">Quản lý Khóa học</div>
                            <div className="text-sm text-muted-foreground">Tạo, chỉnh sửa và xuất bản khóa học</div>
                        </a>
                        <a
                            href="/users"
                            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="font-medium">Quản lý Người dùng</div>
                            <div className="text-sm text-muted-foreground">Thêm hoặc cập nhật tài khoản người dùng</div>
                        </a>
                    </CardContent>
                </Card>

                <Card className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl">
                    <CardHeader>
                        <CardTitle>Trạng thái Hệ thống</CardTitle>
                        <CardDescription>Tổng quan sức khỏe nền tảng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Trạng thái Nền tảng</span>
                                <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
                                    Đang hoạt động
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Cơ sở dữ liệu</span>
                                <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
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
