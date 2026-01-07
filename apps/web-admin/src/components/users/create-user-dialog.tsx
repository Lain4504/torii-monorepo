import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Wifi,
    Headphones,
    Mail,
    Loader2
} from 'lucide-react';
import { UserRole, adminCreateInternalUserDTOSchema, type AdminCreateInternalUserDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateInternalUser } from "@/api/services/users.ts";

const internalRoles = [
    {
        id: UserRole.LECTURER,
        label: 'Lecturer',
        icon: <Wifi className="h-5 w-5" />,
        description: 'Manage classes and view student progress.',
    },
    {
        id: UserRole.STAFF,
        label: 'Staff',
        icon: <Headphones className="h-5 w-5" />,
        description: 'Support tickets and general administration.',
    },
];

const createInternalUserSchema = adminCreateInternalUserDTOSchema.extend({
    displayName: z.string().min(1, 'Full name is required'),
});

type CreateInternalUserFormData = z.infer<typeof createInternalUserSchema>;

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
    open,
    onOpenChange,
}: CreateUserDialogProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CreateInternalUserFormData>({
        resolver: zodResolver(createInternalUserSchema),
        defaultValues: {
            displayName: '',
            email: '',
            role: UserRole.LECTURER,
        },
    });

    const currentRole = watch('role');

    const createInternalUser = useCreateInternalUser();

    const handleFormSubmit: SubmitHandler<CreateInternalUserFormData> = async (data) => {
        const dto: AdminCreateInternalUserDTO = {
            email: data.email,
            displayName: data.displayName,
            role: data.role,
        };
        try {
            await createInternalUser.mutateAsync(dto);
            toast.success('Invitation email sent!', {
                description: `An invitation has been sent to ${dto.email}.`,
            });
            reset();
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to create user', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Create Internal User
                    </DialogTitle>
                    <p className="text-sm zen-text-muted mt-1">
                        Create a new internal user (Lecturer or Staff) and send an invitation email.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 px-1">
                    {/* Personal Details Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="displayName" className="text-sm font-medium zen-text-muted">
                                Full Name
                            </label>
                            <Input
                                id="displayName"
                                className="border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
                                placeholder="e.g. Kenji Sato"
                                {...register('displayName')}
                            />
                            {errors.displayName && (
                                <p className="text-sm text-destructive">{errors.displayName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium zen-text-muted">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="kenji@torii.com"
                                    className="pl-10 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Role Assignment Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Role
                            <span className="h-px flex-1 bg-border/50"></span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {internalRoles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => setValue('role', role.id as UserRole.LECTURER | UserRole.STAFF)}
                                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 ${
                                        currentRole === role.id
                                            ? 'bg-primary/10 shadow-inner'
                                            : 'bg-muted/20 hover:bg-muted/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className={`p-2.5 rounded-xl transition-colors ${
                                                currentRole === role.id
                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                    : 'bg-background'
                                            }`}
                                        >
                                            {role.icon}
                                        </div>
                                        <div
                                            className={`font-semibold ${
                                                currentRole === role.id ? 'text-primary' : 'text-foreground'
                                            }`}
                                        >
                                            {role.label}
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground/80 pl-1">
                                        {role.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.role && (
                            <p className="text-sm text-destructive">{errors.role.message}</p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleOpenChange(false)}
                            disabled={createInternalUser.isPending}
                            className="rounded-xl hover:bg-muted/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createInternalUser.isPending}
                            className="rounded-xl px-8 shadow-lg shadow-primary/20"
                        >
                            {createInternalUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {createInternalUser.isPending ? 'Creating...' : 'Create & Send Invite'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
