import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PageLoading } from "@workspace/ui/components/page-loading";
import { StatsCard } from "./stats-card";
import { useStaffOperationsDashboard } from "@/lib/api/services/dashboard";
import { formatCurrency, formatNumber } from "@/lib/format-utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { HandCoins, ReceiptText, Wallet } from "lucide-react";

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#14b8a6"];

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
        />
        <StatsCard
          title="Yêu cầu hoàn tiền"
          value={formatNumber(data?.stats.pendingRefunds ?? 0)}
          sub="Các yêu cầu cần đối soát"
          icon={HandCoins}
          highlight={(data?.stats.pendingRefunds ?? 0) > 0}
        />
        <StatsCard
          title="Ticket hỗ trợ mở"
          value={formatNumber(data?.stats.pendingTickets ?? 0)}
          sub="Ticket đang chờ xử lý"
          icon={ReceiptText}
          highlight={(data?.stats.pendingTickets ?? 0) > 0}
        />
        <StatsCard
          title="Đơn PAID"
          value={formatNumber(data?.stats.paidOrders ?? 0)}
          sub="Giao dịch thành công"
          icon={Wallet}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng theo trạng thái</CardTitle>
            <CardDescription>Phân bổ status của order</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie data={ordersByStatus} dataKey="value" nameKey="name" outerRadius={95}>
                      {ordersByStatus.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo Level</CardTitle>
            <CardDescription>Top cấp độ theo doanh thu</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByLevel.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByLevel} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giao dịch gần đây</CardTitle>
          <CardDescription>4 giao dịch PAID mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="space-y-3">
              {recentSales.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-border/50 bg-muted/10 p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{s.userName || s.userEmail}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.userEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums">
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

