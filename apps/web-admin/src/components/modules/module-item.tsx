
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
import { Layers, FileText, Plus, MoreVertical, Pencil, Trash, BookOpen, Clock, Video, ClipboardList, ChevronDown, Sparkles, Hash } from 'lucide-react';
import { useLessons } from '@/api/services/lesson';
import type { ModuleResponseDTO, LessonResponseDTO } from '@workspace/schemas';
import { LessonContentType } from '@workspace/schemas';

// Helper to get icon for lesson type
const getLessonIcon = (type: string) => {
    switch (type) {
        case LessonContentType.VIDEO:
            return <Video className="h-3.5 w-3.5" />;
        case LessonContentType.ARTICLE:
            return <FileText className="h-3.5 w-3.5" />;
        case LessonContentType.QUIZ:
            return <ClipboardList className="h-3.5 w-3.5" />;
        default:
            return <FileText className="h-3.5 w-3.5" />;
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
            className="group flex items-center justify-between py-3 px-4 rounded-xl border border-border/20 bg-background/40 hover:bg-muted/10 hover:border-primary/20 transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 size-8 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                    {getLessonIcon(lesson.contentType)}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-foreground truncate group-hover:text-primary transition-colors">
                            {lesson.title}
                        </span>
                        {lesson.isPreview && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-black border-green-500/30 text-green-600 bg-green-500/5 uppercase tracking-widest">
                                Preview
                            </Badge>
                        )}
                        {lesson.isUnlocked && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-black border-blue-500/30 text-blue-600 bg-blue-500/5 uppercase tracking-widest">
                                Open
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/20 border border-border/20 mr-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                        {lesson.contentType}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(lesson);
                    }}
                    title="Config Unit"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(lesson);
                    }}
                    title="Delete Unit"
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
            className="border border-border/40 rounded-[1.5rem] bg-background/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-lg shadow-sm group/module"
        >
            <div className="flex items-center bg-transparent transition-all duration-300">
                {/* Custom Trigger with Left Chevron */}
                <AccordionPrimitive.Header className="flex flex-1 min-w-0">
                    <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-4 py-5 px-6 text-left hover:no-underline [&[data-state=open]>svg]:rotate-180 transition-all outline-none focus-visible:bg-muted/50 cursor-pointer">
                        <ChevronDown className="h-5 w-5 text-muted-foreground/50 shrink-0 transition-transform duration-300 group-hover/module:text-primary" />

                        <div className="flex items-center gap-5 flex-1 min-w-0">
                            <div className="flex-shrink-0 size-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5 group-hover/module:shadow-primary/20 group-hover/module:scale-105 transition-all duration-300">
                                <Layers className="size-5" />
                            </div>
                            <div className="flex flex-col items-start gap-1 flex-1 min-w-0 text-left">
                                <span className="font-black text-sm uppercase tracking-wider text-foreground leading-tight truncate w-full group-hover/module:text-primary transition-colors duration-300">
                                    {module.title}
                                </span>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/20 border border-border/20">
                                        <Hash className="size-3 opacity-50" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            IDX: {module.orderIndex}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/20 border border-border/20">
                                        <BookOpen className="size-3 opacity-50" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            {lessons.length} Units
                                        </span>
                                    </div>
                                    {module.durationMinutes != null && module.durationMinutes > 0 && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/20 border border-border/20">
                                            <Clock className="size-3 opacity-50" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                {module.durationMinutes}m
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>

                {/* Actions Section */}
                <div className="flex items-center gap-2 px-6 flex-shrink-0 py-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest hidden sm:inline-flex border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-300 rounded-xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddLesson(module.id);
                        }}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Append Unit
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl transition-colors duration-300"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] shadow-2xl border border-border/20 bg-background/80 backdrop-blur-3xl p-2">
                            <DropdownMenuItem onClick={() => onAddLesson(module.id)} className="sm:hidden cursor-pointer rounded-xl text-[10px] font-black uppercase tracking-widest py-3">
                                <Plus className="mr-2 h-4 w-4 opacity-50" /> Append Unit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditModule(module)} className="cursor-pointer rounded-xl text-[10px] font-black uppercase tracking-widest py-3">
                                <Pencil className="mr-2 h-4 w-4 opacity-50" /> Configure Module
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDeleteModule(module)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl text-[10px] font-black uppercase tracking-widest py-3"
                            >
                                <Trash className="mr-2 h-4 w-4 opacity-50" /> Delete Module
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AccordionContent className="pt-0 pb-0 px-0">
                <div className="border-t border-border/10 bg-muted/5 relative">
                    <div className="absolute left-10 top-0 bottom-0 w-px bg-border/20 hidden lg:block" />
                    <div className="p-4 sm:p-6 sm:pl-[3.5rem] lg:pl-[4.5rem] space-y-4">
                        {isLoading ? (
                            <div className="py-8 text-center flex justify-center">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 border border-border/20">
                                    <div className="h-4 w-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fetching Data...</span>
                                </div>
                            </div>
                        ) : lessons.length === 0 ? (
                            <div className="py-12 text-center rounded-3xl border border-dashed border-border/30 flex flex-col items-center justify-center gap-4 bg-background/20 backdrop-blur-sm">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/20">
                                    <Sparkles className="size-6 text-muted-foreground/40" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">Empty Module Protocol</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider max-w-[250px] mx-auto leading-relaxed">
                                        No instructional units detected in this container.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => onAddLesson(module.id)}
                                    className="gap-2 cursor-pointer rounded-xl mt-2 border-dashed border-border/40 hover:bg-primary/5 hover:border-primary/30 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all duration-300 h-10 px-6"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Initialize First Unit
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 relative z-10">
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
