import { useForm, Controller } from 'react-hook-form';
import { useStep } from "@workspace/ui/hooks/use-step";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
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
    BookOpen,
    MessageCircle,
    TrendingUp,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    BadgeCheck,
    Lock,
    Save
} from 'lucide-react';
import { UserRole, adminCreateInternalUserDTOSchema } from '@workspace/schemas';
import { toast } from 'sonner';
import { useCreateInternalUser } from "@/lib/api/services/users.ts";
import { useState, useEffect } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Spinner } from "@workspace/ui/components/spinner";

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
        id: UserRole.STAFF_LMS,
        label: 'Quản trị viên LMS',
        icon: BookOpen,
        description: 'Giám sát hoạt động học tập và vận hành học thuật.',
    },
    {
        id: UserRole.STAFF_SUPPORT,
        label: 'Chuyên viên Hỗ trợ',
        icon: MessageCircle,
        description: 'Quản lý yêu cầu hỗ trợ và giải đáp thắc mắc người dùng.',
    },
    {
        id: UserRole.STAFF_SALES,
        label: 'Chuyên viên Phát triển',
        icon: TrendingUp,
        description: 'Thúc đẩy kinh doanh và mở rộng thị trường.',
    },
    {
        id: UserRole.STAFF_FINANCE,
        label: 'Chuyên viên Tài chính',
        icon: TrendingUp, // Or another icon like 'CreditCard' or 'Wallet' if available
        description: 'Quản lý mã giảm giá và các vấn đề tài chính.',
    },
];

