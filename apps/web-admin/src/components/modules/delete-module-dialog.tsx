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
import type { ModuleResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteModule } from "@/api/services/modules.ts";
import { AlertTriangle, Trash, Box, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteModuleDialogProps {
    module: ModuleResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteModuleDialog({ module, open, onOpenChange }: DeleteModuleDialogProps) {
    const deleteModule = useDeleteModule();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!module) return;
        setIsDeleting(true);
        try {
            await deleteModule.mutateAsync(module.id);
            toast.success('Module Node Purged', {
                description: `Structure ${module.title} has been permanently removed.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Purge Failed', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!module) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-destructive/20 bg-background/80 backdrop-blur-3xl shadow-2xl flex flex-col rounded-[2.5rem]">
                <div className="p-8 pb-0">
                    <div className="flex items-start gap-6">
                        <div className="p-4 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 shadow-inner flex-shrink-0">
                            <AlertTriangle className="size-8 text-destructive animate-pulse" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <AlertDialogHeader className="space-y-2 text-left">
                                <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-destructive">
                                    Purge Module Node?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
                                    This action will initiate a <span className="text-destructive font-bold">permanent deletion protocol</span> for module <span className="text-foreground font-black italic">"{module.title}"</span>.
                                    <br /><br />
                                    <span className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/10 text-destructive/80 text-[10px] font-bold uppercase tracking-wider">
                                        <AlertTriangle className="size-3" />
                                        Warning: Associated lessons will be lost.
                                    </span>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                        </div>
                    </div>
                </div>

                {/* Module Preview Card */}
                <div className="mx-8 mt-6 p-4 rounded-2xl bg-muted/30 border border-border/20 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-background border border-border/40 flex items-center justify-center text-muted-foreground">
                        <Box className="size-5 opacity-70" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black uppercase tracking-wide truncate">{module.title}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/60">{module.id}</span>
                    </div>
                </div>

                <AlertDialogFooter className="p-6 mt-2 bg-destructive/5 border-t border-destructive/10 gap-3">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="rounded-xl h-12 text-[11px] font-black uppercase tracking-widest border-transparent bg-background hover:bg-muted/50 hover:text-foreground shadow-sm"
                    >
                        Cancel Protocol
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="rounded-xl h-12 px-6 text-[11px] font-black uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all hover:-translate-y-0.5"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Purging...
                            </>
                        ) : (
                            <>
                                <Trash className="mr-2 h-3 w-3" />
                                Execute Purge
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
