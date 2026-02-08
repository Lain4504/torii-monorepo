'use client'

import { useState, useEffect } from 'react'
import { Button } from '@workspace/ui/components/button'
import { feedApi } from '@/apis/services/feed-api'
import { toast } from '@workspace/ui/components/sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import type { FeedResponseDTO } from '@workspace/schemas'

const CATEGORIES = [
    { id: 'TRANSLATION', label: 'Dịch' },
    { id: 'JAPANESE', label: 'Học Tiếng Nhật' },
    { id: 'STUDY_ABROAD', label: 'Du Học Nhật Bản' },
    { id: 'WORK_JAPAN', label: 'Việc Làm Tiếng Nhật' },
    { id: 'JAPANESE_CULTURE', label: 'Văn Hoá Nhật Bản' },
]

interface FeedEditBlogDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    blog: FeedResponseDTO
    onBlogUpdated?: (updatedBlog: FeedResponseDTO) => void
}

export function FeedEditBlogDialog({ open, onOpenChange, blog, onBlogUpdated }: FeedEditBlogDialogProps) {
    const [category, setCategory] = useState('')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open && blog) {
            setTitle(blog.title || '')
            setContent(blog.content || '')
            // Try to match tags to category
            if (blog.tags && blog.tags.length > 0) {
                // Find the first tag that matches one of our defined categories
                const matchingCategory = CATEGORIES.find(c => blog.tags.includes(c.id))
                if (matchingCategory) {
                    setCategory(matchingCategory.id)
                } else {
                    // Or just take the first tag if no match logic exists
                    setCategory(blog.tags[0] || '')
                }
            } else {
                setCategory('')
            }
        }
    }, [open, blog])

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung câu hỏi')
            return
        }

        try {
            setSubmitting(true)
            const updated = await feedApi.update(blog.id, {
                title: title.trim() || undefined,
                content: content.trim(),
                tags: category ? [category] : []
            })
            toast.success('Cập nhật blog thành công')
            onOpenChange(false)
            onBlogUpdated?.(updated)
        } catch (error) {
            console.error(error)
            toast.error('Có lỗi xảy ra', { description: 'Không thể cập nhật blog' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-4">
                    {/* Category Dropdown */}
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

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Tiêu đề (Tùy chọn)</Label>
                        <Input
                            placeholder="Tóm tắt câu hỏi của bạn..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="bg-muted/30"
                        />
                    </div>

                    {/* Content */}
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
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button onClick={handleSubmit} disabled={submitting || !content.trim() || !category}>
                            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}