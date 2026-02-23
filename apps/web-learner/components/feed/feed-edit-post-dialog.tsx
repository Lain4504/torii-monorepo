'use client'

import { useState, useEffect } from 'react'
import { Button } from '@workspace/ui/components/button'
import { feedApi } from '@/lib/api/services/feed-api'
import { toast } from '@workspace/ui/components/sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { Input } from '@workspace/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import type { FeedResponseDTO } from '@workspace/schemas'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Field, FieldLabel, FieldError, FieldGroup, FieldSet } from '@workspace/ui/components/field'

const editPostSchema = z.object({
    category: z.string().min(1, 'Vui lòng chọn chủ đề'),
    title: z.string().optional(),
    content: z.string().min(1, 'Vui lòng nhập nội dung câu hỏi'),
})

type EditPostFormData = z.infer<typeof editPostSchema>

const CATEGORIES = [
    { id: 'TRANSLATION', label: 'Dịch' },
    { id: 'JAPANESE', label: 'Học Tiếng Nhật' },
    { id: 'STUDY_ABROAD', label: 'Du Học Nhật Bản' },
    { id: 'WORK_JAPAN', label: 'Việc Làm Tiếng Nhật' },
    { id: 'JAPANESE_CULTURE', label: 'Văn Hoá Nhật Bản' },
]

interface FeedEditPostDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    post: FeedResponseDTO
    onPostUpdated?: (updatedPost: FeedResponseDTO) => void
}

export function FeedEditPostDialog({ open, onOpenChange, post, onPostUpdated }: FeedEditPostDialogProps) {
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<EditPostFormData>({
        resolver: zodResolver(editPostSchema),
        defaultValues: {
            category: '',
            title: '',
            content: '',
        },
    })

    const { control, handleSubmit, reset } = form

    useEffect(() => {
        if (open && post) {
            let cat = ''
            if (post.tags && post.tags.length > 0) {
                const matchingCategory = CATEGORIES.find(c => post.tags.includes(c.id))
                cat = matchingCategory ? matchingCategory.id : (post.tags[0] || '')
            }
            reset({
                title: post.title || '',
                content: post.content || '',
                category: cat,
            })
        }
    }, [open, post, reset])

    const onSubmit = async (data: EditPostFormData) => {
        try {
            setSubmitting(true)
            const updated = await feedApi.update(post.id, {
                title: data.title?.trim() || undefined,
                content: data.content.trim(),
                tags: data.category ? [data.category] : []
            })
            toast.success('Cập nhật bài viết thành công')
            onOpenChange(false)
            onPostUpdated?.(updated)
        } catch (error) {
            console.error(error)
            toast.error('Có lỗi xảy ra', { description: 'Không thể cập nhật bài viết' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold tracking-tight">Chỉnh sửa câu hỏi</DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-2">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <FieldSet className="space-y-4">
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Chủ đề <span className="text-destructive">*</span></FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id={field.name} className="h-11 shadow-none" aria-invalid={fieldState.invalid}>
                                                    <SelectValue placeholder="Chọn chủ đề cho câu hỏi..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id} className="font-medium">
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
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Tiêu đề (Tùy chọn)</FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                placeholder="Tóm tắt câu hỏi của bạn..."
                                                className="h-11 shadow-none"
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
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Nội dung chi tiết <span className="text-destructive">*</span></FieldLabel>
                                            <Textarea
                                                {...field}
                                                id={field.name}
                                                placeholder="Mô tả chi tiết vấn đề của bạn..."
                                                className="min-h-[180px] resize-none shadow-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldSet>
                        </FieldGroup>

                        <div className="flex justify-end gap-3 pt-8 border-t mt-4">
                            <Button type="button" variant="ghost" className="font-bold" onClick={() => onOpenChange(false)}>Hủy</Button>
                            <Button type="submit" className="font-bold px-8" disabled={submitting}>
                                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}