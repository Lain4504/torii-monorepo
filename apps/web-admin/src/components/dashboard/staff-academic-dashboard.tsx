import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { BarChart3, ClipboardCheck, School, BookOpen, GraduationCap, ListChecks } from "lucide-react";
import { useStaffAcademicDashboard } from "@/lib/api/services/dashboard";
import { formatNumber } from "@/lib/format-utils";
import { StatsCard } from "./stats-card";
import { PageLoading } from "@workspace/ui/components/page-loading";
import {
  elevatedPanelClass,
  elevatedPanelContentClass,
  elevatedCardHeaderPrimary,
  emptyStateBoxClass,
} from "@/lib/ui-shell";
import { academyPipelineBarFill, pendingApprovalTypePieFill, academyPipelineStatusLabelVi } from "@/lib/dashboard-chart-colors";
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

export default function StaffAcademicDashboard() {
  const narrow = useNarrowMobile();
  const { data, isLoading } = useStaffAcademicDashboard();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  const pending = data?.stats.pendingApprovals ?? 0;
  const pendingApprovalsByType = (data?.pendingApprovalsByType ?? []).map((d) => ({
    label: d.name,
    value: d.value,
    colorKey: d.name,
  }));
  const pipelineBarData = (data?.pipelineByStatus ?? []).slice(0, 12).map((d) => ({
    label: academyPipelineStatusLabelVi(d.name),
    value: d.value,
    statusKey: d.name,
  }));

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 sm:space-y-6">
      {pending > 0 ? (
        <Card className="border-amber-500/35 bg-amber-500/[0.04]">
          <CardContent className="flex flex-wrap items-center gap-2 py-3">
            <ListChecks className="size-4 text-amber-700 dark:text-amber-400" aria-hidden />
            <span className="text-sm font-medium">Ưu tiên nội dung</span>
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {formatNumber(pending)} hạng mục chờ duyệt
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="text-base font-semibold tracking-tight">Học thuật &amp; nội dung</h2>
        <p className="text-xs text-muted-foreground">
          Duyệt, lớp LIVE hôm nay, khối lượng học viên — biểu đồ so sánh nhóm dùng cột ngang (đọc nhãn dễ hơn pie).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatsCard
          title="Chờ phê duyệt"
          value={formatNumber(pending)}
          sub="Course / Cohort / VOD"
          icon={ClipboardCheck}
          tone="warning"
          highlight={pending > 0}
        />
        <StatsCard
          title="Lớp LIVE hôm nay"
          value={formatNumber(data?.stats.activeRooms ?? 0)}
          sub="Buổi có phòng, SCHEDULED/RESCHEDULED"
          icon={School}
          tone="info"
        />
        <StatsCard
          title="Khóa (chưa lưu trữ)"
          value={formatNumber(data?.stats.totalCourses ?? 0)}
          sub="Course profile"
          icon={BookOpen}
          tone="neutral"
        />
        <StatsCard
          title="Học viên đang học"
          value={formatNumber(data?.stats.totalEnrollments ?? 0)}
          sub="Enrollment ACTIVE"
          icon={GraduationCap}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={elevatedPanelClass}>
          <CardHeader className={elevatedCardHeaderPrimary}>
            <CardTitle className="text-base">Hàng chờ duyệt theo loại</CardTitle>
            <CardDescription className="text-xs">So sánh số lượng — cột ngang</CardDescription>
          </CardHeader>
          <CardContent className={elevatedPanelContentClass}>
            {pendingApprovalsByType.length === 0 ? (
              <ChartEmpty />
            ) : (
              <DashboardChartScroll>
                <div className={cn(DASHBOARD_CHART_H, narrow && "min-w-[280px]")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={pendingApprovalsByType}
                      margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal />
                      <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={narrow ? 88 : 120}
                        tick={{ fontSize: narrow ? 9 : 11 }}
                      />
                      <Tooltip formatter={(v) => (v != null ? formatNumber(Number(v)) : "")} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {pendingApprovalsByType.map((e, i) => (
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
            <CardTitle className="text-base">Pipeline theo trạng thái</CardTitle>
            <CardDescription className="text-xs">Gộp Course / Cohort / VOD — cột ngang</CardDescription>
          </CardHeader>
          <CardContent className={elevatedPanelContentClass}>
            {pipelineBarData.length === 0 ? (
              <ChartEmpty />
            ) : (
              <DashboardChartScroll>
                <div className={cn(DASHBOARD_CHART_H, narrow && "min-w-[300px]")}>
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
                        width={narrow ? 100 : 132}
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
    </div>
  );
}
