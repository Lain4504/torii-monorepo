import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
    createPointRewardDtoSchema,
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
import { useCreateReward } from "@/lib/api/services/gamification"
import { Star, Gift } from "lucide-react"

interface CreateRewardSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateRewardSheet({ open, onOpenChange }: CreateRewardSheetProps) {
    const createMutation = useCreateReward()

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createPointRewardDtoSchema),
        defaultValues: {
            name: "",
            description: "",
            points: 100,
            discountType: "percentage",
            discountValue: 10,
            maxDiscountAmount: null as number | null,
            minOrderAmount: null as number | null,
            validDuration: 30,
            isActive: true,
        },
    })


    const handleClose = () => {
        if (!createMutation.isPending) {
            onOpenChange(false)
            reset()
        }
    }

    const onSubmit = async (data: any) => {
        try {
            await createMutation.mutateAsync(data)
            toast.success("Đã tạo mẫu phần thưởng mới")
            handleClose()
        } catch (error: any) {
            toast.error(error.message || "Không thể tạo phần thưởng")
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                    <SheetTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Tạo mẫu phần thưởng mới
                    </SheetTitle>
                    <SheetDescription>
                        Thiết lập thông tin phần thưởng để người dùng dùng điểm XP quy đổi.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
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
                                            <FieldDescription>Kể từ lúc người dùng nhấn đổi quà.</FieldDescription>
                                        </Field>
                                    </div>
                                </FieldSet>

                                <FieldSet>
                                    <FieldLegend>Cấu hình Coupon sinh ra</FieldLegend>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Loại giảm giá</FieldLabel>
                                            <Select
                                                defaultValue="percentage"
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
                                                placeholder="Ví dụ: 200000"
                                                onChange={(e) => setValue("maxDiscountAmount", e.target.value ? Number(e.target.value) : null)}
                                            />
                                            <FieldDescription>Chỉ áp dụng cho loại phần trăm.</FieldDescription>
                                        </Field>
                                        <Field>
                                            <FieldLabel>Đơn hàng tối thiểu</FieldLabel>
                                            <Input
                                                type="number"
                                                placeholder="Ví dụ: 500000"
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
                                            defaultChecked
                                            onCheckedChange={(val) => setValue("isActive", val)}
                                        />
                                    </Field>
                                </FieldSet>
                            </FieldGroup>
                        </form>
                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t bg-card">
                    <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
                        Hủy
                    </Button>
                    <Button form="create-reward-form" type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Đang tạo..." : "Tạo mẫu phần thưởng"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
