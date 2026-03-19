import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    LayoutTemplate,
} from 'lucide-react';
import { SyllabusHeader } from '@/components/academy/syllabus-builder/syllabus-header';
import { ModuleList } from '@/components/academy/syllabus-builder/module-list';
import { SyllabusSidebar } from '@/components/academy/syllabus-builder/syllabus-sidebar';
import { SyllabusActionDialogs } from '@/components/academy/syllabus-builder/dialogs/syllabus-action-dialogs';
import { ModuleDialogs } from '@/components/academy/syllabus-builder/dialogs/module-dialogs';
import { LessonSheets } from '@/components/academy/syllabus-builder/dialogs/lesson-sheets';
import { useAcademySyllabuses, useCreateAcademySyllabus, useCloneAcademySyllabus, useLockAcademySyllabus } from '@/lib/api/services/academy-syllabuses';
import { useCreateAcademyLesson, useUpdateAcademyLesson, useDeleteAcademyLesson } from '@/lib/api/services/academy-lessons';
import { toast } from '@workspace/ui/components/sonner';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import type { StandardApiResponse } from '@workspace/schemas';
export default function SyllabusBuilderPage() {
    // Ở route hiện tại, :id chính là courseProfileId
    const { id: courseProfileId } = useParams<{ id: string }>();
    const { data: syllabuses, isLoading } = useAcademySyllabuses(courseProfileId!);
    const [selectedSyllabusId, setSelectedSyllabusId] = useState<string | null>(null);
    const selectedSyllabus = syllabuses?.find((s) => s.id === selectedSyllabusId) ?? syllabuses?.[0];
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const createSyllabusMutation = useCreateAcademySyllabus();
    const cloneSyllabusMutation = useCloneAcademySyllabus();
    const lockSyllabusMutation = useLockAcademySyllabus();
    const queryClient = useQueryClient();

    // Dialog state: tạo syllabus đầu tiên
    const [confirmInitialOpen, setConfirmInitialOpen] = useState(false);

    // Dialog state: tạo module mới
    const [createModuleOpen, setCreateModuleOpen] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');


    // Dialog state: tạo bài học mới
    const [createLessonOpen, setCreateLessonOpen] = useState(false);
    const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<any | null>(null);

    // Dialog state: xem chi tiết bài học
    const [viewLessonOpen, setViewLessonOpen] = useState(false);
    const [viewLesson, setViewLesson] = useState<any | null>(null);

    // Dialog state: chỉnh sửa bài học
    const [editLessonOpen, setEditLessonOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any | null>(null);

    // Dialog state: clone giáo trình
    const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
    const [cloneNewVersion, setCloneNewVersion] = useState('');
    const [cloneNewName, setCloneNewName] = useState('');

    // Dialog state: lock syllabus
    const [lockConfirmOpen, setLockConfirmOpen] = useState(false);

    // Dialog state: delete lesson
    const [deleteLessonConfirm, setDeleteLessonConfirm] = useState<{ open: boolean, lessonId: string | null, lessonTitle: string | null }>({
        open: false,
        lessonId: null,
        lessonTitle: null
    });

    // Dialog state: delete module
    const [deleteModuleConfirm, setDeleteModuleConfirm] = useState<{ open: boolean, moduleId: string | null, moduleTitle: string | null }>({
        open: false,
        moduleId: null,
        moduleTitle: null
    });

    // Dialog state: edit module
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<{ id: string; title: string } | null>(null);



    // Mutation: tạo Module mới trong syllabus
    const createModuleMutation = useMutation({
        mutationFn: async (input: { title: string }) => {
            if (!selectedSyllabus) throw new Error('Không có syllabus nào được chọn');

            const orderIndex =
                (selectedSyllabus.modules?.length ?? 0) +
                1;

            const res = await apiClient.post<StandardApiResponse<{ item: any }>>(
                `/api/academy/syllabuses/${selectedSyllabus.id}/modules`,
                { title: input.title, orderIndex },
            );
            return res.data.data!.item;
        },
        onSuccess: async () => {
            if (courseProfileId) {
                await queryClient.invalidateQueries({ queryKey: ['academy-syllabuses', courseProfileId] });
            }
            toast.success('Đã tạo Module mới');
            setCreateModuleOpen(false);
            setNewModuleTitle('');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Không thể tạo Module');
        },
    });

    // Mutation: xóa Module trong syllabus
    const deleteModuleMutation = useMutation({
        mutationFn: async (moduleId: string) => {
            if (!selectedSyllabus) throw new Error('Không có syllabus nào được chọn');
            const res = await apiClient.delete<StandardApiResponse<any>>(
                `/api/academy/syllabuses/${selectedSyllabus.id}/modules/${moduleId}`
            );
            return res.data;
        },
        onSuccess: async () => {
            if (courseProfileId) {
                await queryClient.invalidateQueries({ queryKey: ['academy-syllabuses', courseProfileId] });
            }
            toast.success('Đã xóa Module');
            setDeleteModuleConfirm({ open: false, moduleId: null, moduleTitle: null });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Không thể xóa Module');
        },
    });

    // Mutation: cập nhật Module trong syllabus
    const updateModuleMutation = useMutation({
        mutationFn: async (input: { id: string; title: string }) => {
            if (!selectedSyllabus) throw new Error('Không có syllabus nào được chọn');
            const res = await apiClient.put<StandardApiResponse<{ item: any }>>(
                `/api/academy/syllabuses/${selectedSyllabus.id}/modules/${input.id}`,
                { title: input.title },
            );
            return res.data.data!.item;
        },
        onSuccess: async () => {
            if (courseProfileId) {
                await queryClient.invalidateQueries({ queryKey: ['academy-syllabuses', courseProfileId] });
            }
            toast.success('Đã cập nhật Module thành công');
            setEditModuleOpen(false);
            setEditingModule(null);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Không thể cập nhật Module');
        },
    });

    const createLessonMutation = useCreateAcademyLesson();
    const updateLessonMutation = useUpdateAcademyLesson();
    const deleteLessonMutation = useDeleteAcademyLesson();

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const handleCreateInitialSyllabus = async () => {
        try {
            await createSyllabusMutation.mutateAsync({
                courseProfileId: courseProfileId!,
                version: 'v1.0.0',
                name: 'Giáo trình gốc'
            });
            toast.success('Đã tạo syllabus thành công');
            setConfirmInitialOpen(false);
        } catch (error) {
            toast.error('Không thể tạo syllabus');
        }
    };

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) {
            toast.error('Vui lòng nhập tên Module');
            return;
        }
        await createModuleMutation.mutateAsync({ title: newModuleTitle.trim() });
    };


    const handleCloneSyllabus = async () => {
        if (!selectedSyllabus || !cloneNewVersion.trim()) return;
        try {
            const item = await cloneSyllabusMutation.mutateAsync({
                id: selectedSyllabus.id,
                input: {
                    newVersion: cloneNewVersion.trim(),
                    newName: cloneNewName.trim() || undefined,
                },
            });
            await queryClient.invalidateQueries({
                queryKey: ['academy-syllabuses', courseProfileId],
            });
            toast.success('Đã clone giáo trình');
            setCloneDialogOpen(false);
            setCloneNewVersion('');
            setCloneNewName('');
            setSelectedSyllabusId(item.id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể clone giáo trình');
        }
    };

    const handleLockSyllabus = async () => {
        if (!selectedSyllabus) return;
        try {
            await lockSyllabusMutation.mutateAsync(selectedSyllabus.id);
            if (courseProfileId) {
                await queryClient.invalidateQueries({
                    queryKey: ['academy-syllabuses', courseProfileId],
                });
            }
            toast.success('Đã khóa giáo trình');
            setLockConfirmOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể khóa giáo trình');
        }
    };

    const handleUpdateModule = () => {
        if (editingModule) {
            updateModuleMutation.mutate({ id: editingModule.id, title: editingModule.title });
        }
    };

    const handleDeleteModule = async () => {
        if (!deleteModuleConfirm.moduleId) return;
        try {
            await deleteModuleMutation.mutateAsync(deleteModuleConfirm.moduleId);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể xóa module');
        }
    };

    const handleCreateLesson = async (values: any) => {
        if (!selectedModuleForLesson) return;
        try {
            await createLessonMutation.mutateAsync({
                ...(values as any),
                moduleId: selectedModuleForLesson.id,
            });
            if (courseProfileId) {
                await queryClient.invalidateQueries({
                    queryKey: ['academy-syllabuses', courseProfileId],
                });
            }
            toast.success('Đã tạo bài học mới');
            setCreateLessonOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể tạo bài học');
        }
    };

    const handleUpdateLesson = async (values: any) => {
        if (!editingLesson) return;
        try {
            await updateLessonMutation.mutateAsync({
                id: editingLesson.id,
                input: values as any,
            });
            if (courseProfileId) {
                await queryClient.invalidateQueries({
                    queryKey: ['academy-syllabuses', courseProfileId],
                });
            }
            toast.success('Đã cập nhật bài học');
            setEditLessonOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể cập nhật bài học');
        }
    };

    const handleDeleteLesson = async () => {
        if (!deleteLessonConfirm.lessonId) return;
        try {
            await deleteLessonMutation.mutateAsync(deleteLessonConfirm.lessonId);
            if (courseProfileId) {
                await queryClient.invalidateQueries({
                    queryKey: ['academy-syllabuses', courseProfileId],
                });
            }
            toast.success('Đã xóa bài học');
            setDeleteLessonConfirm({ open: false, lessonId: null, lessonTitle: null });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể xóa bài học');
        }
    };

    if (!syllabuses || syllabuses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full space-y-4">
                <div className="size-20 bg-muted rounded-full flex items-center justify-center">
                    <LayoutTemplate className="size-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold">Chưa có giáo trình (Syllabus)</h3>
                    <p className="text-sm text-muted-foreground max-w-[400px]">
                        Hồ sơ khóa học này hiện tại chưa có phiên bản giáo trình nào. Hãy tạo phiên bản đầu tiên để bắt đầu xây dựng cấu trúc bài học.
                    </p>
                </div>
                <Button
                    onClick={() => setConfirmInitialOpen(true)}
                    disabled={createSyllabusMutation.isPending}
                    className="mt-4"
                >
                    <Plus className="mr-2 size-4" />
                    Bắt đầu phiên bản đầu tiên
                </Button>

                <Dialog open={confirmInitialOpen} onOpenChange={setConfirmInitialOpen}>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>Xác nhận tạo giáo trình đầu tiên</DialogTitle>
                            <DialogDescription>
                                Hệ thống sẽ tạo phiên bản syllabus mặc định <strong>v1.0.0</strong> cho hồ sơ khóa học này.
                                Bạn có thể clone và chỉnh sửa các phiên bản sau. Bạn có chắc chắn muốn tiếp tục?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setConfirmInitialOpen(false)}
                                disabled={createSyllabusMutation.isPending}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCreateInitialSyllabus}
                                disabled={createSyllabusMutation.isPending}
                            >
                                Đồng ý tạo
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <SyllabusHeader 
                selectedSyllabus={selectedSyllabus}
                onLock={() => setLockConfirmOpen(true)}
                isLockPending={lockSyllabusMutation.isPending}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <ModuleList 
                    selectedSyllabus={selectedSyllabus}
                    expandedModules={expandedModules}
                    onToggleModule={toggleModule}
                    onAddModule={() => setCreateModuleOpen(true)}
                    onEditModule={(module) => {
                        setEditingModule({ id: module.id, title: module.title });
                        setEditModuleOpen(true);
                    }}
                    onDeleteModule={(module) => {
                        setDeleteModuleConfirm({
                            open: true,
                            moduleId: module.id,
                            moduleTitle: module.title
                        });
                    }}
                    onAddLesson={(module) => {
                        setSelectedModuleForLesson(module);
                        setCreateLessonOpen(true);
                    }}
                    onEditLesson={(lesson) => {
                        setEditingLesson(lesson);
                        setEditLessonOpen(true);
                    }}
                    onDeleteLesson={(lesson) => {
                        setDeleteLessonConfirm({
                            open: true,
                            lessonId: lesson.id,
                            lessonTitle: lesson.title
                        });
                    }}
                    onViewLesson={(lesson) => {
                        setViewLesson(lesson);
                        setViewLessonOpen(true);
                    }}
                />

                <SyllabusSidebar 
                    syllabuses={syllabuses}
                    selectedSyllabus={selectedSyllabus}
                    onSelectSyllabus={setSelectedSyllabusId}
                    onClone={() => {
                        setCloneNewVersion('');
                        setCloneNewName(selectedSyllabus?.name ?? '');
                        setCloneDialogOpen(true);
                    }}
                />
            </div>

            <ModuleDialogs 
                createModuleOpen={createModuleOpen}
                setCreateModuleOpen={setCreateModuleOpen}
                newModuleTitle={newModuleTitle}
                setNewModuleTitle={setNewModuleTitle}
                onCreateModule={handleCreateModule}
                isCreatePending={createModuleMutation.isPending}
                editModuleOpen={editModuleOpen}
                setEditModuleOpen={setEditModuleOpen}
                editingModule={editingModule}
                setEditingModule={setEditingModule}
                onUpdateModule={handleUpdateModule}
                isUpdatePending={updateModuleMutation.isPending}
                deleteModuleConfirm={deleteModuleConfirm}
                setDeleteModuleConfirm={setDeleteModuleConfirm}
                onDeleteModule={handleDeleteModule}
                isDeletePending={deleteModuleMutation.isPending}
            />

            <LessonSheets 
                createLessonOpen={createLessonOpen}
                setCreateLessonOpen={setCreateLessonOpen}
                selectedModuleForLesson={selectedModuleForLesson}
                onCreateLesson={handleCreateLesson}
                isCreatePending={createLessonMutation.isPending}
                editLessonOpen={editLessonOpen}
                setEditLessonOpen={setEditLessonOpen}
                editingLesson={editingLesson}
                onUpdateLesson={handleUpdateLesson}
                isUpdatePending={updateLessonMutation.isPending}
                viewLessonOpen={viewLessonOpen}
                setViewLessonOpen={setViewLessonOpen}
                viewLesson={viewLesson}
                deleteLessonConfirm={deleteLessonConfirm}
                setDeleteLessonConfirm={setDeleteLessonConfirm}
                onDeleteLesson={handleDeleteLesson}
                isDeletePending={deleteLessonMutation.isPending}
            />

            <SyllabusActionDialogs 
                confirmInitialOpen={confirmInitialOpen}
                setConfirmInitialOpen={setConfirmInitialOpen}
                onCreateInitial={handleCreateInitialSyllabus}
                isCreatePending={createSyllabusMutation.isPending}
                cloneDialogOpen={cloneDialogOpen}
                setCloneDialogOpen={setCloneDialogOpen}
                selectedSyllabus={selectedSyllabus}
                cloneNewVersion={cloneNewVersion}
                setCloneNewVersion={setCloneNewVersion}
                cloneNewName={cloneNewName}
                setCloneNewName={setCloneNewName}
                onClone={handleCloneSyllabus}
                isClonePending={cloneSyllabusMutation.isPending}
                lockConfirmOpen={lockConfirmOpen}
                setLockConfirmOpen={setLockConfirmOpen}
                onLock={handleLockSyllabus}
                isLockPending={lockSyllabusMutation.isPending}
            />
        </div>
    );
}
