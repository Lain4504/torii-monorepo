import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PageLoading } from "@workspace/ui/components/page-loading";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { StatsCard } from "./stats-card";
import { useStaffOperationsDashboard } from "@/lib/api/services/dashboard";
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
import { BarChart3, HandCoins, ReceiptText, Wallet, TrendingUp, ListTodo } from "lucide-react";
import {
  elevatedPanelClass,
  elevatedPanelContentClass,
  elevatedCardHeaderOps,
  elevatedCardHeaderSuccess,
  emptyStateBoxClass,
} from "@/lib/ui-shell";
import { orderStatusPieFill, revenueBarFill, orderStatusLabelVi } from "@/lib/dashboard-chart-colors";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
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

export default function StaffFinanceDashboard() {
  const narrow = useNarrowMobile();
  const { data, isLoading } = useStaffOperationsDashboard();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  const ordersBarData = (data?.ordersByStatus ?? []).map((d) => ({
    label: orderStatusLabelVi(d.name),
    value: d.value,
    statusKey: d.name,
  }));
  const revenueByLevel = (data?.revenueByLevel ?? []).slice(0, 8).map((r) => ({
    name: r.level,
    value: r.amount,
  }));
  const recentSales = data?.recentSales ?? [];
  const revenueLast30Days = data?.revenueLast30Days ?? [];
  const tickets = data?.stats.pendingTickets ?? 0;
  const refunds = data?.stats.pendingRefunds ?? 0;
  const hasAttention = tickets > 0 || refunds > 0;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 sm:space-y-6">
      {hasAttention ? (
        <Card className="border-amber-500/35 bg-amber-500/[0.04]">
          <CardContent className="flex flex-wrap items-center gap-2 py-3">
            <ListTodo className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">Cần xử lý</span>
            {refunds > 0 ? (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                Hoàn tiền: {formatNumber(refunds)}
              </Badge>
            ) : null}
            {tickets > 0 ? (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                Ticket: {formatNumber(tickets)}
              </Badge>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="text-base font-semibold tracking-tight">Tài chính &amp; vận hành đơn</h2>
        <p className="text-xs text-muted-foreground">
          Chuỗi thời gian doanh thu (area); phân bổ đơn theo trạng thái (cột ngang); so sánh theo Level (cột đứng).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatsCard
          title="Doanh thu (tổng)"
          value={formatCurrency(data?.stats.totalRevenue ?? 0)}
          sub="Đã thanh toán (billing)"
          icon={Wallet}
          tone="success"
        />
        <StatsCard
          title="Đơn PAID"
          value={formatNumber(data?.stats.paidOrders ?? 0)}
          sub="Giao dịch thành công"
          icon={ReceiptText}
          tone="info"
        />
        <StatsCard
          title="Hoàn tiền chờ"
          value={formatNumber(refunds)}
          sub="Ticket / đối soát"
          icon={HandCoins}
          tone="warning"
          highlight={refunds > 0}
        />
        <StatsCard
          title="Ticket mở"
          value={formatNumber(tickets)}
          sub="Hỗ trợ thanh toán"
          icon={ReceiptText}
          tone="primary"
          highlight={tickets > 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={elevatedPanelClass}>
          <CardHeader className={elevatedCardHeaderOps}>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
              <div>
                <CardTitle className="text-base">Doanh thu 30 ngày</CardTitle>
                <CardDescription className="text-xs">Đơn PAID theo ngày — chuỗi thời gian</CardDescription>
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
                    <AreaChart
                      data={revenueLast30Days}
                      margin={{ top: 10, right: 8, left: narrow ? -12 : 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="staffRevenueArea" x1="0" y1="0" x2="0" y2="1">
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
                        tick={{ fontSize: 11 }}
                        width={narrow ? 40 : 52}
                      />
                      <Tooltip
                        formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : "")}
                        labelFormatter={(label) => `Ngày ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="url(#staffRevenueArea)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </DashboardChartScroll>
            )}
          </CardContent>
        </Card>

        <Card className={elevatedPanelClass}>
          <CardHeader className={elevatedCardHeaderSuccess}>
            <CardTitle className="text-base">Doanh thu theo Level</CardTitle>
            <CardDescription className="text-xs">So sánh mức — biểu đồ cột đứng</CardDescription>
          </CardHeader>
          <CardContent className={elevatedPanelContentClass}>
            {revenueByLevel.length === 0 ? (
              <ChartEmpty />
            ) : (
              <DashboardChartScroll>
                <div className={DASHBOARD_CHART_H}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueByLevel}
                      margin={{ top: 10, right: 8, left: narrow ? -18 : -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: narrow ? 10 : 12 }}
                        interval={0}
                        angle={narrow ? -25 : 0}
                        textAnchor={narrow ? "end" : "middle"}
                        height={narrow ? 48 : 30}
                      />
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
        <CardHeader className={elevatedCardHeaderOps}>
          <CardTitle className="text-base">Đơn hàng theo trạng thái</CardTitle>
          <CardDescription className="text-xs">Đếm theo status — cột ngang (dễ đọc nhiều trạng thái)</CardDescription>
        </CardHeader>
        <CardContent className={elevatedPanelContentClass}>
          {ordersBarData.length === 0 ? (
            <ChartEmpty />
          ) : (
            <DashboardChartScroll>
              <div className={cn(DASHBOARD_CHART_H, narrow && "min-w-[300px]")}>
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
                      width={narrow ? 92 : 128}
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

      <Card className={elevatedPanelClass}>
        <CardHeader className={elevatedCardHeaderOps}>
          <CardTitle className="text-base">Giao dịch PAID gần đây</CardTitle>
          <CardDescription className="text-xs">Theo billing — cuộn trong khung</CardDescription>
        </CardHeader>
        <CardContent className={elevatedPanelContentClass}>
          {recentSales.length === 0 ? (
            <div className={cn("py-10 text-center text-xs", emptyStateBoxClass)}>Chưa có dữ liệu.</div>
          ) : (
            <ScrollArea className="h-[min(18rem,40vh)] rounded-md border border-border/60">
              <div className="space-y-2 p-1 pr-3">
                {recentSales.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{s.userName || s.userEmail || "—"}</div>
                      <div className="truncate text-xs text-muted-foreground">{s.userEmail}</div>
                    </div>
                    <div className="flex shrink-0 items-end justify-between gap-2 text-right sm:block sm:text-right">
                      <div className="text-sm font-semibold tabular-nums">
                        {formatCurrency(Number(s.amount) || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">{s.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
