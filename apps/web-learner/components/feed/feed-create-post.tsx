'use client'

import { useState } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { feedApi } from '@/lib/api/services/feed-api'
import { toast } from '@workspace/ui/components/sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { User } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'

const createPostSchema = z.object({
    category: z.string().min(1, 'Vui lòng chọn chủ đề'),
    title: z.string().optional(),
    content: z.string().min(1, 'Vui lòng nhập nội dung câu hỏi'),
})

type CreatePostFormData = z.infer<typeof createPostSchema>

const CATEGORIES = [
    { id: 'TRANSLATION', label: 'Dịch' },
    { id: 'JAPANESE', label: 'Học Tiếng Nhật' },
    { id: 'STUDY_ABROAD', label: 'Du Học Nhật Bản' },
    { id: 'WORK_JAPAN', label: 'Việc Làm Tiếng Nhật' },
    { id: 'JAPANESE_CULTURE', label: 'Văn Hoá Nhật Bản' },
]

export function FeedCreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
    const { user } = useAppSelector(state => state.auth)
    const [isOpen, setIsOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<CreatePostFormData>({
        resolver: zodResolver(createPostSchema),
        defaultValues: {
            category: '',
            title: '',
            content: '',
        },
    })

    const { control, handleSubmit, reset } = form

    const onSubmit = async (data: CreatePostFormData) => {
        // Form validation is handled by RHF/Zod


        try {
            setSubmitting(true)
            await feedApi.create({
                title: data.title?.trim() || undefined,
                content: data.content.trim(),
                tags: data.category ? [data.category] : []
            })
            toast.success('Đăng bài thành công')
            setIsOpen(false)
            reset()
            onPostCreated?.()
        } catch (error) {
            console.error(error)
            toast.error('Có lỗi xảy ra', { description: 'Không thể đăng bài viết' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-background rounded-xl border border-border/40 p-4 flex gap-4 items-center shadow-sm">
            <Avatar className="h-10 w-10 border border-border/20">
                <AvatarImage src={(user as any)?.avatarUrl} />
                <AvatarFallback>
                    {(user as any)?.displayName?.[0] || <User className="w-5 h-5" />}
                </AvatarFallback>
            </Avatar>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div className="flex-1 group cursor-pointer">
                        <div className="bg-muted/40 border border-transparent group-hover:bg-muted group-hover:border-primary/20 transition-all rounded-full h-11 px-4 flex items-center text-muted-foreground text-sm">
                            {user ? `${(user as any).displayName}, bạn đang thắc mắc điều gì?` : 'Bạn đang thắc mắc điều gì?'}
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Tạo câu hỏi mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <Controller
                            name="category"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="space-y-2">
                                    <FieldLabel htmlFor={field.name}>Chủ đề <span className="text-red-500">*</span></FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id={field.name} className="bg-muted/30" aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Chọn chủ đề cho câu hỏi..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="title"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="space-y-2">
                                    <FieldLabel htmlFor={field.name}>Tiêu đề (Tùy chọn)</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Tóm tắt câu hỏi của bạn..."
                                        className="bg-muted/30"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="content"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="space-y-2">
                                    <FieldLabel htmlFor={field.name}>Nội dung chi tiết <span className="text-red-500">*</span></FieldLabel>
                                    <Textarea
                                        {...field}
                                        id={field.name}
                                        placeholder="Mô tả chi tiết vấn đề của bạn..."
                                        className="min-h-[150px] bg-muted/30 resize-none"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                            <Button variant="ghost" onClick={() => { setIsOpen(false); reset(); }}>Hủy</Button>
                            <Button onClick={handleSubmit(onSubmit)} disabled={submitting}>
                                {submitting ? 'Đang đăng...' : 'Đăng câu hỏi'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}