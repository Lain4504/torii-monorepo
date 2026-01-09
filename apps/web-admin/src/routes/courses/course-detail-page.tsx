import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { Accordion } from '@workspace/ui/components/accordion';
import { Badge } from '@workspace/ui/components/badge';
import {
    Layers,
    Plus,
    ChevronLeft,
    AlertCircle,
    GraduationCap,
    Clock,
    BookOpen,
    DollarSign
} from 'lucide-react';
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
                    <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="p-6 rounded-full bg-destructive/5 text-destructive ring-1 ring-destructive/10">
                    <AlertCircle className="h-10 w-10" />
                </div>
                <div className="space-y-2 max-w-sm">
                    <h2 className="text-2xl font-bold tracking-tight">Course Not Found</h2>
                    <p className="text-muted-foreground">The course you are looking for may have been removed or does not exist.</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => navigate('/courses')}>
                    <ChevronLeft className="h-4 w-4" /> Back to Courses
                </Button>
            </div>
        );
    }

    // Calculate metadata
    const totalDuration = modules.reduce((acc, m) => acc + (m.durationMinutes || 0), 0);
    // Removed unused totalLessons calculation

    return (
        <div className="min-h-screen bg-muted/5 pb-20">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <div className="container max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground gap-1.5 -ml-2"
                        onClick={() => navigate('/courses')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="font-medium">All Courses</span>
                    </Button>
                    <div className="flex items-center gap-2">
                        {/* Optional: Add top-right actions like 'Preview Course' or 'Settings' here */}
                    </div>
                </div>
            </div>

            {/* Course Header Hero */}
            <div className="bg-background border-b border-border/40 pb-8 pt-6">
                <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
                    {/* Header Top Row: Title & Badge */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <Badge
                                        variant={course.status === 'published' ? 'default' : 'secondary'}
                                        className="h-6 px-2.5 text-xs uppercase tracking-wider font-semibold rounded-md"
                                    >
                                        {course.status}
                                    </Badge>
                                    {course.isFree &&
                                        <Badge variant="outline" className="h-6 px-2.5 text-xs font-semibold rounded-md border-green-500/30 text-green-600 bg-green-500/5">
                                            Free
                                        </Badge>
                                    }
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                                    {course.title}
                                </h1>
                            </div>

                            {course.description && (
                                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                                    {course.description}
                                </p>
                            )}

                            {/* Stats Grid */}
                            <div className="flex flex-wrap items-center gap-y-4 gap-x-8 pt-2 text-sm text-foreground/80 font-medium">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                        <Layers className="h-4 w-4" />
                                    </div>
                                    <span>{modules.length} Modules</span>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    {totalDuration > 0 ? (
                                        <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m content</span>
                                    ) : (
                                        <span>0m content</span>
                                    )}
                                </div>

                                {course.jlptLevel && (
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
                                            <GraduationCap className="h-4 w-4" />
                                        </div>
                                        <span>{course.jlptLevel}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-md bg-green-500/10 text-green-600">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                    <span>{course.price > 0 ? `$${course.price.toLocaleString()}` : 'Free'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-start gap-3 flex-shrink-0 pt-2">
                            <Button
                                size="lg"
                                className="h-11 px-6 shadow-lg shadow-primary/20 rounded-xl font-semibold hover:scale-[1.02] transition-transform"
                                onClick={() => setCreateModuleOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Module
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-muted-foreground/70" />
                            Curriculum
                        </h2>
                        {modules.length > 0 &&
                            <span className="text-sm text-muted-foreground font-medium bg-background border border-border/60 px-3 py-1 rounded-full shadow-sm">
                                Total {modules.length} {modules.length === 1 ? 'Section' : 'Sections'}
                            </span>
                        }
                    </div>

                    {modules.length === 0 ? (
                        <div className="bg-background rounded-2xl border border-dashed border-border/60 p-12">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon" className="mb-6 mx-auto">
                                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                                            <Layers className="h-8 w-8 text-muted-foreground/60" />
                                        </div>
                                    </EmptyMedia>
                                    <EmptyTitle className="text-xl font-bold">No modules yet</EmptyTitle>
                                    <EmptyDescription className="max-w-md mx-auto mt-2">
                                        Start building your course structure by creating your first module. Modules act as containers for your lessons.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent className="mt-8 flex justify-center">
                                    <Button onClick={() => setCreateModuleOpen(true)} className="min-w-[160px] rounded-xl">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Module
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
