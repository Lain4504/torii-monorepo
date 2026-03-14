import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    ChevronRight,
    Video,
    FileText,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Lock,
    Save,
    LayoutTemplate,
    Copy,
} from 'lucide-react';
import { useAcademySyllabuses, useCreateAcademySyllabus, useCloneAcademySyllabus, useLockAcademySyllabus } from '@/lib/api/services/academy-syllabuses';
import { useCreateAcademyLesson, useUpdateAcademyLesson, useDeleteAcademyLesson } from '@/lib/api/services/academy-lessons';
import { toast } from '@workspace/ui/components/sonner';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import type { StandardApiResponse } from '@workspace/schemas';
import { LessonForm } from "@/components/academy/lesson-form";
import { RichTextRenderer } from "@/components/editor/rich-text-editor";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

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

    // Dialog state: đặt làm giáo trình hiện tại
    const [confirmSetCurrentOpen, setConfirmSetCurrentOpen] = useState(false);

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

    // Load "current syllabus" từ localStorage để ưu tiên chọn
    useEffect(() => {
        if (!courseProfileId || !syllabuses || syllabuses.length === 0) return;
        try {
            const stored = window.localStorage.getItem(`current-syllabus:${courseProfileId}`);
            if (stored && syllabuses.some((s) => s.id === stored)) {
                setSelectedSyllabusId(stored);
            }
        } catch {
            // ignore
        }
    }, [courseProfileId, syllabuses]);

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

    const handleSetCurrentSyllabus = () => {
        if (!courseProfileId || !selectedSyllabus) return;
        try {
            window.localStorage.setItem(
                `current-syllabus:${courseProfileId}`,
                selectedSyllabus.id,
            );
            toast.success('Đã đặt làm giáo trình hiện tại cho hồ sơ khóa học này');
        } catch {
            toast.error('Không thể lưu thiết lập giáo trình hiện tại trên trình duyệt');
        } finally {
            setConfirmSetCurrentOpen(false);
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
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Link to="/academy/course-profiles" className="hover:underline text-muted-foreground">Hồ sơ khóa học</Link>
                        <ChevronRight className="size-4" />
                        <span>{selectedSyllabus?.name || 'Giáo trình'}</span>
                        {selectedSyllabus && (
                            <Badge variant="outline" className="ml-2 font-mono">
                                {selectedSyllabus.versionLabel}
                            </Badge>
                        )}
                    </div>
                }
                subtitle="Xây dựng lộ trình học tập, tổ chức các module và bài giảng. Quản lý nhiều phiên bản giáo trình cho cùng một hồ sơ khóa học."
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={!selectedSyllabus}
                            onClick={() => setConfirmSetCurrentOpen(true)}
                        >
                            <LayoutTemplate className="mr-2 h-4 w-4" />
                            Đặt làm giáo trình ưu tiên (chỉ trên máy bạn)
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!selectedSyllabus || selectedSyllabus.status === 'LOCKED' || lockSyllabusMutation.isPending}
                            onClick={async () => {
                                if (!selectedSyllabus) return;
                                if (!window.confirm('Sau khi khóa, giáo trình này sẽ không thể chỉnh sửa Module và Lesson nữa. Bạn có chắc chắn muốn khóa?')) {
                                    return;
                                }
                                try {
                                    await lockSyllabusMutation.mutateAsync(selectedSyllabus.id);
                                    if (courseProfileId) {
                                        await queryClient.invalidateQueries({
                                            queryKey: ['academy-syllabuses', courseProfileId],
                                        });
                                    }
                                    toast.success('Đã khóa giáo trình');
                                } catch (error: any) {
                                    toast.error(error?.response?.data?.message || 'Không thể khóa giáo trình');
                                }
                            }}
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            Khóa chỉnh sửa giáo trình
                        </Button>
                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thay đổi
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Module List (bên trái, chiếm 2 cột) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold italic">Cấu trúc Module</h2>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!selectedSyllabus}
                            onClick={() => setCreateModuleOpen(true)}
                        >
                            <Plus className="mr-1 h-3 w-3" />
                            Thêm Module
                        </Button>
                    </div>

                    <ScrollArea className="h-[600px] rounded-md border bg-card p-4">
                        <div className="space-y-4">
                            {selectedSyllabus?.modules?.map((module, mIdx) => (
                                <Card key={module.id} className="overflow-hidden border-muted">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-6 bg-secondary flex items-center justify-center rounded text-xs font-bold">
                                                {mIdx + 1}
                                            </div>
                                            <span className="font-medium">{module.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{module.lessons?.length || 0} bài học</span>
                                            {expandedModules[module.id] ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                        </div>
                                    </div>

                                    {expandedModules[module.id] && (
                                        <CardContent className="p-0 border-t bg-background/50">
                                            <div className="divide-y divide-muted/50">
                                                {module.lessons?.map((lesson: any) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="w-full flex items-center justify-between p-3 pl-12 hover:bg-accent transition-colors text-left cursor-pointer"
                                                        onClick={() => {
                                                            setViewLesson(lesson);
                                                            setViewLessonOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {lesson.type === 'VIDEO' ? (
                                                                <Video className="size-4 text-blue-500" />
                                                            ) : (
                                                                <FileText className="size-4 text-orange-500" />
                                                            )}
                                                            <span className="text-sm">{lesson.title}</span>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="size-8 border-border/60"
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    <MoreVertical className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingLesson(lesson);
                                                                        setEditLessonOpen(true);
                                                                    }}
                                                                >
                                                                    Chỉnh sửa
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (!window.confirm('Bạn có chắc muốn xóa bài học này?')) {
                                                                            return;
                                                                        }
                                                                        try {
                                                                            await deleteLessonMutation.mutateAsync(lesson.id);
                                                                            if (courseProfileId) {
                                                                                await queryClient.invalidateQueries({
                                                                                    queryKey: ['academy-syllabuses', courseProfileId],
                                                                                });
                                                                            }
                                                                            toast.success('Đã xóa bài học');
                                                                        } catch (error: any) {
                                                                            toast.error(error?.response?.data?.message || 'Không thể xóa bài học');
                                                                        }
                                                                    }}
                                                                >
                                                                    Xóa
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                ))}
                                                <button
                                                    className="w-full p-3 pl-12 flex items-center gap-2 text-sm text-primary hover:bg-primary/5 transition-colors"
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedModuleForLesson(module);
                                                        setCreateLessonOpen(true);
                                                    }}
                                                >
                                                    <Plus className="size-3" />
                                                    Thêm bài học mới
                                                </button>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Cột bên phải: danh sách phiên bản + thông tin chung */}
                <div className="space-y-4 lg:pl-2">
                    {/* Danh sách syllabus (theo hồ sơ khóa học) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold italic">Danh sách phiên bản Syllabus</h2>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!selectedSyllabus}
                                onClick={() => {
                                    setCloneNewVersion('');
                                    setCloneNewName(selectedSyllabus?.name ?? '');
                                    setCloneDialogOpen(true);
                                }}
                            >
                                <Copy className="mr-1 h-3 w-3" />
                                Clone giáo trình
                            </Button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {syllabuses.map((s) => (
                                <Button
                                    key={s.id}
                                    variant={s.id === selectedSyllabus?.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedSyllabusId(s.id)}
                                >
                                    <span className="font-mono mr-2">{s.versionLabel}</span>
                                    {s.name && <span>{s.name}</span>}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Properties Pane */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold italic">Chi tiết</h2>
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle className="text-base">Thông tin chung</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase font-bold">Trạng thái</label>
                                    <div>
                                        <Badge variant={selectedSyllabus?.status === 'LOCKED' ? 'secondary' : 'default'}>
                                            {selectedSyllabus?.status || 'DRAFT'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase font-bold">Phiên bản</label>
                                    <div className="font-mono">{selectedSyllabus?.versionLabel || 'N/A'}</div>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>
                                        Syllabus này đang được sử dụng ở{" "}
                                        <strong>{selectedSyllabus?._count?.classes || 0}</strong> lớp học.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Dialog: tạo Module mới */}
            <Dialog open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Thêm Module mới</DialogTitle>
                        <DialogDescription>
                            Tạo một chương/module mới trong giáo trình hiện tại. Bạn có thể sắp xếp lại thứ tự sau.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Tên Module</FieldLabel>
                                <Input
                                    placeholder="Ví dụ: Bài 1 - Giới thiệu"
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                />
                            </Field>
                        </FieldGroup>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                if (!createModuleMutation.isPending) {
                                    setCreateModuleOpen(false);
                                    setNewModuleTitle('');
                                }
                            }}
                            disabled={createModuleMutation.isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCreateModule}
                            disabled={createModuleMutation.isPending || !newModuleTitle.trim()}
                        >
                            Tạo Module
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: clone giáo trình */}
            <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Clone giáo trình</DialogTitle>
                        <DialogDescription>
                            Tạo bản sao của <strong>{selectedSyllabus?.name || selectedSyllabus?.versionLabel}</strong> với phiên bản mới.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Phiên bản mới *</FieldLabel>
                                <Input
                                    placeholder="Ví dụ: v1.1.0"
                                    value={cloneNewVersion}
                                    onChange={(e) => setCloneNewVersion(e.target.value)}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Tên (tuỳ chọn)</FieldLabel>
                                <Input
                                    placeholder="Ví dụ: Bản sao giáo trình"
                                    value={cloneNewName}
                                    onChange={(e) => setCloneNewName(e.target.value)}
                                />
                            </Field>
                        </FieldGroup>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                if (!cloneSyllabusMutation.isPending) {
                                    setCloneDialogOpen(false);
                                }
                            }}
                            disabled={cloneSyllabusMutation.isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={async () => {
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
                            }}
                            disabled={cloneSyllabusMutation.isPending || !cloneNewVersion.trim()}
                        >
                            Tạo bản sao
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: xác nhận đặt làm giáo trình hiện tại */}
            <Dialog open={confirmSetCurrentOpen} onOpenChange={setConfirmSetCurrentOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Đặt làm giáo trình hiện tại</DialogTitle>
                        <DialogDescription>
                            Giáo trình <strong>{selectedSyllabus?.name || selectedSyllabus?.versionLabel}</strong> sẽ được đánh dấu là
                            phiên bản đang sử dụng cho hồ sơ khóa học này (trên thiết bị của bạn). Bạn có chắc chắn muốn tiếp tục?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setConfirmSetCurrentOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSetCurrentSyllabus}
                            disabled={!selectedSyllabus}
                        >
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: tạo bài học mới */}
            <Dialog open={createLessonOpen} onOpenChange={setCreateLessonOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Tạo bài học mới</DialogTitle>
                        <DialogDescription>
                            Tạo bài học mới cho module <strong>{selectedModuleForLesson?.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                        <LessonForm
                            mode="create"
                            submitting={createLessonMutation.isPending}
                            onCancel={() => {
                                if (!createLessonMutation.isPending) {
                                    setCreateLessonOpen(false);
                                }
                            }}
                            onSubmit={async (values) => {
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
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog: xem chi tiết bài học */}
            <Dialog open={viewLessonOpen} onOpenChange={setViewLessonOpen}>
                <DialogContent className="sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết bài học</DialogTitle>
                        <DialogDescription>
                            Xem thông tin cơ bản của bài học trong giáo trình.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-bold">Tiêu đề</p>
                                <p className="text-sm font-medium">
                                    {viewLesson?.title || '—'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-bold">Loại bài học</p>
                                <Badge variant="outline" className="uppercase text-[10px] font-bold">
                                    {viewLesson?.type === 'VIDEO'
                                        ? 'Video (VIDEO)'
                                        : viewLesson?.type === 'READING'
                                        ? 'Bài đọc / tài liệu (READING)'
                                        : 'N/A'}
                                </Badge>
                            </div>
                            {viewLesson?.type === 'VIDEO' && (
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Video URL</p>
                                    <div className="text-xs text-muted-foreground break-all">
                                        {viewLesson?.videoUrl || 'Chưa cấu hình'}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold">Nội dung</p>
                            <RichTextRenderer content={viewLesson?.content} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setViewLessonOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: chỉnh sửa bài học */}
            <Dialog open={editLessonOpen} onOpenChange={setEditLessonOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Chỉnh sửa bài học</DialogTitle>
                        <DialogDescription>
                            Cập nhật nội dung bài học <strong>{editingLesson?.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                        {editingLesson && (
                            <LessonForm
                                mode="edit"
                                defaultValues={{
                                    title: editingLesson.title,
                                    type: editingLesson.type,
                                    videoUrl: editingLesson.videoUrl,
                                    content: editingLesson.content ?? "",
                                } as any}
                                submitting={updateLessonMutation.isPending}
                                onCancel={() => {
                                    if (!updateLessonMutation.isPending) {
                                        setEditLessonOpen(false);
                                    }
                                }}
                                onSubmit={async (values) => {
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
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
