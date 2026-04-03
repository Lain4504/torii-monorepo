import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { ClipboardCheck, School, Users, BookOpen } from "lucide-react";
import { useStaffAcademicDashboard } from "@/lib/api/services/dashboard";
import { formatNumber } from "@/lib/format-utils";
import { StatsCard } from "./stats-card";
import { PageLoading } from "@workspace/ui/components/page-loading";

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#14b8a6"];

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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Chờ phê duyệt"
          value={formatNumber(data?.stats.pendingApprovals ?? 0)}
          sub="Tổng số items đang chờ duyệt (Profiles/Cohorts/VOD)"
          icon={ClipboardCheck}
          highlight={(data?.stats.pendingApprovals ?? 0) > 0}
        />
        <StatsCard
          title="Lớp LIVE đang hoạt động"
          value={formatNumber(data?.stats.activeRooms ?? 0)}
          sub="Buổi học trực tiếp diễn ra trong hôm nay"
          icon={School}
        />
        <StatsCard
          title="Tổng khóa học"
          value={formatNumber(data?.stats.totalCourses ?? 0)}
          sub="Kho nội dung đang quản trị"
          icon={BookOpen}
        />
        <StatsCard
          title="Lượt đăng ký (Active)"
          value={formatNumber(data?.stats.totalEnrollments ?? 0)}
          sub="Tổng enrollment đang ACTIVE trong hệ thống"
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phê duyệt chờ duyệt</CardTitle>
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
            <CardTitle>Pipeline theo status</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineByStatus.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineByStatus} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
    </div>
  );
}

