import {
    usePendingScheduleRequests,
    useHandleScheduleRequest
} from '@/api/services/live-sessions';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { toast } from '@workspace/ui/components/sonner';
import {
    CheckCircle2,
    XCircle,
    User,
    BookOpen,
    ArrowRight,
    MessageSquare,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
    Empty,
    EmptyContent,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@workspace/ui/components/empty';

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

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Yêu cầu Đổi Lịch"
                subtitle="Phê duyệt hoặc từ chối các đề xuất thay đổi lịch dạy từ giảng viên"
                stats={[
                    { label: "Đang chờ xử lý", value: requests?.length ?? 0 }
                ]}
            />

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border bg-card p-6">
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </div>
            ) : !requests?.length ? (
                <div className="rounded-xl border bg-card">
                    <Empty>
                        <EmptyMedia>
                            <CheckCircle2 className="size-8 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyContent>
                            <EmptyTitle>Không có yêu cầu chờ xử lý</EmptyTitle>
                            <EmptyDescription>
                                Tất cả yêu cầu đổi lịch đã được xử lý.
                            </EmptyDescription>
                        </EmptyContent>
                    </Empty>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req.id} className="rounded-xl border bg-card overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Lecturer & Course Info */}
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <User className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">{req.lecturer?.displayName}</h3>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <BookOpen className="size-3" />
                                                    {req.course?.title}
                                                </p>
                                            </div>
                                        </div>

                                        {req.reason && (
                                            <div className="flex gap-2 p-3 rounded-lg bg-muted/30 border border-border/40">
                                                <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    "{req.reason}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Schedule Change */}
                                    <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/30">
                                        <div className="space-y-1 text-center">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Hiện tại</p>
                                            <Badge variant="outline" className="text-[10px]">
                                                {req.originalScheduleId ? 'Lịch cũ' : 'Lịch mới'}
                                            </Badge>
                                            <div>
                                                <p className="text-xs font-semibold">{DAYS[req.dayOfWeek]}</p>
                                                <p className="text-[10px] text-muted-foreground">{req.startTime}</p>
                                            </div>
                                        </div>

                                        <ArrowRight className="size-4 text-muted-foreground" />

                                        <div className="space-y-1 text-center">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-primary">Đề xuất</p>
                                            <Badge className="text-[10px] bg-primary/10 text-primary border-none">
                                                Thay đổi
                                            </Badge>
                                            <div>
                                                <p className="text-xs font-semibold text-primary">{DAYS[req.dayOfWeek]}</p>
                                                <p className="text-[10px] text-muted-foreground">{req.startTime}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            onClick={() => onHandle(req.id, 'approve')}
                                            disabled={handleMutation.isPending}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <CheckCircle2 className="size-4 mr-1.5" />
                                            Phê duyệt
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onHandle(req.id, 'reject')}
                                            disabled={handleMutation.isPending}
                                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                        >
                                            <XCircle className="size-4 mr-1.5" />
                                            Từ chối
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
