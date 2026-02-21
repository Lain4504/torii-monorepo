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
import { useCourseAnalytics, usePlatformOverview } from "../../api/services/analytics"
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

export default function LearningAnalytics() {
    const { data: courseStats, isLoading: isCourseLoading, refetch: refetchCourse } = useCourseAnalytics()
    const { data: overview, isLoading: isOverviewLoading } = usePlatformOverview()

    if (isCourseLoading || isOverviewLoading) return <PageLoading />

    const enrollmentStatusData = courseStats?.enrollmentByStatus?.map(item => ({
        name: item.status === 'completed' ? 'Hoàn thành' : item.status === 'in_progress' ? 'Đang học' : 'Bỏ dở',
        value: item.count,
        color: item.status === 'completed' ? 'hsl(var(--primary))' : item.status === 'in_progress' ? 'hsl(var(--chart-2))' : 'hsl(var(--muted))'
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
                        size="lg"
                    >
                        Làm mới
                        <RefreshCw className={cn(isCourseLoading && "animate-spin")} />
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
                    value={overview?.overview.totalEnrollments.toLocaleString() || "0"}
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
                <Card className="md:col-span-12 lg:col-span-8 rounded-2xl border-border/40 shadow-sm bg-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold uppercase tracking-tight">Khóa học <span className="text-primary">Phổ biến</span></CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Top 5 khóa học có lượng đăng ký nhiều nhất</CardDescription>
                        </div>
                        <TrendingUp className="size-4 text-primary opacity-20" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {overview?.popularCourses.map((course, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-transparent hover:border-border/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-background flex items-center justify-center border border-border/10 overflow-hidden shrink-0">
                                            {course.thumbnailUrl ? (
                                                <img src={course.thumbnailUrl} alt="" className="size-full object-cover" />
                                            ) : (
                                                <BookOpen className="size-5 text-muted-foreground/20" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{course.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{course.jlptLevel}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">Torii Academic</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-foreground">{course.totalStudents.toLocaleString()}</p>
                                        <p className="text-[9px] font-bold uppercase text-muted-foreground/40">Học viên</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Completion Pie Chart */}
                <Card className="md:col-span-12 lg:col-span-4 rounded-2xl border-border/40 shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Tỉ lệ <span className="text-emerald-500">Hoàn thành</span></CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Cơ cấu trạng thái khóa học</CardDescription>
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
                                <span className="text-2xl font-black">{Math.round(courseStats?.averageCompletion || 0)}%</span>
                                <span className="text-[8px] font-black uppercase text-muted-foreground/40">Thành công</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-full mt-4">
                            {enrollmentStatusData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground/60">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course Level Breakdown */}
            <Card className="rounded-2xl border-border/40 shadow-sm bg-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/5 border-b border-border/40 py-6">
                    <div>
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Phân bổ <span className="text-primary">Khóa học</span></CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Số lượng khóa chương trình theo cấp độ JLPT</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="h-[350px] pt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseStats?.statsByLevel || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis dataKey="level" axisLine={false} tickLine={false} fontSize={10} />
                            <YAxis axisLine={false} tickLine={false} fontSize={10} />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-background/95 border border-border/50 p-2 rounded-lg shadow-xl backdrop-blur-sm">
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Cấp độ {payload[0].payload.level}</p>
                                                <p className="text-sm font-black text-primary">{payload[0].value} Khóa học</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                                {(courseStats?.statsByLevel || []).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
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
        <Card className="rounded-2xl border-border/40 shadow-sm bg-card group overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl transition-all", colorClass)}>
                        <Icon className="size-5" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{title}</p>
                    <h3 className="text-2xl font-black tracking-tight text-foreground">{value}</h3>
                    <p className="text-[9px] font-medium text-muted-foreground/60 pt-1 uppercase italic border-l-2 border-border/30 pl-3">{sub}</p>
                </div>
            </CardContent>
        </Card>
    )
}
