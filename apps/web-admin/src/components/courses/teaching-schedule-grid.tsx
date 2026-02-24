import {
    useTeachingSchedules,
    useRemoveTeachingSchedule
} from '@/lib/api/services/live-sessions';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { toast } from '@workspace/ui/components/sonner';
import { Trash2, Clock, User, Calendar, GitPullRequest } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectRole, selectAuthUser } from '@/store/slices/auth-slice';
import { ScheduleRequestDialog } from './schedule-request-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { useState } from 'react';

interface TeachingScheduleGridProps {
    courseId: string;
}

const DAYS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function TeachingScheduleGrid({ courseId }: TeachingScheduleGridProps) {
    const { data: schedules, isLoading } = useTeachingSchedules(courseId);
    const removeMutation = useRemoveTeachingSchedule();
    const role = useSelector(selectRole);
    const user = useSelector(selectAuthUser);

    const [requestOpen, setRequestOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

    const handleRemove = async (id: string) => {
        try {
            await removeMutation.mutateAsync(id);
            toast.success('Đã xóa lịch dạy cố định và các buổi học chưa diễn ra');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa lịch dạy');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium uppercase tracking-widest text-[10px]">Đang tải lịch học...</div>;
    }

    if (!schedules || schedules.length === 0) {
        return (
            <div className="p-12 text-center space-y-4 bg-muted/20 rounded-[2rem] border border-dashed border-border/40">
                <div className="size-16 rounded-full bg-background mx-auto flex items-center justify-center border border-border/20 shadow-sm">
                    <Calendar className="size-8 text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-sans font-bold italic uppercase tracking-tight">Chưa có lịch dạy cố định</h3>
                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                        Hãy thiết lập thời khóa biểu hàng tuần để hệ thống tự động tạo các buổi học Live.
                    </p>
                </div>
            </div>
        );
    }

    // Group by day of week
    const grouped = schedules.reduce((acc, s) => {
        if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
        acc[s.dayOfWeek].push(s);
        return acc;
    }, {} as Record<number, typeof schedules>);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(grouped)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, daySchedules]) => (
                    <Card key={day} className="rounded-[2rem] overflow-hidden border-border/40 bg-background/50 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 group">
                        <div className="px-6 py-4 bg-primary/5 border-b border-border/20 flex items-center justify-between group-hover:bg-primary/10 transition-colors">
                            <h3 className="text-xs font-sans font-black italic uppercase tracking-widest text-primary">
                                {DAYS[Number(day)]}
                            </h3>
                            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {daySchedules.length}
                            </div>
                        </div>
                        <div className="p-2 space-y-2">
                            {daySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((s) => (
                                <div key={s.id} className="p-4 rounded-2xl bg-background border border-border/20 hover:border-primary/30 hover:shadow-md transition-all group/item relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover/item:bg-primary/10 transition-all" />

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                                                    <Clock className="size-3.5" />
                                                </div>
                                                <span className="text-sm font-bold tabular-nums tracking-tight">
                                                    {s.startTime}
                                                </span>
                                                <span className="text-[10px] font-medium text-muted-foreground">
                                                    ({s.duration} phút)
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                    <User className="size-3.5" />
                                                </div>
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    {s.lecturer?.displayName || 'Chưa phân công'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            {role === 'lecturer' && user?.id === s.lecturerId && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedSchedule(s);
                                                        setRequestOpen(true);
                                                    }}
                                                    className="size-10 rounded-xl text-primary/40 hover:text-primary hover:bg-primary/10 transition-all"
                                                    title="Yêu cầu thay đổi"
                                                >
                                                    <GitPullRequest className="size-4" />
                                                </Button>
                                            )}

                                            {(role === 'admin' || role === 'staff') && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-10 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                                                            title="Xóa lịch dạy"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2rem]">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="font-sans font-bold italic uppercase">Xóa lịch dạy cố định?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-xs">
                                                                Hành động này sẽ xóa lịch dạy vào {DAYS[s.dayOfWeek]} lúc {s.startTime}.
                                                                Tất cả các buổi học "Scheduled" trong tương lai của lịch này cũng sẽ bị xóa.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-xl text-[10px] font-bold uppercase">Hủy</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleRemove(s.id)}
                                                                className="rounded-xl bg-destructive text-destructive-foreground text-[10px] font-bold uppercase"
                                                            >
                                                                Xác nhận xóa
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}

            {selectedSchedule && (
                <ScheduleRequestDialog
                    open={requestOpen}
                    onOpenChange={setRequestOpen}
                    courseId={courseId}
                    scheduleId={selectedSchedule.id}
                    lecturerId={selectedSchedule.lecturerId}
                    currentDay={selectedSchedule.dayOfWeek}
                    currentStart={selectedSchedule.startTime}
                    currentDuration={selectedSchedule.duration}
                />
            )}
        </div>
    );
}
