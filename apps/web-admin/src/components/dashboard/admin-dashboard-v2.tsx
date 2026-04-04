import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PageLoading } from "@workspace/ui/components/page-loading";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { StatsCard } from "./stats-card";
import { useAdminDashboard } from "@/lib/api/services/dashboard";
import type { DashboardRecentOrderRowDTO } from "@workspace/schemas";
import { formatCurrency, formatNumber } from "@/lib/format-utils";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  BarChart3,
  ClipboardCheck,
  School,
  Wallet,
  Ticket,
  HandCoins,
  TrendingUp,
  Users,
  Activity,
  MonitorSmartphone,
  BookOpen,
  GraduationCap,
  Layers,
  Zap,
  Receipt,
  ChevronDown,
  ListTodo,
} from "lucide-react";
import {
  elevatedPanelClass,
  elevatedPanelContentClass,
  elevatedCardHeaderPrimary,
  emptyStateBoxClass,
} from "@/lib/ui-shell";
import { cn } from "@workspace/ui/lib/utils";
import {
  orderStatusPieFill,
  orderStatusBadgeVariant,
  orderStatusLabelVi,
  pendingApprovalTypePieFill,
  revenueBarFill,
  academyPipelineBarFill,
  academyPipelineStatusLabelVi,
} from "@/lib/dashboard-chart-colors";
import {
  DASHBOARD_CHART_H,
  DashboardChartScroll,
  useNarrowMobile,
} from "@/components/dashboard/dashboard-responsive";

function ChartEmpty() {
  return (
    <div className={cn(DASHBOARD_CHART_H, emptyStateBoxClass)}>
      <BarChart3 className="size-8 text-muted-foreground/30" aria-hidden />
      Chưa có dữ liệu
    </div>
  );
}

function DomainSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

const PRESENCE_FALLBACK = {
  totalUsers: 0,
  activeToday: 0,
  usersWithActiveSession: 0,
  activeSessionCount: 0,
  usersSignedInLast15Minutes: 0,
  measuredAt: "",
};

