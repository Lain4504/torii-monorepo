import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
    Calendar,
    Clock,
    Plus,
    Video,
    MoreVertical,
    Pencil,
    Trash,
    PlayCircle,
    CheckCircle2,
    Timer,
    Users
} from 'lucide-react';
import type { CourseResponseDTO, LiveSessionResponseDTO } from '@workspace/schemas';
import {
    useLiveSessions,
    useDeleteLiveSession,
    useStartLiveSession,
    useEndLiveSession,
    liveSessionsApi
} from '@/api/services/live-sessions';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';
import { CreateLiveSessionDialog } from './create-live-session-dialog.tsx';

interface LiveSessionManagementSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
}

export function LiveSessionManagementSheet({ open, onOpenChange, course }: LiveSessionManagementSheetProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<LiveSessionResponseDTO | null>(null);

    const { data: sessions, isLoading } = useLiveSessions(course?.id || '');
    const deleteMutation = useDeleteLiveSession();
    const startMutation = useStartLiveSession();
    const endMutation = useEndLiveSession();

    if (!course) return null;

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa buổi học này?')) return;
        try {
            await deleteMutation.mutateAsync({ id, courseId: course.id });
            toast.success('Đã xóa buổi học');
        } catch (error) {
            toast.error('Không thể xóa buổi học');
        }
    };

    const handleStart = async (id: string) => {
        try {
            await startMutation.mutateAsync(id);
            toast.success('Đã bắt đầu buổi học');
        } catch (error) {
            toast.error('Không thể bắt đầu buổi học');
        }
    };

    const handleEnd = async (id: string) => {
        try {
            await endMutation.mutateAsync(id);
            toast.info('Đã kết thúc buổi học');
        } catch (error) {
            toast.error('Không thể kết thúc buổi học');
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/40 p-0">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-8 pb-6 border-b border-border/40 bg-muted/20">
                        <SheetHeader className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                                        Livestream Mode
                                    </Badge>
                                </div>
                                <SheetTitle className="text-2xl font-sans font-bold italic tracking-tight uppercase leading-none">
                                    Quản lý <span className="text-primary not-italic tracking-normal">Lịch dạy Live</span>
                                </SheetTitle>
                                <SheetDescription className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                                    Khóa học: {course.title}
                                </SheetDescription>
                            </div>

                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="w-fit h-10 px-4 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 transition-all"
                            >
                                <Plus className="mr-2 size-4" />
                                Lên lịch buổi mới
                            </Button>
                        </SheetHeader>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 space-y-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
                                ))}
                            </div>
                        ) : sessions?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 border-2 border-dashed border-border/40 rounded-3xl bg-muted/5">
                                <Calendar className="size-12 text-muted-foreground/20" />
                                <div className="space-y-1">
                                    <p className="font-sans font-bold italic text-muted-foreground/50 uppercase">Chưa có lịch dạy nào</p>
                                    <p className="text-xs text-muted-foreground/40">Hãy bắt đầu bằng cách lên lịch buổi học đầu tiên cho khóa này.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sessions?.map((session) => (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            "group relative p-5 rounded-2xl border bg-card transition-all hover:shadow-md",
                                            session.status === 'live' ? "border-red-500/30 bg-red-50/30" : "border-border/40 hover:border-primary/20"
                                        )}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={session.status === 'scheduled' ? "outline" : session.status === 'live' ? "destructive" : "secondary"}
                                                        className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0"
                                                    >
                                                        {session.status === 'scheduled' ? "Sắp diễn ra" : session.status === 'live' ? "Đang trực tiếp" : "Đã kết thúc"}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground/40 font-mono tracking-tighter">#{session.id.slice(0, 8)}</span>
                                                </div>

                                                <h4 className="font-sans font-bold text-base leading-tight">
                                                    {session.title}
                                                </h4>

                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium">
                                                        <Calendar className="size-3.5 opacity-40 text-primary" />
                                                        {format(new Date(session.scheduledAt), 'EEEE, dd/MM', { locale: vi })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium">
                                                        <Clock className="size-3.5 opacity-40 text-primary" />
                                                        {format(new Date(session.scheduledAt), 'HH:mm')}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium">
                                                        <Timer className="size-3.5 opacity-40 text-primary" />
                                                        {session.duration} phút
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium">
                                                        <Users className="size-3.5 opacity-40 text-primary" />
                                                        Duy nhất bản thân
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-40 group-hover:opacity-100">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl border-border/40 shadow-xl min-w-[160px]">
                                                        {session.status === 'scheduled' && (
                                                            <DropdownMenuItem onClick={() => handleStart(session.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50 gap-2">
                                                                <PlayCircle className="size-4" /> <span>Bắt đầu Live</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {session.status === 'live' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleEnd(session.id)} className="text-orange-600 focus:text-orange-700 focus:bg-orange-50 gap-2">
                                                                    <CheckCircle2 className="size-4" /> <span>Kết thúc Live</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={async () => {
                                                                        try {
                                                                            const joinData = await liveSessionsApi.join(session.id);
                                                                            const meetUrl = import.meta.env.VITE_MEET_URL || 'https://meet.torii.com';
                                                                            window.open(`${meetUrl}?access_token=${joinData.token}`, '_blank');
                                                                            toast.success('Đang tham gia buổi học');
                                                                        } catch (error: any) {
                                                                            toast.error(error.response?.data?.message || 'Không thể tham gia buổi học');
                                                                        }
                                                                    }}
                                                                    className="text-primary focus:text-primary focus:bg-primary/10 gap-2"
                                                                >
                                                                    <Video className="size-4" /> <span>Tham gia ngay</span>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuItem onClick={() => setEditingSession(session)} className="gap-2">
                                                            <Pencil className="size-4" /> <span>Sửa thông tin</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(session.id)} className="text-destructive focus:bg-destructive/5 gap-2">
                                                            <Trash className="size-4" /> <span>Xóa lịch</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-xl h-8 px-3 text-[10px] font-bold uppercase tracking-wider gap-1.5"
                                                    onClick={() => window.open(`/meet/${session.meetingId || 'test'}`, '_blank')}
                                                >
                                                    <Video className="size-3.5" />
                                                    Vào dạy
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>

            <CreateLiveSessionDialog
                open={isCreateOpen || !!editingSession}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        setIsCreateOpen(false);
                        setEditingSession(null);
                    }
                }}
                courseId={course.id}
                initialData={editingSession}
            />
        </Sheet>
    );
}
