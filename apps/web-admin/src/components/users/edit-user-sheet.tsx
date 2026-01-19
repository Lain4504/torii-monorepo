import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import type { UserResponseDTO } from '@workspace/schemas';
import { Loader2, User, Mail, ShieldCheck, X, UserCog } from 'lucide-react';
import { userAdminUpdateDTOSchema, type UserAdminUpdateDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateUser } from "@/api/services/users.ts";
import { cn } from '@workspace/ui/lib/utils';

type UpdateUserFormData = UserAdminUpdateDTO;

interface EditUserSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponseDTO | null;
}

export function EditUserSheet({
    open,
    onOpenChange,
    user,
}: EditUserSheetProps) {
    const updateUser = useUpdateUser();
    const {
        control,
        handleSubmit,
    } = useForm<UpdateUserFormData>({
        resolver: zodResolver(userAdminUpdateDTOSchema),
        values: user ? {
            displayName: user.displayName,
            email: user.email,
            role: user.role as any,
        } : undefined,
    });

    const handleFormSubmit = async (data: UpdateUserFormData) => {
        if (!user) return;
        try {
            await updateUser.mutateAsync({
                id: user.id,
                user: data,
            });
            toast.success('User Updated', {
                description: `User details have been updated.`,
            });
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
            toast.error('Update Failed', {
                description: errorMessage,
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] p-0 flex flex-col bg-background border-l border-border/50 shadow-2xl">
                {/* Header */}
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border bg-background relative">
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            <UserCog className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-xl font-serif font-bold italic uppercase tracking-tight text-foreground">
                                Chỉnh Sửa Người Dùng
                            </SheetTitle>
                            <SheetDescription className="text-xs font-medium text-muted-foreground">
                                Cập nhật thông tin và quyền hạn truy cập
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden relative" noValidate>
                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1">
                        <div className="px-8 py-10 space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                            {/* Section Header */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-serif font-bold italic uppercase tracking-widest text-muted-foreground/40 text-center">
                                        Basic Information
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Controller
                                    control={control}
                                    name="displayName"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-2 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-xs font-semibold text-foreground/70 group-focus-within:text-primary transition-colors">
                                                <User className="size-3.5" />
                                                Họ và tên
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                autoFocus
                                                placeholder="Nhập họ và tên đầy đủ"
                                                aria-invalid={fieldState.invalid}
                                                className={cn(
                                                    "h-11 px-4 rounded-xl bg-background border-border hover:border-primary/50 focus-visible:ring-primary/20",
                                                    "text-sm font-medium transition-all"
                                                )}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[11px] font-medium text-destructive mt-1" />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-2 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-xs font-semibold text-foreground/70 group-focus-within:text-primary transition-colors">
                                                <Mail className="size-3.5" />
                                                Địa chỉ Email
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                type="email"
                                                placeholder="example@torii.edu.vn"
                                                aria-invalid={fieldState.invalid}
                                                className={cn(
                                                    "h-11 px-4 rounded-xl bg-background border-border hover:border-primary/50 focus-visible:ring-primary/20",
                                                    "text-sm font-medium transition-all"
                                                )}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[11px] font-medium text-destructive mt-1" />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="role"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-2 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-xs font-semibold text-foreground/70 group-focus-within:text-primary transition-colors">
                                                <ShieldCheck className="size-3.5" />
                                                Vai trò
                                            </FieldLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger
                                                    id={field.name}
                                                    aria-invalid={fieldState.invalid}
                                                    className={cn(
                                                        "h-11 px-4 rounded-xl bg-background border-border hover:border-primary/50 focus:ring-primary/20",
                                                        "text-sm font-medium transition-all"
                                                    )}
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="border-border shadow-xl bg-background rounded-xl overflow-hidden p-1">
                                                    <SelectItem value="learner" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Học viên</SelectItem>
                                                    <SelectItem value="lecturer" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Giảng viên</SelectItem>
                                                    <SelectItem value="staff" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Nhân viên</SelectItem>
                                                    <SelectItem value="staff-lms" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">QTV LMS</SelectItem>
                                                    <SelectItem value="staff-support" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Hỗ trợ viên</SelectItem>
                                                    <SelectItem value="staff-sales" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Kinh doanh</SelectItem>
                                                    <SelectItem value="admin" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Quản trị viên (Admin)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[11px] font-medium text-destructive mt-1" />}
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Fixed Footer */}
                    <div className="px-8 py-6 bg-background border-t border-border flex items-center justify-between gap-4 relative z-20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={updateUser.isPending}
                            className="rounded-xl h-11 px-6 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/10 group bg-background border border-border"
                        >
                            <X className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateUser.isPending}
                            className="rounded-xl h-11 px-8 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                        >
                            {updateUser.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : 'Lưu Thay Đổi'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
