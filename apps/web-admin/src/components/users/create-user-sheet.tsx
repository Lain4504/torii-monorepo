import { useForm, Controller } from 'react-hook-form';
import { useStep } from "@workspace/ui/hooks/use-step";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@workspace/ui/components/sheet';
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
    Check,
    ScanFace,
    Sparkles,
    ShieldCheck,
    BadgeCheck
} from 'lucide-react';
import { UserRole, adminCreateInternalUserDTOSchema } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateInternalUser } from "@/api/services/users.ts";
import { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';

const internalRoles = [
    {
        id: UserRole.LECTURER,
        label: 'Academic Lecturer',
        icon: GraduationCap,
        description: 'Manage curriculum delivery and student engagement protocols.',
    },
    {
        id: UserRole.STAFF,
        label: 'Operations Staff',
        icon: Users,
        description: 'Handle administrative workflows and system support.',
        hasVariants: true,
    },
];

const staffVariants = [
    {
        id: 'staff-lms' as const,
        label: 'LMS Administrator',
        icon: BookOpen,
        description: 'Oversee learning management and academic operations.',
    },
    {
        id: 'staff-support' as const,
        label: 'Support Specialist',
        icon: MessageCircle,
        description: 'Manage user inquiries and technical assistance.',
    },
    {
        id: 'staff-sales' as const,
        label: 'Growth Executive',
        icon: TrendingUp,
        description: 'Drive business development and market expansion.',
    },
];

const formSchema = adminCreateInternalUserDTOSchema.extend({
    displayName: z.string().min(1, 'Full name is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateUserSheet({
    open,
    onOpenChange,
}: CreateUserSheetProps) {
    const [showStaffVariants, setShowStaffVariants] = useState(false);
    const [currentStep, { goToNextStep, goToPrevStep, reset }] = useStep(2);

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
        try {
            await createInternalUser.mutateAsync(data);
            toast.success('Invitation Protocol Initiated', {
                description: `Secure uplink established for ${data.displayName}.`,
            });
            form.reset();
            setShowStaffVariants(false);
            reset();
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
            toast.error('Protocol Failure', {
                description: errorMessage,
            });
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
            setShowStaffVariants(false);
            reset();
        }
        onOpenChange(newOpen);
    };

    const handleNextToRole = async () => {
        const valid = await form.trigger(['displayName', 'email']);
        if (valid) {
            goToNextStep();
        }
    };

    const handleBackToDetails = () => {
        goToPrevStep();
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
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="sm:max-w-[600px] p-0 flex flex-col overflow-hidden bg-background/80 backdrop-blur-3xl border-l border-border/20 shadow-2xl">
                {/* Header */}
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative flex items-center gap-4 z-10">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                            <ScanFace className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                Initialize <span className="text-primary not-italic">Identity</span>
                            </SheetTitle>
                            <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                {currentStep === 1
                                    ? 'Step 01: Identity Parameters'
                                    : 'Step 02: Access Level Assignment'}
                            </SheetDescription>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-background/50 backdrop-blur-md rounded-full border border-border/20">
                            <span className={cn("size-2 rounded-full", currentStep === 1 ? "bg-primary animate-pulse" : "bg-primary/30")} />
                            <span className={cn("size-2 rounded-full", currentStep === 2 ? "bg-primary animate-pulse" : "bg-muted")} />
                        </div>
                    </div>
                </SheetHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 overflow-hidden relative z-10"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (currentStep === 1) {
                                e.preventDefault();
                                if (detailsValid) {
                                    handleNextToRole();
                                }
                            } else {
                                e.preventDefault();
                            }
                        }
                    }}
                >
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-8 py-8">
                        {currentStep === 1 ? (
                            // Step 1: Personal Details
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-500">
                                <Controller
                                    name="displayName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-3 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <User className="size-3" />
                                                Entity Name
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                autoFocus
                                                placeholder="ENTER FULL DESIGNATION"
                                                aria-invalid={fieldState.invalid}
                                                className={cn(
                                                    "h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20",
                                                    "text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                )}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-3 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <Mail className="size-3" />
                                                Communication Node
                                            </FieldLabel>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    type="email"
                                                    placeholder="NAME@TORII.NETWORK"
                                                    aria-invalid={fieldState.invalid}
                                                    className={cn(
                                                        "h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20",
                                                        "text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                    )}
                                                />
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />}
                                        </Field>
                                    )}
                                />

                                {/* Info Box */}
                                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                                    <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">System Notification</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                            An encrypted invitation key will be transmitted to the provided communication node for immediate synchronization.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Step 2: Role Selection
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                {!showStaffVariants ? (
                                    // Main role selection
                                    <div className="grid grid-cols-1 gap-4">
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
                                                        "relative group cursor-pointer rounded-[1.5rem] p-1 transition-all duration-300",
                                                        isSelected ? "bg-gradient-to-br from-primary via-primary/50 to-transparent p-[2px]" : "bg-transparent hover:bg-muted/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "relative flex items-center gap-5 p-5 w-full h-full rounded-[1.4rem]",
                                                        isSelected ? "bg-background/90" : "bg-muted/10 border border-border/10"
                                                    )}>
                                                        <div className={cn(
                                                            "p-3 rounded-2xl transition-all duration-300",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                                                                : "bg-background/50 text-muted-foreground group-hover:bg-background group-hover:text-foreground"
                                                        )}>
                                                            <Icon className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className={cn(
                                                                    "font-black uppercase tracking-tight text-sm",
                                                                    isSelected ? "text-primary italic" : "text-foreground"
                                                                )}>
                                                                    {role.label}
                                                                </span>
                                                                {isSelected && (
                                                                    <BadgeCheck className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground/60 mt-1 font-medium leading-relaxed">
                                                                {role.description}
                                                            </p>
                                                        </div>
                                                        {role.hasVariants && (
                                                            <ChevronRight className={cn(
                                                                "h-5 w-5 transition-transform duration-300",
                                                                isSelected ? "text-primary translate-x-1" : "text-border group-hover:text-muted-foreground"
                                                            )} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // Staff variants selection
                                    <div className="space-y-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleBackToRoles}
                                            className="mb-2 h-9 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl group"
                                        >
                                            <ArrowLeft className="h-3 w-3 mr-2 transition-transform group-hover:-translate-x-1" />
                                            Return to Origin
                                        </Button>

                                        <div className="grid gap-3">
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
                                                            "w-full cursor-pointer rounded-2xl p-4 transition-all duration-300 border bg-muted/5 hover:bg-muted/10",
                                                            isSelected
                                                                ? "border-primary/50 ring-1 ring-primary/20 shadow-[0_0_20px_-10px_rgba(var(--primary),0.3)]"
                                                                : "border-border/20 text-muted-foreground hover:border-border/40"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "p-2.5 rounded-xl transition-all",
                                                                isSelected
                                                                    ? "bg-primary/10 text-primary"
                                                                    : "bg-background/50"
                                                            )}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn(
                                                                        "font-bold text-xs uppercase tracking-wider",
                                                                        isSelected ? "text-primary" : "text-foreground"
                                                                    )}>
                                                                        {variant.label}
                                                                    </span>
                                                                    {isSelected && (
                                                                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium">
                                                                    {variant.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fixed Footer */}
                    <div className="px-8 py-6 bg-background/50 backdrop-blur-xl border-t border-border/10 flex items-center justify-between gap-4 relative z-20">
                        {currentStep === 1 ? (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleOpenChange(false)}
                                    className="rounded-xl h-12 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/20"
                                >
                                    Abort
                                </Button>
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleNextToRole();
                                    }}
                                    disabled={!detailsValid}
                                    className="rounded-xl h-12 px-8 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/5 hover:shadow-primary/20 group"
                                >
                                    Define Privileges
                                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleBackToDetails}
                                    disabled={createInternalUser.isPending}
                                    className="rounded-xl h-12 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/20 group"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    Details
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createInternalUser.isPending}
                                    className="rounded-xl h-12 px-8 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                                >
                                    {createInternalUser.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authorizing...
                                        </>
                                    ) : 'Execute Creation'}
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
