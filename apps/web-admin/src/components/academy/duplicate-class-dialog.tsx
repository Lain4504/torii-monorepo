import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    academyClassDuplicateDTOSchema,
    type AcademyClassDuplicateDTO,
} from "@workspace/schemas"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "sonner"
import { useDuplicateAcademyClass, type AcademyClass } from "@/lib/api/services/academy-classes"
import { useNavigate } from "react-router-dom"

export function DuplicateClassDialog({
    sourceClass,
    open,
    onOpenChange,
}: {
    sourceClass: AcademyClass
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const navigate = useNavigate()
    const duplicateMutation = useDuplicateAcademyClass()

    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = useForm<AcademyClassDuplicateDTO>({
        resolver: zodResolver(academyClassDuplicateDTOSchema),
        defaultValues: {
            code: "",
            name: `${sourceClass.name} (Bản sao)`,
            term: sourceClass.liveClass?.term ?? "",
            batch: sourceClass.liveClass?.batch ?? "",
            startDate: sourceClass.liveClass?.startDate ? new Date(sourceClass.liveClass.startDate) : undefined,
            endDate: sourceClass.liveClass?.endDate ? new Date(sourceClass.liveClass.endDate) : undefined,
        },
    })

    const isLive = sourceClass.mode === "LIVE"

    const onSubmit = async (data: AcademyClassDuplicateDTO) => {
        try {
            const result = await duplicateMutation.mutateAsync({
                id: sourceClass.id,
                input: data,
            })
            toast.success("Đã nhân bản lớp học thành công")
            onOpenChange(false)
            navigate(`/academy/classes/${result.id}`)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể nhân bản lớp học")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Nhân bản lớp học</DialogTitle>
                        <DialogDescription>
                            Tạo một lớp học mới từ lớp {sourceClass.code}. Trạng thái sẽ là DRAFT.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        <FieldGroup>
                            <Controller
                                name="code"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Mã lớp mới (Tùy chọn)</FieldLabel>
                                        <Input placeholder="Để trống để tự động sinh" {...field} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name="name"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Tên lớp mới</FieldLabel>
                                        <Input placeholder="Nhập tên lớp học" {...field} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />

                            {isLive && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller
                                            name="term"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field>
                                                    <FieldLabel>Kỳ học (Term)</FieldLabel>
                                                    <Input placeholder="2026-Q1" {...field} />
                                                    <FieldError>{fieldState.error?.message}</FieldError>
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="batch"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field>
                                                    <FieldLabel>Đợt (Batch)</FieldLabel>
                                                    <Input placeholder="K01" {...field} />
                                                    <FieldError>{fieldState.error?.message}</FieldError>
                                                </Field>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller
                                            name="startDate"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field>
                                                    <FieldLabel>Ngày bắt đầu</FieldLabel>
                                                    <Input
                                                        type="date"
                                                        value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? field.value.toISOString().slice(0, 10) : ""}
                                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                    />
                                                    <FieldError>{fieldState.error?.message}</FieldError>
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="endDate"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field>
                                                    <FieldLabel>Ngày kết thúc</FieldLabel>
                                                    <Input
                                                        type="date"
                                                        value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? field.value.toISOString().slice(0, 10) : ""}
                                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                    />
                                                    <FieldError>{fieldState.error?.message}</FieldError>
                                                </Field>
                                            )}
                                        />
                                    </div>
                                </>
                            )}
                        </FieldGroup>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner className="mr-2" />}
                            Xác nhận nhân bản
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
