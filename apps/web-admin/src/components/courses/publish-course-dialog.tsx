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
            toast.success('System Deployed', {
                description: 'Course repository successfully published to live environment.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Deployment Failed', {
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
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[2rem] p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-6 bg-muted/5 border-b border-border/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-2 z-10 relative">
                        Deploy <span className="text-primary not-italic">Repository</span>
                    </DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 z-10 relative">
                        Pre-Launch Diagnostic Sequence for <span className="text-foreground">{course?.title}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 p-8 max-h-[60vh] overflow-y-auto">
                    {/* Critical Requirements */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border/20">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" />
                                Critical Protocols
                            </h4>
                            {allCriticalValid ? (
                                <Badge variant="default" className="rounded-md text-[9px] uppercase tracking-widest font-black shadow-none bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20">
                                    Sequence Valid
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="rounded-md text-[9px] uppercase tracking-widest font-black shadow-none bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20">
                                    {criticalFailedCount} Errors Found
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
                                            <span className="text-xs font-bold uppercase tracking-wide text-foreground/90 block">{check.label}</span>
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
                        <div className="flex items-center justify-between pb-2 border-b border-border/20">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3" />
                                Optimization Protocols
                            </h4>
                            {allRecommendedValid ? (
                                <Badge variant="default" className="rounded-md text-[9px] uppercase tracking-widest font-black shadow-none bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                                    Fully Optimized
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="rounded-md text-[9px] uppercase tracking-widest font-black shadow-none bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20">
                                    {recommendedFailedCount} Improvements
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
                                            <span className="text-xs font-bold uppercase tracking-wide text-foreground/90 block">{check.label}</span>
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
                                <p className="text-xs font-black uppercase tracking-wide text-orange-500">
                                    Optimization Pending
                                </p>
                                <p className="text-[10px] font-bold text-orange-500/70 uppercase tracking-widest">
                                    Launch feasible, but system performance can be improved.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-8 pt-6 bg-background/50 border-t border-border/10 backdrop-blur-md">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-12 px-6 hover:bg-muted/20 text-[11px] font-black uppercase tracking-widest"
                    >
                        Abort
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={!allCriticalValid || publishMutation.isPending}
                        className={cn(
                            "rounded-xl h-12 px-8 text-[11px] font-black uppercase tracking-widest shadow-xl transition-all",
                            !allCriticalValid
                                ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                                : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-[1.02] shadow-emerald-500/20"
                        )}
                    >
                        {publishMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deploying...
                            </>
                        ) : (
                            <>
                                <Rocket className="mr-2 h-4 w-4" />
                                Initiate Launch
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