const formSchema = adminCreateInternalUserDTOSchema.extend({
    displayName: z.string().min(1, 'Họ và tên là bắt buộc'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fixedRole?: UserRole.LECTURER | UserRole.STAFF;
}

export function CreateUserDialog({
    open,
    onOpenChange,
    fixedRole,
}: CreateUserDialogProps) {
    const isLecturerOnly = fixedRole === UserRole.LECTURER;
    const isStaffOnly = fixedRole === UserRole.STAFF;

    // For staff, we always want 2 steps: 
    // Step 1: Details
    // Step 2: Specific Staff Role Selection
    const totalSteps = isLecturerOnly ? 1 : 2;

    const [showStaffVariants, setShowStaffVariants] = useState(isStaffOnly);
    const [currentStep, { goToNextStep, goToPrevStep, reset }] = useStep(totalSteps);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            displayName: '',
            email: '',
            role: fixedRole || UserRole.LECTURER,
        },
    });

    const createInternalUser = useCreateInternalUser();

    useEffect(() => {
        if (open) {
            setShowStaffVariants(isStaffOnly);
            reset();
            form.reset({
                displayName: '',
                email: '',
                role: fixedRole || UserRole.LECTURER,
            });
        }
    }, [open, fixedRole, isStaffOnly, form, reset]);

    const [showConfirm, setShowConfirm] = useState(false);

    const onSubmit = async (data: FormValues) => {
        try {
            await createInternalUser.mutateAsync(data);
            toast.success('Thành công', {
                description: `Tài khoản ${data.displayName} đã được tạo thành công.`,
            });
            form.reset();
            setShowStaffVariants(isStaffOnly);
            reset();
            setShowConfirm(false);
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tạo người dùng';
            toast.error('Thất bại', {
                description: errorMessage,
            });
        }
    };

    const handlePreSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const valid = await form.trigger();
        if (valid) {
            setShowConfirm(true);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
            setShowStaffVariants(isStaffOnly);
            reset();
        }
        onOpenChange(newOpen);
    };

    const handleNextToRole = async () => {
        const valid = await form.trigger(['displayName', 'email']);
        if (valid) {
            if (isLecturerOnly) {
                form.handleSubmit(onSubmit)();
            } else {
                goToNextStep();
            }
        }
    };

    const handleBackToDetails = () => {
        goToPrevStep();
        if (!isStaffOnly) {
            setShowStaffVariants(false);
        }
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

    const handleStaffVariantSelect = (variantId: UserRole) => {
        form.setValue('role', variantId as UserRole.STAFF_LMS | UserRole.STAFF_SUPPORT | UserRole.STAFF_SALES | UserRole.STAFF_FINANCE, { shouldValidate: true });
    };

    const handleBackToRoles = () => {
        setShowStaffVariants(false);
        form.setValue('role', UserRole.STAFF);
    };

    const currentRole = form.watch('role');
    const displayName = form.watch('displayName');
    const email = form.watch('email');
    const detailsValid = !!displayName && !!email;

    const dialogTitle = isLecturerOnly
        ? 'Thêm Giảng Viên Mới'
        : isStaffOnly
            ? 'Thêm Nhân Viên Mới'
            : 'Thêm Người Dùng Mới';

    return (
        <>
            <Dialog open={open && !showConfirm} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <form onSubmit={handlePreSubmit}>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                                    {isLecturerOnly ? <GraduationCap className="size-5" /> : <Users className="size-5" />}
                                </div>
                                <DialogTitle>{dialogTitle}</DialogTitle>
                            </div>
                            <DialogDescription>
                                {totalSteps === 1
                                    ? 'Cung cấp thông tin để cấp quyền truy cập hệ thống.'
                                    : currentStep === 1
                                        ? 'Bước 1: Nhập thông tin cá nhân'
                                        : 'Bước 2: Chọn vai trò'}
                            </DialogDescription>
                        </DialogHeader>

                        {totalSteps > 1 && (
                            <div className="flex gap-2 mb-4">
                                {[1, 2].map((step) => (
                                    <div
                                        key={step}
                                        className={cn(
                                            "h-2 flex-1 rounded-full",
                                            currentStep >= step ? "bg-primary" : "bg-muted"
                                        )}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="space-y-4">
                            {currentStep === 1 ? (
                                <div className="space-y-4">
                                    <Controller
                                        name="displayName"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Họ và tên
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    autoFocus
                                                    placeholder="Nguyễn Văn A"
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
                                                <FieldLabel htmlFor={field.name}>
                                                    Email
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    type="email"
                                                    placeholder="name@torii.edu.vn"
                                                />
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />

                                    <div className="p-4 rounded-lg border bg-muted/50">
                                        <div className="flex gap-3">
                                            <Lock className="size-4 text-muted-foreground mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Bảo mật</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Hệ thống sẽ gửi email kích hoạt. Người dùng cần xác nhận để thiết lập mật khẩu.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {!showStaffVariants ? (
                                        <div className="space-y-2">
                                            {internalRoles
                                                .filter(role => !fixedRole || role.id === fixedRole)
                                                .map((role) => {
                                                    const Icon = role.icon;
                                                    const isSelected = currentRole === role.id ||
                                                        (role.id === UserRole.STAFF && currentRole.toString().startsWith('staff-'));

                                                    return (
                                                        <div
                                                            key={role.id}
                                                            onClick={() => handleRoleSelect(role.id)}
                                                            className={cn(
                                                                "cursor-pointer rounded-lg border p-4",
                                                                isSelected
                                                                    ? "border-primary bg-primary/5"
                                                                    : "hover:border-primary/50"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "p-2 rounded-md",
                                                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                                                )}>
                                                                    <Icon className="size-5" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-medium">{role.label}</span>
                                                                        {isSelected && <BadgeCheck className="size-4 text-primary" />}
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {role.description}
                                                                    </p>
                                                                </div>
                                                                {role.hasVariants && <ChevronRight className="size-4 text-muted-foreground" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {!isStaffOnly && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleBackToRoles}
                                                >
                                                    <ArrowLeft className="size-4 mr-2" />
                                                    Quay lại
                                                </Button>
                                            )}

                                            <div className="grid grid-cols-2 gap-2">
                                                {staffVariants.map((variant) => {
                                                    const Icon = variant.icon;
                                                    const isSelected = currentRole === variant.id;

                                                    return (
                                                        <div
                                                            key={variant.id}
                                                            onClick={() => handleStaffVariantSelect(variant.id)}
                                                            className={cn(
                                                                "cursor-pointer rounded-lg border p-3",
                                                                isSelected
                                                                    ? "bg-primary text-primary-foreground border-primary"
                                                                    : "hover:border-primary/50"
                                                            )}
                                                        >
                                                            <div className="flex flex-col gap-2">
                                                                <div className={cn(
                                                                    "size-8 rounded-md flex items-center justify-center",
                                                                    isSelected ? "bg-white/20" : "bg-muted"
                                                                )}>
                                                                    <Icon className="size-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-sm font-medium">{variant.label}</span>
                                                                        {isSelected && <ShieldCheck className="size-3" />}
                                                                    </div>
                                                                    <p className={cn(
                                                                        "text-xs",
                                                                        isSelected ? "text-white/80" : "text-muted-foreground"
                                                                    )}>
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

                        <DialogFooter className="mt-6">
                            {currentStep === 1 ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleOpenChange(false)}
                                        disabled={createInternalUser.isPending}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNextToRole();
                                        }}
                                        disabled={!detailsValid || createInternalUser.isPending}
                                    >
                                        {isLecturerOnly ? (
                                            createInternalUser.isPending ? (
                                                <>
                                                    <Spinner className="mr-2 size-4" />
                                                    Đang tạo...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 size-4" />
                                                    Tạo ngay
                                                </>
                                            )
                                        ) : (
                                            <>
                                                Tiếp theo
                                                <ChevronRight className="ml-2 size-4" />
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleBackToDetails}
                                        disabled={createInternalUser.isPending}
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createInternalUser.isPending || (isStaffOnly && currentRole === UserRole.STAFF)}
                                    >
                                        {createInternalUser.isPending ? (
                                            <>
                                                <Spinner className="mr-2 size-4" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <BadgeCheck className="mr-2 size-4" />
                                                Xác nhận
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-primary" />
                            <AlertDialogTitle>Xác nhận tạo tài khoản</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Bạn đang tạo tài khoản <strong>{form.getValues('role')}</strong> cho{' '}
                            <strong>{form.getValues('displayName')}</strong>.
                            <br /><br />
                            Email kích hoạt sẽ được gửi đến <strong>{form.getValues('email')}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={createInternalUser.isPending}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                            }}
                            disabled={createInternalUser.isPending}
                        >
                            {createInternalUser.isPending ? (
                                <>
                                    <Spinner className="mr-2 size-4" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
