import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Link } from "react-router-dom"
import { usePlatformOverview } from "@/lib/api/services/analytics"
import { formatCurrency, formatNumber } from "@/lib/format-utils"
import { StatsCard } from "./stats-card"
import { DollarSign, FileSearch, Ticket, Video, Users } from "lucide-react"

export default function AdminDashboardV2() {
  const { data, isLoading } = usePlatformOverview()
  const overview = data?.overview

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <PageLoading />
      </div>
    )
  }

  const popularCourses = data?.popularCourses ?? []
  const recentSales = data?.recentSales ?? []
  const revenueByLevel = data?.revenueByLevel ?? []

  const estimatedTodayRevenue = (overview?.totalRevenue ?? 0) / 30

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <StatsCard
          title="Yêu cầu Hoàn tiền"
          value={formatNumber(overview?.pendingRefunds ?? 0)}
          sub="Cần đối soát ngay"
          icon={Ticket}
          highlight={Number(overview?.pendingRefunds ?? 0) > 0}
        />
        <StatsCard
          title="Duyệt Khóa học"
          value={formatNumber(overview?.pendingApprovals ?? 0)}
          sub="Đang chờ kiểm duyệt"
          icon={FileSearch}
          highlight={Number(overview?.pendingApprovals ?? 0) > 0}
        />
        <StatsCard
          title="Lịch Live"
          value={formatNumber(overview?.activeRooms ?? 0)}
          sub="Buổi dạy trực tiếp hôm nay"
          icon={Video}
        />
        <StatsCard
          title="Doanh thu (ước tính)"
          value={formatCurrency(estimatedTodayRevenue)}
          sub="Ước tính theo tổng 30 ngày"
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
        {/* Actions / Queue */}
        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Điều phối nhanh</CardTitle>
                <CardDescription>Luồng xử lý theo ưu tiên cho admin</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="shadow-none">
                <Link to="/audit-logs">Xem nhật ký</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Button asChild variant="outline" className="h-auto py-4 justify-start flex flex-col items-start gap-1 border-primary/20">
                <Link to="/academy/approvals">
                  <span className="text-sm font-semibold">Approval Center</span>
                  <span className="text-xs text-muted-foreground">Duyệt khóa học / class</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start flex flex-col items-start gap-1">
                <Link to="/tickets">
                  <span className="text-sm font-semibold">Ticket hoàn tiền</span>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(overview?.pendingRefunds ?? 0)} yêu cầu chờ
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start flex flex-col items-start gap-1">
                <Link to="/orders">
                  <span className="text-sm font-semibold">Đơn hàng & doanh thu</span>
                  <span className="text-xs text-muted-foreground">Kiểm soát trạng thái thanh toán</span>
                </Link>
              </Button>
            </div>

            <div className="pt-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ghi chú hệ thống</div>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Người dùng đang hoạt động</span>
                  <span className="text-sm font-bold">{formatNumber(overview?.activeToday ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Tổng học viên</span>
                  <span className="text-sm font-bold">{formatNumber(overview?.totalUsers ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Tổng doanh thu</span>
                  <span className="text-sm font-bold">{formatCurrency(overview?.totalRevenue ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">LIVE</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(overview?.activeRooms ?? 0)} phòng đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular courses */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Khóa học phổ biến</CardTitle>
              <CardDescription>Top khóa học theo đăng ký</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {popularCourses.length === 0 ? (
                <div className="text-xs text-muted-foreground">Chưa có dữ liệu.</div>
              ) : (
                popularCourses.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-mono">{c.jlptLevel}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{formatNumber(c.totalStudents)} học viên</span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="h-8">
                      <Link to="/academy/course-profiles">Xem</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo cấp độ</CardTitle>
              <CardDescription>Tổng hợp doanh thu</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueByLevel.length === 0 ? (
                <div className="text-xs text-muted-foreground">Chưa có dữ liệu.</div>
              ) : (
                <div className="overflow-auto rounded-md border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Level</TableHead>
                        <TableHead className="text-right">Doanh thu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueByLevel.slice(0, 8).map((r) => (
                        <TableRow key={r.level}>
                          <TableCell className="font-mono">{r.level}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(r.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent sales */}
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>Thông tin bán hàng mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-xs text-muted-foreground">Chưa có dữ liệu.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {recentSales.slice(0, 6).map((s) => (
                  <div key={s.id} className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="size-4 text-primary" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{s.userName}</div>
                          <div className="text-xs text-muted-foreground truncate">{s.userEmail}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{s.id}</Badge>
                    </div>
                    <div className="text-sm font-bold">{formatCurrency(Number(s.amount) || 0)}</div>
                    <div className="text-xs text-muted-foreground">{s.date}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

