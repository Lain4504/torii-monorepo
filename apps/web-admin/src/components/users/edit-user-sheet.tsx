import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@workspace/ui/components/sheet';
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
import { UserRole } from '@workspace/schemas';
import { Loader2 } from 'lucide-react';
import { userAdminUpdateDTOSchema, type UserAdminUpdateDTO } from '@workspace/schemas';
import { toast } from 'sonner';
import { useUpdateUser } from "@/api/services/users.ts";

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
            toast.success('Đã cập nhật người dùng', {
                description: `Thông tin người dùng đã được cập nhật.`,
            });
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật người dùng';
            toast.error('Cập nhật thất bại', {
                description: errorMessage,
            });
        }
    };

    if (!user) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chỉnh sửa người dùng</SheetTitle>
                    <SheetDescription>
                        Cập nhật thông tin và quyền hạn truy cập của {user.displayName}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden" noValidate>
                    <ScrollArea className="flex-1">
                        <div className="space-y-6 p-6">
                            <Controller
                                control={control}
                                name="displayName"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                                        <FieldLabel htmlFor={field.name}>Họ và tên</FieldLabel>
                                        <Input
                                            id={field.name}
                                            {...field}
                                            placeholder="Nhập họ và tên đầy đủ"
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={control}
                                name="email"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                                        <FieldLabel htmlFor={field.name}>Địa chỉ Email</FieldLabel>
                                        <Input
                                            id={field.name}
                                            {...field}
                                            type="email"
                                            placeholder="example@torii.edu.vn"
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={control}
                                name="role"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                                        <FieldLabel htmlFor={field.name}>Vai trò</FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger id={field.name}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={UserRole.LEARNER}>Học viên</SelectItem>
                                                <SelectItem value={UserRole.LECTURER}>Giảng viên</SelectItem>
                                                <SelectItem value={UserRole.STAFF}>Nhân viên (Chung)</SelectItem>
                                                <SelectItem value={UserRole.STAFF_LMS}>Giáo vụ (LMS)</SelectItem>
                                                <SelectItem value={UserRole.STAFF_SUPPORT}>Hỗ trợ (Support)</SelectItem>
                                                <SelectItem value={UserRole.STAFF_SALES}>Kinh doanh (Sales)</SelectItem>
                                                <SelectItem value={UserRole.ADMIN}>Quản trị viên (Admin)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                        </div>
                    </ScrollArea>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateUser.isPending}>
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateUser.isPending}>
                            {updateUser.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin mr-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu thay đổi"
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
