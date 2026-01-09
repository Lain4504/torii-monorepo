import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { Accordion } from '@workspace/ui/components/accordion';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Layers, Plus, ChevronLeft, AlertCircle, GraduationCap, Clock, BookOpen } from 'lucide-react';
import { useCourse } from '@/api/services/courses';
import { useModules, useDeleteModule } from '@/api/services/modules';
import { useDeleteLesson } from '@/api/services/lesson';
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
import { ModuleItem } from '@/components/modules/module-item';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
    const { data: modulesData } = useModules({
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="p-4 rounded-full bg-destructive/10">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-semibold">Course not found</h2>
                    <p className="text-sm text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/courses')}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back to Courses
                </Button>
            </div>
        );
    }

    const totalDuration = modules.reduce((acc, m) => acc + (m.durationMinutes || 0), 0);
    const totalLessons = modules.reduce((acc, m) => {
        // This is approximate - actual lesson count would require fetching all lessons
        return acc;
    }, 0);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header Section - Improved with better spacing and visual hierarchy */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/40 supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-5 sm:py-6">
                        <div className="flex items-center gap-3 mb-5">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 gap-1.5 pl-2 pr-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer rounded-lg"
                                onClick={() => navigate('/courses')}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="font-medium">Back</span>
                            </Button>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            <div className="space-y-4 flex-1 min-w-0">
                                <div className="space-y-3">
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
                                        {course.title}
                                    </h1>
                                    {course.description && (
                                        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
                                            {course.description}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Course Metadata - Enhanced with icons and better spacing */}
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                                    <Badge 
                                        variant={course.status === 'published' ? 'default' : 'secondary'} 
                                        className="capitalize h-7 px-3 text-xs font-semibold shadow-sm"
                                    >
                                        {course.status}
                                    </Badge>
                                    {course.jlptLevel && (
                                        <>
                                            <Separator orientation="vertical" className="h-5 bg-border/60" />
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40">
                                                <GraduationCap className="h-4 w-4 text-primary/80" />
                                                <span className="text-foreground font-semibold">
                                                    {course.jlptLevel}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    <Separator orientation="vertical" className="h-5 bg-border/60" />
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40">
                                        <span className="text-foreground font-bold text-base">
                                            ${course.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button - Enhanced with better styling */}
                            <div className="flex-shrink-0 flex items-center gap-3">
                                <Button
                                    size="lg"
                                    className="rounded-xl px-6 sm:px-8 h-11 sm:h-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base font-semibold cursor-pointer"
                                    onClick={() => setCreateModuleOpen(true)}
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add Module
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Improved layout and spacing */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
                {/* Curriculum Header - Enhanced with better visual design */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                                Curriculum
                            </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pl-12">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 opacity-70" />
                                <span className="font-medium">
                                    {modules.length} {modules.length === 1 ? 'module' : 'modules'}
                                </span>
                            </div>
                            {totalDuration > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 opacity-70" />
                                        <span className="font-medium">{totalDuration} mins total</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modules List - Enhanced empty state and list styling */}
                {modules.length === 0 ? (
                    <div className="pt-8">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon" className="text-muted-foreground/40 mb-6">
                                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                                        <Layers className="h-12 w-12" />
                                    </div>
                                </EmptyMedia>
                                <EmptyTitle className="text-xl sm:text-2xl font-bold">Course is empty</EmptyTitle>
                                <EmptyDescription className="text-base max-w-md mx-auto text-muted-foreground">
                                    Start building your course by creating your first module. Modules help organize your content into logical sections.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button
                                    size="lg"
                                    onClick={() => setCreateModuleOpen(true)}
                                    className="gap-2 mt-6 rounded-xl px-8 h-11 font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all cursor-pointer"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create First Module
                                </Button>
                            </EmptyContent>
                        </Empty>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Accordion type="multiple" className="space-y-4">
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
                    </div>
                )}
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
