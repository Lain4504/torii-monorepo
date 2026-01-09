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
import type { UserResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteUser } from "@/api/services/users.ts";

interface DeleteUserDialogProps {
    user: UserResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
    user,
    open,
    onOpenChange,
}: DeleteUserDialogProps) {
    const deleteUser = useDeleteUser();

    const handleDelete = async () => {
        if (!user) return;
        try {
            await deleteUser.mutateAsync({ id: user.id, hardDelete: true });
            toast.success('User deleted successfully!', {
                description: `${user.displayName} has been removed from the system.`,
            });
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
            toast.error('Failed to delete user', {
                description: errorMessage,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-destructive">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground/80">
                        This action cannot be undone. This will permanently delete the user
                        <span className="font-semibold text-foreground mx-1">"{user?.displayName}"</span>
                        and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel className="rounded-xl border-none bg-muted/30 hover:bg-muted/50">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="rounded-xl bg-destructive hover:bg-destructive/90 focus:ring-destructive/30 shadow-lg shadow-destructive/20"
                    >
                        Delete User
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
