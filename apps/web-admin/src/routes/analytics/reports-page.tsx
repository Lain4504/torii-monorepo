import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
    FileSpreadsheet,
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
        <div className="flex flex-col gap-8 p-4 md:p-6 animate-in fade-in duration-700 max-w-7xl mx-auto w-full pb-20">
            {/* Header Area */}
            <PageHeader
                title={<span>Hệ thống <span className="text-primary">Báo cáo Tài chính</span></span>}
                subtitle="Xuất dữ liệu thô ra file Excel để phục vụ công tác đối soát, kế toán và quản trị vận hành."
                stats={[
                    { label: "Báo cáo khả dụng", value: "03" },
                    { label: "Định dạng", value: "XLSX" }
                ]}
            />

            {/* Filter Section */}
            <Card className="rounded-2xl border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="size-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground/80">Khoảng thời gian đối soát</CardTitle>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground/50">Chọn thời gian để lọc dữ liệu trong các file báo cáo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="grid w-full items-center gap-1.5 flex-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 ml-1">Từ ngày</label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-12 bg-background/50 border-border/40 rounded-xl focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex items-center justify-center mt-6">
                            <ArrowRight className="size-5 text-muted-foreground/20" />
                        </div>
                        <div className="grid w-full items-center gap-1.5 flex-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 ml-1">Đến ngày</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-12 bg-background/50 border-border/40 rounded-xl focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                        <div className="w-full md:w-auto mt-0 md:mt-6">
                            <Button
                                variant="outline"
                                onClick={() => { setStartDate(""); setEndDate(""); }}
                                className="h-12 w-full md:w-auto px-6 rounded-xl border-border/40 font-bold uppercase text-[10px] tracking-widest hover:bg-muted/30 transition-all"
                            >
                                Xóa lọc
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
        <Card className="group rounded-2xl border-border/40 shadow-sm bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 overflow-hidden flex flex-col">
            <div className={cn("h-1.5 w-full", bg.replace('/10', ''))} />
            <CardHeader>
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-xl transition-all group-hover:scale-110", bg, color)}>
                        <Icon className="size-6" />
                    </div>
                    <FileSpreadsheet className="size-5 text-muted-foreground/10 group-hover:text-primary/10 transition-colors" />
                </div>
                <CardTitle className="text-lg font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                    {title}
                </CardTitle>
                <CardDescription className="text-xs font-medium leading-relaxed min-h-[40px]">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-6">
                <Button
                    variant="default"
                    disabled={loading}
                    onClick={onExport}
                    className="w-full h-12 rounded-xl bg-foreground text-background font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-primary hover:text-primary-foreground hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
                >
                    {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Download className="size-4" />
                    )}
                    {loading ? "Đang xử lý..." : "Xuất báo cáo"}
                </Button>
            </CardContent>
        </Card>
    );
}
