import { useState } from 'react';
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
import { Switch } from '@workspace/ui/components/switch';


import {
    GraduationCap,
    Wifi,
    Headphones,
    Shield,
    Mail,
    Upload,
    Check,
    Pencil,
    Loader2
} from 'lucide-react';
import { userCreateDTOSchema, type UserCreateDTO, UserRole, UserStatus } from '@workspace/schemas';
import { useCreateUser } from '@/features/users/api/users';
import { toast } from '@workspace/ui/components/sonner';

const roles = [
    {
        id: UserRole.LEARNER,
        label: 'Learner',
        icon: <GraduationCap className="h-5 w-5" />,
        description: 'Access to courses and WebRTC classes.',
    },
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
    {
        id: UserRole.ADMIN,
        label: 'Admin',
        icon: <Shield className="h-5 w-5" />,
        description: 'Full access to all system settings.',
    },
];

const createUserSchema = userCreateDTOSchema.omit({
    fullName: true,
    status: true,
    role: true
}).extend({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(UserRole),
    aiFeedback: z.boolean(),
    webRtcAccess: z.boolean(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
    open,
    onOpenChange,
}: CreateUserDialogProps) {
    const [hasProfilePhoto, setHasProfilePhoto] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: UserRole.LEARNER,
            aiFeedback: true,
            webRtcAccess: true,
        },
    });

    const currentRole = watch('role');
    const aiFeedback = watch('aiFeedback');
    const webRtcAccess = watch('webRtcAccess');

    const createUser = useCreateUser();

    const handleFormSubmit: SubmitHandler<CreateUserFormData> = async (data) => {
        const dto: UserCreateDTO = {
            email: data.email,
            fullName: `${data.firstName} ${data.lastName}`,
            password: data.password,
            role: data.role,
            status: UserStatus.ACTIVE,
        };
        try {
            await createUser.mutateAsync(dto);
            toast.success('User created successfully!', {
                description: `${dto.fullName} has been added to the system.`,
            });
            reset();
            setHasProfilePhoto(false);
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
            setHasProfilePhoto(false);
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add New User</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create a new account and assign roles for the Torii Nihongo platform.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Profile Photo Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Profile Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                    {hasProfilePhoto ? (
                                        <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center">
                                            <Check className="h-8 w-8 text-green-600" />
                                        </div>
                                    ) : (
                                        <Upload className="h-8 w-8 text-gray-400" />
                                    )}
                                </div>
                                {hasProfilePhoto && (
                                    <button
                                        type="button"
                                        className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white"
                                        onClick={() => setHasProfilePhoto(false)}
                                    >
                                        <Pencil className="h-3 w-3 text-white" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    Supports JPG, PNG or GIF. Max 5MB.
                                </p>
                                <button
                                    type="button"
                                    className="text-sm text-primary hover:underline mt-1"
                                    onClick={() => setHasProfilePhoto(true)}
                                >
                                    Upload Image
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Personal Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium">
                                    First Name
                                </label>
                                <Input
                                    id="firstName"
                                    placeholder="e.g. Kenji"
                                    {...register('firstName')}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium">
                                    Last Name
                                </label>
                                <Input
                                    id="lastName"
                                    placeholder="e.g. Sato"
                                    {...register('lastName')}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="kenji@torii.com"
                                    className="pl-9"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Role Assignment Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Role Assignment</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => setValue('role', role.id)}
                                    className={`cursor-pointer rounded-lg border p-4 hover:bg-muted transition-colors ${currentRole === role.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-md ${currentRole === role.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                            }`}>
                                            {role.icon}
                                        </div>
                                        <div className="font-semibold">{role.label}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {role.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Permissions Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Feature Permissions</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-sm mb-1">
                                        Enable AI Feedback (FastMCP)
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Allow this user to receive automated AI grading and suggestions.
                                    </div>
                                </div>
                                <Switch
                                    checked={aiFeedback}
                                    onCheckedChange={(checked) => setValue('aiFeedback', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-sm mb-1">
                                        WebRTC Class Access
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Allow joining live video sessions.
                                    </div>
                                </div>
                                <Switch
                                    checked={webRtcAccess}
                                    onCheckedChange={(checked) => setValue('webRtcAccess', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={createUser.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createUser.isPending}>
                            {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {createUser.isPending ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
