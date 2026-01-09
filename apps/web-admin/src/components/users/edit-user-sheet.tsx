import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import type { UserResponseDTO } from '@workspace/schemas';
import { Loader2, User } from 'lucide-react';
import { userAdminUpdateDTOSchema, type UserAdminUpdateDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateUser } from "@/api/services/users.ts";
import { cn } from '@workspace/ui/lib/utils';

type UpdateUserFormData = UserAdminUpdateDTO;

interface EditUserSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponseDTO | null;
}

export function EditUserSheet({
    open,
    onOpenChange,
    user,
}: EditUserSheetProps) {
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
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
            toast.error('Failed to update user', {
                description: errorMessage,
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px] p-0 flex flex-col overflow-hidden bg-background/95 backdrop-blur-xl border-none shadow-2xl">
                {/* Header */}
                <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle className="text-xl font-bold">
                                Edit User
                            </SheetTitle>
                            <SheetDescription className="text-sm text-muted-foreground mt-0.5">
                                Update user details and permissions
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden" noValidate>
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                        <div className="space-y-5">
                            <Controller
                                control={control}
                                name="displayName"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Display Name <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            {...field}
                                            placeholder="Display Name"
                                            aria-invalid={fieldState.invalid}
                                            className={cn(
                                                "border-none bg-muted/40 hover:bg-muted/60 focus-visible:bg-muted/60",
                                                "focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl h-12 transition-all"
                                            )}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={control}
                                name="email"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Email <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id={field.name}
                                            {...field}
                                            placeholder="Email"
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            className={cn(
                                                "border-none bg-muted/40 hover:bg-muted/60 focus-visible:bg-muted/60",
                                                "focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl h-12 transition-all"
                                            )}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={control}
                                name="role"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Role <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                id={field.name}
                                                aria-invalid={fieldState.invalid}
                                                className={cn(
                                                    "border-none bg-muted/40 hover:bg-muted/60",
                                                    "focus:ring-2 focus:ring-primary/20 rounded-xl h-12 transition-all"
                                                )}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="border-none shadow-xl bg-background/90 backdrop-blur-xl rounded-xl">
                                                <SelectItem value="learner" className="rounded-lg cursor-pointer">Learner</SelectItem>
                                                <SelectItem value="lecturer" className="rounded-lg cursor-pointer">Lecturer</SelectItem>
                                                <SelectItem value="staff" className="rounded-lg cursor-pointer">Staff</SelectItem>
                                                <SelectItem value="staff-lms" className="rounded-lg cursor-pointer">LMS Staff</SelectItem>
                                                <SelectItem value="staff-support" className="rounded-lg cursor-pointer">Support Staff</SelectItem>
                                                <SelectItem value="staff-sales" className="rounded-lg cursor-pointer">Sales Staff</SelectItem>
                                                <SelectItem value="admin" className="rounded-lg cursor-pointer">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="px-4 sm:px-6 py-4 bg-muted/20 border-t border-border/40 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={updateUser.isPending}
                            className="rounded-xl hover:bg-muted/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateUser.isPending}
                            className="rounded-xl px-6 shadow-lg shadow-primary/20"
                        >
                            {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
