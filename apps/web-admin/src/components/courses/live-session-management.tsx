import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
    PlayCircle,
    StopCircle,
    Users,
    Video,
    Clock,
    Settings,
    Radio
} from 'lucide-react';
import type { CourseResponseDTO } from '@workspace/schemas';
import { cn } from '@workspace/ui/lib/utils';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateLiveConfig } from '@/api/services/courses';

interface LiveSessionManagementProps {
    course: CourseResponseDTO;
}

export function LiveSessionManagement({ course }: LiveSessionManagementProps) {
    const [isLive, setIsLive] = useState(course.liveConfig?.isRunning || false);
    const [isRecording, setIsRecording] = useState(false);
    const [participantCount] = useState(0);
    const updateLiveConfigMutation = useUpdateLiveConfig();

    useEffect(() => {
        setIsLive(course.liveConfig?.isRunning || false);
    }, [course.liveConfig]);

    const handleStartSession = async () => {
        try {
            await updateLiveConfigMutation.mutateAsync({
                id: course.id,
                config: { ...course.liveConfig, isRunning: true, startTime: new Date() }
            });
            setIsLive(true);
            toast.success('Bắt đầu buổi học trực tuyến', {
                description: `Buổi học cho khóa "${course.title}" đã bắt đầu.`,
            });

            // Open meeting room if link exists
            if (course.liveConfig?.meetingLink) {
                window.open(course.liveConfig.meetingLink, '_blank');
            }
        } catch (error) {
            toast.error('Không thể bắt đầu buổi học');
        }
    };

    const handleEndSession = async () => {
        try {
            await updateLiveConfigMutation.mutateAsync({
                id: course.id,
                config: { ...course.liveConfig, isRunning: false, endTime: new Date() }
            });
            setIsLive(false);
            setIsRecording(false);
            toast.info('Đã kết thúc buổi học', {
                description: 'Thông tin điểm danh và bản ghi đang được xử lý.',
            });
        } catch (error) {
            toast.error('Không thể kết thúc buổi học');
        }
    };

    const toggleRecording = () => {
        // In a real app, this would trigger recording service
        setIsRecording(!isRecording);
        toast.info(isRecording ? 'Đã dừng ghi hình' : 'Bắt đầu ghi hình buổi học');
    };

    if (course.type !== 'live') {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Khóa học này không phải là khóa học trực tiếp (Livestream).
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Status Card */}
            <Card className="border-border/40 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-sans font-bold italic uppercase tracking-wider">Trạng thái lớp học</CardTitle>
                        <Badge variant={isLive ? "destructive" : "secondary"} className={cn("animate-pulse", !isLive && "animate-none")}>
                            {isLive ? "LIVE" : "OFFLINE"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={cn("size-10 rounded-xl flex items-center justify-center border", isLive ? "bg-red-500/10 border-red-500/20 text-red-600" : "bg-muted border-border text-muted-foreground")}>
                            <Radio className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phiên hiện tại</p>
                            <p className="text-sm font-semibold">{isLive ? "Đang diễn ra" : "Chưa bắt đầu"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Button
                            variant={isLive ? "outline" : "default"}
                            className="w-full rounded-xl gap-2 text-xs font-bold uppercase tracking-wider"
                            onClick={isLive ? handleEndSession : handleStartSession}
                            disabled={updateLiveConfigMutation.isPending}
                        >
                            {isLive ? (
                                <><StopCircle className="size-4" /> Kết thúc</>
                            ) : (
                                <><PlayCircle className="size-4" /> Bắt đầu</>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!isLive}
                            onClick={toggleRecording}
                            className={cn("w-full rounded-xl gap-2 text-xs font-bold uppercase tracking-wider", isRecording && "border-red-500 text-red-600 hover:bg-red-50")}
                        >
                            <Video className="size-4" />
                            {isRecording ? "Dừng ghi" : "Ghi hình"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Card */}
            <Card className="border-border/40 shadow-sm">
                <CardHeader className="bg-muted/30 pb-4 text-xs font-sans font-bold italic uppercase tracking-wider">
                    Thống kê tham gia
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="size-5 text-primary opacity-60" />
                            <span className="text-sm font-medium">Học viên đang online</span>
                        </div>
                        <span className="text-2xl font-bold tabular-nums">{participantCount}</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            <span>Tỉ lệ chuyên cần</span>
                            <span>{course.totalStudents > 0 ? Math.round((participantCount / course.totalStudents) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${course.totalStudents > 0 ? (participantCount / course.totalStudents) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5">
                        Xem danh sách chi tiết
                    </Button>
                </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="border-border/40 shadow-sm">
                <CardHeader className="bg-muted/30 pb-4 text-xs font-sans font-bold italic uppercase tracking-wider">
                    Thông tin phiên học
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-sm">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Giảng viên:</span>
                        <span className="font-semibold">Bản thân (Phụ trách)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Phòng học:</span>
                        <Badge variant="outline" className="text-[9px] font-bold">ROOM-{course.id.slice(0, 4)}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Thời lượng:</span>
                        <div className="flex items-center gap-1 font-semibold">
                            <Clock className="size-3" />
                            <span>00:00:00</span>
                        </div>
                    </div>

                    <DropdownSeparator className="my-2" />

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            <Settings className="size-3 mr-1.5" /> Thiết lập
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            Ghi chú dạy
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function DropdownSeparator({ className }: { className?: string }) {
    return <div className={cn("h-px bg-border", className)} />;
}
