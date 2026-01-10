import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import type { UserResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteUser } from "@/api/services/users.ts";
import { AlertTriangle, Trash2, X } from 'lucide-react';

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
            toast.success('Entity Terminated', {
                description: `${user.displayName} has been permanently purged.`,
            });
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
            toast.error('Termination Failed', {
                description: errorMessage,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-l border-destructive/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[2rem] p-0 overflow-hidden sm:max-w-[420px]">
                <div className="absolute inset-0 bg-destructive/5 blur-3xl opacity-20 pointer-events-none" />

                <div className="p-6 pb-2 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/10 shadow-inner">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-destructive">
                                Critical Action
                            </AlertDialogTitle>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                Permanent Deletion Protocol
                            </p>
                        </div>
                    </div>

                    <AlertDialogDescription className="text-sm text-foreground/80 font-medium leading-relaxed bg-muted/20 p-4 rounded-xl border border-destructive/5">
                        You are about to execute a permanent deletion for entity:
                        <br />
                        <span className="block mt-2 font-black text-foreground text-lg uppercase tracking-tight border-l-2 border-destructive pl-3">
                            {user?.displayName}
                        </span>
                        <span className="block mt-2 text-xs text-muted-foreground">
                            This action is irreversible. All associated data will be purged.
                        </span>
                    </AlertDialogDescription>
                </div>

                <div className="p-6 pt-2 bg-muted/5 relative z-10 flex gap-3">
                    <AlertDialogCancel className="flex-1 rounded-xl h-11 border-border/20 bg-background/50 hover:bg-muted/50 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                        <X className="mr-2 h-3.5 w-3.5" />
                        Abort
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="flex-1 rounded-xl h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-[11px] font-black uppercase tracking-widest shadow-lg shadow-destructive/20"
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Execute Purge
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}

