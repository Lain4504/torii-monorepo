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
import { useDeleteBlog } from "@/api/services/blog.ts";
import { toast } from '@workspace/ui/components/sonner';
import type { BlogResponseDTO } from '@workspace/schemas';
import { Trash2, Loader2 } from "lucide-react";

interface DeleteBlogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog: BlogResponseDTO | null;
}

export function DeleteBlogDialog({
    open,
    onOpenChange,
    blog,
}: DeleteBlogDialogProps) {
    const deleteBlog = useDeleteBlog();

    const handleDelete = async () => {
        if (!blog) return;

        try {
            await deleteBlog.mutateAsync(blog.id);
            toast.success('Blog deleted successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to delete blog', {
                description: error.response?.data?.message || error.message,
            });
        }
    };

    if (!blog) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[480px] p-0 gap-0 border border-border/50 shadow-2xl bg-background rounded-3xl">
                <AlertDialogHeader className="px-8 py-6 border-b border-border/10">
                    <div className="flex items-start gap-5">
                        <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-sm flex-shrink-0">
                            <Trash2 className="size-6 text-destructive" />
                        </div>
                        <div className="space-y-1.5 pt-1 text-left">
                            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                                Delete Blog
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                                Are you sure you want to delete <span className="text-foreground font-semibold">"{blog.title}"</span>?
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="px-8 py-6">
                    <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                        This action will permanently remove this blog and all its contents. This cannot be undone.
                    </p>
                </div>

                <AlertDialogFooter className="p-6 mt-2 bg-background border-t border-border/10 gap-3">
                    <AlertDialogCancel
                        disabled={deleteBlog.isPending}
                        className="rounded-xl h-10 text-xs font-medium border-border/10 bg-background hover:bg-muted/50 hover:text-foreground shadow-sm"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteBlog.isPending}
                        className="rounded-xl h-10 px-6 text-xs font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all font-semibold"
                    >
                        {deleteBlog.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Blog"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
