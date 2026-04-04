import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PageLoading } from "@workspace/ui/components/page-loading";
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

function ChartEmpty() {
  return (
    <div className={cn("h-64", emptyStateBoxClass)}>
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
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1 border-b border-border/70 pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
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

  const recentOrders = (staffOperations?.recentOrders ?? []).slice(0, 20);
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

  return (
    <div className="space-y-10">
      <div className="space-y-1 pb-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tổng quan nền tảng</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Theo từng nhóm: người dùng & phiên, học tập, thương mại. Biểu đồ được chọn theo loại dữ liệu (xu hướng
          theo thời gian, so sánh nhóm, phân bổ trạng thái).
        </p>
        {dataUpdatedAt ? (
          <p className="text-[11px] text-muted-foreground/80">
            Làm mới dữ liệu: {new Date(dataUpdatedAt).toLocaleString("vi-VN")}
          </p>
        ) : null}
      </div>

      <DomainSection
        title="Người dùng & phiên đăng nhập"
        description={
          "Ước lượng hoạt động: phiên còn hiệu lực lấy từ bảng session; “15 phút” và “hôm nay” dựa trên lastSignInAt. " +
          (measuredLabel ? `Đo tại: ${measuredLabel}.` : "")
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
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
            sub="Có đăng nhập trong ngày (00:00 server)"
            icon={Activity}
            tone="info"
            highlight={(presence.activeToday ?? 0) > 0}
          />
          <StatsCard
            title="User có phiên hợp lệ"
            value={formatNumber(presence.usersWithActiveSession)}
            sub="≥1 session chưa hết hạn, chưa thu hồi"
            icon={MonitorSmartphone}
            tone="primary"
            highlight={(presence.usersWithActiveSession ?? 0) > 0}
          />
          <StatsCard
            title="Tổng phiên đăng nhập"
            value={formatNumber(presence.activeSessionCount)}
            sub="Số phiên đang hiệu lực (nhiều thiết bị)"
            icon={Layers}
            tone="neutral"
          />
          <StatsCard
            title="Đăng nhập 15 phút gần đây"
            value={formatNumber(presence.usersSignedInLast15Minutes)}
            sub="Theo lastSignInAt — hoạt động rất gần"
            icon={Zap}
            tone="success"
            highlight={(presence.usersSignedInLast15Minutes ?? 0) > 0}
          />
        </div>
      </DomainSection>

      <DomainSection
        title="Học tập & nội dung"
        description="Khóa học, lớp LIVE và pipeline duyệt — so sánh nhanh bằng biểu đồ cột ngang."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <StatsCard
            title="Duyệt cần xử lý"
            value={formatNumber(staffAcademic?.stats.pendingApprovals ?? 0)}
            sub="Profiles / Cohorts / VOD chờ duyệt"
            icon={ClipboardCheck}
            tone="warning"
            highlight={(staffAcademic?.stats.pendingApprovals ?? 0) > 0}
          />
          <StatsCard
            title="Lớp LIVE hôm nay"
            value={formatNumber(staffAcademic?.stats.activeRooms ?? 0)}
            sub="Phiên có phòng trong ngày"
            icon={School}
            tone="info"
          />
          <StatsCard
            title="Khóa (chưa lưu trữ)"
            value={formatNumber(staffAcademic?.stats.totalCourses ?? 0)}
            sub="Course profile đang mở"
            icon={BookOpen}
            tone="neutral"
          />
          <StatsCard
            title="Học viên đang học"
            value={formatNumber(staffAcademic?.stats.totalEnrollments ?? 0)}
            sub="Enrollment trạng thái ACTIVE"
            icon={GraduationCap}
            tone="success"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className={elevatedPanelClass}>
            <CardHeader className={elevatedCardHeaderPrimary}>
              <CardTitle>Duyệt đang chờ</CardTitle>
              <CardDescription>So sánh khối lượng theo loại (cột ngang)</CardDescription>
            </CardHeader>
            <CardContent className={elevatedPanelContentClass}>
              {pendingBarData.length === 0 ? (
                <ChartEmpty />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={pendingBarData}
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="label" width={118} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => (v != null ? formatNumber(Number(v)) : "")} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {pendingBarData.map((e, i) => (
                          <Cell key={i} fill={pendingApprovalTypePieFill(e.colorKey)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={elevatedPanelClass}>
            <CardHeader className={elevatedCardHeaderPrimary}>
              <CardTitle>Pipeline nội dung (theo status)</CardTitle>
              <CardDescription>Gộp Course / Cohort / VOD — cột ngang, màu theo trạng thái</CardDescription>
            </CardHeader>
            <CardContent className={elevatedPanelContentClass}>
              {pipelineBarData.length === 0 ? (
                <ChartEmpty />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={pipelineBarData}
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="label" width={132} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => (v != null ? formatNumber(Number(v)) : "")} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {pipelineBarData.map((e, i) => (
                          <Cell key={i} fill={academyPipelineBarFill(e.statusKey)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DomainSection>

      <DomainSection
        title="Thương mại & hỗ trợ"
        description="Doanh thu, đơn hàng và ticket — xu hướng theo ngày dùng vùng (area); so sánh cấp độ dùng cột đứng."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <StatsCard
            title="Doanh thu (đã thanh toán)"
            value={formatCurrency(staffOperations?.stats.totalRevenue ?? 0)}
            sub="Tổng grand total đơn PAID"
            icon={Wallet}
            tone="success"
          />
          <StatsCard
            title="Đơn PAID"
            value={formatNumber(staffOperations?.stats.paidOrders ?? 0)}
            sub="Số đơn trạng thái thanh toán thành công"
            icon={Receipt}
            tone="info"
          />
          <StatsCard
            title="Hoàn tiền chờ xử lý"
            value={formatNumber(staffOperations?.stats.pendingRefunds ?? 0)}
            sub="Ticket / đối soát hoàn"
            icon={HandCoins}
            tone="warning"
            highlight={(staffOperations?.stats.pendingRefunds ?? 0) > 0}
          />
          <StatsCard
            title="Ticket đang mở"
            value={formatNumber(staffOperations?.stats.pendingTickets ?? 0)}
            sub="Hỗ trợ thanh toán / khiếu nại"
            icon={Ticket}
            tone="primary"
            highlight={(staffOperations?.stats.pendingTickets ?? 0) > 0}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className={elevatedPanelClass}>
            <CardHeader className={elevatedCardHeaderPrimary}>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
                <div>
                  <CardTitle>Doanh thu 30 ngày</CardTitle>
                  <CardDescription>Xu hướng theo thời gian — đơn PAID (area)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className={elevatedPanelContentClass}>
              {revenueLast30Days.length === 0 ? (
                <ChartEmpty />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueLast30Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminRevenueArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickMargin={8}
                        interval="preserveStartEnd"
                        tickFormatter={(v: string) => {
                          const [, m, d] = v.split("-");
                          return m && d ? `${d}/${m}` : v;
                        }}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={52} />
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
              )}
            </CardContent>
          </Card>

          <Card className={elevatedPanelClass}>
            <CardHeader className={elevatedCardHeaderPrimary}>
              <CardTitle>Doanh thu theo Level</CardTitle>
              <CardDescription>So sánh mức động học phí theo cấp độ (cột đứng)</CardDescription>
            </CardHeader>
            <CardContent className={elevatedPanelContentClass}>
              {revenueByLevel.length === 0 ? (
                <ChartEmpty />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByLevel} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => (v != null ? formatCurrency(Number(v)) : "")} />
                      <Bar dataKey="value" fill={revenueBarFill} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className={elevatedPanelClass}>
          <CardHeader className={elevatedCardHeaderPrimary}>
            <CardTitle>Đơn hàng theo trạng thái</CardTitle>
            <CardDescription>So sánh số lượng đơn — cột ngang, màu theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent className={elevatedPanelContentClass}>
            {ordersBarData.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-[min(22rem,70vh)] min-h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={ordersBarData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" width={128} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => (v != null ? formatNumber(Number(v)) : "")} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {ordersBarData.map((e, i) => (
                        <Cell key={i} fill={orderStatusPieFill(e.statusKey)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </DomainSection>

      <Card className={elevatedPanelClass}>
        <CardHeader className={elevatedCardHeaderPrimary}>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <CardDescription>20 đơn mới nhất — badge màu theo trạng thái</CardDescription>
        </CardHeader>
        <CardContent className={elevatedPanelContentClass}>
          {recentOrders.length === 0 ? (
            <div className={cn("py-10 text-center text-xs", emptyStateBoxClass)}>Chưa có dữ liệu.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày</TableHead>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
