import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@workspace/ui/components/dialog';
import {
    Field,
    FieldError,
    FieldLabel,
} from '@workspace/ui/components/field';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    GraduationCap,
    Users,
    Mail,
    Loader2,
    BookOpen,
    MessageCircle,
    TrendingUp,
    ChevronRight,
    User,
    ArrowLeft,
    Check
} from 'lucide-react';
import { UserRole, adminCreateInternalUserDTOSchema } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateInternalUser } from "@/api/services/users.ts";
import { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';

const internalRoles = [
    {
        id: UserRole.LECTURER,
        label: 'Lecturer',
        icon: GraduationCap,
        description: 'Teaching staff managing classes and students',
    },
    {
        id: UserRole.STAFF,
        label: 'Staff',
        icon: Users,
        description: 'Administrative staff with department roles',
        hasVariants: true,
    },
];

const staffVariants = [
    {
        id: 'staff-lms' as const,
        label: 'LMS Staff',
        icon: BookOpen,
        description: 'Learning Management & Academic Operations',
    },
    {
        id: 'staff-support' as const,
        label: 'Support Staff',
        icon: MessageCircle,
        description: 'Customer support and general inquiries',
    },
    {
        id: 'staff-sales' as const,
        label: 'Sales Staff',
        icon: TrendingUp,
        description: 'Sales, marketing, and business development',
    },
];

const formSchema = adminCreateInternalUserDTOSchema.extend({
    displayName: z.string().min(1, 'Full name is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
    open,
    onOpenChange,
}: CreateUserDialogProps) {
    const [showStaffVariants, setShowStaffVariants] = useState(false);
    const [step, setStep] = useState<'details' | 'role'>('details');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onSubmit',
        defaultValues: {
            displayName: '',
            email: '',
            role: UserRole.LECTURER,
        },
    });

    const createInternalUser = useCreateInternalUser();

    const onSubmit = async (data: FormValues) => {
        console.log('🚀 Form submitted with data:', data);
        try {
            await createInternalUser.mutateAsync(data);
            toast.success('Invitation sent!', {
                description: `${data.displayName} will receive an email at ${data.email}`,
            });
            form.reset();
            setShowStaffVariants(false);
            setStep('details');
            onOpenChange(false);
        } catch (error: any) {
            console.error('❌ Create user error:', error);
            toast.error('Failed to create user', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
            setShowStaffVariants(false);
            setStep('details');
        }
        onOpenChange(newOpen);
    };

    const handleNextToRole = async () => {
        const valid = await form.trigger(['displayName', 'email']);
        if (valid) {
            setStep('role');
        }
    };

    const handleBackToDetails = () => {
        setStep('details');
        setShowStaffVariants(false);
    };

    const handleRoleSelect = (roleId: string) => {
        if (roleId === UserRole.STAFF) {
            setShowStaffVariants(true);
            form.setValue('role', UserRole.STAFF, { shouldValidate: false });
        } else if (roleId === UserRole.LECTURER) {
            form.setValue('role', UserRole.LECTURER, { shouldValidate: false });
            setShowStaffVariants(false);
        }
    };

    const handleStaffVariantSelect = (variantId: 'staff-lms' | 'staff-support' | 'staff-sales') => {
        form.setValue('role', variantId as any, { shouldValidate: false });
    };

    const handleBackToRoles = () => {
        setShowStaffVariants(false);
        form.setValue('role', UserRole.STAFF);
    };

    const currentRole = form.watch('role');
    const displayName = form.watch('displayName');
    const email = form.watch('email');
    const detailsValid = displayName && email && !form.formState.errors.displayName && !form.formState.errors.email;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[520px] border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-xl font-bold">
                                Create Internal User
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                {step === 'details'
                                    ? 'Enter user information to send an invitation'
                                    : 'Select the appropriate role and department'}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        <div className={cn(
                            "flex-1 h-1 rounded-full transition-all duration-300",
                            step === 'details' ? "bg-primary" : "bg-primary/30"
                        )} />
                        <div className={cn(
                            "flex-1 h-1 rounded-full transition-all duration-300",
                            step === 'role' ? "bg-primary" : "bg-muted"
                        )} />
                    </div>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (step === 'details') {
                                e.preventDefault();
                                if (detailsValid) {
                                    handleNextToRole();
                                }
                            } else {
                                // Prevent Enter from submitting at step 2
                                // User must click "Create & Send Invite" button
                                e.preventDefault();
                            }
                        }
                    }}
                >
                    {/* Content */}
                    <div className="px-6 py-6 min-h-[320px]">
                        {step === 'details' ? (
                            // Step 1: Personal Details
                            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                                <Controller
                                    name="displayName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Full Name <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                autoFocus
                                                placeholder="e.g. Kenji Sato"
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
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Email Address <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    type="email"
                                                    placeholder="kenji@torii.com"
                                                    aria-invalid={fieldState.invalid}
                                                    className={cn(
                                                        "pl-11 border-none bg-muted/40 hover:bg-muted/60 focus-visible:bg-muted/60",
                                                        "focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl h-12 transition-all"
                                                    )}
                                                />
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                {/* Info Box */}
                                <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-sm text-muted-foreground">
                                        💡 An invitation email will be sent to this address with instructions to set up their account.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // Step 2: Role Selection
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                {!showStaffVariants ? (
                                    // Main role selection
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {internalRoles.map((role) => {
                                            const Icon = role.icon;
                                            const isSelected = currentRole === role.id ||
                                                (role.id === UserRole.STAFF && currentRole.toString().startsWith('staff-'));

                                            return (
                                                <div
                                                    key={role.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => handleRoleSelect(role.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            handleRoleSelect(role.id);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "relative group cursor-pointer rounded-xl p-4 transition-all duration-200",
                                                        "border-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "p-2.5 rounded-lg transition-all duration-200",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground shadow-md"
                                                                : "bg-background group-hover:bg-muted"
                                                        )}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn(
                                                                    "font-semibold text-sm",
                                                                    isSelected ? "text-primary" : "text-foreground"
                                                                )}>
                                                                    {role.label}
                                                                </span>
                                                                {isSelected && (
                                                                    <Check className="h-4 w-4 text-primary" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                {role.description}
                                                            </p>
                                                        </div>
                                                        {role.hasVariants && (
                                                            <ChevronRight className={cn(
                                                                "h-4 w-4 transition-colors flex-shrink-0",
                                                                isSelected ? "text-primary" : "text-muted-foreground"
                                                            )} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // Staff variants selection
                                    <div className="space-y-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleBackToRoles}
                                            className="mb-2 h-8 px-3 text-xs hover:bg-muted/50"
                                        >
                                            <ArrowLeft className="h-3 w-3 mr-1.5" />
                                            Back to roles
                                        </Button>

                                        {staffVariants.map((variant) => {
                                            const Icon = variant.icon;
                                            const isSelected = currentRole === variant.id;

                                            return (
                                                <div
                                                    key={variant.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => handleStaffVariantSelect(variant.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            handleStaffVariantSelect(variant.id);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full cursor-pointer rounded-xl p-4 transition-all duration-200",
                                                        "border-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "p-2 rounded-lg transition-all",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-background"
                                                        )}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn(
                                                                    "font-semibold text-sm",
                                                                    isSelected ? "text-primary" : "text-foreground"
                                                                )}>
                                                                    {variant.label}
                                                                </span>
                                                                {isSelected && (
                                                                    <Check className="h-4 w-4 text-primary" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {variant.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex items-center justify-between gap-3">
                        {step === 'details' ? (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleOpenChange(false)}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleNextToRole();
                                    }}
                                    disabled={!detailsValid}
                                    className="rounded-xl px-6"
                                >
                                    Next: Select Role
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleBackToDetails}
                                    disabled={createInternalUser.isPending}
                                    className="rounded-xl"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createInternalUser.isPending}
                                    className="rounded-xl px-6 shadow-lg shadow-primary/20"
                                >
                                    {createInternalUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {createInternalUser.isPending ? 'Sending...' : 'Create & Send Invite'}
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
