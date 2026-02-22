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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';

const DAYS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const COLUMNS = 5; // #, Giảng viên & Khóa học, Lý do, Thay đổi lịch, Thao tác

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

            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Giảng viên &amp; Khóa học</TableHead>
                            <TableHead>Lý do</TableHead>
                            <TableHead className="text-center">Thay đổi lịch</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="size-9 rounded-xl shrink-0" />
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-48" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-3">
                                            <Skeleton className="h-10 w-20 rounded-xl" />
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-10 w-20 rounded-xl" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="h-8 w-20" />
                                            <Skeleton className="h-8 w-20" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : !requests?.length ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={COLUMNS} className="h-[400px] text-center">
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
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req, idx) => (
                                <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <User className="size-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{req.lecturer?.displayName}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <BookOpen className="size-3" />
                                                    {req.course?.title}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[240px]">
                                        {req.reason ? (
                                            <div className="flex gap-2 items-start">
                                                <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                    "{req.reason}"
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/50 italic">Không có lý do</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="space-y-0.5 text-center">
                                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Hiện tại</p>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {DAYS[req.dayOfWeek]}
                                                </Badge>
                                                <p className="text-[10px] text-muted-foreground">{req.startTime}</p>
                                            </div>
                                            <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                                            <div className="space-y-0.5 text-center">
                                                <p className="text-[10px] font-medium uppercase tracking-wider text-primary">Đề xuất</p>
                                                <Badge variant="default" className="text-[10px]">
                                                    {DAYS[req.dayOfWeek]}
                                                </Badge>
                                                <p className="text-[10px] text-muted-foreground">{req.startTime}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => onHandle(req.id, 'approve')}
                                                disabled={handleMutation.isPending}
                                            >
                                                <CheckCircle2 className="size-4 mr-1.5" />
                                                Phê duyệt
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onHandle(req.id, 'reject')}
                                                disabled={handleMutation.isPending}
                                            >
                                                <XCircle className="size-4 mr-1.5" />
                                                Từ chối
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
