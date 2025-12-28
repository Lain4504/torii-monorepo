import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { useDeleteModule } from '@/features/modules/api/modules';
import type { ModuleResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';

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
            toast.success('Module deleted successfully!', {
                description: `${module.title} has been removed.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to delete module', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the module
                        "{module?.title}" and remove its data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
