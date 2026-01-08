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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Publish Course</DialogTitle>
                    <DialogDescription>
                        Ready to publish <strong>{course?.title}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Validation Checklist</h4>
                        {validationChecks.map((check, index) => (
                            <div key={index} className="flex items-center gap-3">
                                {check.valid ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                )}
                                <span className="text-sm">{check.label}</span>
                                <Badge variant={check.valid ? 'default' : 'secondary'} className="ml-auto">
                                    {check.valid ? 'Valid' : 'Missing'}
                                </Badge>
                            </div>
                        ))}
                    </div>

                    {!allValid && (
                        <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-4 border border-orange-200 dark:border-orange-900">
                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                <strong>Warning:</strong> Some validation checks failed. Publishing is still allowed, but the course may not display correctly to students.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={publishMutation.isPending}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                        {publishMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Course
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
