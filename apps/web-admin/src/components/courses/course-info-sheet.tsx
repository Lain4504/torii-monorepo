import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { Badge } from '@workspace/ui/components/badge';
import { BookOpen, Users, Calendar, Globe, DollarSign, Layers, ArrowRight } from 'lucide-react';
import type { CourseResponseDTO } from '@workspace/schemas';
import { useNavigate } from 'react-router-dom';

interface CourseInfoSheetProps {
    course: CourseResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CourseInfoSheet({ course, open, onOpenChange }: CourseInfoSheetProps) {
    const navigate = useNavigate();

    if (!course) return null;

    const handleManageContent = () => {
        onOpenChange(false);
        navigate(`/courses/${course.id}`);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-md">
                <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-border/60 bg-background/50">
                            {course.id.substring(0, 8)}
                        </Badge>
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="uppercase tracking-wider font-semibold text-[10px] px-2.5 py-0.5 shadow-none">
                            {course.status}
                        </Badge>
                    </div>
                    <div className="space-y-1.5">
                        <SheetTitle className="text-2xl font-bold leading-tight tracking-tight text-foreground">
                            {course.title}
                        </SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground/80">
                            Course key metrics and metadata overview
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="px-6 py-8 space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/40 shadow-sm transition-all hover:shadow-md hover:border-border/60">
                                <div className="flex items-center gap-2.5 text-muted-foreground mb-2">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wide">Students</span>
                                </div>
                                <div className="text-3xl font-bold text-foreground tracking-tight">{course.totalStudents || 0}</div>
                            </div>
                            <div className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/40 shadow-sm transition-all hover:shadow-md hover:border-border/60">
                                <div className="flex items-center gap-2.5 text-muted-foreground mb-2">
                                    <div className="p-1.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wide">Price</span>
                                </div>
                                <div className="text-3xl font-bold text-foreground tracking-tight">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(course.price))}
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-border/40" />

                        {/* Details List */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Course Details
                            </h3>

                            <div className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-5 text-sm">
                                <Globe className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide block mb-1">Slug</span>
                                    <code className="text-sm bg-muted/40 px-2 py-1 rounded-md text-foreground font-mono block break-all border border-border/20">{course.slug}</code>
                                </div>

                                <Layers className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide block mb-1">JLPT Level</span>
                                    <span className="font-medium text-foreground bg-accent/20 px-2 py-0.5 rounded text-sm inline-block">{course.jlptLevel || 'N/A'}</span>
                                </div>

                                <Calendar className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide block mb-1">Last Updated</span>
                                    <span className="font-medium text-foreground">{new Date(course.updatedAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-border/40" />

                        {/* Description */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-primary" />
                                Description
                            </h3>
                            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-card/30 p-4 rounded-lg border border-border/20">
                                {course.description || 'No description provided.'}
                            </div>
                        </div>

                        {/* Thumbnail Preview if available */}
                        {course.thumbnailUrl && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">Thumbnail</h3>
                                <div className="rounded-xl border border-border/40 overflow-hidden bg-muted/30 aspect-video relative shadow-sm">
                                    <img src={course.thumbnailUrl} alt={course.title} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t border-border/40 bg-muted/5 backdrop-blur-sm sticky bottom-0 z-10">
                    <Button size="lg" className="w-full gap-2 shadow-lg hover:shadow-xl transition-all rounded-xl h-12 text-base font-medium" onClick={handleManageContent}>
                        <Layers className="h-5 w-5" /> Manage Curriculum
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
