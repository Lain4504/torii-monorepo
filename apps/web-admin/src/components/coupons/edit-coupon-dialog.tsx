import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@workspace/ui/components/dialog';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Calendar } from '@workspace/ui/components/calendar';
import { cn } from '@workspace/ui/lib/utils';
import { format } from 'date-fns';
import { Ticket, CalendarIcon, Percent, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { CouponDiscountType, CouponStatus, type CouponResponseDTO, type CouponUpdateDTO } from '@workspace/schemas';
import { useUpdateCoupon } from "@/lib/api/services/coupons";
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Spinner } from "@workspace/ui/components/spinner";

interface EditCouponDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon: CouponResponseDTO;
}

export function EditCouponDialog({ open, onOpenChange, coupon }: EditCouponDialogProps) {
    const updateMutation = useUpdateCoupon();
    const hasUsage = coupon.usageCount > 0;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
        watch,
    } = useForm<CouponUpdateDTO>({
        defaultValues: {
            code: coupon.code,
            name: coupon.name,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue),
            maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined,
            minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : undefined,
            usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : undefined,
            perUserLimit: Number(coupon.perUserLimit || 1),
            startDate: coupon.startDate ? new Date(coupon.startDate) : new Date(),
            endDate: coupon.endDate ? new Date(coupon.endDate) : new Date(),
            status: coupon.status,
            applicableCourseMasterIds: coupon.applicableCourseMasterIds || [],
            excludedCourseMasterIds: coupon.excludedCourseMasterIds || [],
            applicableRunIds: coupon.applicableRunIds || [],
            excludedRunIds: coupon.excludedRunIds || [],
        },
    });

    useEffect(() => {
        if (open && coupon) {
            reset({
                code: coupon.code,
                name: coupon.name,
                description: coupon.description || '',
                discountType: coupon.discountType,
                discountValue: Number(coupon.discountValue),
                maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined,
                minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : undefined,
                usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : undefined,
                perUserLimit: Number(coupon.perUserLimit || 1),
                startDate: coupon.startDate ? new Date(coupon.startDate) : new Date(),
                endDate: coupon.endDate ? new Date(coupon.endDate) : new Date(),
                status: coupon.status,
                applicableCourseMasterIds: coupon.applicableCourseMasterIds || [],
                excludedCourseMasterIds: coupon.excludedCourseMasterIds || [],
                applicableRunIds: coupon.applicableRunIds || [],
                excludedRunIds: coupon.excludedRunIds || [],
            });
        }
    }, [open, coupon, reset]);

    const discountType = watch('discountType');

    const handleClose = () => {
        if (!updateMutation.isPending) {
            onOpenChange(false);
            reset();
        }
    };

    const onSubmit = async (data: CouponUpdateDTO) => {
        try {
            await updateMutation.mutateAsync({
                id: coupon.id,
                data: {
                    ...data,
                    discountValue: Number(data.discountValue),
                    maxDiscountAmount: (data.maxDiscountAmount && !Number.isNaN(data.maxDiscountAmount)) ? Number(data.maxDiscountAmount) : null,
                    minOrderValue: (data.minOrderValue !== undefined && data.minOrderValue !== null && !Number.isNaN(data.minOrderValue)) ? Number(data.minOrderValue) : null,
                    usageLimit: (data.usageLimit && !Number.isNaN(data.usageLimit)) ? Number(data.usageLimit) : null,
                    perUserLimit: Number(data.perUserLimit || 1),
                    startDate: data.startDate!,
                    endDate: data.endDate!
                }
            });

            toast.success('Đã cập nhật', {
                description: `Mã ${coupon.code} đã được cập nhật thành công.`,
            });
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại', {
                description: 'Đã xảy ra lỗi khi cập nhật coupon. Vui lòng thử lại.',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
                <DialogHeader className="p-6 pb-0 shadow-sm z-10 bg-background">
                    <DialogTitle>Chỉnh Sửa Coupon</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin mã phiếu giảm giá #{coupon.id.slice(0, 8)}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden" noValidate>
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-6 p-6">

                            {hasUsage && (
                                <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600 rounded-xl">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle className="ml-2 font-bold mb-0">Lưu ý quan trọng</AlertTitle>
                                    <AlertDescription className="ml-2 text-xs opacity-90">
                                        Coupon này đã được sử dụng. Một số trường (Loại giảm giá, Giá trị) có thể bị khóa để đảm bảo tính toàn vẹn dữ liệu.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="code" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Mã Coupon
                                        </FieldLabel>
                                        <Input
                                            id="code"
                                            {...register('code')}
                                            disabled={true}
                                            className="font-mono uppercase tracking-widest font-bold placeholder:normal-case bg-muted/20"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="name" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Tên Chiến Dịch <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="name"
                                            {...register('name', { required: 'Tên chiến dịch là bắt buộc' })}
                                            className=""
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
                                        rows={3}
                                        className="rounded-xl resize-none p-4"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="status" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                        Trạng Thái
                                    </FieldLabel>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={CouponStatus.ACTIVE}>Đang hoạt động</SelectItem>
                                                    <SelectItem value={CouponStatus.INACTIVE}>Ngừng hoạt động</SelectItem>
                                                    <SelectItem value={CouponStatus.EXPIRED}>Đã hết hạn</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
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
                                                    <SelectTrigger className="">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
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
                                                className="pl-10 font-mono font-bold"
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
                                            className="font-mono"
                                        />
                                    </Field>
                                )}

                                <Field>
                                    <FieldLabel htmlFor="minOrderValue" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                        Đơn Hàng Tối Thiểu (VND)
                                    </FieldLabel>
                                    <Input
                                        id="minOrderValue"
                                        type="number"
                                        min="0"
                                        {...register('minOrderValue', { valueAsNumber: true })}
                                        className="font-mono"
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
                                            className="font-mono"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="perUserLimit" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Lượt Dùng / User
                                        </FieldLabel>
                                        <Input
                                            id="perUserLimit"
                                            type="number"
                                            min="1"
                                            {...register('perUserLimit', { valueAsNumber: true, min: 1 })}
                                            className="font-mono"
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
                                    <Controller
                                        control={control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Bắt Đầu
                                                </FieldLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(new Date(field.value), "PPP") : <span>Chọn ngày</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={new Date(field.value!)}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.startDate && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.startDate.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Kết Thúc
                                                </FieldLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(new Date(field.value), "PPP") : <span>Chọn ngày</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={new Date(field.value!)}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.endDate && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.endDate.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0 mt-4 shadow-sm z-10 bg-background">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={updateMutation.isPending}>
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending || !isDirty}>
                            {updateMutation.isPending ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Ticket className="mr-2 h-4 w-4" />
                                    Lưu Thay Đổi
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
