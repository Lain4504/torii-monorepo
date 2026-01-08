import { usePublishCourse } from '@/api/services/courses';
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
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import type { CourseResponseDTO } from '@workspace/schemas';

interface PublishCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
}

export function PublishCourseDialog({ open, onOpenChange, course }: PublishCourseDialogProps) {
    const publishMutation = usePublishCourse();

    const handlePublish = async () => {
        if (!course) return;

        try {
            await publishMutation.mutateAsync(course.id);
            toast.success('Course published successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to publish course');
        }
    };

    // Simple validation checklist - can be enhanced based on backend validation
    const validationChecks = [
        {
            label: 'Course has a title and description',
            valid: !!(course?.title && course?.description),
        },
        {
            label: 'Course has a thumbnail',
            valid: !!course?.thumbnailUrl,
        },
        {
            label: 'Course price is set',
            valid: course?.price !== null && course?.price !== undefined,
        },
    ];

    const allValid = validationChecks.every(check => check.valid);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-muted/30">
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Publish Course</DialogTitle>
                    <DialogDescription className="text-muted-foreground/70">
                        Ready to publish <strong>{course?.title}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 p-6 pt-2">
                    <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Validation Checklist</h4>
                        <div className="space-y-2">
                            {validationChecks.map((check, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-muted/20">
                                    {check.valid ? (
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                    )}
                                    <span className="text-sm font-medium text-foreground/80">{check.label}</span>
                                    <Badge variant={check.valid ? 'default' : 'secondary'} className="ml-auto rounded-md text-[10px] uppercase tracking-wider font-bold shadow-none">
                                        {check.valid ? 'Valid' : 'Missing'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!allValid && (
                        <div className="rounded-xl bg-orange-50 dark:bg-orange-950/10 p-4 border border-orange-200/50 dark:border-orange-900/30">
                            <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                                <strong>Warning:</strong> Some validation checks failed. Publishing is still allowed, but the course may not display correctly.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-2 bg-transparent">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-11 px-6 hover:bg-primary/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={publishMutation.isPending}
                        className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                        {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Course
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
