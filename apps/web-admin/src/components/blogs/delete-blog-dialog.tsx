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
import type { BlogPostResponseDTO } from '@workspace/schemas';
import { Loader2 } from 'lucide-react';

interface DeleteBlogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog: BlogPostResponseDTO | null;
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
            toast.success('Blog post deleted successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to delete blog post', {
                description: error.response?.data?.message || error.message,
            });
        }
    };

    if (!blog) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the blog post
                        <strong> "{blog.title}"</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteBlog.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteBlog.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteBlog.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {deleteBlog.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


