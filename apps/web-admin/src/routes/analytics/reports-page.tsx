import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
    Download,
    Calendar,
    ArrowRight,
    TrendingUp,
    History,
    PieChart,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { PageHeader } from "@/components/common/page-header";
import { reportApi } from "@/api/services/reports";
import { toast } from "sonner";

export default function ReportsPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const handleExport = async (type: "orders" | "balance" | "revenue") => {
        try {
            setIsExporting(type);
            toast.info(`Đang tạo báo cáo ${type === 'orders' ? 'đơn hàng' : type === 'balance' ? 'biến động số dư' : 'doanh thu'}...`);
            await reportApi.exportReport(type, startDate, endDate);
            toast.success("Xuất báo cáo thành công!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Xuất báo cáo thất bại. Vui lòng thử lại sau.");
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Hệ thống Báo cáo Tài chính"
                subtitle="Xuất dữ liệu thô ra file Excel để phục vụ công tác đối soát, kế toán và quản trị vận hành."
                stats={[
                    { label: "Báo cáo khả dụng", value: "03" },
                    { label: "Định dạng", value: "XLSX" }
                ]}
            />

            {/* Filter Section */}
            <div className="rounded-xl border bg-card p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Khoảng thời gian đối soát</h3>
                    </div>
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 space-y-1.5 w-full">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-0.5">Từ ngày</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="hidden md:block pb-3">
                            <ArrowRight className="size-4 text-muted-foreground/20" />
                        </div>
                        <div className="flex-1 space-y-1.5 w-full">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-0.5">Đến ngày</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => { setStartDate(""); setEndDate(""); }}
                            className="shrink-0"
                        >
                            Xóa lọc
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <ReportCard
                    title="Báo cáo Đơn hàng"
                    description="Chi tiết các giao dịch mua khóa học, nạp coin và thanh toán từ phía người dùng."
                    icon={TrendingUp}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                    loading={isExporting === "orders"}
                    onExport={() => handleExport("orders")}
                />
                <ReportCard
                    title="Biến động số dư"
                    description="Danh sách các thao tác cộng/trừ coin, hoàn tiền và thưởng hệ thống cho học viên."
                    icon={History}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                    loading={isExporting === "balance"}
                    onExport={() => handleExport("balance")}
                />
                <ReportCard
                    title="Doanh thu Khóa học"
                    description="Thống kê hiệu suất bán hàng của từng khóa học, doanh thu quy đổi từ tiền mặt và coin."
                    icon={PieChart}
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                    loading={isExporting === "revenue"}
                    onExport={() => handleExport("revenue")}
                />
            </div>

            {/* Security Note */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4 max-w-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                    <ShieldCheck className="size-5 text-primary" />
                </div>
                <div className="space-y-1">
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-primary">Lưu ý bảo mật dữ liệu</h5>
                    <p className="text-[12px] font-medium text-muted-foreground/70 leading-relaxed">
                        Các tập tin báo cáo này chứa thông tin giao dịch nhạy cảm của người dùng. Vui lòng chỉ chia sẻ file với những nhân sự có thẩm quyền và tuân thủ các quy định về bảo mật dữ liệu của Torii Nihongo.
                    </p>
                </div>
            </div>
        </div>
    );
}

interface ReportCardProps {
    title: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
    loading: boolean;
    onExport: () => void;
}

function ReportCard({ title, description, icon: Icon, color, bg, loading, onExport }: ReportCardProps) {
    return (
        <div className="rounded-xl border bg-card overflow-hidden flex flex-col group hover:border-primary/20 transition-colors">
            <div className="p-6 space-y-4 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                    <div className={cn("p-2.5 rounded-lg", bg, color)}>
                        <Icon className="size-5" />
                    </div>
                </div>
                <div className="space-y-1.5 flex-1">
                    <h3 className="text-base font-bold uppercase tracking-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
                <Button
                    variant="default"
                    disabled={loading}
                    onClick={onExport}
                    className="w-full"
                >
                    {loading ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                        <Download className="size-4 mr-2" />
                    )}
                    {loading ? "Đang xử lý..." : "Xuất báo cáo"}
                </Button>
            </div>
        </div>
    );
}
