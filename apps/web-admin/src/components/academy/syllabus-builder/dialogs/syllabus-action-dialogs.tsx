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

interface SyllabusActionDialogsProps {
    // Initial Syllabus
    confirmInitialOpen: boolean;
    setConfirmInitialOpen: (open: boolean) => void;
    onCreateInitial: () => void;
    isCreatePending: boolean;

    // Clone Syllabus
    cloneDialogOpen: boolean;
    setCloneDialogOpen: (open: boolean) => void;
    selectedSyllabus: any;
    cloneNewVersion: string;
    setCloneNewVersion: (version: string) => void;
    cloneNewName: string;
    setCloneNewName: (name: string) => void;
    onClone: () => void;
    isClonePending: boolean;


    // Lock Syllabus
    lockConfirmOpen: boolean;
    setLockConfirmOpen: (open: boolean) => void;
    onLock: () => void;
    isLockPending: boolean;
}

export function SyllabusActionDialogs({
    confirmInitialOpen,
    setConfirmInitialOpen,
    onCreateInitial,
    isCreatePending,

    cloneDialogOpen,
    setCloneDialogOpen,
    selectedSyllabus,
    cloneNewVersion,
    setCloneNewVersion,
    cloneNewName,
    setCloneNewName,
    onClone,
    isClonePending,


    lockConfirmOpen,
    setLockConfirmOpen,
    onLock,
    isLockPending,
}: SyllabusActionDialogsProps) {
    return (
        <>
            {/* Dialog: tạo syllabus đầu tiên */}
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
                            disabled={isCreatePending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={onCreateInitial}
                            disabled={isCreatePending}
                        >
                            Đồng ý tạo
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
                                if (!isClonePending) {
                                    setCloneDialogOpen(false);
                                }
                            }}
                            disabled={isClonePending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={onClone}
                            disabled={isClonePending || !cloneNewVersion.trim()}
                        >
                            Tạo bản sao
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Dialog: Xác nhận khóa giáo trình */}
            <Dialog open={lockConfirmOpen} onOpenChange={setLockConfirmOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận khóa giáo trình</DialogTitle>
                        <DialogDescription>
                            Sau khi khóa, giáo trình này sẽ <strong>không thể chỉnh sửa</strong> Module và Lesson nữa. Bạn có chắc chắn muốn khóa?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setLockConfirmOpen(false)}
                            disabled={isLockPending}
                        >
                            Hủy
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={onLock}
                            disabled={isLockPending}
                        >
                            Khóa giáo trình
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
