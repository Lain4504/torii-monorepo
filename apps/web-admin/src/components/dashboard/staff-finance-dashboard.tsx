import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { CircleDollarSign, CreditCard, HandCoins, ReceiptText, Ticket, Wallet } from "lucide-react";
import { usePlatformOverview } from "@/lib/api/services/analytics";
import { formatCurrency, formatNumber } from "@/lib/format-utils";
import { StatsCard } from "./stats-card";

function FinanceAction({
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

export default function StaffFinanceDashboard() {
  const { data } = usePlatformOverview();
  const overview = data?.overview;
  const estimatedTodayRevenue = (overview?.totalRevenue ?? 0) / 30;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Doanh thu ước tính hôm nay"
          value={formatCurrency(estimatedTodayRevenue)}
          sub="Ước tính từ dữ liệu doanh thu tổng"
          icon={Wallet}
        />
        <StatsCard
          title="Yêu cầu hoàn tiền"
          value={formatNumber(overview?.pendingRefunds ?? 0)}
          sub="Các yêu cầu cần đối soát"
          icon={HandCoins}
          highlight={(overview?.pendingRefunds ?? 0) > 0}
        />
        <StatsCard
          title="Ticket hỗ trợ mở"
          value={formatNumber(overview?.pendingTickets ?? 0)}
          sub="Vấn đề thanh toán/đơn hàng đang chờ xử lý"
          icon={ReceiptText}
          highlight={(overview?.pendingTickets ?? 0) > 0}
        />
        <StatsCard
          title="Đăng ký khóa học"
          value={formatNumber(overview?.totalEnrollments ?? 0)}
          sub="Tổng lượt đăng ký trong hệ thống"
          icon={CreditCard}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trung tâm tài chính</CardTitle>
            <CardDescription>Các thao tác daily cho staff-finance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <FinanceAction
              to="/orders"
              title="Đơn hàng & doanh thu"
              description="Theo dõi giao dịch, trạng thái thanh toán và doanh thu."
            />
            <FinanceAction
              to="/coupons"
              title="Mã giảm giá (Coupons)"
              description="Kiểm soát chiến dịch giảm giá và hiệu lực mã."
            />
            <FinanceAction
              to="/tickets"
              title="Hỗ trợ thanh toán"
              description="Xử lý ticket liên quan đến lỗi nạp tiền, hoàn tiền, giao dịch."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giám sát vận hành doanh thu</CardTitle>
            <CardDescription>Điểm kiểm soát nhanh theo vai trò tài chính</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CircleDollarSign className="size-4 text-primary" />
                Tổng doanh thu
              </div>
              <div className="text-sm font-bold">{formatCurrency(overview?.totalRevenue ?? 0)}</div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Ticket className="size-4 text-primary" />
                Ticket cần xử lý
              </div>
              <div className="text-sm font-bold">{formatNumber(overview?.pendingTickets ?? 0)}</div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <HandCoins className="size-4 text-primary" />
                Hoàn tiền chờ duyệt
              </div>
              <div className="text-sm font-bold">{formatNumber(overview?.pendingRefunds ?? 0)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

