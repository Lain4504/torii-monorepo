import { useForm, Controller } from 'react-hook-form';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@workspace/ui/components/sheet';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2, X, Ticket, Calendar as CalendarIcon, Percent, DollarSign } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { CouponDiscountType, type CouponCreateDTO } from '@workspace/schemas';
import { useCreateCoupon } from "@/api/services/coupons";

interface CreateCouponSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCouponSheet({ open, onOpenChange }: CreateCouponSheetProps) {
    const createMutation = useCreateCoupon();

    // Default validUntil = 30 days from now
    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
        watch,
    } = useForm<CouponCreateDTO>({
        defaultValues: {
            code: '',
            name: '',
            description: '',
            discountType: CouponDiscountType.PERCENTAGE,
            discountValue: 0,
            maxDiscountAmount: undefined,
            minOrderAmount: undefined,
            usageLimit: undefined,
            userUsageLimit: 1,
            validFrom: new Date(),
            validUntil: defaultValidUntil,
            applicableCourseIds: [],
            excludedCourseIds: [],
        },
    });

    const discountType = watch('discountType');

    const handleClose = () => {
        if (!createMutation.isPending) {
            onOpenChange(false);
            reset();
        }
    };

    const onSubmit = async (data: CouponCreateDTO) => {
        try {
            await createMutation.mutateAsync({
                ...data,
                // Ensure correct types
                discountValue: Number(data.discountValue),
                maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined,
                minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
                usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
                userUsageLimit: Number(data.userUsageLimit || 1),
                validFrom: new Date(data.validFrom),
                validUntil: new Date(data.validUntil)
            });

            toast.success('Đã tạo coupon', {
                description: `Mã ${data.code} đã được tạo thành công.`,
            });
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Tạo thất bại', {
                description: 'Đã xảy ra lỗi khi tạo coupon. Vui lòng thử lại.',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:w-[600px] !max-w-[600px] flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background space-y-0">
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5">
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            <Ticket className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-2xl font-sans font-bold italic tracking-tight text-foreground uppercase">
                                Tạo Coupon Mới
                            </SheetTitle>
                            <SheetDescription className="text-xs font-medium text-muted-foreground/60">
                                Thiết lập mã giảm giá mới cho hệ thống.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 py-8 space-y-8">

                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="code" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Mã Coupon <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="code"
                                            {...register('code', { required: 'Mã coupon là bắt buộc' })}
                                            placeholder="VD: SALE50, SUMMER2024"
                                            className="h-11 px-4 rounded-xl font-mono uppercase tracking-widest font-bold placeholder:normal-case"
                                        />
                                        {errors.code && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.code.message}</FieldError>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="name" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Tên Chiến Dịch <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="name"
                                            {...register('name', { required: 'Tên chiến dịch là bắt buộc' })}
                                            placeholder="VD: Siêu sale mùa hè"
                                            className="h-11 px-4 rounded-xl"
                                        />
                                        {errors.name && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.name.message}</FieldError>}
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="description" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                        Mô Tả
                                    </FieldLabel>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        placeholder="Mô tả chi tiết về mã giảm giá..."
                                        rows={3}
                                        className="rounded-xl resize-none p-4"
                                    />
                                </Field>
                            </div>

                            {/* Discount Settings */}
                            <div className="space-y-6 pt-6 border-t border-border/40">
                                <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50">
                                    Thiết Lập Giảm Giá
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="discountType" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Loại Giảm Giá
                                        </FieldLabel>
                                        <Controller
                                            name="discountType"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="h-11 px-4 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value={CouponDiscountType.PERCENTAGE}>Theo phần trăm (%)</SelectItem>
                                                        <SelectItem value={CouponDiscountType.FIXED_AMOUNT}>Số tiền cố định (VND)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="discountValue" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Giá Trị Giảm <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                id="discountValue"
                                                type="number"
                                                min="0"
                                                {...register('discountValue', { valueAsNumber: true, required: true, min: 1 })}
                                                className="h-11 pl-10 pr-4 rounded-xl font-mono font-bold"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                {discountType === CouponDiscountType.PERCENTAGE ? <Percent className="size-4" /> : <DollarSign className="size-4" />}
                                            </div>
                                        </div>
                                    </Field>
                                </div>

                                {discountType === CouponDiscountType.PERCENTAGE && (
                                    <Field>
                                        <FieldLabel htmlFor="maxDiscountAmount" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Giảm Tối Đa (VND)
                                        </FieldLabel>
                                        <Input
                                            id="maxDiscountAmount"
                                            type="number"
                                            min="0"
                                            {...register('maxDiscountAmount', { valueAsNumber: true })}
                                            placeholder="Không giới hạn"
                                            className="h-11 px-4 rounded-xl font-mono"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">Để trống nếu không giới hạn số tiền giảm.</p>
                                    </Field>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="minOrderAmount" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                        Đơn Hàng Tối Thiểu (VND)
                                    </FieldLabel>
                                    <Input
                                        id="minOrderAmount"
                                        type="number"
                                        min="0"
                                        {...register('minOrderAmount', { valueAsNumber: true })}
                                        placeholder="0"
                                        className="h-11 px-4 rounded-xl font-mono"
                                    />
                                </Field>
                            </div>

                            {/* Usage Limits */}
                            <div className="space-y-6 pt-6 border-t border-border/40">
                                <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50">
                                    Giới Hạn Sử Dụng
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="usageLimit" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Tổng Lượt Dùng
                                        </FieldLabel>
                                        <Input
                                            id="usageLimit"
                                            type="number"
                                            min="0"
                                            {...register('usageLimit', { valueAsNumber: true })}
                                            placeholder="Không giới hạn"
                                            className="h-11 px-4 rounded-xl font-mono"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="userUsageLimit" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Lượt Dùng / User
                                        </FieldLabel>
                                        <Input
                                            id="userUsageLimit"
                                            type="number"
                                            min="1"
                                            {...register('userUsageLimit', { valueAsNumber: true, min: 1 })}
                                            defaultValue={1}
                                            className="h-11 px-4 rounded-xl font-mono"
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Validity Period */}
                            <div className="space-y-6 pt-6 border-t border-border/40">
                                <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50">
                                    Thời Gian Hiệu Lực
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Bắt Đầu
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                {...register('validFrom', { valueAsDate: true })}
                                                className="h-11 px-4 rounded-xl"
                                                defaultValue={new Date().toISOString().split('T')[0]}
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </Field>

                                    <Field>
                                        <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Kết Thúc
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                {...register('validUntil', { valueAsDate: true })}
                                                className="h-11 px-4 rounded-xl"
                                                defaultValue={defaultValidUntil.toISOString().split('T')[0]}
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={createMutation.isPending}>
                            <X className="mr-2 h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || !isDirty}>
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Ticket className="mr-2 h-4 w-4" />
                                    Tạo Coupon
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
