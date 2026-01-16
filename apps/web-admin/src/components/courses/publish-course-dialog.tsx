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

import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, BookOpen, Users, Layers, Rocket, ShieldCheck, XCircle } from 'lucide-react';
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
            toast.error('Deployment Aborted', {
                description: 'Critical pre-launch protocols failed. Please resolve errors.',
            });
            return;
        }

        try {
            await publishMutation.mutateAsync(course.id);
            toast.success('Course Published', {
                description: 'Course has been successfully made live.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Publication Failed', {
                description: error.response?.data?.message || 'System error during publication sequence.',
            });
        }
    };

    // Critical validation checks - MUST pass to publish
    const criticalChecks = [
        {
            label: 'Repository Identification (Title)',
            valid: !!course?.title,
            icon: BookOpen,
        },
        {
            label: 'Core Instructions (Description)',
            valid: !!course?.description,
            icon: BookOpen,
        },
        {
            label: 'Personnel Allocation',
            valid: (instructors?.length || 0) > 0,
            icon: Users,
        },
        {
            label: 'Value Valuation (Price)',
            valid: course?.price !== null && course?.price !== undefined && course?.price >= 0,
            icon: BookOpen,
        },
    ];

    // Recommended validation checks - Should pass for best experience
    const recommendedChecks = [
        {
            label: 'Visual Asset: Thumbnail',
            valid: !!course?.thumbnailUrl,
            icon: BookOpen,
        },
        {
            label: 'Visual Asset: Preview Sequence',
            valid: !!course?.previewVideoUrl,
            icon: BookOpen,
        },
        {
            label: 'Lead Instructor Assigned',
            valid: instructors?.some(i => i.isPrimary) || false,
            icon: Users,
        },
        {
            label: 'Proficiency Level (JLPT)',
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
            <DialogContent className="sm:max-w-[540px] border border-border/50 shadow-2xl bg-background rounded-3xl p-0 overflow-hidden">
                <DialogHeader className="px-8 py-6 border-b border-border/10">
                    <DialogTitle className="text-xl font-semibold tracking-tight">
                        Publish Course
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground/60 mt-1">
                        Review requirements for <span className="text-foreground">{course?.title}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 p-8 max-h-[60vh] overflow-y-auto">
                    {/* Critical Requirements */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2">
                            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-destructive/80 flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" />
                                Required Assets
                            </h4>
                            {allCriticalValid ? (
                                <Badge variant="secondary" className="rounded-full text-[9px] font-medium bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none">
                                    Validated
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="rounded-full text-[9px] font-medium bg-destructive/10 text-destructive border-destructive/20 shadow-none">
                                    {criticalFailedCount} Missing
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
                                            "flex items-center gap-4 p-3 rounded-xl border transition-all group",
                                            check.valid
                                                ? "bg-muted/5 border-border/10 opacity-70 hover:opacity-100"
                                                : "bg-destructive/5 border-destructive/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]"
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-lg", check.valid ? "bg-muted/20 text-muted-foreground" : "bg-destructive/10 text-destructive")}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 space-y-0.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">{check.label}</span>
                                        </div>

                                        {check.valid ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500/50" />
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
                            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-amber-600/80 flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3" />
                                Recommended Optimizations
                            </h4>
                            {allRecommendedValid ? (
                                <Badge variant="default" className="rounded-md text-[9px] uppercase tracking-widest font-black shadow-none bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                                    Fully Optimized
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="rounded-full text-[9px] font-medium bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none">
                                    {recommendedFailedCount} Pending
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
                                            "flex items-center gap-4 p-3 rounded-xl border transition-all",
                                            check.valid
                                                ? "bg-muted/5 border-border/10 opacity-60 hover:opacity-100"
                                                : "bg-orange-500/5 border-orange-500/20"
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-lg", check.valid ? "bg-muted/20 text-muted-foreground" : "bg-orange-500/10 text-orange-500")}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 space-y-0.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">{check.label}</span>
                                        </div>

                                        {check.valid ? (
                                            <CheckCircle2 className="h-5 w-5 text-primary/40" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-orange-500/80" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Warning Message */}
                    {!allCriticalValid && (
                        <div className="rounded-2xl bg-destructive/5 p-4 border border-destructive/10 flex gap-4 items-center">
                            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                                <XCircle className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-wide text-destructive">
                                    Deployment Locked
                                </p>
                                <p className="text-[10px] font-bold text-destructive/70 uppercase tracking-widest">
                                    Critical errors must be resolved prior to launch.
                                </p>
                            </div>
                        </div>
                    )}

                    {allCriticalValid && !allRecommendedValid && (
                        <div className="rounded-2xl bg-orange-500/5 p-4 border border-orange-500/10 flex gap-4 items-center">
                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-amber-600">
                                    Optimization Recommended
                                </p>
                                <p className="text-[10px] font-medium text-amber-600/60 uppercase tracking-wider">
                                    Ready for launch, but performance can be improved.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-background border-t border-border/10 gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-10 px-6 hover:bg-muted/20 text-xs font-medium"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={!allCriticalValid || publishMutation.isPending}
                        className={cn(
                            "rounded-xl h-10 px-6 text-xs font-medium transition-all shadow-lg",
                            !allCriticalValid
                                ? "bg-muted text-muted-foreground opacity-50"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/30"
                        )}
                    >
                        {publishMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <Rocket className="mr-2 h-3.5 w-3.5" />
                                Publish Course
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
