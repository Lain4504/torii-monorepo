import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import type { UserResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteUser } from "@/api/services/users.ts";
import { AlertTriangle, Loader2 } from 'lucide-react';

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
            toast.success('User Deleted', {
                description: `${user.displayName} has been removed.`,
            });
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
            toast.error('Deletion Failed', {
                description: errorMessage,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="z-50 w-full max-w-md gap-0 rounded-3xl border border-border/50 bg-background p-0 shadow-2xl">
                <div className="absolute inset-0 bg-rose-500/5 blur-3xl opacity-20 pointer-events-none" />

                <AlertDialogHeader className="relative px-8 pt-10 pb-6 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 ring-8 ring-rose-500/5">
                        <AlertTriangle className="h-8 w-8 animate-pulse" />
                    </div>
                    <AlertDialogTitle className="text-2xl font-sans font-bold italic uppercase tracking-tight text-foreground">
                        Delete <span className="text-rose-500">Account</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground/80 font-medium leading-relaxed max-w-[280px] mx-auto">
                        This action will permanently remove this user and all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="p-6 pt-2 bg-background border-t border-border/10 relative z-10 flex gap-3 shadow-none">
                    <AlertDialogCancel asChild>
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-xl text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteUser.isPending}
                        className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-xs font-semibold uppercase tracking-wider shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all font-semibold"
                    >
                        {deleteUser.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Delete User"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
