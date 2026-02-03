'use client'

import { useState } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { qaApi } from '@/apis/services/qa-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/sonner'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { Input } from '@workspace/ui/components/input'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@workspace/ui/components/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { ImagePlus, X, Loader2, Sparkles } from 'lucide-react'

const TOPICS = [
    'Học Tiếng Nhật',
    'Du Học Nhật Bản',
    'Việc Làm Tiếng Nhật',
    'Văn Hoá Nhật Bản',
    'Dịch',
    'Khác'
]

export function QACreatePost({ onSuccess }: { onSuccess?: () => void }) {
    const { user } = useAppSelector(state => state.auth)
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState<string>('')
    const queryClient = useQueryClient()

    const createPostMutation = useMutation({
        mutationFn: async (postData: { title: string; content: string; type: 'QA'; tags: string[] }) => {
            const response = await qaApi.create(postData)
            return response.data
        },
        onSuccess: () => {
            setTitle('')
            setContent('')
            setCategory('')
            setOpen(false)
            toast.success('Đăng bài thành công')
            queryClient.invalidateQueries({ queryKey: ['qa-feed'] })
            onSuccess?.()
        },
        onError: (err) => {
            console.error(err)
            toast.error('Đăng bài thất bại, vui lòng thử lại')
        }
    })

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung')
            return
        }

        createPostMutation.mutate({
            title: title.trim(),
            content: content.trim(),
            type: 'QA',
            tags: category ? [category] : []
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="group relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/50 p-1 shadow-sm transition-all hover:bg-white/80 hover:shadow-md cursor-pointer dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80">
                    <div className="flex items-center gap-4 p-4">
                        <Avatar className="h-11 w-11 border-2 border-white shadow-sm dark:border-zinc-800">
                            <AvatarImage src={user?.avatarUrl || ''} alt={user?.displayName || 'User'} />
                            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="relative h-11 w-full rounded-full bg-muted/30 px-5 flex items-center text-muted-foreground transition-colors group-hover:bg-muted/50 border border-transparent group-hover:border-border/50">
                                <span className="truncate text-sm font-medium">
                                    {user?.displayName ? `${user.displayName} ơi, bạn đang nghĩ gì thế?` : 'Bạn đang nghĩ gì thế?'}
                                </span>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl gap-0 p-0 overflow-hidden border-border/60 bg-white/95 backdrop-blur-3xl dark:bg-zinc-950/95 shadow-2xl">
                <DialogHeader className="px-6 py-4 border-b border-border/10 flex flex-row items-center justify-between space-y-0 bg-muted/10">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Tạo bài viết mới
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border border-border shadow-sm">
                                <AvatarImage src={user?.avatarUrl || ''} />
                                <AvatarFallback>{user?.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-sm">{user?.displayName}</h4>
                                <p className="text-xs text-muted-foreground">Đang chia sẻ với cộng đồng</p>
                            </div>
                        </div>

                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-[180px] h-9 rounded-full bg-background border-border shadow-sm hover:bg-muted/50 transition-colors">
                                <SelectValue placeholder="Chọn chủ đề" />
                            </SelectTrigger>
                            <SelectContent align="end">
                                {TOPICS.map(topic => (
                                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Content Input Area */}
                    <div className="space-y-4">
                        <Input
                            placeholder="Tiêu đề câu hỏi của bạn là gì?"
                            className="text-xl font-bold border-none px-0 shadow-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40 h-auto py-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Hãy chia sẻ chi tiết hơn về vấn đề bạn đang gặp phải..."
                            className="min-h-[150px] resize-none border-none px-0 shadow-none focus-visible:ring-0 bg-transparent text-base placeholder:text-muted-foreground/40 leading-relaxed"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Add-ons */}
                    <div className="pt-4 border-t border-border/10">
                        <div className="flex items-center gap-2">
                            <div className="text-xs font-medium text-muted-foreground mr-2">Thêm vào bài viết:</div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 data-[state=open]:bg-muted rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                <ImagePlus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/5 border-t border-border/10 flex sm:justify-between items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        Hãy đảm bảo nội dung phù hợp với quy tắc cộng đồng.
                    </span>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full px-6 hover:bg-muted/50">
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="rounded-full px-8 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 transition-opacity shadow-md"
                            disabled={!title.trim() || !content.trim() || createPostMutation.isPending}
                        >
                            {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Đăng ngay
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
