import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useEffect } from "react"
import {
    updatePointRewardDTOSchema,
    type PointRewardDTO,
    type UpdatePointRewardDTO,
} from "@workspace/schemas"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@workspace/ui/components/dialog"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
    FieldSet,
    FieldLegend,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"

import { useUpdateReward } from "@/lib/api/services/gamification"
import { Star, Gift, Save } from "lucide-react"
import { Spinner } from "@workspace/ui/components/spinner"

interface EditRewardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    reward: PointRewardDTO
}

export function EditRewardDialog({ open, onOpenChange, reward }: EditRewardDialogProps) {
    const updateMutation = useUpdateReward()

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        control,
        watch,
        formState: { errors, isDirty },
    } = useForm<UpdatePointRewardDTO>({
        resolver: zodResolver(updatePointRewardDTOSchema) as any,
        defaultValues: {
            name: reward.name,
            description: reward.description || "",
            costPoints: reward.costPoints,
            type: reward.type,
            config: {
                discountType: reward.config?.discountType || "PERCENTAGE",
                discountValue: Number(reward.config?.discountValue || 0),
                maxDiscountAmount: reward.config?.maxDiscountAmount ? Number(reward.config.maxDiscountAmount) : undefined,
                minOrderValue: reward.config?.minOrderValue ? Number(reward.config.minOrderValue) : undefined,
                validDays: Number(reward.config?.validDays || 30),
            },
            isActive: reward.isActive,
        },
    })

    // const config = watch("config")
    const discountType = watch("config.discountType")

    useEffect(() => {
        if (reward) {
            reset({
                name: reward.name,
                description: reward.description || "",
                costPoints: reward.costPoints,
                type: reward.type,
                config: {
                    discountType: reward.config?.discountType || "PERCENTAGE",
                    discountValue: Number(reward.config?.discountValue || 0),
                    maxDiscountAmount: reward.config?.maxDiscountAmount ? Number(reward.config.maxDiscountAmount) : undefined,
                    minOrderValue: reward.config?.minOrderValue ? Number(reward.config.minOrderValue) : undefined,
                    validDays: Number(reward.config?.validDays || 30),
                },
                isActive: reward.isActive,
            })
        }
    }, [reward, reset])

    const handleClose = () => {
        if (!updateMutation.isPending) {
            onOpenChange(false)
        }
    }

    const onSubmit = async (data: UpdatePointRewardDTO) => {
        try {
            await updateMutation.mutateAsync({ id: reward.id, data })
            toast.success("Đã cập nhật phần thưởng")
            handleClose()
        } catch (error: any) {
            toast.error(error.message || "Không thể cập nhật")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Chỉnh sửa mẫu phần thưởng
                    </DialogTitle>
                    <DialogDescription>
                        Cập nhật các thông tin và điều kiện của phần thưởng.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-6 p-6">
                        <form id="edit-reward-form" onSubmit={handleSubmit(onSubmit as any)}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Thông tin cơ bản</FieldLegend>
                                    <Field>
                                        <FieldLabel>Tên phần thưởng</FieldLabel>
                                        <Input {...register("name")} />
                                        {errors.name && <FieldDescription className="text-destructive">{errors.name.message}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel>Mô tả (không bắt buộc)</FieldLabel>
                                        <Textarea
                                            className="min-h-[100px]"
                                            {...register("description")}
                                        />
                                    </Field>
                                </FieldSet>

                                <FieldSet>
                                    <FieldLegend>Cấu hình quy đổi</FieldLegend>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel className="flex items-center gap-1.5">
                                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                                Số điểm cần đổi (XP)
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                {...register("costPoints", { valueAsNumber: true })}
                                            />
                                            {errors.costPoints && <FieldDescription className="text-destructive">{errors.costPoints.message}</FieldDescription>}
                                        </Field>
                                        <Field>
                                            <FieldLabel>Thời hạn sử dụng (ngày)</FieldLabel>
                                            <Input
                                                type="number"
                                                {...register("config.validDays", { valueAsNumber: true })}
                                            />
                                        </Field>
                                    </div>
                                </FieldSet>

                                <FieldSet>
                                    <FieldLegend>Cấu hình Coupon sinh ra</FieldLegend>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Loại giảm giá</FieldLabel>
                                            <Controller
                                                name="config.discountType"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PERCENTAGE">Theo phần trăm (%)</SelectItem>
                                                            <SelectItem value="FIXED_AMOUNT">Số tiền cố định (VND)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel>Giá trị giảm</FieldLabel>
                                            <Input
                                                type="number"
                                                {...register("config.discountValue", { valueAsNumber: true })}
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {discountType === "PERCENTAGE" && (
                                            <Field>
                                                <FieldLabel>Giảm tối đa (không bắt buộc)</FieldLabel>
                                                <Input
                                                    type="number"
                                                    {...register("config.maxDiscountAmount", { valueAsNumber: true })}
                                                />
                                            </Field>
                                        )}
                                        <Field className={discountType === "PERCENTAGE" ? "" : "col-span-2"}>
                                            <FieldLabel>Đơn hàng tối thiểu</FieldLabel>
                                            <Input
                                                type="number"
                                                {...register("config.minOrderValue", { valueAsNumber: true })}
                                            />
                                        </Field>
                                    </div>
                                </FieldSet>

                                <FieldSet>
                                    <Field orientation="horizontal" className="justify-between items-center bg-muted/30 p-4 rounded-lg">
                                        <div className="space-y-0.5">
                                            <FieldLabel>Đang hoạt động</FieldLabel>
                                            <FieldDescription>Người dùng có thể nhìn thấy và đổi quà này.</FieldDescription>
                                        </div>
                                        <Switch
                                            defaultChecked={reward.isActive}
                                            onCheckedChange={(val) => setValue("isActive", val)}
                                        />
                                    </Field>
                                </FieldSet>
                            </FieldGroup>
                        </form>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={updateMutation.isPending}>
                        Hủy Bố
                    </Button>
                    <Button
                        form="edit-reward-form"
                        type="submit"
                        disabled={updateMutation.isPending || !isDirty}>
                        {updateMutation.isPending ? (
                            <>
                                <Spinner className="mr-2" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Lưu thay đổi
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
