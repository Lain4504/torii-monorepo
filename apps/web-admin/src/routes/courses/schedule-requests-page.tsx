import {
    usePendingScheduleRequests,
    useHandleScheduleRequest
} from '@/api/services/live-sessions';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { toast } from '@workspace/ui/components/sonner';
import {
    CheckCircle2,
    XCircle,
    User,
    BookOpen,
    ArrowRight,
    MessageSquare
} from 'lucide-react';

const DAYS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function ScheduleRequestsPage() {
    const { data: requests, isLoading } = usePendingScheduleRequests();
    const handleMutation = useHandleScheduleRequest();

    const onHandle = async (id: string, action: 'approve' | 'reject') => {
        try {
            await handleMutation.mutateAsync({ id, action });
            toast.success(action === 'approve' ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu');
        } catch {
            toast.error('Có lỗi xảy ra khi xử lý yêu cầu');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium uppercase tracking-widest text-xs">Đang tải yêu cầu...</div>;
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-sans font-black italic uppercase tracking-tighter text-primary">
                    Yêu Cầu Đổi Lịch
                </h1>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    Phê duyệt hoặc từ chối các đề xuất thay đổi lịch dạy từ giảng viên
                </p>
            </div>

            {requests?.length === 0 ? (
                <Card className="p-12 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center gap-4 rounded-[2rem]">
                    <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
                        <CheckCircle2 className="size-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Không có yêu cầu chờ xử lý</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests?.map((req) => (
                        <Card key={req.id} className="relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 group rounded-[2.5rem] bg-card/50 backdrop-blur-xl">
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-50" />

                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    {/* Lecturer & Course Info */}
                                    <div className="space-y-6 flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                                <User className="size-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold tracking-tight">{req.lecturer?.displayName}</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mt-1">
                                                    <BookOpen className="size-3" />
                                                    {req.course?.title}
                                                </p>
                                            </div>
                                        </div>

                                        {req.reason && (
                                            <div className="flex gap-3 p-4 rounded-2xl bg-muted/30 border border-border/10">
                                                <MessageSquare className="size-4 text-primary shrink-0 mt-0.5" />
                                                <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                                                    "{req.reason}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Schedule Change Visualizer */}
                                    <div className="flex items-center gap-4 lg:gap-8 bg-muted/20 p-6 rounded-[2rem] border border-border/10">
                                        <div className="space-y-2 text-center pointer-events-none opacity-40 grayscale scale-95 transition-all group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest">Hiện tại</p>
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="rounded-lg text-[9px] font-bold uppercase border-border/20">
                                                    {req.originalScheduleId ? 'Lịch Cũ' : 'Lịch Mới'}
                                                </Badge>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">{DAYS[req.dayOfWeek]}</span>
                                                    <span className="text-[10px] font-medium opacity-70">{req.startTime}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <ArrowRight className="size-5 text-primary/40 animate-pulse" />

                                        <div className="space-y-2 text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary">Đề xuất</p>
                                            <div className="space-y-1">
                                                <Badge className="rounded-lg text-[9px] font-bold uppercase bg-primary/20 text-primary border-none">
                                                    Thay đổi
                                                </Badge>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-primary">{DAYS[req.dayOfWeek]}</span>
                                                    <span className="text-[10px] font-bold">{req.startTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                                        <Button
                                            onClick={() => onHandle(req.id, 'approve')}
                                            disabled={handleMutation.isPending}
                                            className="h-12 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                                        >
                                            <CheckCircle2 className="size-4 mr-2" />
                                            Phê duyệt
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => onHandle(req.id, 'reject')}
                                            disabled={handleMutation.isPending}
                                            className="h-12 px-8 rounded-2xl text-destructive hover:bg-destructive/10 font-bold uppercase text-[10px] tracking-widest border border-destructive/20 transition-all"
                                        >
                                            <XCircle className="size-4 mr-2" />
                                            Từ chối
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
