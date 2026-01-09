import { useStaffDashboard } from '@/api/services/staff-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { BookOpen, Users, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function StaffDashboardPage() {
    const { data: metrics, isLoading, error } = useStaffDashboard();

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center text-destructive py-8">
                    Error: {error.message}
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Courses',
            value: metrics?.totalCourses || 0,
            icon: BookOpen,
            description: 'All courses in the system',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'Active Courses',
            value: metrics?.activeCourses || 0,
            icon: CheckCircle2,
            description: 'Published and running',
            gradient: 'from-green-500 to-emerald-500',
        },
        {
            title: 'Total Students',
            value: metrics?.totalStudents || 0,
            icon: Users,
            description: 'Enrolled learners',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            title: 'Total Lecturers',
            value: metrics?.totalLecturers || 0,
            icon: GraduationCap,
            description: 'Active instructors',
            gradient: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Overview of your learning management system
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
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <a
                            href="/courses"
                            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="font-medium">Manage Courses</div>
                            <div className="text-sm text-muted-foreground">Create, edit, and publish courses</div>
                        </a>
                        <a
                            href="/users"
                            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="font-medium">Manage Users</div>
                            <div className="text-sm text-muted-foreground">Add or update user accounts</div>
                        </a>
                    </CardContent>
                </Card>

                <Card className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl">
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                        <CardDescription>Platform health overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Platform Status</span>
                                <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
                                    Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Database</span>
                                <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
                                    Connected
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
