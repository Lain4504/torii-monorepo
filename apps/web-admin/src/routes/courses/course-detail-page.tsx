
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { Accordion } from '@workspace/ui/components/accordion';
import {
    Layers,
    Plus,
    ChevronLeft,
    AlertCircle,
    Sparkles,
    ShieldCheck,
    Fingerprint,
    Zap,
    Target, Clock
} from 'lucide-react';
import { useCourse } from '@/api/services/courses';
import { useModules } from '@/api/services/modules';
import type { ModuleResponseDTO, LessonResponseDTO } from '@workspace/schemas';

import { CreateModuleDialog } from '@/components/modules/create-module-dialog';
import { EditModuleDialog } from '@/components/modules/edit-module-dialog';
import { CreateLessonDialog } from '@/components/lessons/create-lesson-dialog';
import { EditLessonDialog } from '@/components/lessons/edit-lesson-dialog';
import { DeleteModuleDialog } from '@/components/modules/delete-module-dialog';
import { DeleteLessonDialog } from '@/components/lessons/delete-lesson-dialog';
import { ModuleItem } from '@/components/modules/module-item';
import { cn } from '@workspace/ui/lib/utils';
import { Card } from '@workspace/ui/components/card';
import { formatDateTime } from '@/lib/format-utils.ts';
import { PageLoading } from '@workspace/ui/components/page-loading';

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
    const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<ModuleResponseDTO | null>(null);

    const [createLessonOpen, setCreateLessonOpen] = useState(false);
    const [selectedModuleIdForLesson, setSelectedModuleIdForLesson] = useState<string | null>(null);
    const [editLessonOpen, setEditLessonOpen] = useState(false);
    const [deleteLessonOpen, setDeleteLessonOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<LessonResponseDTO | null>(null);

    const modules = modulesData?.data || [];

    const handleEditModule = (module: ModuleResponseDTO) => {
        setSelectedModule(module);
        setEditModuleOpen(true);
    };

    const handleDeleteModule = (module: ModuleResponseDTO) => {
        setSelectedModule(module);
        setDeleteModuleOpen(true);
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
        setSelectedLesson(lesson);
        setDeleteLessonOpen(true);
    };

    if (isLoadingCourse) {
        return (
            <PageLoading text="Accessing Knowledge Node..." className="min-h-[60vh]" />
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700 max-w-lg mx-auto px-6">
                <div className="p-8 rounded-[2.5rem] bg-destructive/5 border border-dashed border-destructive/20 relative group">
                    <div className="absolute inset-0 bg-destructive/5 blur-3xl rounded-full opacity-50" />
                    <AlertCircle className="size-16 text-destructive/40 relative z-10 mx-auto" />
                </div>
                <div className="space-y-4 text-center relative z-10">
                    <h2 className="text-5xl font-serif font-bold tracking-tight italic leading-none">Node Sync Failed</h2>
                    <p className="text-[12px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed">
                        Hệ thống không tìm thấy định danh bài giảng được yêu cầu. <br />
                        Có thể tài nguyên đã được di chuyển hoặc xóa bỏ khỏi <span className="font-serif italic text-foreground px-1">Torii Matrix</span>.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-border/20 bg-background/50 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group"
                    onClick={() => navigate('/courses')}
                >
                    <ChevronLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Control Center
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-40 animate-in fade-in duration-700">
            {/* Zen Ambient Backgrounds */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-primary/[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-blue-500/[0.02] blur-[100px] rounded-full" />
            </div>

            {/* Premium Sticky Header */}
            <div className="sticky top-0 z-40 bg-background/40 backdrop-blur-3xl border-b border-border/10 px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 min-w-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-0 text-muted-foreground/40 hover:text-primary gap-2 transition-all hover:bg-transparent"
                            onClick={() => navigate('/courses')}
                        >
                            <ChevronLeft className="size-4" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Knowledge Hub</span>
                        </Button>
                        <div className="flex items-center gap-4 overflow-hidden">
                            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tighter text-foreground italic truncate py-1">
                                {course.title}
                            </h1>
                            <div className={cn(
                                "hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm flex-shrink-0",
                                course.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            )}>
                                <div className={cn("size-1 rounded-full mr-2", course.status === 'published' && 'bg-emerald-500 animate-pulse')} />
                                {course.status}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-6 px-10 py-5 rounded-3xl bg-muted/20 border border-border/10 hidden lg:flex">
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Entities</p>
                                <p className="text-3xl font-serif font-bold italic text-primary">{modules.length}</p>
                            </div>
                            <div className="w-px h-10 bg-border/20 mx-4" />
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Matrix</p>
                                <p className="text-3xl font-serif font-bold italic text-foreground">{course.jlptLevel || 'N/A'}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setCreateModuleOpen(true)}
                            className="h-16 px-10 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
                        >
                            Append Module
                            <Plus className="ml-3 size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Portal */}
            <div className="max-w-7xl mx-auto px-8 py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Curriculum */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="flex items-center justify-between px-2">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-serif font-bold tracking-tight italic flex items-center gap-4">
                                    <Target className="size-7 text-primary" />
                                    Knowledge <span className="text-primary not-italic">Architecture</span>
                                </h2>
                                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic pl-9">Structural hierarchy of the learning repository.</p>
                            </div>
                        </div>

                        {modules.length === 0 ? (
                            <div className="p-20 text-center space-y-8 bg-muted/10 rounded-[3.5rem] border border-dashed border-border/20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
                                <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mx-auto relative group-hover:scale-110 transition-transform duration-500">
                                    <Layers className="size-10 text-primary opacity-20" />
                                    <Sparkles className="absolute -top-2 -right-2 size-6 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h3 className="text-2xl font-black uppercase italic tracking-tight">System Initialization Required</h3>
                                    <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic max-w-sm mx-auto">
                                        Chu trình bài giảng chưa được cấu hình. <br />
                                        Hãy khởi tạo Knowledge Node đầu tiên để hoàn thiện cấu trúc repository.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setCreateModuleOpen(true)}
                                    className="h-14 px-10 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:-translate-y-1 transition-all shadow-xl"
                                >
                                    Deploy First Node
                                </Button>
                            </div>
                        ) : (
                            <Card className="rounded-[3.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden p-8 lg:p-12">
                                <Accordion type="multiple" className="space-y-6">
                                    {modules.map((module, idx) => (
                                        <div key={module.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <ModuleItem
                                                module={module}
                                                onEditModule={handleEditModule}
                                                onDeleteModule={handleDeleteModule}
                                                onAddLesson={handleAddLesson}
                                                onEditLesson={handleEditLesson}
                                                onDeleteLesson={handleDeleteLesson}
                                            />
                                        </div>
                                    ))}
                                </Accordion>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Metadata & Details */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 p-8 space-y-10 group">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                        <Fingerprint className="size-5" />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] italic">Meta signatures</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-1 px-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Protocol Identifier</p>
                                        <p className="text-[13px] font-black italic text-foreground truncate uppercase">{course.id}</p>
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Valuation Sync</p>
                                        <p className="text-4xl font-serif font-bold italic text-primary tracking-tighter">{formatCurrency(course.price)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border/10 space-y-6">
                                <div className="flex items-center gap-3 text-muted-foreground/60 transition-colors group-hover:text-primary">
                                    <Clock className="size-4 opacity-40" />
                                    <p className="text-[9px] font-black uppercase tracking-widest italic">Last Registry Sync: {formatDateTime(course.updatedAt)}</p>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground/60">
                                    <ShieldCheck className="size-4 opacity-40 text-emerald-500" />
                                    <p className="text-[9px] font-black uppercase tracking-widest italic text-emerald-500/60">Verified Content Repository</p>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Guide / Help */}
                        <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <Zap className="size-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Operational Tip</h4>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] italic leading-relaxed">
                                Use high-impact cover images and meta-descriptions to increase the discoverability index in Torii Marketplace.
                            </p>
                        </div>
                    </div>
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
                <>
                    <EditModuleDialog
                        open={editModuleOpen}
                        onOpenChange={setEditModuleOpen}
                        module={selectedModule}
                        existingModules={modules}
                        courseTitle={course.title}
                    />
                    <DeleteModuleDialog
                        open={deleteModuleOpen}
                        onOpenChange={setDeleteModuleOpen}
                        module={selectedModule}
                    />
                </>
            )}

            {selectedModuleIdForLesson && (
                <CreateLessonDialog
                    open={createLessonOpen}
                    onOpenChange={setCreateLessonOpen}
                    moduleId={selectedModuleIdForLesson}
                />
            )}

            {selectedLesson && (
                <>
                    <EditLessonDialog
                        open={editLessonOpen}
                        onOpenChange={setEditLessonOpen}
                        lesson={selectedLesson}
                    />
                    <DeleteLessonDialog
                        open={deleteLessonOpen}
                        onOpenChange={setDeleteLessonOpen}
                        lesson={selectedLesson}
                    />
                </>
            )}
        </div>
    );
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};
