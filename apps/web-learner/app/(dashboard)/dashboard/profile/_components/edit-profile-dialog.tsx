'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@workspace/ui/components/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"

const profileFormSchema = z.object({
    displayName: z.string().min(2, {
        message: "Tên hiển thị phải có ít nhất 2 ký tự.",
    }),
    phone: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    dateOfBirth: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface EditProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData: {
        displayName: string
        phone: string
        bio: string
        location: string
        dateOfBirth: string
        avatarUrl?: string | null
    }
    onSubmit: (data: ProfileFormValues) => void
    onUploadAvatar: (file: File) => Promise<void>
    isSubmitting: boolean
    isUploadingAvatar: boolean
}

export function EditProfileDialog({
    open,
    onOpenChange,
    initialData,
    onSubmit,
    onUploadAvatar,
    isSubmitting,
    isUploadingAvatar,
}: EditProfileDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: initialData,
    })

    useEffect(() => {
        if (open) {
            form.reset(initialData)
        }
    }, [open, initialData, form])

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh')
            return
        }
        await onUploadAvatar(file)
        e.target.value = ''
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin cá nhân và ảnh đại diện của bạn.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh]">
                    <div className="p-6 space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <Avatar className="w-24 h-24 border-2 border-border shadow-sm rounded-full overflow-hidden">
                                    <AvatarImage src={initialData.avatarUrl || ''} alt={initialData.displayName} />
                                    <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                                        {initialData.displayName[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 shadow-md border"
                                    onClick={handleAvatarClick}
                                    disabled={isUploadingAvatar}
                                    type="button"
                                >
                                    {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Nhấn vào biểu tượng để đổi ảnh</p>
                        </div>

                        <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FieldGroup>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <FieldLabel>Tên hiển thị</FieldLabel>
                                        <Input {...form.register("displayName")} />
                                        {form.formState.errors.displayName && (
                                            <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <FieldLabel>Số điện thoại</FieldLabel>
                                            <Input {...form.register("phone")} />
                                        </div>
                                        <div className="grid gap-2">
                                            <FieldLabel>Ngày sinh</FieldLabel>
                                            <Input type="date" {...form.register("dateOfBirth")} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <FieldLabel>Địa chỉ</FieldLabel>
                                        <Input {...form.register("location")} />
                                    </div>

                                    <div className="grid gap-2">
                                        <FieldLabel>Tiểu sử</FieldLabel>
                                        <Textarea {...form.register("bio")} className="min-h-[100px] resize-none" />
                                    </div>
                                </div>
                            </FieldGroup>
                        </form>
                    </div>
                </ScrollArea>
                <DialogFooter className="p-6 border-t bg-muted/20">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button type="submit" form="profile-form" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
