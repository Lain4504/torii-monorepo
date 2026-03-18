import { Button } from "@workspace/ui/components/button";
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

interface ModuleDialogsProps {
    // Create Module
    createModuleOpen: boolean;
    setCreateModuleOpen: (open: boolean) => void;
    newModuleTitle: string;
    setNewModuleTitle: (title: string) => void;
    onCreateModule: () => void;
    isCreatePending: boolean;

    // Edit Module
    editModuleOpen: boolean;
    setEditModuleOpen: (open: boolean) => void;
    editingModule: { id: string; title: string } | null;
    setEditingModule: (module: { id: string; title: string } | null) => void;
    onUpdateModule: () => void;
    isUpdatePending: boolean;

    // Delete Module
    deleteModuleConfirm: { open: boolean; moduleId: string | null; moduleTitle: string | null };
    setDeleteModuleConfirm: (state: { open: boolean; moduleId: string | null; moduleTitle: string | null }) => void;
    onDeleteModule: () => void;
    isDeletePending: boolean;
}

export function ModuleDialogs({
    createModuleOpen,
    setCreateModuleOpen,
    newModuleTitle,
    setNewModuleTitle,
    onCreateModule,
    isCreatePending,

    editModuleOpen,
    setEditModuleOpen,
    editingModule,
    setEditingModule,
    onUpdateModule,
    isUpdatePending,

    deleteModuleConfirm,
    setDeleteModuleConfirm,
    onDeleteModule,
    isDeletePending,
}: ModuleDialogsProps) {
    return (
        <>
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
                                if (!isCreatePending) {
                                    setCreateModuleOpen(false);
                                    setNewModuleTitle('');
                                }
                            }}
                            disabled={isCreatePending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={onCreateModule}
                            disabled={isCreatePending || !newModuleTitle.trim()}
                        >
                            Tạo Module
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: chỉnh sửa Module */}
            <Dialog open={editModuleOpen} onOpenChange={setEditModuleOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa Module</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin module trong giáo trình.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Tên Module</FieldLabel>
                                <Input
                                    placeholder="Ví dụ: Bài 1 - Giới thiệu"
                                    value={editingModule?.title || ''}
                                    onChange={(e) => setEditingModule(editingModule ? { ...editingModule, title: e.target.value } : null)}
                                />
                            </Field>
                        </FieldGroup>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                setEditModuleOpen(false);
                                setEditingModule(null);
                            }}
                            disabled={isUpdatePending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={onUpdateModule}
                            disabled={isUpdatePending || !editingModule?.title.trim()}
                        >
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Xác nhận xóa Module */}
            <Dialog 
                open={deleteModuleConfirm.open} 
                onOpenChange={(open) => !open && setDeleteModuleConfirm({ open: false, moduleId: null, moduleTitle: null })}
            >
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa Module</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa Module <strong>{deleteModuleConfirm.moduleTitle}</strong>? 
                            Tất cả các bài học bên trong module này cũng sẽ bị xóa. Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteModuleConfirm({ open: false, moduleId: null, moduleTitle: null })}
                            disabled={isDeletePending}
                        >
                            Hủy
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={onDeleteModule}
                            disabled={isDeletePending}
                        >
                            Xóa Module
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
