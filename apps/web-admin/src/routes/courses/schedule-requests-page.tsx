import { useState } from 'react';
import { Card } from '@workspace/ui/components/card';
import {
    usePendingScheduleRequests,
    useHandleScheduleRequest
} from '@/lib/api/services/live-sessions';
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
    Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/auth-slice';
import type { TeachingScheduleResponseDTO } from '@workspace/schemas';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@workspace/ui/components/dialog';
import {
    Field,
    FieldLabel,
} from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { useCreateScheduleRequest, useCheckAvailabilityQuery, useTeachingSchedules } from '@/lib/api/services/live-sessions';
import { Spinner } from "@workspace/ui/components/spinner";
import { useMyCourseRuns } from '@/lib/api/services/course-runs';
import { AlertCircle } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
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
    const user = useSelector(selectUser);
    const isLecturer = user?.role === 'lecturer';
    const { data: requests, isLoading } = usePendingScheduleRequests();
    const handleMutation = useHandleScheduleRequest();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

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
                title={isLecturer ? "Yêu cầu của Tôi" : "Yêu cầu Đổi Lịch"}
                subtitle={isLecturer ? "Quản lý và theo dõi các yêu cầu thay đổi lịch dạy của bạn" : "Phê duyệt hoặc từ chối các đề xuất thay đổi lịch dạy từ giảng viên"}
                actions={isLecturer && (
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 transition-all"
                    >
                        <Plus className="mr-2 size-4" />
                        Tạo yêu cầu mới
                    </Button>
                )}
                stats={[
                    { label: "Đang chờ xử lý", value: requests?.length ?? 0 }
                ]}
            />

            <Card>
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
                                        {!isLecturer ? (
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
                                        ) : (
                                            <Badge variant="outline" className="capitalize">
                                                {req.status}
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {isLecturer && (
                <CreateGlobalScheduleRequestDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />
            )}
        </div>
    );
}

import { CourseRunStatus } from '@workspace/schemas';

// Internal component for creating a request from the list page
function CreateGlobalScheduleRequestDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const user = useSelector(selectUser);
    const { data: runsData } = useMyCourseRuns({ limit: 100, page: 1, status: CourseRunStatus.IN_PROGRESS });
    const [selectedCourseRunId, setSelectedCourseRunId] = useState<string>('');
    const { data: schedules } = useTeachingSchedules(selectedCourseRunId);
    const [selectedSchedule, setSelectedSchedule] = useState<TeachingScheduleResponseDTO | null>(null);

    const createMutation = useCreateScheduleRequest();

    const form = useForm({
        defaultValues: {
            dayOfWeek: 1,
            startTime: '19:00',
            duration: 90,
            reason: '',
        }
    });

    const requestedDay = form.watch('dayOfWeek');
    const requestedStart = form.watch('startTime');
    const requestedDuration = form.watch('duration');

    const { data: availabilityResult, isFetching: isChecking } = useCheckAvailabilityQuery({
        lecturerId: user?.id || '',
        dayOfWeek: requestedDay,
        startTime: requestedStart,
        duration: requestedDuration,
        excludeScheduleId: selectedSchedule?.id
    }, open && !!requestedStart && !!user?.id);

    const isAvailable = availabilityResult?.available ?? true;

    const onSubmit = async (values: any) => {
        if (!selectedSchedule || !selectedCourseRunId) {
            toast.error('Vui lòng chọn khóa học và lịch dạy');
            return;
        }

        try {
            await createMutation.mutateAsync({
                ...values,
                lecturerId: user?.id,
                courseRunId: selectedCourseRunId,
                originalScheduleId: selectedSchedule.id,
            });
            toast.success('Đã gửi yêu cầu thay đổi lịch dạy');
            onOpenChange(false);
            form.reset();
            setSelectedCourseRunId('');
            setSelectedSchedule(null);
        } catch {
            toast.error('Có lỗi xảy ra khi gửi yêu cầu');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo Yêu Cầu Đổi Lịch</DialogTitle>
                    <DialogDescription>
                        Chọn khóa học và lịch dạy bạn muốn thay đổi.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Field>
                        <FieldLabel>Khóa học</FieldLabel>
                        <Select onValueChange={setSelectedCourseRunId} value={selectedCourseRunId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn khóa học" />
                            </SelectTrigger>
                            <SelectContent>
                                {runsData?.data?.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    {selectedCourseRunId && (
                        <Field>
                            <FieldLabel>Lịch dạy hiện tại</FieldLabel>
                            <Select
                                onValueChange={(val) => setSelectedSchedule(schedules?.find(s => s.id === val) || null)}
                                value={selectedSchedule?.id || ''}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn lịch dạy" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schedules?.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {DAYS[s.dayOfWeek]} - {s.startTime} ({s.duration}p)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )}

                    {selectedSchedule && (
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t">
                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="dayOfWeek"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Ngày mới</FieldLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(parseInt(val))}
                                                defaultValue={field.value.toString()}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DAYS.map((label, idx) => (
                                                        <SelectItem key={idx} value={idx.toString()}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="startTime"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Giờ mới</FieldLabel>
                                            <Input type="time" {...field} />
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                name="reason"
                                control={form.control}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Lý do</FieldLabel>
                                        <Textarea {...field} placeholder="Tại sao bạn muốn đổi lịch?" />
                                    </Field>
                                )}
                            />

                            <div className={cn(
                                "p-3 rounded-lg border flex items-center gap-3 text-xs",
                                isAvailable ? "border-border" : "border-destructive/30 bg-destructive/5 text-destructive"
                            )}>
                                {isChecking ? <Spinner className="size-4" /> : isAvailable ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                                <div>
                                    <p className="font-bold">{isChecking ? 'Đang kiểm tra...' : isAvailable ? 'Khả dụng' : 'Trùng lịch'}</p>
                                    <p className="opacity-70">{isAvailable ? 'Bạn có thể sử dụng khung giờ này' : 'Bạn đã có lịch khác vào lúc này'}</p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={!isAvailable || isChecking || createMutation.isPending}>
                                    {createMutation.isPending && <Spinner className="mr-2" />}
                                    Gửi yêu cầu
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
