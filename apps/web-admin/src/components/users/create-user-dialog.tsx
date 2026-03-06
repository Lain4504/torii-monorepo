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
    Mail,
    BookOpen,
    MessageCircle,
    TrendingUp,
    ChevronRight,
    User,
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
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                    <form onSubmit={handlePreSubmit}>
                        <div className="relative">
                            {/* Header Background Decoration */}
                            <div className="absolute inset-0 h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent pointer-events-none" />

                            <div className="relative px-8 pt-8 pb-4">
                                <DialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 rounded-2xl bg-primary shadow-lg shadow-primary/20 text-primary-foreground transform transition-transform hover:scale-105">
                                            {isLecturerOnly ? <GraduationCap className="size-6" /> : <Users className="size-6" />}
                                        </div>
                                        <DialogTitle className="text-2xl font-black tracking-tight">{dialogTitle}</DialogTitle>
                                    </div>
                                    <DialogDescription className="text-sm font-medium text-muted-foreground/80">
                                        {totalSteps === 1
                                            ? 'Cung cấp thông tin để cấp quyền truy cập hệ thống.'
                                            : currentStep === 1
                                                ? 'Bước 01: Nhập thông tin cá nhân cơ bản.'
                                                : 'Bước 02: Lựa chọn vị trí chuyên môn phù hợp.'}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            {/* Step Indicator */}
                            {totalSteps > 1 && (
                                <div className="px-8 flex items-center gap-2 mb-6">
                                    {[1, 2].map((step) => (
                                        <div
                                            key={step}
                                            className={cn(
                                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                                currentStep >= step ? "bg-primary shadow-sm" : "bg-muted"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="px-8 pb-8">
                                <div className="space-y-6">
                                    {currentStep === 1 ? (
                                        <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <Controller
                                                name="displayName"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <FieldLabel htmlFor={field.name} className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                                Họ và tên đầy đủ
                                                            </FieldLabel>
                                                            <User className="size-3.5 text-primary/40" />
                                                        </div>
                                                        <Input
                                                            {...field}
                                                            id={field.name}
                                                            autoFocus
                                                            className="h-12 bg-muted/30 border-muted-foreground/10 focus:ring-primary/20 font-medium"
                                                            placeholder="Vd: Nguyễn Văn A"
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
                                                        <div className="flex items-center justify-between mb-2">
                                                            <FieldLabel htmlFor={field.name} className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                                Địa chỉ Email công việc
                                                            </FieldLabel>
                                                            <Mail className="size-3.5 text-primary/40" />
                                                        </div>
                                                        <Input
                                                            {...field}
                                                            id={field.name}
                                                            type="email"
                                                            className="h-12 bg-muted/30 border-muted-foreground/10 focus:ring-primary/20 font-medium"
                                                            placeholder="name@torii.edu.vn"
                                                        />
                                                        <FieldError errors={[fieldState.error]} />
                                                    </Field>
                                                )}
                                            />

                                            <div className="group p-4 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-start gap-4 transition-all hover:bg-primary/[0.05]">
                                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                    <Lock className="size-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-primary/80">Cơ chế Bảo mật</p>
                                                    <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                                                        Hệ thống sẽ gửi yêu cầu kích hoạt qua email. Người dùng cần xác nhận để thiết lập mật khẩu lần đầu.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 animate-in fade-in zoom-in-95 duration-500">
                                            {!showStaffVariants ? (
                                                <div className="grid gap-3">
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
                                                                        "group cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden",
                                                                        isSelected
                                                                            ? "bg-primary/[0.03] border-primary shadow-lg shadow-primary/10"
                                                                            : "bg-background border-muted/30 hover:border-primary/40 hover:bg-muted/10"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-5 relative z-10">
                                                                        <div className={cn(
                                                                            "p-3 rounded-xl shadow-inner transition-colors",
                                                                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                                                        )}>
                                                                            <Icon className="size-6" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between underline-offset-4 mb-1">
                                                                                <span className="font-bold text-base tracking-tight">{role.label}</span>
                                                                                {isSelected && <BadgeCheck className="size-5 text-primary animate-in zoom-in" />}
                                                                            </div>
                                                                            <p className="text-[11px] font-medium text-muted-foreground/80 leading-normal line-clamp-2">
                                                                                {role.description}
                                                                            </p>
                                                                        </div>
                                                                        {role.hasVariants && <ChevronRight className="size-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            ) : (
                                                <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                                                    {!isStaffOnly && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleBackToRoles}
                                                            className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                                                            <ArrowLeft className="size-3.5 mr-2" />
                                                            Quay lại danh sách vai trò
                                                        </Button>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {staffVariants.map((variant) => {
                                                            const Icon = variant.icon;
                                                            const isSelected = currentRole === variant.id;

                                                            return (
                                                                <div
                                                                    key={variant.id}
                                                                    onClick={() => handleStaffVariantSelect(variant.id)}
                                                                    className={cn(
                                                                        "group cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300",
                                                                        isSelected
                                                                            ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-[1.02]"
                                                                            : "bg-background border-muted/30 hover:border-primary/40 hover:bg-muted/10"
                                                                    )}
                                                                >
                                                                    <div className="flex flex-col gap-3">
                                                                        <div className={cn(
                                                                            "size-9 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                                                            isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                                                        )}>
                                                                            <Icon className="size-4" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                                <span className="font-bold text-xs tracking-tight">{variant.label}</span>
                                                                                {isSelected && <ShieldCheck className="size-3 text-white" />}
                                                                            </div>
                                                                            <p className={cn(
                                                                                "text-[9px] font-medium leading-relaxed line-clamp-2",
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
                            </div>

                            <DialogFooter className="px-8 py-6 border-t bg-muted/10 backdrop-blur-md gap-3">
                                {currentStep === 1 ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="font-bold text-xs uppercase tracking-widest text-muted-foreground hover:bg-transparent hover:text-foreground"
                                            onClick={() => handleOpenChange(false)}
                                            disabled={createInternalUser.isPending}
                                        >
                                            Hủy Bỏ
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNextToRole();
                                            }}
                                            className="px-8 font-black text-xs uppercase tracking-[0.15em] h-12 shadow-xl shadow-primary/20 hover:translate-x-1 transition-all"
                                            disabled={!detailsValid || createInternalUser.isPending}
                                        >
                                            {isLecturerOnly ? (
                                                createInternalUser.isPending ? (
                                                    <Spinner className="mr-2 size-4" />
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 size-4" />
                                                        Tạo ngay
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    Chọn vai trò
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
                                            className="font-bold text-xs uppercase tracking-widest text-muted-foreground"
                                            disabled={createInternalUser.isPending}
                                        >
                                            Quay lại
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="px-10 font-black text-xs uppercase tracking-[0.15em] h-12 bg-primary group shadow-xl shadow-primary/20"
                                            disabled={createInternalUser.isPending || (isStaffOnly && currentRole === UserRole.STAFF)}
                                        >
                                            {createInternalUser.isPending ? (
                                                <Spinner className="mr-2 size-4 text-white" />
                                            ) : (
                                                <>
                                                    <BadgeCheck className="mr-2 size-4" />
                                                    Xác nhận tạo
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent className="shadow-2xl border-none">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <ShieldCheck className="size-5" />
                            </div>
                            <AlertDialogTitle className="text-xl font-bold">Xác nhận tạo tài khoản?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                            Bạn đang thiết lập quyền truy cập <strong className="text-primary uppercase tracking-wider">{form.getValues('role')}</strong> cho
                            <strong className="text-foreground ml-1">{form.getValues('displayName')}</strong>.
                            <br /><br />
                            Hệ thống sẽ gửi một email kích hoạt đến <span className="font-bold underline decoration-primary/30">{form.getValues('email')}</span>.
                            Người dùng này sẽ có quyền truy cập vào các tính năng tương ứng với vai trò được chọn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel
                            disabled={createInternalUser.isPending}
                            className="font-bold text-xs uppercase tracking-widest border-none hover:bg-muted"
                        >
                            Kiểm tra lại
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                            }}
                            disabled={createInternalUser.isPending}
                            className="font-black text-xs uppercase tracking-[0.15em] px-6 h-11 shadow-lg shadow-primary/20"
                        >
                            {createInternalUser.isPending ? (
                                <>
                                    <Spinner className="mr-2 size-4" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận & Cấp quyền"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
