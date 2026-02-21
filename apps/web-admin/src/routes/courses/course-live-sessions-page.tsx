import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
    ChevronLeft,
    Settings,
    PlayCircle,
    StopCircle,
    Video,
    Trash,
    MoreVertical,
} from 'lucide-react';
import {
    useLiveSessions,
    useDeleteLiveSession,
    useStartLiveSession,
    useEndLiveSession,
    liveSessionsApi
} from '@/api/services/live-sessions';
import { useCourse } from '@/api/services/courses';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { toast } from '@workspace/ui/components/sonner';
import { PageHeader } from '@/components/common/page-header';
import { PageLoading } from '@workspace/ui/components/page-loading';
import { TeachingScheduleSheet } from '@/components/courses/teaching-schedule-sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';

export default function CourseLiveSessionsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);

    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: sessions, isLoading: isLoadingSessions } = useLiveSessions(id || '');

    const deleteMutation = useDeleteLiveSession();
    const startMutation = useStartLiveSession();
    const endMutation = useEndLiveSession();

    if (isLoadingCourse) {
        return <PageLoading text="Đang tải thông tin khóa học..." />;
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <p className="text-muted-foreground">Không tìm thấy khóa học</p>
                <Button onClick={() => navigate('/courses')}>Quay lại danh sách</Button>
            </div>
        );
    }

    const handleDelete = async (sessionId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa buổi học này?')) return;
        try {
            await deleteMutation.mutateAsync({ id: sessionId, courseId: course.id });
            toast.success('Đã xóa buổi học');
        } catch (error) {
            toast.error('Không thể xóa buổi học');
        }
    };

    const handleStart = async (sessionId: string) => {
        try {
            await startMutation.mutateAsync(sessionId);
            toast.success('Đã bắt đầu buổi học');
        } catch (error) {
            toast.error('Không thể bắt đầu buổi học');
        }
    };

    const handleEnd = async (sessionId: string) => {
        try {
            await endMutation.mutateAsync(sessionId);
            toast.info('Đã kết thúc buổi học');
        } catch (error) {
            toast.error('Không thể kết thúc buổi học');
        }
    };

    const handleJoin = async (sessionId: string) => {
        try {
            const joinData = await liveSessionsApi.join(sessionId);
            const meetUrl = import.meta.env.VITE_MEET_URL || 'https://meet.torii.com';
            window.open(`${meetUrl}?access_token=${joinData.token}`, '_blank');
            toast.success('Đang tham gia buổi học');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tham gia buổi học');
        }
    };

    const sortedSessions = sessions?.sort((a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    ) || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 text-muted-foreground hover:text-foreground gap-2 transition-colors hover:bg-transparent -ml-2 w-fit"
                    onClick={() => navigate(`/courses/${id}`)}
                >
                    <ChevronLeft className="size-4" />
                    <span className="text-xs font-sans font-bold italic uppercase tracking-wider">Quay lại chi tiết khóa học</span>
                </Button>

                <PageHeader
                    title="Quản lý Lịch dạy Live"
                    subtitle={`Khóa học: ${course.title}`}
                    actions={
                        <Button
                            onClick={() => setIsScheduleSheetOpen(true)}
                            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 transition-all"
                        >
                            <Settings className="mr-2 size-4" />
                            Quản lý lịch cố định
                        </Button>
                    }
                    stats={[
                        {
                            label: 'Tổng buổi học',
                            value: sessions?.length || 0,
                        },
                        {
                            label: 'Đang live',
                            value: sessions?.filter(s => s.status === 'live').length || 0,
                        },
                        {
                            label: 'Sắp diễn ra',
                            value: sessions?.filter(s => s.status === 'scheduled').length || 0,
                        },
                    ]}
                />
            </div>

            {isLoadingSessions ? (
                <PageLoading text="Đang tải danh sách buổi học..." />
            ) : sortedSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 border-2 border-dashed border-border/40 rounded-3xl bg-muted/5">
                    <div className="p-6 rounded-full bg-muted/10">
                        <Video className="size-16 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-sans font-bold italic text-muted-foreground/50 uppercase tracking-tight">Chưa có lịch dạy nào</h3>
                        <p className="text-sm text-muted-foreground/40 max-w-sm mx-auto">Hãy bắt đầu bằng cách thiết lập lịch cố định hàng tuần cho khóa học này.</p>
                    </div>
                    <Button
                        onClick={() => setIsScheduleSheetOpen(true)}
                        variant="outline"
                        className="h-11 px-8 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold uppercase tracking-widest text-[10px]"
                    >
                        Thiết lập lịch cố định
                    </Button>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/30 border-b border-border">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-12 border-r border-border/30 last:border-r-0">#</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0">Trạng thái</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0">Tiêu đề</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0">Thời gian</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0">Thời lượng</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0">Giảng viên</TableHead>
                                <TableHead className="text-right h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSessions.map((session, idx) => (
                                <TableRow key={session.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {session.status === 'live' && (
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                            )}
                                            <Badge
                                                variant={session.status === 'scheduled' ? "outline" : session.status === 'live' ? "destructive" : "secondary"}
                                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg"
                                            >
                                                {session.status === 'scheduled' ? "Sắp diễn ra" : session.status === 'live' ? "Đang live" : "Hoàn thành"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm">{session.title}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">ID: {session.id.slice(0, 8)}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p className="font-medium">{format(new Date(session.scheduledAt), 'HH:mm', { locale: vi })}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(session.scheduledAt), 'EEEE, dd/MM/yyyy', { locale: vi })}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium">{session.duration} phút</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{session.lecturer?.displayName || 'Chưa chỉ định'}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {session.status === 'live' && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="rounded-lg h-8 px-3 text-[10px] font-bold uppercase tracking-widest gap-1.5"
                                                    onClick={() => handleJoin(session.id)}
                                                >
                                                    <Video className="size-3" />
                                                    Vào dạy
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                                                        <MoreVertical className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-border/40 shadow-xl min-w-[160px] p-1.5">
                                                    {session.status === 'scheduled' && (
                                                        <DropdownMenuItem onClick={() => handleStart(session.id)} className="rounded-lg text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 gap-2 py-2">
                                                            <PlayCircle className="size-3.5" /> <span className="font-bold text-xs uppercase">Bắt đầu</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {session.status === 'live' && (
                                                        <DropdownMenuItem onClick={() => handleEnd(session.id)} className="rounded-lg text-orange-600 focus:text-orange-700 focus:bg-orange-50 gap-2 py-2">
                                                            <StopCircle className="size-3.5" /> <span className="font-bold text-xs uppercase">Kết thúc</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDelete(session.id)} className="rounded-lg text-destructive focus:bg-destructive/10 gap-2 py-2">
                                                        <Trash className="size-3.5" /> <span className="font-bold text-xs uppercase">Xóa</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <TeachingScheduleSheet
                open={isScheduleSheetOpen}
                onOpenChange={setIsScheduleSheetOpen}
                course={course}
            />
        </div>
    );
}
