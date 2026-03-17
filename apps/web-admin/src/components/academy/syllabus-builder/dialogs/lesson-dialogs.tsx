import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Badge } from '@workspace/ui/components/badge';
import { LessonForm } from "@/components/academy/lesson-form";
import { RichTextRenderer } from "@/components/editor/rich-text-editor";

interface LessonDialogsProps {
    // Create Lesson
    createLessonOpen: boolean;
    setCreateLessonOpen: (open: boolean) => void;
    selectedModuleForLesson: any;
    onCreateLesson: (values: any) => Promise<void>;
    isCreatePending: boolean;

    // Edit Lesson
    editLessonOpen: boolean;
    setEditLessonOpen: (open: boolean) => void;
    editingLesson: any;
    onUpdateLesson: (values: any) => Promise<void>;
    isUpdatePending: boolean;

    // View Lesson
    viewLessonOpen: boolean;
    setViewLessonOpen: (open: boolean) => void;
    viewLesson: any;

    // Delete Lesson
    deleteLessonConfirm: { open: boolean; lessonId: string | null; lessonTitle: string | null };
    setDeleteLessonConfirm: (state: { open: boolean; lessonId: string | null; lessonTitle: string | null }) => void;
    onDeleteLesson: () => void;
    isDeletePending: boolean;
}

export function LessonDialogs({
    createLessonOpen,
    setCreateLessonOpen,
    selectedModuleForLesson,
    onCreateLesson,
    isCreatePending,

    editLessonOpen,
    setEditLessonOpen,
    editingLesson,
    onUpdateLesson,
    isUpdatePending,

    viewLessonOpen,
    setViewLessonOpen,
    viewLesson,

    deleteLessonConfirm,
    setDeleteLessonConfirm,
    onDeleteLesson,
    isDeletePending,
}: LessonDialogsProps) {
    return (
        <>
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
                            submitting={isCreatePending}
                            onCancel={() => {
                                if (!isCreatePending) {
                                    setCreateLessonOpen(false);
                                }
                            }}
                            onSubmit={onCreateLesson}
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
                                    videoUrl: editingLesson.videoUrl || undefined,
                                    content: editingLesson.content ?? "",
                                } as any}
                                submitting={isUpdatePending}
                                onCancel={() => {
                                    if (!isUpdatePending) {
                                        setEditLessonOpen(false);
                                    }
                                }}
                                onSubmit={onUpdateLesson}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog: Xác nhận xóa bài học */}
            <Dialog 
                open={deleteLessonConfirm.open} 
                onOpenChange={(open) => !open && setDeleteLessonConfirm({ open: false, lessonId: null, lessonTitle: null })}
            >
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa bài học</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa bài học <strong>{deleteLessonConfirm.lessonTitle}</strong>? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteLessonConfirm({ open: false, lessonId: null, lessonTitle: null })}
                            disabled={isDeletePending}
                        >
                            Hủy
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={onDeleteLesson}
                            disabled={isDeletePending}
                        >
                            Xóa bài học
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
