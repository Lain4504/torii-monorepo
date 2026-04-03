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
import { ClipboardCheck, School, Wallet, Ticket, Users, HandCoins } from "lucide-react";

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#14b8a6"];

function ChartEmpty() {
  return <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Chưa có dữ liệu</div>;
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <StatsCard
          title="Duyệt cần xử lý"
          value={formatNumber(staffAcademic?.stats.pendingApprovals ?? 0)}
          sub="Tổng pending (Profiles/Cohorts/VOD)"
          icon={ClipboardCheck}
          highlight={(staffAcademic?.stats.pendingApprovals ?? 0) > 0}
        />
        <StatsCard
          title="Lớp LIVE đang chạy"
          value={formatNumber(staffAcademic?.stats.activeRooms ?? 0)}
          sub="Phiên trực tiếp trong hôm nay"
          icon={School}
        />
        <StatsCard
          title="Doanh thu"
          value={formatCurrency(staffOperations?.stats.totalRevenue ?? 0)}
          sub="Tổng doanh thu đã thanh toán"
          icon={Wallet}
        />
        <StatsCard
          title="Hoàn tiền pending"
          value={formatNumber(staffOperations?.stats.pendingRefunds ?? 0)}
          sub="Yêu cầu đối soát chưa xong"
          icon={HandCoins}
          highlight={(staffOperations?.stats.pendingRefunds ?? 0) > 0}
        />

        <StatsCard
          title="Ticket đang chờ xử lý"
          value={formatNumber(staffOperations?.stats.pendingTickets ?? 0)}
          sub="Vấn đề hỗ trợ thanh toán"
          icon={Ticket}
          highlight={(staffOperations?.stats.pendingTickets ?? 0) > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending approvals</CardTitle>
            <CardDescription>Phân bổ theo loại nội dung</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApprovalsByType.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie data={pendingApprovalsByType} dataKey="value" nameKey="name" outerRadius={95}>
                      {pendingApprovalsByType.map((_, idx) => (
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
                  <BarChart
                    data={revenueByLevel}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng theo trạng thái</CardTitle>
            <CardDescription>Distribution theo order.status</CardDescription>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giao dịch gần đây</CardTitle>
          <CardDescription>Thông tin bán hàng mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <div className="text-xs text-muted-foreground">Chưa có dữ liệu.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {recentSales.map((s) => (
                <div key={s.id} className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Users className="size-4 text-primary" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{s.userName}</div>
                        <div className="text-xs text-muted-foreground truncate">{s.userEmail}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {s.id}
                    </Badge>
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
  );
}

