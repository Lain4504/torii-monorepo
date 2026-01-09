import { usePublishCourse } from '@/api/services/courses';
import { useCourseInstructors } from '@/api/services/course-instructors';
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
import { Separator } from '@workspace/ui/components/separator';
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, BookOpen, Users, Layers } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';
import type { CourseResponseDTO } from '@workspace/schemas';

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
            toast.error('Cannot publish course', {
                description: 'Please complete all critical requirements first.',
            });
            return;
        }

        try {
            await publishMutation.mutateAsync(course.id);
            toast.success('Course published successfully', {
                description: 'Students can now enroll in this course.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to publish course');
        }
    };

    // Critical validation checks - MUST pass to publish
    const criticalChecks = [
        {
            label: 'Course has a title',
            valid: !!course?.title,
            icon: BookOpen,
        },
        {
            label: 'Course has a description',
            valid: !!course?.description,
            icon: BookOpen,
        },
        {
            label: 'At least one instructor assigned',
            valid: (instructors?.length || 0) > 0,
            icon: Users,
        },
        {
            label: 'Course price is set',
            valid: course?.price !== null && course?.price !== undefined && course?.price >= 0,
            icon: BookOpen,
        },
    ];

    // Recommended validation checks - Should pass for best experience
    const recommendedChecks = [
        {
            label: 'Course has a thumbnail image',
            valid: !!course?.thumbnailUrl,
            icon: BookOpen,
        },
        {
            label: 'Course has a preview video',
            valid: !!course?.previewVideoUrl,
            icon: BookOpen,
        },
        {
            label: 'Primary instructor is assigned',
            valid: instructors?.some(i => i.isPrimary) || false,
            icon: Users,
        },
        {
            label: 'JLPT level is specified',
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
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-muted/30 border-b border-border/40">
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Publish Course
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground/70">
                        Review requirements before publishing <strong className="text-foreground">{course?.title}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 p-6 max-h-[60vh] overflow-y-auto">
                    {/* Critical Requirements */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                Critical Requirements
                            </h4>
                            {allCriticalValid ? (
                                <Badge variant="default" className="rounded-md text-[10px] uppercase tracking-wider font-bold shadow-none">
                                    All Passed
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="rounded-md text-[10px] uppercase tracking-wider font-bold shadow-none">
                                    {criticalFailedCount} Failed
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
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                            check.valid
                                                ? "bg-green-50/50 dark:bg-green-950/10 border-green-200/50 dark:border-green-900/30"
                                                : "bg-destructive/5 border-destructive/20"
                                        )}
                                    >
                                        {check.valid ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                        )}
                                        <Icon className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                                        <span className="text-sm font-medium text-foreground/90 flex-1">{check.label}</span>
                                        <Badge
                                            variant={check.valid ? 'default' : 'destructive'}
                                            className="rounded-md text-[10px] uppercase tracking-wider font-bold shadow-none"
                                        >
                                            {check.valid ? 'Pass' : 'Required'}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Recommended Checks */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Recommended (Optional)
                            </h4>
                            {allRecommendedValid ? (
                                <Badge variant="default" className="rounded-md text-[10px] uppercase tracking-wider font-bold shadow-none">
                                    All Completed
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="rounded-md text-[10px] uppercase tracking-wider font-bold shadow-none">
                                    {recommendedFailedCount} Missing
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
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                            check.valid
                                                ? "bg-muted/20 border-border/40"
                                                : "bg-orange-50/30 dark:bg-orange-950/5 border-orange-200/30 dark:border-orange-900/20"
                                        )}
                                    >
                                        {check.valid ? (
                                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                        )}
                                        <Icon className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                                        <span className="text-sm font-medium text-foreground/80 flex-1">{check.label}</span>
                                        <Badge
                                            variant={check.valid ? 'default' : 'secondary'}
                                            className="rounded-md text-[10px] uppercase tracking-wider font-bold shadow-none"
                                        >
                                            {check.valid ? 'Done' : 'Optional'}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Warning Message */}
                    {!allCriticalValid && (
                        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-destructive">
                                        Cannot Publish Course
                                    </p>
                                    <p className="text-xs text-destructive/80">
                                        Please complete all critical requirements before publishing. This ensures a quality learning experience for students.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {allCriticalValid && !allRecommendedValid && (
                        <div className="rounded-xl bg-orange-50 dark:bg-orange-950/10 p-4 border border-orange-200/50 dark:border-orange-900/30">
                            <div className="flex gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                                        Recommended Items Missing
                                    </p>
                                    <p className="text-xs text-orange-700 dark:text-orange-300">
                                        While you can publish now, completing the recommended items will improve the course presentation and student engagement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-4 bg-muted/20 border-t border-border/40">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-11 px-6 hover:bg-primary/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={!allCriticalValid || publishMutation.isPending}
                        className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Course
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
