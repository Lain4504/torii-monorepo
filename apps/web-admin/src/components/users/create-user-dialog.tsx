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
import { userCreateDTOSchema, type UserCreateDTO, UserRole } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateUser } from "@/api/services/users.ts";

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
    displayName: true,
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
            displayName: `${data.firstName} ${data.lastName}`,
            password: data.password,
            role: data.role,
        };
        try {
            await createUser.mutateAsync(dto);
            toast.success('User created successfully!', {
                description: `${dto.displayName} has been added to the system.`,
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
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Add New User</DialogTitle>
                    <p className="text-sm zen-text-muted mt-1">
                        Create a new account and assign roles for the Torii Nihongo platform.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 px-1">
                    {/* Profile Photo Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium zen-text-muted">Profile Photo</label>
                        <div className="flex items-center gap-6">
                            <div className="relative group cursor-pointer" onClick={() => !hasProfilePhoto && setHasProfilePhoto(true)}>
                                <div className="w-24 h-24 rounded-full border-none bg-muted/30 flex items-center justify-center transition-all group-hover:bg-muted/50 overflow-hidden">
                                    {hasProfilePhoto ? (
                                        <div className="w-full h-full bg-emerald-100/50 flex items-center justify-center">
                                            <Check className="h-10 w-10 text-emerald-600" />
                                        </div>
                                    ) : (
                                        <Upload className="h-8 w-8 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                                    )}
                                </div>
                                {hasProfilePhoto && (
                                    <button
                                        type="button"
                                        className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                                        onClick={(e) => { e.stopPropagation(); setHasProfilePhoto(false); }}
                                    >
                                        <Pencil className="h-3 w-3 text-white" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Supports JPG, PNG or GIF. Max 5MB.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full border-none bg-muted/50 hover:bg-muted"
                                    onClick={() => setHasProfilePhoto(true)}
                                >
                                    Upload Image
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Personal Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Personal Details
                            <span className="h-px flex-1 bg-border/50"></span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium zen-text-muted">
                                    First Name
                                </label>
                                <Input
                                    id="firstName"
                                    className="border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
                                    placeholder="e.g. Kenji"
                                    {...register('firstName')}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium zen-text-muted">
                                    Last Name
                                </label>
                                <Input
                                    id="lastName"
                                    className="border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
                                    placeholder="e.g. Sato"
                                    {...register('lastName')}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                                )}
                            </div>
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
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium zen-text-muted">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                className="border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl h-11 transition-all"
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
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Role Assignment
                            <span className="h-px flex-1 bg-border/50"></span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => setValue('role', role.id)}
                                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 ${currentRole === role.id
                                            ? 'bg-primary/10 shadow-inner'
                                            : 'bg-muted/20 hover:bg-muted/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2.5 rounded-xl transition-colors ${currentRole === role.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-background'
                                            }`}>
                                            {role.icon}
                                        </div>
                                        <div className={`font-semibold ${currentRole === role.id ? 'text-primary' : 'text-foreground'}`}>
                                            {role.label}
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground/80 pl-1">
                                        {role.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Permissions Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Feature Permissions
                            <span className="h-px flex-1 bg-border/50"></span>
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
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
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
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
                    <div className="flex justify-end gap-3 pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleOpenChange(false)}
                            disabled={createUser.isPending}
                            className="rounded-xl hover:bg-muted/50"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createUser.isPending} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                            {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {createUser.isPending ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
