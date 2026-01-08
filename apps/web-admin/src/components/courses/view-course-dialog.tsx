import {
    Dialog,
    DialogContent,
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
            <DialogContent className="max-w-2xl border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-4 bg-muted/30">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Course Details</DialogTitle>
                </DialogHeader>

                <div className="p-8 pt-4 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Title</Label>
                        <h3 className="text-xl font-semibold text-foreground px-1">{course.title}</h3>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Description</Label>
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-xl border border-border/20">
                            {course.description || 'No description provided.'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">JLPT Level</Label>
                            <div>
                                <Badge variant="outline" className="text-sm px-3 py-1 font-normal bg-background/50">{course.jlptLevel}</Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Price</Label>
                            <p className="font-medium text-lg px-1 tabular-nums">{formatPrice(course.price)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Status</Label>
                            <div>
                                <Badge
                                    variant={
                                        course.status === 'published'
                                            ? 'default'
                                            : course.status === 'draft'
                                                ? 'secondary'
                                                : 'outline'
                                    }
                                    className="capitalize text-sm px-3 py-1 shadow-none"
                                >
                                    {course.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Total Students</Label>
                            <p className="text-sm font-medium px-1">{course.totalStudents || 0}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Thumbnail</Label>
                        {course.thumbnailUrl ? (
                            <div className="mt-2 rounded-xl overflow-hidden border border-border/40 bg-muted/30 aspect-video relative shadow-sm max-w-sm">
                                <img src={course.thumbnailUrl} alt={course.title} className="object-cover w-full h-full" />
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground px-1 italic">No thumbnail uploaded</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Preview Video</Label>
                        {course.previewVideoUrl ? (
                            <div className="mt-2 text-sm text-primary break-all px-1 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                <a href={course.previewVideoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                                    View Video Content
                                </a>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground px-1 italic">No preview video uploaded</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/40">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Created At</Label>
                            <p className="text-xs text-muted-foreground font-mono">{new Date(course.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Updated At</Label>
                            <p className="text-xs text-muted-foreground font-mono">{new Date(course.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
