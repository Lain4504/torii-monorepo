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
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
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
    Sparkles,
    ShieldCheck,
    BadgeCheck
} from 'lucide-react';
import { UserRole, adminCreateInternalUserDTOSchema } from '@workspace/schemas';
import { toast } from 'sonner';
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
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Thêm Người Dùng Mới</SheetTitle>
                    <SheetDescription>
                        {currentStep === 1
                            ? 'Bước 01: Thông tin cá nhân'
                            : 'Bước 02: Phân quyền vai trò'}
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 overflow-hidden min-h-0"
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
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            {currentStep === 1 ? (
                                <div className="space-y-6">
                                    <Controller
                                        name="displayName"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                                                    <User className="size-4" />
                                                    Họ và tên
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    autoFocus
                                                    placeholder="Nhập họ và tên đầy đủ"
                                                />
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="email"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                                                    <Mail className="size-4" />
                                                    Địa chỉ Email
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    type="email"
                                                    placeholder="example@torii.edu.vn"
                                                />
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />

                                    <div className="p-4 rounded-lg bg-muted/20 border flex items-start gap-3">
                                        <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold">Thông tin xác thực</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Một liên kết xác nhận sẽ được gửi đến email để người dùng kích hoạt tài khoản.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
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
                                                        className={cn(
                                                            "cursor-pointer rounded-lg p-4 border transition-colors",
                                                            isSelected
                                                                ? "bg-primary/5 border-primary shadow-sm"
                                                                : "bg-background border-border hover:bg-muted/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "p-2 rounded-lg transition-colors",
                                                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                                            )}>
                                                                <Icon className="size-5" />
                                                            </div>
                                                            <div className="flex-1 min-h-0">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-semibold text-sm">{role.label}</span>
                                                                    {isSelected && <BadgeCheck className="size-4 text-primary" />}
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                                    {role.description}
                                                                </p>
                                                            </div>
                                                            {role.hasVariants && <ChevronRight className="size-4 text-muted-foreground/50" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleBackToRoles}
                                                className="h-8 px-0 text-muted-foreground hover:text-foreground">
                                                <ArrowLeft className="size-3.5 mr-2" />
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
                                                            className={cn(
                                                                "cursor-pointer rounded-lg p-3.5 border transition-colors",
                                                                isSelected ? "bg-primary/5 border-primary" : "bg-background border-border hover:bg-muted/50"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "p-2 rounded-lg",
                                                                    isSelected ? "bg-primary/10 text-primary" : "bg-muted"
                                                                )}>
                                                                    <Icon className="size-3.5" />
                                                                </div>
                                                                <div className="flex-1 min-h-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold text-xs">{variant.label}</span>
                                                                        {isSelected && <ShieldCheck className="size-3 text-primary" />}
                                                                    </div>
                                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
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
                    </ScrollArea>

                    <SheetFooter>
                        {currentStep === 1 ? (
                            <>
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleNextToRole();
                                    }}
                                    disabled={!detailsValid}
                                >
                                    Tiếp tục
                                    <ChevronRight className="ml-2 size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Hủy Bỏ
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="submit"
                                    disabled={createInternalUser.isPending}
                                >
                                    {createInternalUser.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 size-3.5 animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : 'Tạo người dùng'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBackToDetails}
                                    disabled={createInternalUser.isPending}
                                >
                                    Quay lại
                                </Button>
                            </>
                        )}
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
