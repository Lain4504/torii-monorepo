import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { BookOpen, ClipboardCheck, School, Users } from "lucide-react";
import { usePlatformOverview } from "@/lib/api/services/analytics";
import { formatNumber } from "@/lib/format-utils";
import { StatsCard } from "./stats-card";

function QuickAction({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Button asChild variant="outline" className="h-auto w-full justify-start py-3">
      <Link to={to} className="flex flex-col items-start gap-1">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Link>
    </Button>
  );
}

export default function StaffAcademicDashboard() {
  const { data } = usePlatformOverview();
  const overview = data?.overview;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Chờ phê duyệt"
          value={formatNumber(overview?.pendingApprovals ?? 0)}
          sub="Nội dung/chương trình đang chờ duyệt"
          icon={ClipboardCheck}
          highlight={(overview?.pendingApprovals ?? 0) > 0}
        />
        <StatsCard
          title="Lớp LIVE đang hoạt động"
          value={formatNumber(overview?.activeRooms ?? 0)}
          sub="Buổi học trực tiếp đang diễn ra"
          icon={School}
        />
        <StatsCard
          title="Tổng khóa học"
          value={formatNumber(overview?.totalCourses ?? 0)}
          sub="Kho nội dung đang quản trị"
          icon={BookOpen}
        />
        <StatsCard
          title="Học viên đang hoạt động"
          value={formatNumber(overview?.activeToday ?? 0)}
          sub="Số học viên học trong ngày"
          icon={Users}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ưu tiên học thuật</CardTitle>
            <CardDescription>Nhóm thao tác quan trọng cho staff-academic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              to="/academy/approvals"
              title="Approval Center"
              description="Duyệt course profile, class, offering theo luồng mới."
            />
            <QuickAction
              to="/academy/course-profiles"
              title="Kho khóa học (Profiles)"
              description="Cập nhật mô tả, module, lesson cho từng profile."
            />
            <QuickAction
              to="/academy/classes"
              title="Lớp học"
              description="Theo dõi trạng thái OPENING/ONGOING, lịch lớp và giảng viên."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vận hành nội dung</CardTitle>
            <CardDescription>Công cụ hỗ trợ nội dung và chuẩn hóa đề thi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              to="/academy/jlpt/templates"
              title="JLPT Templates"
              description="Quản lý đề thi, ngân hàng câu hỏi, mondai."
            />
            <QuickAction
              to="/academy/jlpt/config"
              title="JLPT Config"
              description="Cấu hình kỳ thi, lịch thi và tham số hệ thống."
            />
            <QuickAction
              to="/academy/classes"
              title="Theo dõi lớp theo lịch"
              description="Kiểm soát chất lượng triển khai lớp LIVE/VOD."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

