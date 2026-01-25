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
        label: 'Giảng viên',
        icon: GraduationCap,
        description: 'Quản lý nội dung học tập và tương tác với học viên.',
    },
    {
        id: UserRole.STAFF,
        label: 'Nhân viên vận hành',
        icon: Users,
        description: 'Xử lý các quy trình hành chính và quản trị hệ thống.',
        hasVariants: true,
    },
];

const staffVariants = [
    {
        id: 'staff-lms' as const,
        label: 'Quản trị viên LMS',
        icon: BookOpen,
        description: 'Giám sát hoạt động học tập và vận hành học thuật.',
    },
    {
        id: 'staff-support' as const,
        label: 'Chuyên viên Hỗ trợ',
        icon: MessageCircle,
        description: 'Quản lý yêu cầu hỗ trợ và giải đáp thắc mắc người dùng.',
    },
    {
        id: 'staff-sales' as const,
        label: 'Chuyên viên Phát triển',
        icon: TrendingUp,
        description: 'Thúc đẩy kinh doanh và mở rộng thị trường.',
    },
    {
        id: 'staff-finance' as const,
        label: 'Chuyên viên Tài chính',
        icon: TrendingUp, // Or another icon like 'CreditCard' or 'Wallet' if available
        description: 'Quản lý mã giảm giá và các vấn đề tài chính.',
    },
];

const formSchema = adminCreateInternalUserDTOSchema.extend({
    displayName: z.string().min(1, 'Họ và tên là bắt buộc'),
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
            toast.success('Thành công', {
                description: `Tài khoản ${data.displayName} đã được tạo thành công.`,
            });
            form.reset();
            setShowStaffVariants(false);
            reset();
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tạo người dùng';
            toast.error('Thất bại', {
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

    const handleStaffVariantSelect = (variantId: 'staff-lms' | 'staff-support' | 'staff-sales' | 'staff-finance') => {
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
            <SheetContent className="sm:max-w-[550px] p-0 flex flex-col bg-background border-l border-border shadow-xl">
                {/* Header */}
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/50 bg-muted/20 relative">
                    <div className="relative flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <ScanFace className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                            <SheetTitle className="text-xl font-serif font-bold italic uppercase tracking-tight">
                                Thêm <span className="text-primary">Người dùng mới</span>
                            </SheetTitle>
                            <SheetDescription className="text-[10px] font-serif font-bold italic uppercase tracking-widest text-muted-foreground/60">
                                {currentStep === 1
                                    ? 'Bước 01: Thông tin cá nhân'
                                    : 'Bước 02: Phân quyền vai trò'}
                            </SheetDescription>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-background/50 rounded-full border border-border/50">
                            <div className={cn("size-1.5 rounded-full transition-all", currentStep === 1 ? "bg-primary w-4" : "bg-muted-foreground/30")} />
                            <div className={cn("size-1.5 rounded-full transition-all", currentStep === 2 ? "bg-primary w-4" : "bg-muted-foreground/30")} />
                        </div>
                    </div>
                </SheetHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 overflow-hidden"
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
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Controller
                                    name="displayName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-2 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-xs font-semibold text-foreground/70 group-focus-within:text-primary transition-colors">
                                                <User className="size-3.5" />
                                                Họ và tên
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                autoFocus
                                                placeholder="Nhập họ và tên đầy đủ"
                                                aria-invalid={fieldState.invalid}
                                                className={cn(
                                                    "h-11 px-4 rounded-xl bg-background border-border hover:border-primary/50 focus-visible:ring-primary/20",
                                                    "text-sm font-medium transition-all"
                                                )}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[11px] font-medium text-destructive mt-1" />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-2 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-xs font-semibold text-foreground/70 group-focus-within:text-primary transition-colors">
                                                <Mail className="size-3.5" />
                                                Địa chỉ Email
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="email"
                                                placeholder="example@torii.edu.vn"
                                                aria-invalid={fieldState.invalid}
                                                className={cn(
                                                    "h-11 px-4 rounded-xl bg-background border-border hover:border-primary/50 focus-visible:ring-primary/20",
                                                    "text-sm font-medium transition-all"
                                                )}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[11px] font-medium text-destructive mt-1" />}
                                        </Field>
                                    )}
                                />

                                {/* Info Box */}
                                <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
                                    <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-foreground/80">Thông tin xác thực</p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Một liên kết xác nhận sẽ được gửi đến email để người dùng kích hoạt tài khoản.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Step 2: Role Selection
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {!showStaffVariants ? (
                                    <div className="grid grid-cols-1 gap-3">
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
                                                        "relative cursor-pointer rounded-xl p-4 transition-all duration-300 border",
                                                        isSelected
                                                            ? "bg-primary/5 border-primary shadow-sm"
                                                            : "bg-background border-border hover:border-primary/50 hover:bg-muted/5"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "p-2.5 rounded-xl transition-all",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted text-muted-foreground group-hover:text-primary"
                                                        )}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className={cn(
                                                                    "font-semibold text-sm",
                                                                    isSelected ? "text-primary" : "text-foreground"
                                                                )}>
                                                                    {role.label}
                                                                </span>
                                                                {isSelected && (
                                                                    <BadgeCheck className="h-4 w-4 text-primary" />
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-1">
                                                                {role.description}
                                                            </p>
                                                        </div>
                                                        {role.hasVariants && (
                                                            <ChevronRight className={cn(
                                                                "h-4 w-4 transition-transform",
                                                                isSelected ? "text-primary translate-x-1" : "text-muted-foreground/30"
                                                            )} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleBackToRoles}
                                            className="mb-1 h-8 px-0 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                                            Quay lại vai trò chính
                                        </Button>

                                        <div className="grid gap-2">
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
                                                            "w-full cursor-pointer rounded-xl p-3.5 transition-all border",
                                                            isSelected
                                                                ? "bg-primary/5 border-primary shadow-sm"
                                                                : "bg-background border-border hover:border-primary/50 hover:bg-muted/5"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "p-2 rounded-xl transition-all",
                                                                isSelected
                                                                    ? "bg-primary/10 text-primary"
                                                                    : "bg-muted/50"
                                                            )}>
                                                                <Icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn(
                                                                        "font-semibold text-xs",
                                                                        isSelected ? "text-primary" : "text-foreground"
                                                                    )}>
                                                                        {variant.label}
                                                                    </span>
                                                                    {isSelected && (
                                                                        <ShieldCheck className="h-3 w-3 text-primary" />
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
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
                    <div className="px-8 py-5 bg-muted/20 border-t border-border/50 flex items-center justify-between gap-4">
                        {currentStep === 1 ? (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleOpenChange(false)}
                                    className="rounded-xl h-10 px-6 text-xs font-semibold text-muted-foreground hover:bg-muted"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleNextToRole();
                                    }}
                                    disabled={!detailsValid}
                                    className="rounded-xl h-10 px-6 bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all group"
                                >
                                    Tiếp tục
                                    <ChevronRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleBackToDetails}
                                    disabled={createInternalUser.isPending}
                                    className="rounded-xl h-10 px-4 text-xs font-semibold text-muted-foreground hover:bg-muted group"
                                >
                                    <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                                    Thông tin
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createInternalUser.isPending}
                                    className="rounded-xl h-10 px-8 bg-primary text-primary-foreground text-xs font-semibold shadow-md active:scale-95 transition-all"
                                >
                                    {createInternalUser.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : 'Tạo người dùng'}
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
