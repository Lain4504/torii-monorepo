import { useForm, Controller } from 'react-hook-form';
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
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import type { UserResponseDTO } from '@workspace/schemas';
import { Loader2 } from 'lucide-react';

import { userAdminUpdateDTOSchema, type UserAdminUpdateDTO } from '@workspace/schemas';

type UpdateUserFormData = UserAdminUpdateDTO;

import { toast } from '@workspace/ui/components/sonner';
import { useUpdateUser } from "@/api/services/users.ts";

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
        control,
        handleSubmit,
    } = useForm<UpdateUserFormData>({
        resolver: zodResolver(userAdminUpdateDTOSchema),
        values: user ? {
            displayName: user.displayName,
            email: user.email,
            role: user.role as any,
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
                description: `Changes to ${data.displayName} have been saved.`,
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
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Edit User</DialogTitle>
                    <DialogDescription className="text-sm zen-text-muted mt-1">
                        Update user details and permissions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 px-1" noValidate>
                    <Controller
                        control={control}
                        name="displayName"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Display Name"
                                    aria-invalid={fieldState.invalid}
                                    className="border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Email"
                                    type="email"
                                    aria-invalid={fieldState.invalid}
                                    className="border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="role"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        className="border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl h-11 transition-all"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-none shadow-xl bg-background/90 backdrop-blur-xl rounded-xl">
                                        <SelectItem value="learner" className="rounded-lg cursor-pointer">Learner</SelectItem>
                                        <SelectItem value="lecturer" className="rounded-lg cursor-pointer">Lecturer</SelectItem>
                                        <SelectItem value="staff" className="rounded-lg cursor-pointer">Staff</SelectItem>
                                        <SelectItem value="admin" className="rounded-lg cursor-pointer">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={updateUser.isPending}
                            className="rounded-xl hover:bg-muted/50"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateUser.isPending} className="rounded-xl px-6 shadow-lg shadow-primary/20">
                            {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
