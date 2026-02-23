import { usePublishCourse } from '@/lib/api/services/courses';
import { useCourseInstructors } from '@/lib/api/services/course-instructors';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';

import { CheckCircle2, AlertCircle, AlertTriangle, BookOpen, Users, Layers, Rocket, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';
import type { CourseResponseDTO } from '@workspace/schemas';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Spinner } from "@workspace/ui/components/spinner";

interface PublishCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
}

export function PublishCourseDialog({ open, onOpenChange, course }: PublishCourseDialogProps) {
    const publishMutation = usePublishCourse();
    const { data: instructors } = useCourseInstructors(course?.id || '');

    const handlePublish = async () => {
        if (!course) return;

        // Block if critical requirements are not met
        if (!allCriticalValid) {
            toast.error('Hủy Triển Khai', {
                description: 'Yêu cầu quan trọng chưa được đáp ứng. Vui lòng khắc phục lỗi.',
            });
            return;
        }

        try {
            await publishMutation.mutateAsync(course.id);
            toast.success('Đã Xuất Bản Khóa Học', {
                description: 'Khóa học đã được xuất bản thành công.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Xuất Bản Thất Bại', {
                description: error.response?.data?.message || 'Lỗi hệ thống trong quá trình xuất bản.',
            });
        }
    };

    // Critical validation checks - MUST pass to publish
    const criticalChecks = [
        {
            label: 'Tên Khóa Học',
            valid: !!course?.title,
            icon: BookOpen,
        },
        {
            label: 'Mô Tả Khóa Học',
            valid: !!course?.description,
            icon: BookOpen,
        },
        {
            label: 'Giảng Viên',
            valid: (instructors?.length || 0) > 0,
            icon: Users,
        },
        {
            label: 'Học Phí',
            valid: course?.price !== null && course?.price !== undefined && course?.price >= 0,
            icon: BookOpen,
        },
    ];

    // Recommended validation checks - Should pass for best experience
    const recommendedChecks = [
        {
            label: 'Ảnh Bìa',
            valid: !!course?.thumbnailUrl,
            icon: BookOpen,
        },
        {
            label: 'Video Giới Thiệu',
            valid: !!course?.previewVideoUrl,
            icon: BookOpen,
        },
        {
            label: 'Giảng Viên Chính',
            valid: instructors?.some(i => i.isPrimary) || false,
            icon: Users,
        },
        {
            label: 'Trình Độ JLPT',
            valid: !!course?.jlptLevel,
            icon: Layers,
        },
    ];

    const allCriticalValid = criticalChecks.every(check => check.valid);
    const allRecommendedValid = recommendedChecks.every(check => check.valid);
    const criticalFailedCount = criticalChecks.filter(c => !c.valid).length;
    const recommendedFailedCount = recommendedChecks.filter(c => !c.valid).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                    <DialogTitle>Xuất Bản Khóa Học</DialogTitle>
                    <DialogDescription>
                        Kiểm tra yêu cầu cho <span className="text-foreground font-semibold">{course?.title}</span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-6 p-6">
                        {/* Critical Requirements */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2">
                                <h4 className="text-[10px] font-sans font-bold italic uppercase tracking-widest text-destructive/80 flex items-center gap-2">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Yêu Cầu Bắt Buộc
                                </h4>
                                {allCriticalValid ? (
                                    <Badge variant="secondary">
                                        Đạt Yêu Cầu
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">
                                        {criticalFailedCount} Còn Thiếu
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-2">
                                {criticalChecks.map((check, index) => {
                                    const Icon = check.icon;
                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex items-center gap-4 p-3 rounded-lg border transition-all",
                                                check.valid
                                                    ? "bg-card"
                                                    : "border-destructive/30 bg-destructive/5"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-md", check.valid ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive")}>
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="flex-1 space-y-0.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block">{check.label}</span>
                                            </div>

                                            {check.valid ? (
                                                <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-destructive animate-pulse" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recommended Checks */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between pb-2 border-b border-border/10">
                                <h4 className="text-[10px] font-sans font-bold italic uppercase tracking-widest text-amber-600/80 flex items-center gap-2">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Đề Xuất Tối Ưu
                                </h4>
                                {allRecommendedValid ? (
                                    <Badge variant="default">
                                        Đã Tối Ưu
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        {recommendedFailedCount} Chưa Hoàn Tất
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-2">
                                {recommendedChecks.map((check, index) => {
                                    const Icon = check.icon;
                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex items-center gap-4 p-3 rounded-lg border transition-all",
                                                check.valid
                                                    ? "bg-card"
                                                    : "border-amber-500/20 bg-amber-500/5"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-md", check.valid ? "bg-muted text-muted-foreground" : "bg-amber-500/10 text-amber-600")}>
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="flex-1 space-y-0.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block">{check.label}</span>
                                            </div>

                                            {check.valid ? (
                                                <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-amber-500/80" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Warning Message */}
                        {!allCriticalValid && (
                            <Alert variant="destructive">
                                <XCircle className="size-4" />
                                <AlertDescription className="font-bold">
                                    Không Thể Xuất Bản — Các lỗi quan trọng cần được khắc phục trước khi xuất bản.
                                </AlertDescription>
                            </Alert>
                        )}

                        {allCriticalValid && !allRecommendedValid && (
                            <Alert>
                                <ShieldCheck className="size-4" />
                                <AlertDescription>
                                    <strong>Khuyến Nghị Tối Ưu</strong> — Sẵn sàng xuất bản, nhưng có thể cải thiện thêm.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Quay Lại
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={!allCriticalValid || publishMutation.isPending}
                    >
                        {publishMutation.isPending ? (
                            <>
                                <Spinner className="mr-2 h-3.5 w-3.5" />
                                Đang xuất bản...
                            </>
                        ) : (
                            <>
                                <Rocket className="mr-2 h-3.5 w-3.5" />
                                Xuất Bản Ngay
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
