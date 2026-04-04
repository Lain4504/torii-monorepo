import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
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
import { ClipboardCheck, School, BookOpen } from "lucide-react";
import { useStaffAcademicDashboard } from "@/lib/api/services/dashboard";
import { formatNumber } from "@/lib/format-utils";
import { StatsCard } from "./stats-card";
import { PageLoading } from "@workspace/ui/components/page-loading";
import {
  elevatedPanelClass,
  elevatedPanelContentClass,
  elevatedCardHeaderPrimary,
  elevatedCardHeaderInfo,
} from "@/lib/ui-shell";
import { academyPipelineBarFill, pendingApprovalTypePieFill } from "@/lib/dashboard-chart-colors";

function ChartEmpty() {
  return <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Chưa có dữ liệu</div>;
}

export default function StaffAcademicDashboard() {
  const { data, isLoading } = useStaffAcademicDashboard();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  const pendingApprovalsByType = data?.pendingApprovalsByType ?? [];
  const pipelineByStatus = (data?.pipelineByStatus ?? []).slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatsCard
          title="Chờ phê duyệt"
          value={formatNumber(data?.stats.pendingApprovals ?? 0)}
          sub="Tổng số items đang chờ duyệt (Profiles/Cohorts/VOD)"
          icon={ClipboardCheck}
          tone="warning"
          highlight={(data?.stats.pendingApprovals ?? 0) > 0}
        />
        <StatsCard
          title="Lớp LIVE đang hoạt động"
          value={formatNumber(data?.stats.activeRooms ?? 0)}
          sub="Buổi học trực tiếp diễn ra trong hôm nay"
          icon={School}
          tone="info"
        />
        <StatsCard
          title="Tổng khóa học"
          value={formatNumber(data?.stats.totalCourses ?? 0)}
          sub="Kho nội dung đang quản trị"
          icon={BookOpen}
          tone="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={elevatedPanelClass}>
          <CardHeader className={elevatedCardHeaderPrimary}>
            <CardTitle>Phê duyệt chờ duyệt</CardTitle>
            <CardDescription>Phân bổ theo loại nội dung</CardDescription>
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
          <CardHeader className={elevatedCardHeaderInfo}>
            <CardTitle>Pipeline theo status</CardTitle>
          </CardHeader>
          <CardContent className={elevatedPanelContentClass}>
            {pipelineByStatus.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineByStatus} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {pipelineByStatus.map((d, idx) => (
                        <Cell key={`cell-${idx}`} fill={academyPipelineBarFill(d.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

