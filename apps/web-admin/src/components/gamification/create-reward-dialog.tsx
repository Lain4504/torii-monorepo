import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
    createPointRewardDTOSchema,
    type CreatePointRewardDTO,
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
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { useCreateReward } from "@/lib/api/services/gamification"
import { Star, Gift, Ticket, X } from "lucide-react"
import { Spinner } from "@workspace/ui/components/spinner"

interface CreateRewardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateRewardDialog({ open, onOpenChange }: CreateRewardDialogProps) {
    const createMutation = useCreateReward()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm<CreatePointRewardDTO>({
        resolver: zodResolver(createPointRewardDTOSchema),
        defaultValues: {
            name: "",
            description: "",
            costPoints: 100,
            type: "COUPON",
            config: {
                discountType: "PERCENTAGE",
                discountValue: 10,
                maxDiscountAmount: null,
                minOrderValue: null,
                validDays: 30,
            },
            isActive: true,
        },
    })

    const config = watch("config")

    const handleClose = () => {
        if (!createMutation.isPending) {
            onOpenChange(false)
            reset()
        }
    }

    const onSubmit = async (data: CreatePointRewardDTO) => {
        try {
            await createMutation.mutateAsync(data)
            toast.success("Đã tạo mẫu phần thưởng mới")
            handleClose()
        } catch (error: any) {
            toast.error(error.message || "Không thể tạo phần thưởng")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Tạo mẫu phần thưởng mới
                    </DialogTitle>
                    <DialogDescription>
                        Thiết lập thông tin phần thưởng để người dùng dùng điểm XP quy đổi.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 max-h-[calc(90vh-180px)]">
                    <div className="space-y-6 p-6">
                        <form id="create-reward-form" onSubmit={handleSubmit(onSubmit)}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Thông tin cơ bản</FieldLegend>
                                    <Field>
                                        <FieldLabel>Tên phần thưởng</FieldLabel>
                                        <Input
                                            placeholder="Ví dụ: Giảm giá 50k cho khóa học N3"
                                            {...register("name")}
                                        />
                                        {errors.name && <FieldDescription className="text-destructive">{errors.name.message}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel>Mô tả (không bắt buộc)</FieldLabel>
                                        <Textarea
                                            placeholder="Chi tiết về phần thưởng..."
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
                                            <FieldDescription>Kể từ lúc người dùng nhấn đổi quà.</FieldDescription>
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
                                        <Field>
                                            <FieldLabel>Giảm tối đa (không bắt buộc)</FieldLabel>
                                            <Input
                                                type="number"
                                                placeholder="Ví dụ: 200000"
                                                {...register("config.maxDiscountAmount", { valueAsNumber: true })}
                                            />
                                            <FieldDescription>Chỉ áp dụng cho loại phần trăm.</FieldDescription>
                                        </Field>
                                        <Field>
                                            <FieldLabel>Đơn hàng tối thiểu</FieldLabel>
                                            <Input
                                                type="number"
                                                placeholder="Ví dụ: 500000"
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
                                            defaultChecked
                                            onCheckedChange={(val) => setValue("isActive", val)}
                                        />
                                    </Field>
                                </FieldSet>
                            </FieldGroup>
                        </form>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={createMutation.isPending}>
                        Hủy Bỏ
                    </Button>
                    <Button
                        form="create-reward-form"
                        type="submit"
                        disabled={createMutation.isPending || !isDirty}>
                        {createMutation.isPending ? (
                            <>
                                <Spinner className="mr-2" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Ticket className="mr-2 h-4 w-4" />
                                Tạo phần thưởng
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
