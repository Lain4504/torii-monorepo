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
import { useDeletePost } from "@/api/services/post.ts";
import { toast } from '@workspace/ui/components/sonner';
import type { PostResponseDTO } from '@workspace/schemas';
import { Loader2 } from 'lucide-react';

interface DeletePostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: PostResponseDTO | null;
}

export function DeletePostDialog({
    open,
    onOpenChange,
    post,
}: DeletePostDialogProps) {
    const deletePost = useDeletePost();

    const handleDelete = async () => {
        if (!post) return;

        try {
            await deletePost.mutateAsync(post.id);
            toast.success('Post deleted successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to delete post', {
                description: error.response?.data?.message || error.message,
            });
        }
    };

    if (!post) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the post
                        <strong> "{post.title}"</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletePost.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deletePost.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deletePost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {deletePost.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}



