import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@workspace/ui/components/sheet";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
    FieldSet,
    FieldLegend,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";

import { useUpdateAchievement } from "@/lib/api/services/gamification";
import { Trophy, Star, Target, Zap, Flame, Award } from "lucide-react";
import type { AchievementDTO } from "@workspace/schemas";

const achievementTypes = [
    { value: 'STREAK_DAYS', label: 'Chuỗi ngày học tập' },
    { value: 'LONGEST_STREAK', label: 'Kỷ lục chuỗi ngày' },
    { value: 'LOGIN_DAYS', label: 'Tổng số ngày đăng nhập' },
    { value: 'LESSONS_COMPLETED', label: 'Bài học hoàn thành' },
    { value: 'EXAM_PASSED_COUNT', label: 'Số bài thi đã đỗ' },
    { value: 'EXAM_ATTEMPT_COUNT', label: 'Số lần thi' },
    { value: 'POINTS_EARNED_TOTAL', label: 'Tổng điểm tích lũy' },
    { value: 'LEVEL_REACHED', label: 'Cấp độ đạt được' },
    { value: 'REVIEWS_PUBLISHED', label: 'Số lượt đánh giá khóa học' },
    { value: 'CUSTOM', label: 'Tùy chỉnh / Khác' },
];

const icons = [
    { value: 'Trophy', icon: Trophy },
    { value: 'Star', icon: Star },
    { value: 'Target', icon: Target },
    { value: 'Zap', icon: Zap },
    { value: 'Flame', icon: Flame },
    { value: 'Award', icon: Award },
];

const categories = ['STREAK', 'CONSISTENCY', 'LEARNING_PROGRESS', 'MASTERY', 'SOCIAL', 'RECOVERY'];

const formSchema = z.object({
    code: z.string().min(3).max(50),
    title: z.string().min(3).max(100),
    description: z.string().min(5),
    category: z.string(),
    icon: z.string(),
    requirements: z.object({
        type: z.string(),
        value: z.number().min(1).optional().default(1),
    }),
    rewards: z.object({
        points: z.number().min(1, "Phần thưởng (XP) phải lớn hơn 0"),
    }),
    isActive: z.boolean(),
    orderIndex: z.number(),
});

type AchievementFormValues = z.infer<typeof formSchema>;

