'use client'

import { useState } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { feedApi } from '@/lib/api/services/feed-api'
import { toast } from '@workspace/ui/components/sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { User } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Field, FieldLabel, FieldError, FieldGroup, FieldSet } from '@workspace/ui/components/field'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'

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
        <Card className="shadow-none border group">
            <CardContent className="p-4 flex gap-4 items-center">
                <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={(user as any)?.avatarUrl} />
                    <AvatarFallback className="bg-muted text-foreground font-bold">
                        {(user as any)?.displayName?.[0] || <User className="size-5" />}
                    </AvatarFallback>
                </Avatar>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <div className="flex-1 group cursor-pointer">
                            <div className="bg-muted/50 hover:bg-muted transition-all duration-300 rounded-full h-11 px-6 flex items-center text-muted-foreground text-sm font-medium border border-transparent hover:border-border/60">
                                {user ? `${(user as any).displayName}, bạn đang thắc mắc điều gì?` : 'Bạn đang thắc mắc điều gì?'}
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold tracking-tight">Tạo câu hỏi mới</DialogTitle>
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
                                    <Button type="button" variant="ghost" onClick={() => { setIsOpen(false); reset(); }}>Hủy</Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? 'Đang đăng...' : 'Đăng câu hỏi'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}