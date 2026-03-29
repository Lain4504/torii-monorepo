import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Field,
    FieldError,
    FieldLabel,
    FieldGroup,
} from "@workspace/ui/components/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@workspace/ui/components/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Search } from "lucide-react"
import { Spinner } from "@workspace/ui/components/spinner"
import {
    academyEnrollmentCreateDTOSchema,
    academyEnrollmentUpdateDTOSchema,
    type AcademyEnrollmentCreateDTO,
    type AcademyEnrollmentUpdateDTO,
    UserRole,
} from "@workspace/schemas"
import type { AcademyEnrollment } from "@/lib/api/services/academy-enrollments"
import { useAcademyLiveClasses } from "@/lib/api/services/academy-live-classes"
import { useUsers } from "@/lib/api/services/users"
import { useDebounceValue } from "@workspace/ui/hooks/use-debounce-value"

export function EnrollmentForm({
    mode,
    initial,
    onSubmit,
    onCancel,
    submitting,
    defaultClassId,
}: {
    mode: "create" | "edit"
    initial?: AcademyEnrollment
    onSubmit: (
        data: AcademyEnrollmentCreateDTO | AcademyEnrollmentUpdateDTO
    ) => Promise<void>
    onCancel: () => void
    submitting?: boolean
    defaultClassId?: string
}) {
    const isEdit = mode === "edit"
    const [classSearch, setClassSearch] = useState("")
    const [debouncedClassSearch] = useDebounceValue(classSearch, 500)
    const [openClassPopover, setOpenClassPopover] = useState(false)

    const { data: classesData = [], isLoading: loadingClasses } = useAcademyLiveClasses({
        q: debouncedClassSearch,
    })
    const classes = Array.isArray(classesData) ? classesData : (classesData as any)?.items || []

    const [search, setSearch] = useState("")
    const [debouncedSearch] = useDebounceValue(search, 500)
    const [openUserPopover, setOpenUserPopover] = useState(false)

    const { data: learnersData, isLoading: loadingLearners } = useUsers({
        role: UserRole.LEARNER,
        search: debouncedSearch,
        limit: 100,
    })
    const learners = learnersData?.data || []

    const { handleSubmit, control } = useForm<
        AcademyEnrollmentCreateDTO | AcademyEnrollmentUpdateDTO
    >({
        resolver: zodResolver(
            (isEdit
                ? academyEnrollmentUpdateDTOSchema
                : academyEnrollmentCreateDTOSchema) as any
        ) as any,
        defaultValues: (isEdit
            ? {
                expiresAt: initial?.expiresAt ? new Date(initial.expiresAt) : undefined,
                status: initial?.status ?? 'ACTIVE',
            }
            : {
                liveClassId: defaultClassId ?? "",
                userId: "",
                status: "ACTIVE",
            }) as any,
    })

    const today = new Date().toISOString().split("T")[0]

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-6">
                <FieldGroup>
                    {!isEdit && (
                        <>
                            {!defaultClassId && (
                                <Controller
                                    name={"liveClassId" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Lớp học</FieldLabel>
                                            <Popover open={openClassPopover} onOpenChange={setOpenClassPopover}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="w-full justify-between font-normal"
                                                    >
                                                        {field.value
                                                            ? classes.find((c: any) => c.id === field.value)?.name || "Đã chọn lớp"
                                                            : "Chọn lớp..."}
                                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0" align="start">
                                                    <Command shouldFilter={false}>
                                                        <CommandInput
                                                            placeholder="Tìm lớp học (tên hoặc mã)..."
                                                            value={classSearch}
                                                            onValueChange={setClassSearch}
                                                        />
                                                        <CommandList>
                                                            {loadingClasses && (
                                                                <div className="p-4 text-center">
                                                                    <Spinner className="mx-auto" />
                                                                </div>
                                                            )}
                                                            {!loadingClasses && classes.length === 0 && (
                                                                <CommandEmpty>Không tìm thấy lớp học nào</CommandEmpty>
                                                            )}
                                                            <CommandGroup>
                                                                {classes.map((cls: any) => (
                                                                    <CommandItem
                                                                        key={cls.id}
                                                                        value={cls.id}
                                                                        onSelect={() => {
                                                                            field.onChange(cls.id)
                                                                            setOpenClassPopover(false)
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                field.value === cls.id ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{cls.name}</span>
                                                                            <span className="text-xs text-muted-foreground">{cls.code}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />
                            )}

                            <Controller
                                name={"userId" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Học viên</FieldLabel>
                                        <Popover open={openUserPopover} onOpenChange={setOpenUserPopover}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full justify-between font-normal"
                                                >
                                                    {field.value
                                                        ? learners.find((u: any) => u.id === field.value)?.displayName || "Đã chọn học viên"
                                                        : "Chọn học viên..."}
                                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0" align="start">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="Tìm học viên (tên hoặc email)..."
                                                        value={search}
                                                        onValueChange={setSearch}
                                                    />
                                                    <CommandList>
                                                        {loadingLearners && (
                                                            <div className="p-4 text-center">
                                                                <Spinner className="mx-auto" />
                                                            </div>
                                                        )}
                                                        {!loadingLearners && learners.length === 0 && (
                                                            <CommandEmpty>Không tìm thấy học viên nào</CommandEmpty>
                                                        )}
                                                        <CommandGroup>
                                                            {learners.map((u: any) => (
                                                                <CommandItem
                                                                    key={u.id}
                                                                    value={u.id}
                                                                    onSelect={() => {
                                                                        field.onChange(u.id)
                                                                        setOpenUserPopover(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value === u.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{u.displayName}</span>
                                                                        <span className="text-xs text-muted-foreground">{u.email}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name={"status" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Trạng thái</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
                                            <SelectItem value="COMPLETED">Hoàn thành (COMPLETED)</SelectItem>
                                            <SelectItem value="CANCELLED">Đã huỷ (CANCELLED)</SelectItem>
                                            <SelectItem value="EXPIRED">Hết hạn (EXPIRED)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <Controller
                            name={"expiresAt" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Ngày hết hạn</FieldLabel>
                                    <Input type="date" {...field} min={today} />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />
                    </div>
                </FieldGroup>
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? <Spinner className="mr-2" /> : null}
                    {isEdit ? "Lưu thay đổi" : "Ghi danh học viên"}
                </Button>
            </div>
        </form>
    )
}
