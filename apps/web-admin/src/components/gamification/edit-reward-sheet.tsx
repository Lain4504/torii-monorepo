import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useEffect } from "react"
import {
    updatePointRewardDtoSchema,
    type PointRewardDto,
    type UpdatePointRewardDto,
} from "@workspace/schemas"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@workspace/ui/components/sheet"
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
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { useUpdateReward } from "@/lib/api/services/gamification"
import { Star, Gift } from "lucide-react"

interface EditRewardSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    reward: PointRewardDto
}

export function EditRewardSheet({ open, onOpenChange, reward }: EditRewardSheetProps) {
    const updateMutation = useUpdateReward()

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<UpdatePointRewardDto>({
        resolver: zodResolver(updatePointRewardDtoSchema),
        defaultValues: {
            name: reward.name,
            description: reward.description || "",
            points: reward.points,
            discountType: reward.discountType as "percentage" | "fixed_amount",
            discountValue: Number(reward.discountValue),
            maxDiscountAmount: reward.maxDiscountAmount ? Number(reward.maxDiscountAmount) : null,
            minOrderAmount: reward.minOrderAmount ? Number(reward.minOrderAmount) : null,
            validDuration: reward.validDuration || 30,
            isActive: reward.isActive,
        },
    })

    useEffect(() => {
        if (reward) {
            reset({
                name: reward.name,
                description: reward.description || "",
                points: reward.points,
                discountType: reward.discountType as "percentage" | "fixed_amount",
                discountValue: Number(reward.discountValue),
                maxDiscountAmount: reward.maxDiscountAmount ? Number(reward.maxDiscountAmount) : null,
                minOrderAmount: reward.minOrderAmount ? Number(reward.minOrderAmount) : null,
                validDuration: reward.validDuration || 30,
                isActive: reward.isActive,
            })
        }
    }, [reward, reset])

    const handleClose = () => {
        if (!updateMutation.isPending) {
            onOpenChange(false)
        }
    }

    const onSubmit = async (data: UpdatePointRewardDto) => {
        try {
            await updateMutation.mutateAsync({ id: reward.id, data })
            toast.success("Đã cập nhật phần thưởng")
            handleClose()
        } catch (error: any) {
            toast.error(error.message || "Không thể cập nhật")
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                    <SheetTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Chỉnh sửa mẫu phần thưởng
                    </SheetTitle>
                    <SheetDescription>
                        Cập nhật các thông tin và điều kiện của phần thưởng.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">
                        <form id="edit-reward-form" onSubmit={handleSubmit(onSubmit)}>
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
                                                {...register("points", { valueAsNumber: true })}
                                            />
                                            {errors.points && <FieldDescription className="text-destructive">{errors.points.message}</FieldDescription>}
                                        </Field>
                                        <Field>
                                            <FieldLabel>Thời hạn sử dụng (ngày)</FieldLabel>
                                            <Input
                                                type="number"
                                                {...register("validDuration", { valueAsNumber: true })}
                                            />
                                        </Field>
                                    </div>
                                </FieldSet>

                                <FieldSet>
                                    <FieldLegend>Cấu hình Coupon sinh ra</FieldLegend>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Loại giảm giá</FieldLabel>
                                            <Select
                                                defaultValue={reward.discountType as string}
                                                onValueChange={(val: any) => setValue("discountType", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Theo phần trăm (%)</SelectItem>
                                                    <SelectItem value="fixed_amount">Số tiền cố định (VND)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <FieldLabel>Giá trị giảm</FieldLabel>
                                            <Input
                                                type="number"
                                                {...register("discountValue", { valueAsNumber: true })}
                                            />
                                            {errors.discountValue && <FieldDescription className="text-destructive">{errors.discountValue.message}</FieldDescription>}
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Giảm tối đa (không bắt buộc)</FieldLabel>
                                            <Input
                                                type="number"
                                                defaultValue={reward.maxDiscountAmount ? Number(reward.maxDiscountAmount) : ""}
                                                onChange={(e) => setValue("maxDiscountAmount", e.target.value ? Number(e.target.value) : null)}
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel>Đơn hàng tối thiểu</FieldLabel>
                                            <Input
                                                type="number"
                                                defaultValue={reward.minOrderAmount ? Number(reward.minOrderAmount) : ""}
                                                onChange={(e) => setValue("minOrderAmount", e.target.value ? Number(e.target.value) : null)}
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
                </ScrollArea>

                <SheetFooter className="p-6 border-t bg-card">
                    <Button variant="outline" onClick={handleClose} disabled={updateMutation.isPending}>
                        Hủy
                    </Button>
                    <Button form="edit-reward-form" type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
