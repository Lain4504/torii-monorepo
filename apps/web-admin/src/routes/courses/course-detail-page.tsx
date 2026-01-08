import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Badge } from '@workspace/ui/components/badge';
import { Layers, FileText, Plus, MoreVertical, Pencil, Trash, GripVertical, ChevronLeft, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { useCourse } from '@/api/services/courses';
import { useModules, useDeleteModule } from '@/api/services/modules';
import { useLessons, useDeleteLesson } from '@/api/services/lesson';
import { toast } from '@workspace/ui/components/sonner';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@workspace/ui/components/empty';
import type { ModuleResponseDTO, LessonResponseDTO } from '@workspace/schemas';

import { CreateModuleDialog } from '@/components/modules/create-module-dialog';
import { EditModuleDialog } from '@/components/modules/edit-module-dialog';
import { CreateLessonDialog } from '@/components/lessons/create-lesson-dialog';
import { EditLessonDialog } from '@/components/lessons/edit-lesson-dialog';

// Sub-component for individual Lesson row
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
        <div className="group flex items-center justify-between py-3 px-4 min-h-[56px] hover:bg-muted/40 rounded-lg transition-all duration-200 border border-transparent hover:border-border/40 bg-transparent">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2 rounded-md bg-muted/30 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground block truncate pr-2 group-hover:text-primary transition-colors">{lesson.title}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground capitalize">{lesson.contentType}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background hover:text-primary transition-colors"
                    onClick={() => onEdit(lesson)}
                    title="Edit Lesson"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => onDelete(lesson)}
                    title="Delete Lesson"
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// Sub-component for Module Item
function ModuleItem({
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
    // Fetch lessons for this module
    const { data: lessonsData, isLoading } = useLessons({
        page: 1,
        limit: 100,
        // @ts-ignore - Assuming module filtering is supported
        moduleId: module.id
    });

    const lessons = lessonsData?.data || [];

    return (
        <AccordionItem
            value={module.id}
            className="border border-border/40 rounded-xl shadow-sm overflow-hidden bg-card transition-all hover:shadow-md hover:border-border/60"
        >
            <div className="flex items-stretch group transition-colors min-h-[64px]">
                {/* Drag Handle - Hidden on mobile */}
                <div className="hidden sm:flex items-center pl-3 pr-2 text-muted-foreground/20 group-hover:text-muted-foreground/50 cursor-grab active:cursor-grabbing transition-colors">
                    <GripVertical className="h-5 w-5" />
                </div>

                {/* Main Trigger Area */}
                <AccordionTrigger className="flex-1 hover:no-underline py-3 px-4 sm:pr-3 [&[data-state=open]>div>svg]:rotate-180">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-secondary/50 flex items-center justify-center text-primary border border-border/50 group-hover:scale-105 transition-transform">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start gap-1 flex-1 min-w-0 text-left">
                            <span className="font-semibold text-base text-foreground/90 leading-tight truncate w-full pr-2 group-hover:text-primary transition-colors">
                                {module.title}
                            </span>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                                </span>
                                {module.durationMinutes != null && module.durationMinutes > 0 && (
                                    <>
                                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-border" />
                                        <span className="hidden sm:flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {module.durationMinutes} mins
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 px-3 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddLesson(module.id);
                        }}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">Add Lesson</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onAddLesson(module.id)} className="sm:hidden">
                                <Plus className="mr-2 h-4 w-4" /> Add Lesson
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditModule(module)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Module
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDeleteModule(module)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/5"
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete Module
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AccordionContent className="pt-0 pb-4 px-3 sm:px-4">
                <div className="pt-4 border-t border-border/40 sm:ml-[3.5rem]">
                    {isLoading ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            <div className="inline-flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                Loading lessons...
                            </div>
                        </div>
                    ) : lessons.length === 0 ? (
                        <div className="py-8 text-center bg-muted/20 rounded-lg border border-dashed border-border/50 flex flex-col items-center justify-center gap-3">
                            <div className="p-3 rounded-full bg-background shadow-sm">
                                <FileText className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">No lessons yet</p>
                                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                    Add lessons to build out this module's content
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 h-8 text-xs"
                                onClick={() => onAddLesson(module.id)}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Add Lesson
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
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
            </AccordionContent>
        </AccordionItem>
    );
}

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: modulesData, isLoading: isLoadingModules } = useModules({
        page: 1, limit: 100, courseId: id
    } as any);

    // Dialog States
    const [createModuleOpen, setCreateModuleOpen] = useState(false);
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<ModuleResponseDTO | null>(null);

    const [createLessonOpen, setCreateLessonOpen] = useState(false);
    const [selectedModuleIdForLesson, setSelectedModuleIdForLesson] = useState<string | null>(null);
    const [editLessonOpen, setEditLessonOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<LessonResponseDTO | null>(null);

    // Mutations
    const { mutate: deleteModule } = useDeleteModule();
    const { mutate: deleteLesson } = useDeleteLesson();

    const modules = modulesData?.data || [];

    const handleEditModule = (module: ModuleResponseDTO) => {
        setSelectedModule(module);
        setEditModuleOpen(true);
    };

    const handleDeleteModule = (module: ModuleResponseDTO) => {
        if (confirm(`Are you sure you want to delete module "${module.title}"?`)) {
            deleteModule(module.id);
            toast.success('Module deleted');
        }
    };

    const handleAddLesson = (moduleId: string) => {
        setSelectedModuleIdForLesson(moduleId);
        setCreateLessonOpen(true);
    };

    const handleEditLesson = (lesson: LessonResponseDTO) => {
        setSelectedLesson(lesson);
        setEditLessonOpen(true);
    };

    const handleDeleteLesson = (lesson: LessonResponseDTO) => {
        if (confirm(`Are you sure you want to delete lesson "${lesson.title}"?`)) {
            deleteLesson(lesson.id);
            toast.success('Lesson deleted');
        }
    };

    if (isLoadingCourse) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted/50 animate-pulse" />
                    <div className="h-3 w-32 rounded-full bg-muted/50 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
                <div className="p-4 rounded-full bg-destructive/10">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-semibold">Course not found</h2>
                    <p className="text-sm text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/courses')} className="min-h-[44px] px-6">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back to Courses
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
            {/* Header Section - Zen style with better mobile layout */}
            <div className="space-y-6">
                {/* Back Navigation */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => navigate('/courses')}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Back to Courses</span>
                    <span className="sm:hidden">Back</span>
                </Button>

                {/* Course Header - Mobile optimized */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-4 flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent break-words">
                            {course.title}
                        </h1>

                        {/* Meta Info - Stack on mobile */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                            <Badge variant="outline" className="px-2.5 py-1 font-medium bg-background/50">
                                {course.status}
                            </Badge>
                            {course.jlptLevel && (
                                <>
                                    <span className="text-muted-foreground/40">•</span>
                                    <span className="text-muted-foreground">{course.jlptLevel}</span>
                                </>
                            )}
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5" />
                                {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
                            </span>
                        </div>

                        {course.description && (
                            <p className="text-muted-foreground leading-relaxed max-w-3xl">
                                {course.description}
                            </p>
                        )}
                    </div>

                    {/* Stats Card - Responsive width */}
                    <div className="w-full sm:w-auto lg:min-w-[200px]">
                        <div className="p-5 rounded-lg bg-gradient-to-br from-card to-card/50 border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                                Total Students
                            </p>
                            <p className="text-3xl font-bold text-primary">
                                {course.totalStudents || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Curriculum Section */}
            <div className="space-y-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        Course Curriculum
                    </h2>
                    <Button
                        size="default"
                        className="w-full sm:w-auto rounded-full shadow-sm hover:shadow-md transition-all gap-2 min-h-[44px]"
                        onClick={() => setCreateModuleOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Module</span>
                    </Button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {modules.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon" className="text-muted-foreground/40 mb-2">
                                    <Layers className="h-6 w-6" />
                                </EmptyMedia>
                                <EmptyTitle>No modules yet</EmptyTitle>
                                <EmptyDescription>
                                    Start building your course curriculum by creating your first module.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button
                                    onClick={() => setCreateModuleOpen(true)}
                                    className="min-h-[44px] px-6 rounded-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Module
                                </Button>
                            </EmptyContent>
                        </Empty>
                    ) : (
                        <Accordion type="multiple" className="w-full space-y-3 sm:space-y-4">
                            {modules.map((module) => (
                                <ModuleItem
                                    key={module.id}
                                    module={module}
                                    onEditModule={handleEditModule}
                                    onDeleteModule={handleDeleteModule}
                                    onAddLesson={handleAddLesson}
                                    onEditLesson={handleEditLesson}
                                    onDeleteLesson={handleDeleteLesson}
                                />
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <CreateModuleDialog
                open={createModuleOpen}
                onOpenChange={setCreateModuleOpen}
                courseId={id}
                courseTitle={course.title}
                existingModules={modules}
            />

            {selectedModule && (
                <EditModuleDialog
                    open={editModuleOpen}
                    onOpenChange={setEditModuleOpen}
                    module={selectedModule}
                    existingModules={modules}
                    courseTitle={course.title}
                />
            )}

            {selectedModuleIdForLesson && (
                <CreateLessonDialog
                    open={createLessonOpen}
                    onOpenChange={setCreateLessonOpen}
                    moduleId={selectedModuleIdForLesson}
                />
            )}

            {selectedLesson && (
                <EditLessonDialog
                    open={editLessonOpen}
                    onOpenChange={setEditLessonOpen}
                    lesson={selectedLesson}
                />
            )}
        </div>
    );
}
