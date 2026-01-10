import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import type { LessonResponseDTO } from '@workspace/schemas';

interface ViewLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lesson: LessonResponseDTO | null;
}

export function ViewLessonDialog({ open, onOpenChange, lesson }: ViewLessonDialogProps) {
    if (!lesson) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Lesson Details</DialogTitle>
                    <DialogDescription>View the complete details of the lesson.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <h3 className="text-lg font-semibold">{lesson.title}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Content Type</Label>
                            <div>
                                <Badge variant="outline">{lesson.contentType}</Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Order</Label>
                            <p className="text-sm">{lesson.orderIndex}</p>
                        </div>
                    </div>

                    {lesson.contentType === 'video' && (
                        <div className="space-y-2">
                            <Label>Video URL</Label>
                            {lesson.videoUrl ? (
                                <div className="mt-2 text-sm text-blue-500 break-all">
                                    <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {lesson.videoUrl}
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No video uploaded</p>
                            )}
                        </div>
                    )}

                    {lesson.contentType === 'article' && (
                        <div className="space-y-2">
                            <Label>Article Content</Label>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lesson.articleContent || 'No article content'}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                            <Label className="text-xs">Is Preview</Label>
                            <p>{lesson.isPreview ? 'Yes' : 'No'}</p>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Is Unlocked</Label>
                            <p>{lesson.isUnlocked ? 'Yes' : 'No'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                            <Label className="text-xs">Created At</Label>
                            <p>{new Date(lesson.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Updated At</Label>
                            <p>{new Date(lesson.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

