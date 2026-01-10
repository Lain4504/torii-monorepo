
import { Button } from '@workspace/ui/components/button';
import {
    AccordionContent,
    AccordionItem,
    AccordionPrimitive
} from '@workspace/ui/components/accordion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Badge } from '@workspace/ui/components/badge';
import { Layers, FileText, Plus, MoreVertical, Pencil, Trash, BookOpen, Clock, Video, ClipboardList, ChevronDown } from 'lucide-react';
import { useLessons } from '@/api/services/lesson';
import type { ModuleResponseDTO, LessonResponseDTO } from '@workspace/schemas';
import { LessonContentType } from '@workspace/schemas';

// Helper to get icon for lesson type
const getLessonIcon = (type: string) => {
    switch (type) {
        case LessonContentType.VIDEO:
            return <Video className="h-4 w-4" />;
        case LessonContentType.ARTICLE:
            return <FileText className="h-4 w-4" />;
        case LessonContentType.QUIZ:
            return <ClipboardList className="h-4 w-4" />;
        default:
            return <FileText className="h-4 w-4" />;
    }
};

// Sub-component for individual Lesson row - Enhanced UI
function LessonRow({
    lesson,
    onEdit,
    onDelete
}: {
    lesson: LessonResponseDTO;
    onEdit: (lesson: LessonResponseDTO) => void;
    onDelete: (lesson: LessonResponseDTO) => void;
}) {
    return (
        <div
            onClick={() => onEdit(lesson)}
            className="group flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/60 transition-colors duration-200 border border-transparent hover:border-border/40 cursor-pointer"
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 h-9 w-9 rounded-md bg-background border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/20 transition-colors">
                    {getLessonIcon(lesson.contentType)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                            {lesson.title}
                        </span>
                        {lesson.isPreview && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal border-green-500/30 text-green-600 bg-green-500/5">
                                Free
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="text-xs text-muted-foreground mr-3 font-medium px-2 py-0.5 rounded-full bg-background border border-border/40 uppercase tracking-wider">
                    {lesson.contentType}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(lesson);
                    }}
                    title="Edit Lesson"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(lesson);
                    }}
                    title="Delete Lesson"
                >
                    <Trash className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

// Main Module Item Component
export function ModuleItem({
    module,
    onEditModule,
    onDeleteModule,
    onAddLesson,
    onEditLesson,
    onDeleteLesson
}: {
    module: ModuleResponseDTO;
    onEditModule: (module: ModuleResponseDTO) => void;
    onDeleteModule: (module: ModuleResponseDTO) => void;
    onAddLesson: (moduleId: string) => void;
    onEditLesson: (lesson: LessonResponseDTO) => void;
    onDeleteLesson: (lesson: LessonResponseDTO) => void;
}) {
    const { data: lessonsData, isLoading } = useLessons({
        page: 1,
        limit: 100,
        moduleId: module.id
    });

    const lessons = lessonsData?.data || [];

    return (
        <AccordionItem
            value={module.id}
            className="border border-border/60 rounded-xl bg-card overflow-hidden transition-all duration-200 hover:border-border/80 hover:shadow-sm"
        >
            <div className="flex items-center group bg-card/50 hover:bg-card/80 transition-all duration-200">
                {/* Custom Trigger with Left Chevron */}
                <AccordionPrimitive.Header className="flex flex-1 min-w-0">
                    <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-4 py-5 px-6 text-left hover:no-underline [&[data-state=open]>svg]:rotate-180 transition-all outline-none focus-visible:bg-muted/50 cursor-pointer">
                        <ChevronDown className="h-5 w-5 text-muted-foreground/70 shrink-0 transition-transform duration-200" />

                        <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                            <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-sm shadow-primary/5 group-hover:shadow-primary/10 transition-all duration-200">
                                <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="flex flex-col items-start gap-1.5 flex-1 min-w-0 text-left">
                                <span className="font-bold text-base sm:text-lg text-foreground leading-tight truncate w-full group-hover:text-primary transition-colors duration-200">
                                    {module.title}
                                </span>
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 border border-border/40">
                                        <BookOpen className="h-3.5 w-3.5 opacity-70" />
                                        <span className="font-semibold text-foreground/80">
                                            {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                                        </span>
                                    </div>
                                    {module.durationMinutes != null && module.durationMinutes > 0 && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 border border-border/40">
                                            <Clock className="h-3.5 w-3.5 opacity-70" />
                                            <span className="font-semibold text-foreground/80">
                                                {module.durationMinutes} mins
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>

                {/* Actions Section - Separated from Trigger */}
                <div className="flex items-center gap-2 px-4 sm:px-6 flex-shrink-0 py-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 text-sm font-semibold hidden sm:inline-flex border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddLesson(module.id);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Add Lesson
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg transition-colors duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border border-border/50">
                            <DropdownMenuItem onClick={() => onAddLesson(module.id)} className="sm:hidden cursor-pointer">
                                <Plus className="mr-2 h-4 w-4" /> Add Lesson
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditModule(module)} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" /> Edit Module
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDeleteModule(module)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete Module
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AccordionContent className="pt-0 pb-3 px-0">
                <div className="border-t border-border/50 bg-muted/5">
                    <div className="p-4 sm:p-6 sm:pl-[5.5rem] lg:pl-[6.5rem]">
                        {isLoading ? (
                            <div className="py-12 text-center">
                                <div className="inline-flex flex-col items-center gap-3">
                                    <div className="h-6 w-6 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
                                    <p className="text-sm text-muted-foreground font-medium">Loading lessons...</p>
                                </div>
                            </div>
                        ) : lessons.length === 0 ? (
                            <div className="py-12 text-center rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-4 bg-background/60 backdrop-blur-sm">
                                <div className="p-4 rounded-full bg-muted/40 border border-border/40">
                                    <FileText className="h-7 w-7 text-muted-foreground/60" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-base sm:text-lg font-semibold text-foreground">No lessons yet</p>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                        This module is empty. Start by adding your first lesson to begin building your course content.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => onAddLesson(module.id)}
                                    className="gap-2 cursor-pointer rounded-lg mt-2 border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Lesson
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {lessons.map((lesson) => (
                                    <LessonRow
                                        key={lesson.id}
                                        lesson={lesson}
                                        onEdit={onEditLesson}
                                        onDelete={onDeleteLesson}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

