'use client'

import { useState } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { qaApi } from '@/apis/services/qa-api'
import { toast } from '@workspace/ui/components/sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { User } from 'lucide-react'

const CATEGORIES = [
    { id: 'TRANSLATION', label: 'Dịch' },
    { id: 'JAPANESE', label: 'Học Tiếng Nhật' },
    { id: 'STUDY_ABROAD', label: 'Du Học Nhật Bản' },
    { id: 'WORK_JAPAN', label: 'Việc Làm Tiếng Nhật' },
    { id: 'JAPANESE_CULTURE', label: 'Văn Hoá Nhật Bản' },
]

export function QACreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
    const { user } = useAppSelector(state => state.auth)
    const [isOpen, setIsOpen] = useState(false)
    const [category, setCategory] = useState('')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung câu hỏi')
            return
        }

        try {
            setSubmitting(true)
            await qaApi.create({
                title: title.trim() || undefined,
                content: content.trim(),
                tags: category ? [category] : []
            })
            toast.success('Đăng bài thành công')
            setIsOpen(false)
            setCategory('')
            setTitle('')
            setContent('')
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
                        {/* Category Dropdown - First */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Chủ đề <span className="text-red-500">*</span></Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="bg-muted/30">
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
                        </div>

                        {/* Title - Second */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Tiêu đề (Tùy chọn)</Label>
                            <Input
                                placeholder="Tóm tắt câu hỏi của bạn..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="bg-muted/30"
                            />
                        </div>

                        {/* Content - Third */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Nội dung chi tiết <span className="text-red-500">*</span></Label>
                            <Textarea
                                placeholder="Mô tả chi tiết vấn đề của bạn..."
                                className="min-h-[150px] bg-muted/30 resize-none"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                            <Button variant="ghost" onClick={() => setIsOpen(false)}>Hủy</Button>
                            <Button onClick={handleSubmit} disabled={submitting || !content.trim() || !category}>
                                {submitting ? 'Đang đăng...' : 'Đăng câu hỏi'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