export default function AdminDashboardV2() {
  const narrow = useNarrowMobile();
  const yAxisHBar = narrow ? 92 : 128;
  const yAxisPending = narrow ? 88 : 118;
  const yAxisPipeline = narrow ? 100 : 132;

  const { data, isLoading, dataUpdatedAt } = useAdminDashboard({ refetchInterval: 60_000 });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  const staffAcademic = data?.staffAcademic;
  const staffOperations = data?.staffOperations;
  const presence = data?.presence ?? PRESENCE_FALLBACK;

  const pendingApprovalsByType = staffAcademic?.pendingApprovalsByType ?? [];
  const pipelineByStatus = (staffAcademic?.pipelineByStatus ?? []).slice(0, 12);
  const ordersByStatus = (staffOperations?.ordersByStatus ?? []).slice(0, 8);
  const revenueByLevel = (staffOperations?.revenueByLevel ?? []).slice(0, 8).map((r) => ({
    name: r.level,
    value: r.amount,
  }));

  const recentOrders = (staffOperations?.recentOrders ?? []).slice(0, 12);
  const revenueLast30Days = staffOperations?.revenueLast30Days ?? [];

  const pendingBarData = pendingApprovalsByType.map((d) => ({
    label: d.name,
    value: d.value,
    colorKey: d.name,
  }));

  const pipelineBarData = pipelineByStatus.map((d) => ({
    label: academyPipelineStatusLabelVi(d.name),
    value: d.value,
    statusKey: d.name,
  }));

  const ordersBarData = ordersByStatus.map((d) => ({
    label: orderStatusLabelVi(d.name),
    value: d.value,
    statusKey: d.name,
  }));

  const measuredLabel =
    presence.measuredAt &&
    (() => {
      try {
        return new Date(presence.measuredAt).toLocaleString("vi-VN");
      } catch {
        return presence.measuredAt;
      }
    })();

  const pendingApprovals = staffAcademic?.stats.pendingApprovals ?? 0;
  const pendingTickets = staffOperations?.stats.pendingTickets ?? 0;
  const pendingRefunds = staffOperations?.stats.pendingRefunds ?? 0;
  const hasAttention = pendingApprovals > 0 || pendingTickets > 0 || pendingRefunds > 0;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Tổng quan nền tảng</h1>
          <p className="text-sm text-muted-foreground">
            Ưu tiên: tiền → đơn → việc cần xử lý → học tập → phiên đăng nhập.
          </p>
          {dataUpdatedAt ? (
            <p className="text-[11px] text-muted-foreground/80">
              Cập nhật: {new Date(dataUpdatedAt).toLocaleString("vi-VN")}
            </p>
          ) : null}
        </div>
        <Collapsible className="min-w-0 sm:max-w-md sm:shrink-0">
          <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
            <ChevronDown
              className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden
            />
            Ghi chú nguồn dữ liệu
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 space-y-1.5 rounded-md border border-border/60 bg-card/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Người dùng & phiên:</span> phiên hiệu lực từ bảng
                session; “hôm nay” và “15 phút” theo lastSignInAt.
                {measuredLabel ? ` Đo tại: ${measuredLabel}.` : ""}
              </li>
              <li>
                <span className="font-medium text-foreground">Thương mại:</span> doanh thu 30 ngày (đơn PAID theo
                ngày); đơn theo trạng thái; bảng 12 đơn mới nhất.
              </li>
              <li>
                <span className="font-medium text-foreground">Học tập:</span> pipeline gộp Course / Cohort / VOD;
                duyệt chờ xử lý theo loại.
              </li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Card
        className={cn(
          "border",
          hasAttention ? "border-amber-500/35 bg-amber-500/[0.04]" : "border-dashed bg-muted/20",
        )}
      >
        <CardContent className="flex flex-col gap-2 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ListTodo className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            Hành động cần xử lý
          </div>
          {!hasAttention ? (
            <span className="text-xs text-muted-foreground">Không có hạng mục cần xử lý gấp.</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pendingApprovals > 0 ? (
                <Badge variant="secondary" className="font-semibold tabular-nums">
                  Duyệt chờ: {formatNumber(pendingApprovals)}
                </Badge>
              ) : null}
              {pendingTickets > 0 ? (
                <Badge variant="secondary" className="font-semibold tabular-nums">
                  Ticket mở: {formatNumber(pendingTickets)}
                </Badge>
              ) : null}
              {pendingRefunds > 0 ? (
                <Badge variant="secondary" className="font-semibold tabular-nums">
                  Hoàn tiền chờ: {formatNumber(pendingRefunds)}
                </Badge>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <section aria-label="Chỉ số ưu tiên admin" className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Chỉ số xem ngay</h2>
        <p className="text-[11px] text-muted-foreground sm:text-xs">
          Doanh thu, đơn, rủi ro vận hành, duyệt nội dung và tín hiệu hoạt động người dùng.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatsCard
            title="Doanh thu (PAID)"
            value={formatCurrency(staffOperations?.stats.totalRevenue ?? 0)}
            sub="Tổng đã thanh toán"
            icon={Wallet}
            tone="success"
          />
          <StatsCard
            title="Đơn PAID"
            value={formatNumber(staffOperations?.stats.paidOrders ?? 0)}
            sub="Giao dịch thành công"
            icon={Receipt}
            tone="info"
          />
          <StatsCard
            title="Ticket mở"
            value={formatNumber(pendingTickets)}
            sub="Hỗ trợ / khiếu nại"
            icon={Ticket}
            tone="primary"
            highlight={pendingTickets > 0}
          />
          <StatsCard
            title="Hoàn tiền chờ"
            value={formatNumber(pendingRefunds)}
            sub="Đối soát"
            icon={HandCoins}
            tone="warning"
            highlight={pendingRefunds > 0}
          />
          <StatsCard
            title="Duyệt nội dung"
            value={formatNumber(pendingApprovals)}
            sub="Course / Cohort / VOD"
            icon={ClipboardCheck}
            tone="warning"
            highlight={pendingApprovals > 0}
          />
          <StatsCard
            title="Đăng nhập hôm nay"
            value={formatNumber(presence.activeToday)}
            sub="Theo lastSignInAt"
            icon={Activity}
            tone="info"
            highlight={(presence.activeToday ?? 0) > 0}
          />
        </div>
      </section>

      <Card className={elevatedPanelClass}>
        <CardHeader className={elevatedCardHeaderPrimary}>
          <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
          <CardDescription className="text-xs">12 đơn mới nhất — ưu tiên theo dõi vận hành</CardDescription>
        </CardHeader>
        <CardContent className={elevatedPanelContentClass}>
          {recentOrders.length === 0 ? (
            <div className={cn("py-10 text-center text-xs", emptyStateBoxClass)}>Chưa có dữ liệu.</div>
          ) : (
            <>
              <div className="space-y-2 md:hidden">
                {recentOrders.map((o: DashboardRecentOrderRowDTO) => (
                  <div
                    key={o.id}
                    className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-semibold">{o.code}</span>
                      <Badge variant={orderStatusBadgeVariant(o.status)} className="shrink-0 text-[10px] font-semibold">
                        {orderStatusLabelVi(o.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">{o.userName || "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.userEmail}</p>
                    <div className="mt-2 flex items-end justify-between gap-2 border-t border-border/50 pt-2">
                      <span className="text-xs tabular-nums text-muted-foreground">{o.date}</span>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(Number(o.amount) || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollArea className="hidden h-[min(20rem,50vh)] rounded-md border border-border/60 md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="sticky top-0 z-10 bg-card">Mã đơn</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-card">Khách hàng</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-card">Email</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-card text-right">Số tiền</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-card">Trạng thái</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-card">Ngày</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((o: DashboardRecentOrderRowDTO) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs font-medium">{o.code}</TableCell>
                        <TableCell className="max-w-[140px] truncate font-medium">{o.userName || "—"}</TableCell>
                        <TableCell className="max-w-[180px] truncate text-muted-foreground text-xs">
                          {o.userEmail}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(Number(o.amount) || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={orderStatusBadgeVariant(o.status)} className="font-semibold">
                            {orderStatusLabelVi(o.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs tabular-nums text-muted-foreground">{o.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="order-1 min-w-0 space-y-6 xl:col-span-8 xl:col-start-1 xl:row-start-1">
          <DomainSection
            title="Thương mại — biểu đồ"
            description="Xu hướng doanh thu, phân bổ đơn và so sánh theo Level (sau khi đã xem chỉ số & đơn ở trên)."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className={elevatedPanelClass}>
                <CardHeader className={elevatedCardHeaderPrimary}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0">
                      <CardTitle className="text-base">Doanh thu 30 ngày</CardTitle>
                      <CardDescription className="text-xs">Đơn PAID theo ngày</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={elevatedPanelContentClass}>
                  {revenueLast30Days.length === 0 ? (
                    <ChartEmpty />
                  ) : (
                    <DashboardChartScroll>
                      <div className={DASHBOARD_CHART_H}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueLast30Days} margin={{ top: 10, right: 8, left: narrow ? -12 : 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="adminRevenueArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: narrow ? 9 : 10 }}
                              tickMargin={6}
                              interval="preserveStartEnd"
                              tickFormatter={(v: string) => {
                                const [, m, d] = v.split("-");
                                return m && d ? `${d}/${m}` : v;
                              }}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: narrow ? 10 : 11 }}
                              width={narrow ? 40 : 52}
                            />
                            <Tooltip
                              formatter={(value: number | undefined) =>
                                value != null ? formatCurrency(value) : ""
                              }
                              labelFormatter={(label) => `Ngày ${label}`}
                            />
                            <Area
                              type="monotone"
                              dataKey="amount"
                              stroke="var(--primary)"
                              strokeWidth={2}
                              fill="url(#adminRevenueArea)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </DashboardChartScroll>
                  )}
                </CardContent>
              </Card>

              <Card className={elevatedPanelClass}>
                <CardHeader className={elevatedCardHeaderPrimary}>
                  <CardTitle className="text-base">Doanh thu theo Level</CardTitle>
                  <CardDescription className="text-xs">So sánh nhóm</CardDescription>
                </CardHeader>
                <CardContent className={elevatedPanelContentClass}>
                  {revenueByLevel.length === 0 ? (
                    <ChartEmpty />
                  ) : (
                    <DashboardChartScroll>
                      <div className={DASHBOARD_CHART_H}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueByLevel} margin={{ top: 10, right: 8, left: narrow ? -18 : -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: narrow ? 10 : 12 }} interval={0} angle={narrow ? -25 : 0} textAnchor={narrow ? "end" : "middle"} height={narrow ? 48 : 30} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={narrow ? 32 : 36} />
                            <Tooltip formatter={(v) => (v != null ? formatCurrency(Number(v)) : "")} />
                            <Bar dataKey="value" fill={revenueBarFill} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </DashboardChartScroll>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className={elevatedPanelClass}>
              <CardHeader className={elevatedCardHeaderPrimary}>
                <CardTitle className="text-base">Đơn hàng theo trạng thái</CardTitle>
                <CardDescription className="text-xs">Số lượng — cột ngang</CardDescription>
              </CardHeader>
              <CardContent className={elevatedPanelContentClass}>
                {ordersBarData.length === 0 ? (
                  <ChartEmpty />
                ) : (
                  <DashboardChartScroll>
                    <div className={cn(DASHBOARD_CHART_H, narrow ? "min-w-[300px]" : "")}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={ordersBarData}
                          margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal />
                          <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={yAxisHBar}
                            tick={{ fontSize: narrow ? 9 : 10 }}
                          />
                          <Tooltip formatter={(v) => (v != null ? formatNumber(Number(v)) : "")} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {ordersBarData.map((e, i) => (
                              <Cell key={i} fill={orderStatusPieFill(e.statusKey)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </DashboardChartScroll>
                )}
              </CardContent>
            </Card>
          </DomainSection>

          <DomainSection
            title="Học tập & nội dung"
            description="Quy mô vận hành và pipeline (duyệt đã nêu ở chỉ số xem ngay)."
          >
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
              <StatsCard
                title="Lớp LIVE hôm nay"
                value={formatNumber(staffAcademic?.stats.activeRooms ?? 0)}
                sub="Buổi có phòng"
                icon={School}
                tone="info"
              />
              <StatsCard
                title="Khóa (chưa lưu trữ)"
                value={formatNumber(staffAcademic?.stats.totalCourses ?? 0)}
                sub="Course profile"
                icon={BookOpen}
                tone="neutral"
              />
              <StatsCard
                title="Học viên đang học"
                value={formatNumber(staffAcademic?.stats.totalEnrollments ?? 0)}
                sub="Enrollment ACTIVE"
                icon={GraduationCap}
                tone="success"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className={elevatedPanelClass}>
                <CardHeader className={elevatedCardHeaderPrimary}>
                  <CardTitle className="text-base">Duyệt đang chờ</CardTitle>
                  <CardDescription className="text-xs">Theo loại</CardDescription>
                </CardHeader>
                <CardContent className={elevatedPanelContentClass}>
                  {pendingBarData.length === 0 ? (
                    <ChartEmpty />
                  ) : (
                    <DashboardChartScroll>
                      <div className={cn(DASHBOARD_CHART_H, narrow ? "min-w-[280px]" : "")}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={pendingBarData}
                            margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal />
                            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                            <YAxis
                              type="category"
                              dataKey="label"
                              width={yAxisPending}
                              tick={{ fontSize: narrow ? 9 : 11 }}
                            />
                            <Tooltip formatter={(v) => (v != null ? formatNumber(Number(v)) : "")} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {pendingBarData.map((e, i) => (
                                <Cell key={i} fill={pendingApprovalTypePieFill(e.colorKey)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </DashboardChartScroll>
                  )}
                </CardContent>
              </Card>

              <Card className={elevatedPanelClass}>
                <CardHeader className={elevatedCardHeaderPrimary}>
                  <CardTitle className="text-base">Pipeline nội dung</CardTitle>
                  <CardDescription className="text-xs">Course / Cohort / VOD</CardDescription>
                </CardHeader>
                <CardContent className={elevatedPanelContentClass}>
                  {pipelineBarData.length === 0 ? (
                    <ChartEmpty />
                  ) : (
                    <DashboardChartScroll>
                      <div className={cn(DASHBOARD_CHART_H, narrow ? "min-w-[300px]" : "")}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={pipelineBarData}
                            margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal />
                            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                            <YAxis
                              type="category"
                              dataKey="label"
                              width={yAxisPipeline}
                              tick={{ fontSize: narrow ? 8 : 10 }}
                            />
                            <Tooltip formatter={(v) => (v != null ? formatNumber(Number(v)) : "")} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {pipelineBarData.map((e, i) => (
                                <Cell key={i} fill={academyPipelineBarFill(e.statusKey)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </DashboardChartScroll>
                  )}
                </CardContent>
              </Card>
            </div>
          </DomainSection>
        </div>

        <aside
          className={cn(
            "order-2 min-w-0 space-y-3 xl:col-span-4 xl:col-start-9 xl:row-start-1",
            "xl:sticky xl:top-4 xl:self-start",
          )}
        >
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Người dùng & phiên</CardTitle>
              <CardDescription className="text-xs">
                Theo dõi sau khi đã xem tài chính và đơn — sticky trên màn hình lớn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              <StatsCard
                title="Tổng tài khoản"
                value={formatNumber(presence.totalUsers)}
                sub="User chưa xóa mềm"
                icon={Users}
                tone="neutral"
              />
              <StatsCard
                title="Hoạt động hôm nay"
                value={formatNumber(presence.activeToday)}
                sub="Đăng nhập trong ngày"
                icon={Activity}
                tone="info"
                highlight={(presence.activeToday ?? 0) > 0}
              />
              <StatsCard
                title="User có phiên hợp lệ"
                value={formatNumber(presence.usersWithActiveSession)}
                sub="Session chưa hết hạn"
                icon={MonitorSmartphone}
                tone="primary"
                highlight={(presence.usersWithActiveSession ?? 0) > 0}
              />
              <StatsCard
                title="Tổng phiên đăng nhập"
                value={formatNumber(presence.activeSessionCount)}
                sub="Nhiều thiết bị"
                icon={Layers}
                tone="neutral"
              />
              <StatsCard
                title="Đăng nhập 15 phút"
                value={formatNumber(presence.usersSignedInLast15Minutes)}
                sub="Theo lastSignInAt"
                icon={Zap}
                tone="success"
                highlight={(presence.usersSignedInLast15Minutes ?? 0) > 0}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
