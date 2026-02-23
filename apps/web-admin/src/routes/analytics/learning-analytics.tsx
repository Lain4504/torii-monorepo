import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
    BookOpen,
    TrendingUp,
    RefreshCw,
    Award,
    Layout,
    Star,
    Clock,
    CheckCircle2,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import { useCourseAnalytics, usePlatformOverview } from "@/lib/api/services/analytics"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

import { PageLoading } from "@workspace/ui/components/page-loading"
import { PageHeader } from "@/components/common/page-header"
import { formatNumber } from "@/lib/format-utils"

export default function LearningAnalytics() {
    const { data: courseStats, isLoading: isCourseLoading, refetch: refetchCourse } = useCourseAnalytics()
    const { data: overview, isLoading: isOverviewLoading } = usePlatformOverview()

    if (isCourseLoading || isOverviewLoading) return <PageLoading />

    const enrollmentStatusData = courseStats?.enrollmentByStatus?.map(item => ({
        name: item.status === 'completed' ? 'Hoàn thành' : item.status === 'in_progress' ? 'Đang học' : 'Bỏ dở',
        value: item.count,
        color: item.status === 'completed' ? 'var(--primary)' : item.status === 'in_progress' ? 'var(--chart-2)' : 'var(--muted)'
    })) || []

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Phân tích Nội dung"
                subtitle="Đánh giá chất lượng bài giảng, tỷ lệ hoàn thành và mức độ tương tác của học viên với chương trình học."
                stats={[
                    { label: "Hoàn thành TB", value: `${(courseStats?.averageCompletion || 0).toFixed(1)}%` },
                    { label: "Khóa học active", value: courseStats?.statsByLevel.reduce((acc, curr) => acc + curr.count, 0) || 0 }
                ]}
                actions={
                    <Button
                        onClick={() => refetchCourse()}
                    >
                        <RefreshCw className={cn("mr-2 size-4", isCourseLoading && "animate-spin")} />
                        Làm mới
                    </Button>
                }
            />

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                    title="Tỷ lệ Hoàn thành TB"
                    value={`${(courseStats?.averageCompletion || 0).toFixed(1)}%`}
                    sub="Tiến độ học tập của toàn hệ thống"
                    icon={Award}
                    colorClass="text-emerald-500 bg-emerald-500/10"
                />
                <AnalyticsCard
                    title="Tổng số Đăng ký"
                    value={formatNumber(overview?.overview.totalEnrollments) || "0"}
                    sub="Học viên đã tham gia khóa học"
                    icon={Layout}
                    colorClass="text-blue-500 bg-blue-500/10"
                />
                <AnalyticsCard
                    title="Đánh giá trung bình"
                    value="4.8/5"
                    sub="Dựa trên 1,200+ review thực tế"
                    icon={Star}
                    colorClass="text-amber-500 bg-amber-500/10"
                />
                <AnalyticsCard
                    title="Thời gian học TB"
                    value="42h"
                    sub="Tổng thời gian học mỗi học viên"
                    icon={Clock}
                    colorClass="text-primary bg-primary/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Popular Courses Table */}
                <Card className="md:col-span-12 lg:col-span-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Khóa học <span className="text-primary">Phổ biến</span></CardTitle>
                            <CardDescription>Top 5 khóa học có lượng đăng ký nhiều nhất</CardDescription>
                        </div>
                        <TrendingUp className="size-4 text-primary opacity-20" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {overview?.popularCourses.map((course, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                            {course.thumbnailUrl ? (
                                                <img src={course.thumbnailUrl} alt="" className="size-full object-cover" />
                                            ) : (
                                                <BookOpen className="size-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{course.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary">{course.jlptLevel}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold">{formatNumber(course.totalStudents)}</p>
                                        <p className="text-xs text-muted-foreground">Học viên</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Completion Pie Chart */}
                <Card className="md:col-span-12 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Tỉ lệ Hoàn thành</CardTitle>
                        <CardDescription>Cơ cấu trạng thái khóa học</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={enrollmentStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {enrollmentStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <CheckCircle2 className="size-5 text-emerald-500 mb-1" />
                                <span className="text-2xl font-bold">{Math.round(courseStats?.averageCompletion || 0)}%</span>
                                <span className="text-xs text-muted-foreground">Thành công</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-full mt-4">
                            {enrollmentStatusData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="font-semibold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course Level Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Phân bổ Khóa học</CardTitle>
                    <CardDescription>Số lượng khóa chương trình theo cấp độ JLPT</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseStats?.statsByLevel || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis dataKey="level" axisLine={false} tickLine={false} fontSize={10} />
                            <YAxis axisLine={false} tickLine={false} fontSize={10} />
                            <Tooltip
                                cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-background border p-2 rounded-lg shadow-lg">
                                                <p className="text-sm font-semibold text-muted-foreground">Cấp độ {payload[0].payload.level}</p>
                                                <p className="text-base font-bold text-primary">{payload[0].value} Khóa học</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                                {(courseStats?.statsByLevel || []).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

function AnalyticsCard({ title, value, sub, icon: Icon, colorClass }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("size-4 text-muted-foreground", colorClass)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
        </Card>
    )
}
