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
import { Button } from '@workspace/ui/components/button';
import type { UserResponseDTO } from '@workspace/schemas';
import { toast } from 'sonner';
import { useDeleteUser } from "@/lib/api/services/users.ts";
import { AlertTriangle } from 'lucide-react';
import { Spinner } from "@workspace/ui/components/spinner";

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
            toast.success('Đã xóa người dùng', {
                description: `${user.displayName} đã được xóa khỏi hệ thống.`,
            });
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể xóa người dùng';
            toast.error('Xóa thất bại', {
                description: errorMessage,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertTriangle />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Xóa tài khoản</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này sẽ xóa vĩnh viễn người dùng <span className="font-semibold text-foreground">{user?.displayName}</span> và tất cả dữ liệu liên quan. Bạn có chắc chắn muốn tiếp tục?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline">Hủy</Button>
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteUser.isPending}
                    >
                        {deleteUser.isPending ? (
                            <Spinner />
                        ) : (
                            "Xóa người dùng"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
