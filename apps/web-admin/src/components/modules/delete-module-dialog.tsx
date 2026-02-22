import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import type { ModuleResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteModule } from "@/api/services/modules.ts";
import { AlertTriangle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from "@workspace/ui/components/spinner";

interface DeleteModuleDialogProps {
    module: ModuleResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteModuleDialog({ module, open, onOpenChange }: DeleteModuleDialogProps) {
    const deleteModule = useDeleteModule();

    const handleDelete = async () => {
        if (!module) return;
        try {
            await deleteModule.mutateAsync(module.id);
            toast.success('Đã xóa học phần', {
                description: `Học phần "${module.title}" đã được xóa thành công.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Xóa thất bại', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    if (!module) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertTriangle />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Xóa học phần</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này sẽ xóa vĩnh viễn học phần <span className="font-semibold text-foreground">"{module.title}"</span> và tất cả bài học liên quan. Thao tác này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={deleteModule.isPending}>Hủy</Button>
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteModule.isPending}
                    >
                        {deleteModule.isPending ? (
                            <Spinner />
                        ) : (
                            "Xóa học phần"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