export function EditAchievementSheet({
    open,
    onOpenChange,
    achievement
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    achievement: AchievementDTO;
}) {
    const { mutate: updateAchievement, isPending } = useUpdateAchievement();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isDirty },
    } = useForm<AchievementFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            code: achievement.code,
            title: achievement.title,
            description: achievement.description,
            category: achievement.category,
            icon: achievement.icon || "Award",
            requirements: {
                type: (achievement.requirements as any)?.type || "STREAK_DAYS",
                value: (achievement.requirements as any)?.value || 1,
            },
            rewards: {
                points: (achievement.rewards as any)?.points || 0,
            },
            isActive: achievement.isActive,
            orderIndex: achievement.orderIndex || 0,
        },
    });

    // Update form when achievement changes
    useEffect(() => {
        if (achievement && open) {
            reset({
                code: achievement.code,
                title: achievement.title,
                description: achievement.description,
                category: achievement.category,
                icon: achievement.icon || "Award",
                requirements: {
                    type: (achievement.requirements as any)?.type || "STREAK_DAYS",
                    value: (achievement.requirements as any)?.value || 1,
                },
                rewards: {
                    points: (achievement.rewards as any)?.points || 0,
                },
                isActive: achievement.isActive,
                orderIndex: achievement.orderIndex || 0,
            });
        }
    }, [achievement, open, reset]);

    const category = watch("category");
    const icon = watch("icon");
    const reqType = watch("requirements.type");
    const needsValue = reqType !== 'CUSTOM';

    const onSubmit: SubmitHandler<AchievementFormValues> = (values) => {
        updateAchievement({ id: achievement.id, data: values }, {
            onSuccess: () => {
                toast.success("Đã cập nhật thành tích!");
                onOpenChange(false);
            },
            onError: (error: any) => {
                toast.error("Không thể cập nhật: " + error.message);
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] max-h-screen p-0 flex flex-col overflow-hidden">
                <SheetHeader className="p-6 border-b shrink-0">
                    <SheetTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        Chỉnh sửa Thành tích
                    </SheetTitle>
                    <SheetDescription>
                        Cập nhật thông tin và điều kiện cho thành tích này.
                    </SheetDescription>
                </SheetHeader>

                <form id="edit-achievement-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-6">
                            <FieldGroup className="space-y-6">
                                <FieldSet>
                                    <FieldLegend>Thông tin cơ bản</FieldLegend>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Tên thành tích</FieldLabel>
                                            <Input {...register("title")} />
                                            {errors.title && <FieldDescription className="text-destructive">{errors.title.message}</FieldDescription>}
                                        </Field>
                                        <Field>
                                            <FieldLabel>Mã (Code)</FieldLabel>
                                            <Input {...register("code")} />
                                            {errors.code && <FieldDescription className="text-destructive">{errors.code.message}</FieldDescription>}
                                        </Field>
                                    </div>

                                    <Field>
                                        <FieldLabel>Mô tả</FieldLabel>
                                        <Textarea {...register("description")} />
                                        {errors.description && <FieldDescription className="text-destructive">{errors.description.message}</FieldDescription>}
                                    </Field>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Phân loại</FieldLabel>
                                            <Select value={category} onValueChange={(val) => setValue("category", val, { shouldDirty: true })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <FieldLabel>Icon hiển thị</FieldLabel>
                                            <Select value={icon} onValueChange={(val) => setValue("icon", val, { shouldDirty: true })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {icons.map(({ value, icon: Icon }) => (
                                                        <SelectItem key={value} value={value}>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4" />
                                                                {value}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>
                                </FieldSet>

                                <FieldSet className="rounded-lg border p-4 bg-muted/30">
                                    <FieldLegend>Điều kiện đạt được (Requirements)</FieldLegend>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Loại chỉ số</FieldLabel>
                                            <Select value={reqType} onValueChange={(val) => setValue("requirements.type", val, { shouldDirty: true })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {achievementTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        {needsValue && (
                                            <Field>
                                                <FieldLabel>Giá trị cần đạt</FieldLabel>
                                                <Input type="number" {...register("requirements.value", { valueAsNumber: true })} />
                                                {errors.requirements?.value && <FieldDescription className="text-destructive">{errors.requirements.value.message}</FieldDescription>}
                                            </Field>
                                        )}
                                    </div>
                                </FieldSet>

                                <FieldSet>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel className="flex items-center gap-1.5">
                                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                                Phần thưởng (XP)
                                            </FieldLabel>
                                            <Input type="number" {...register("rewards.points", { valueAsNumber: true })} />
                                            {errors.rewards?.points && <FieldDescription className="text-destructive">{errors.rewards.points.message}</FieldDescription>}
                                        </Field>
                                        <Field>
                                            <FieldLabel>Thứ tự hiển thị</FieldLabel>
                                            <Input type="number" {...register("orderIndex", { valueAsNumber: true })} />
                                        </Field>
                                    </div>

                                    <Field orientation="horizontal" className="justify-between items-center bg-muted/20 p-4 rounded-lg mt-4">
                                        <div className="space-y-0.5">
                                            <FieldLabel>Đang hoạt động</FieldLabel>
                                            <FieldDescription>Học viên có thể đạt được thành tích này.</FieldDescription>
                                        </div>
                                            <Switch
                                                checked={watch("isActive")}
                                                onCheckedChange={(val) => setValue("isActive", val, { shouldDirty: true })}
                                            />
                                    </Field>
                                </FieldSet>
                            </FieldGroup>
                        </div>
                    </ScrollArea>

                    <div className="p-6 border-t flex justify-end gap-3 bg-muted/20 shrink-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Hủy</Button>
                        <Button type="submit" disabled={isPending || !isDirty}>
                            {isPending ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
