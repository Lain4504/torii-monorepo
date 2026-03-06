import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { BarChart3, Users, BookOpen, GraduationCap, ArrowUpRight, TrendingUp } from "lucide-react"

export default function AcademyReportsPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Academy · Báo cáo & Phân tích"
                subtitle="Theo dõi hiệu quả đào tạo, tiến độ học tập và tỉ lệ hoàn thành."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Học viên mới (Tháng này)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+128</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-emerald-500 font-medium flex items-center gap-1 inline-flex">
                                <TrendingUp className="h-3 w-3" /> 12%
                            </span>{" "}
                            so với tháng trước
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tỉ lệ Hoàn thành Khóa học</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">64.2%</div>
                        <p className="text-xs text-muted-foreground">Trung bình trên toàn hệ thống</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Điểm đánh giá Trung bình</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8.4/10</div>
                        <p className="text-xs text-muted-foreground">Từ 450 bài kiểm tra gần nhất</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Tiến độ học tập theo thời gian</CardTitle>
                        <CardDescription>Số lượng học viên hoàn thành các lesson mỗi ngày.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-t bg-muted/10">
                        <div className="text-muted-foreground flex flex-col items-center gap-2">
                            <BarChart3 className="h-8 w-8 opacity-20" />
                            <span className="text-sm">Biểu đồ đang được phát triển...</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Xếp hạng Lớp học</CardTitle>
                        <CardDescription>Top lớp học có tương tác cao nhất.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Tiếng Nhật N5 - Batch 22", students: 45, progress: "92%" },
                                { name: "Luyện thi SAT Cấp tốc", students: 32, progress: "88%" },
                                { name: "IELTS 7.5+ Masterclass", students: 28, progress: "85%" },
                                { name: "Tiếng Hàn Sơ cấp 1", students: 50, progress: "78%" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.students} học viên</p>
                                    </div>
                                    <div className="font-medium text-sm text-emerald-600">{item.progress}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Báo cáo theo Lớp (Class-level)</CardTitle>
                        <CardDescription>Xem chi tiết tiến độ của từng lớp học cụ thể.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full justify-between">
                            Chọn lớp để xem báo cáo <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Báo cáo học viên (Student-level)</CardTitle>
                        <CardDescription>Tra cứu lịch sử học tập và điểm số của từng cá nhân.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full justify-between">
                            Tìm kiếm học viên <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
