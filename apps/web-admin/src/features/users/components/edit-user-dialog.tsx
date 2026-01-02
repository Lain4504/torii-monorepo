import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import type { UserResponseDTO } from '@workspace/schemas';
import { Loader2 } from 'lucide-react';

import { userAdminUpdateDTOSchema, type UserAdminUpdateDTO } from '@workspace/schemas';

type UpdateUserFormData = UserAdminUpdateDTO;

import { useUpdateUser } from '@/features/users/api/users';
import { toast } from '@workspace/ui/components/sonner';

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponseDTO | null;
}

export function EditUserDialog({
    open,
    onOpenChange,
    user,
}: EditUserDialogProps) {
    const updateUser = useUpdateUser();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<UpdateUserFormData>({
        resolver: zodResolver(userAdminUpdateDTOSchema),
        values: user ? {
            fullName: user.fullName,
            email: user.email,
            role: user.role as any,
            status: user.status as any,
        } : undefined,
    });

    const handleFormSubmit = async (data: UpdateUserFormData) => {
        if (!user) return;
        try {
            await updateUser.mutateAsync({
                id: user.id,
                user: data,
            });
            toast.success('User updated successfully!', {
                description: `Changes to ${data.fullName} have been saved.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to update user', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user details and permissions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            {...register('fullName')}
                            placeholder="Full Name"
                        />
                        {errors.fullName && (
                            <p className="text-sm text-destructive">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            {...register('email')}
                            placeholder="Email"
                            type="email"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select
                            value={watch('role')}
                            onValueChange={(value) => setValue('role', value as any)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="learner">Learner</SelectItem>
                                <SelectItem value="lecturer">Lecturer</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-destructive">{errors.role.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={watch('status')}
                            onValueChange={(value) => setValue('status', value as any)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-destructive">{errors.status.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateUser.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateUser.isPending}>
                            {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
