import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PageLoading } from "@workspace/ui/components/page-loading";
import { StatsCard } from "./stats-card";
import { useStaffOperationsDashboard } from "@/lib/api/services/dashboard";
import { formatCurrency, formatNumber } from "@/lib/format-utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { HandCoins, ReceiptText, Wallet } from "lucide-react";
import {
  elevatedPanelClass,
  elevatedPanelContentClass,
  elevatedCardHeaderOps,
  elevatedCardHeaderSuccess,
  elevatedCardHeaderFinance,
} from "@/lib/ui-shell";
import { orderStatusPieFill, revenueBarFill } from "@/lib/dashboard-chart-colors";

function ChartEmpty() {
  return <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Chưa có dữ liệu</div>;
}

export default function StaffFinanceDashboard() {
  const { data, isLoading } = useStaffOperationsDashboard();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  const ordersByStatus = (data?.ordersByStatus ?? []).slice(0, 6);
  const revenueByLevel = (data?.revenueByLevel ?? []).slice(0, 8).map((r) => ({
    name: r.level,
    value: r.amount,
  }));
  const recentSales = (data?.recentSales ?? []).slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Doanh thu (tổng)"
          value={formatCurrency(data?.stats.totalRevenue ?? 0)}
          sub="Tổng doanh thu đã thanh toán"
          icon={Wallet}
          tone="success"
        />
        <StatsCard
          title="Yêu cầu hoàn tiền"
          value={formatNumber(data?.stats.pendingRefunds ?? 0)}
          sub="Các yêu cầu cần đối soát"
          icon={HandCoins}
          tone="warning"
          highlight={(data?.stats.pendingRefunds ?? 0) > 0}
        />
        <StatsCard
          title="Ticket hỗ trợ mở"
          value={formatNumber(data?.stats.pendingTickets ?? 0)}
          sub="Ticket đang chờ xử lý"
          icon={ReceiptText}
          tone="primary"
          highlight={(data?.stats.pendingTickets ?? 0) > 0}
        />
        <StatsCard
          title="Đơn PAID"
          value={formatNumber(data?.stats.paidOrders ?? 0)}
          sub="Giao dịch thành công"
          icon={Wallet}
          tone="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={elevatedPanelClass}>
          <CardHeader className={elevatedCardHeaderOps}>
            <CardTitle>Đơn hàng theo trạng thái</CardTitle>
            <CardDescription>Phân bổ status của order</CardDescription>
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
          <CardHeader className={elevatedCardHeaderSuccess}>
            <CardTitle>Doanh thu theo Level</CardTitle>
            <CardDescription>Top cấp độ theo doanh thu</CardDescription>
          </CardHeader>
          <CardContent className={elevatedPanelContentClass}>
            {revenueByLevel.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByLevel} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
        <CardHeader className={elevatedCardHeaderFinance}>
          <CardTitle>Giao dịch gần đây</CardTitle>
          <CardDescription>4 giao dịch PAID mới nhất</CardDescription>
        </CardHeader>
        <CardContent className={elevatedPanelContentClass}>
          {recentSales.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="space-y-3">
              {recentSales.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{s.userName || s.userEmail}</div>
                    <div className="truncate text-xs text-muted-foreground">{s.userEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(Number(s.amount) || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

