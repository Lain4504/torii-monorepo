import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import type { CourseResponseDTO } from '@workspace/schemas';

interface ViewCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
}

export function ViewCourseDialog({
    open,
    onOpenChange,
    course,
}: ViewCourseDialogProps) {
    if (!course) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Course Details</DialogTitle>
                    <DialogDescription>
                        View the complete details of the course.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {course.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>JLPT Level</Label>
                            <div>
                                <Badge variant="outline">{course.jlptLevel}</Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Price</Label>
                            <p className="font-medium">{formatPrice(course.price)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div>
                                <Badge
                                    variant={
                                        course.status === 'published'
                                            ? 'default'
                                            : course.status === 'draft'
                                                ? 'secondary'
                                                : 'outline'
                                    }
                                >
                                    {course.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Total Students</Label>
                            <p className="text-sm">{course.totalStudents || 0}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Thumbnail URL</Label>
                        {course.thumbnailUrl ? (
                            <div className="mt-2 text-sm text-blue-500 break-all">
                                <a href={course.thumbnailUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {course.thumbnailUrl}
                                </a>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No thumbnail uploaded</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Preview Video URL</Label>
                        {course.previewVideoUrl ? (
                            <div className="mt-2 text-sm text-blue-500 break-all">
                                <a href={course.previewVideoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {course.previewVideoUrl}
                                </a>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No preview video uploaded</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                            <Label className="text-xs">Created At</Label>
                            <p>{new Date(course.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Updated At</Label>
                            <p>{new Date(course.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
