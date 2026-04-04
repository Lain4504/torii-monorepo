import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PageLoading } from "@workspace/ui/components/page-loading";
import { StatsCard } from "./stats-card";
import { useAdminDashboard } from "@/lib/api/services/dashboard";
import { formatCurrency, formatNumber } from "@/lib/format-utils";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@workspace/ui/components/badge";
import { BarChart3, ClipboardCheck, School, Wallet, Ticket, Users, HandCoins } from "lucide-react";
import {
  elevatedPanelClass,
  elevatedPanelContentClass,
  elevatedCardHeaderPrimary,
  emptyStateBoxClass,
} from "@/lib/ui-shell";
import { cn } from "@workspace/ui/lib/utils";
import {
  orderStatusPieFill,
  pendingApprovalTypePieFill,
  revenueBarFill,
} from "@/lib/dashboard-chart-colors";

function ChartEmpty() {
  return (
    <div className={cn("h-64", emptyStateBoxClass)}>
      <BarChart3 className="size-8 text-muted-foreground/30" aria-hidden />
      Chưa có dữ liệu
    </div>
  );
}

export default function AdminDashboardV2() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  const staffAcademic = data?.staffAcademic;
  const staffOperations = data?.staffOperations;

  const pendingApprovalsByType = staffAcademic?.pendingApprovalsByType ?? [];
  const ordersByStatus = (staffOperations?.ordersByStatus ?? []).slice(0, 6);
  const revenueByLevel = (staffOperations?.revenueByLevel ?? []).slice(0, 8).map((r) => ({
    name: r.level,
    value: r.amount,
  }));

  const recentSales = (staffOperations?.recentSales ?? []).slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="space-y-1 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tổng quan vận hành</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Duyệt nội dung, lớp LIVE, doanh thu và ticket — một màn hình.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:gap-5">
        <StatsCard
          title="Duyệt cần xử lý"
          value={formatNumber(staffAcademic?.stats.pendingApprovals ?? 0)}
          sub="Tổng pending (Profiles/Cohorts/VOD)"
          icon={ClipboardCheck}
          tone="warning"
          highlight={(staffAcademic?.stats.pendingApprovals ?? 0) > 0}
        />
        <StatsCard
          title="Lớp LIVE đang chạy"
          value={formatNumber(staffAcademic?.stats.activeRooms ?? 0)}
          sub="Phiên trực tiếp trong hôm nay"
          icon={School}
          tone="info"
        />
        <StatsCard
          title="Doanh thu"
          value={formatCurrency(staffOperations?.stats.totalRevenue ?? 0)}
          sub="Tổng doanh thu đã thanh toán"
          icon={Wallet}
          tone="success"
        />
        <StatsCard
          title="Hoàn tiền pending"
          value={formatNumber(staffOperations?.stats.pendingRefunds ?? 0)}
          sub="Yêu cầu đối soát chưa xong"
          icon={HandCoins}
          tone="warning"
          highlight={(staffOperations?.stats.pendingRefunds ?? 0) > 0}
        />

        <StatsCard
          title="Ticket đang chờ xử lý"
          value={formatNumber(staffOperations?.stats.pendingTickets ?? 0)}
          sub="Vấn đề hỗ trợ thanh toán"
          icon={Ticket}
          tone="primary"
          highlight={(staffOperations?.stats.pendingTickets ?? 0) > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={elevatedPanelClass}>
          <CardHeader className={elevatedCardHeaderPrimary}>
            <CardTitle>Duyệt đang chờ</CardTitle>
            <CardDescription>Phân bổ theo loại nội dung cần duyệt</CardDescription>
          </CardHeader>
          <CardContent className={elevatedPanelContentClass}>
            {pendingApprovalsByType.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie data={pendingApprovalsByType} dataKey="value" nameKey="name" outerRadius={95}>
                      {pendingApprovalsByType.map((d, idx) => (
                        <Cell key={`cell-${idx}`} fill={pendingApprovalTypePieFill(d.name)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={elevatedPanelClass}>
          <CardHeader className={elevatedCardHeaderPrimary}>
            <CardTitle>Doanh thu theo Level</CardTitle>
            <CardDescription>Top cấp độ theo doanh thu</CardDescription>
          </CardHeader>
          <CardContent className={elevatedPanelContentClass}>
            {revenueByLevel.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueByLevel}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
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
          <CardDescription>Phân bổ theo trạng thái đơn hàng</CardDescription>
        </CardHeader>
        <CardContent className={elevatedPanelContentClass}>
          {ordersByStatus.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={ordersByStatus} dataKey="value" nameKey="name" outerRadius={95}>
                    {ordersByStatus.map((d, idx) => (
                      <Cell key={`cell-${idx}`} fill={orderStatusPieFill(d.name)} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={elevatedPanelClass}>
        <CardHeader className={elevatedCardHeaderPrimary}>
          <CardTitle>Giao dịch gần đây</CardTitle>
          <CardDescription>Thông tin bán hàng mới nhất</CardDescription>
        </CardHeader>
        <CardContent className={elevatedPanelContentClass}>
          {recentSales.length === 0 ? (
            <div className={cn("py-10 text-center text-xs", emptyStateBoxClass)}>Chưa có dữ liệu.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {recentSales.map((s) => (
                <div
                  key={s.id}
                  className="space-y-3 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Users className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-foreground">{s.userName}</div>
                        <div className="truncate text-xs text-muted-foreground">{s.userEmail}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="max-w-[5.5rem] shrink-0 truncate font-mono text-[9px]">
                      {s.id}
                    </Badge>
                  </div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">{formatCurrency(Number(s.amount) || 0)}</div>
                  <div className="text-[11px] font-medium text-muted-foreground">{s.date}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

