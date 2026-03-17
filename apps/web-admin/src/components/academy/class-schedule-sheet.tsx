import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Plus, Trash2, Calendar, Clock, MapPin, FileEdit } from "lucide-react"
import { toast } from "sonner"
import {
  useAcademyLiveSchedules,
  useCreateAcademyLiveSchedule,
  useDeleteAcademyLiveSchedule,
} from "@/lib/api/services/academy-live-schedules"
import { Item } from "@workspace/ui/components/item"

const scheduleItemSchema = z.object({
  id: z.string().optional(),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().min(1, "Bắt đầu không được để trống"),
  endTime: z.string().min(1, "Kết thúc không được để trống"),
  location: z.string().optional(),
  note: z.string().optional(),
})

const scheduleFormSchema = z.object({
  schedules: z.array(scheduleItemSchema),
})

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>

interface ClassScheduleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
}

const WEEKDAYS = [
  { value: "1", label: "Thứ Hai" },
  { value: "2", label: "Thứ Ba" },
  { value: "3", label: "Thứ Tư" },
  { value: "4", label: "Thứ Năm" },
  { value: "5", label: "Thứ Sáu" },
  { value: "6", label: "Thứ Bảy" },
  { value: "0", label: "Chủ Nhật" },
]

export function ClassScheduleSheet({ open, onOpenChange, classId }: ClassScheduleSheetProps) {
  const { data: existingSchedules = [] } = useAcademyLiveSchedules(
    { classId },
    { enabled: open && !!classId }
  )

  const createScheduleMutation = useCreateAcademyLiveSchedule()
  const deleteScheduleMutation = useDeleteAcademyLiveSchedule()

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      schedules: [],
    },
  })

  useEffect(() => {
    if (open && existingSchedules.length > 0) {
      form.reset({
        schedules: existingSchedules.map((s) => ({
          id: s.id,
          weekday: s.weekday,
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location || "",
          note: s.note || "",
        })),
      })
    } else if (open) {
      form.reset({ schedules: [] })
    }
  }, [existingSchedules, form, open])

  const { fields, append, remove } = useFieldArray({
    name: "schedules",
    control: form.control,
  })

  const onSubmit = async (values: ScheduleFormValues) => {
    try {
        const existingIds = existingSchedules.map(s => s.id)
        const currentIds = values.schedules.map(s => s.id).filter(Boolean) as string[]
        
        const toDelete = existingIds.filter(id => !currentIds.includes(id))
        const toCreate = values.schedules.filter(s => !s.id)

        // Delete removed ones
        for (const id of toDelete) {
            await deleteScheduleMutation.mutateAsync(id)
        }

        // Create new ones
        for (const s of toCreate) {
            await createScheduleMutation.mutateAsync({
                classId,
                weekday: s.weekday,
                startTime: s.startTime,
                endTime: s.endTime,
                location: s.location,
                note: s.note,
            })
        }

        toast.success("Cập nhật lịch học thành công")
        onOpenChange(false)
    } catch (error) {
        toast.error("Lỗi khi cập nhật lịch học")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[800px] flex flex-col p-0 text-foreground">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Thiết lập lịch học trong tuần</SheetTitle>
          <SheetDescription>
            Quy định các buổi học cố định trong tuần cho lớp này. Hệ thống sẽ tự động tạo các buổi học (session) dựa trên lịch này.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="space-y-6 p-6">
              {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                    <Calendar className="size-12 opacity-20 mb-4" />
                    <p className="text-sm">Chưa có lịch học nào được thiết lập.</p>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => append({ weekday: 1, startTime: "18:00", endTime: "20:00" })}
                    >
                        <Plus className="size-4 mr-2" /> Thêm buổi đầu tiên
                    </Button>
                </div>
              )}

              <FieldGroup>
                {fields.map((field, index) => (
                  <Item key={field.id} variant="outline" className="p-4 block">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                {index + 1}
                            </span>
                            <h3 className="font-semibold text-sm">Buổi học #{index + 1}</h3>
                        </div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Field>
                        <FieldLabel>Ngày trong tuần</FieldLabel>
                        <Select
                          onValueChange={(val) => form.setValue(`schedules.${index}.weekday`, parseInt(val, 10))}
                          value={form.watch(`schedules.${index}.weekday`)?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thứ" />
                          </SelectTrigger>
                          <SelectContent>
                            {WEEKDAYS.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field>
                        <FieldLabel>Giờ bắt đầu</FieldLabel>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <Input 
                                type="time" 
                                className="pl-9" 
                                {...form.register(`schedules.${index}.startTime`)} 
                            />
                        </div>
                      </Field>

                      <Field>
                        <FieldLabel>Giờ kết thúc</FieldLabel>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <Input 
                                type="time" 
                                className="pl-9" 
                                {...form.register(`schedules.${index}.endTime`)} 
                            />
                        </div>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Field>
                            <FieldLabel>Phòng học / Địa điểm (không bắt buộc)</FieldLabel>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input 
                                    className="pl-9" 
                                    placeholder="Phòng A101, Zoom, ..."
                                    {...form.register(`schedules.${index}.location`)}
                                />
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel>Ghi chú</FieldLabel>
                            <div className="relative">
                                <FileEdit className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input 
                                    className="pl-9" 
                                    placeholder="Ghi chú buổi học..."
                                    {...form.register(`schedules.${index}.note`)}
                                />
                            </div>
                        </Field>
                    </div>
                  </Item>
                ))}
              </FieldGroup>

              {fields.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed py-6"
                  onClick={() => append({ weekday: 1, startTime: "18:00", endTime: "20:00" })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Thêm buổi học khác
                </Button>
              )}
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 border-t bg-muted/10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={createScheduleMutation.isPending || deleteScheduleMutation.isPending}>
              Lưu thay đổi
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
