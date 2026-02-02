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
import { ImagePlus, X, Loader2 } from 'lucide-react'

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
                <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-xl shadow-sm cursor-pointer hover:border-primary/20 transition-all group">
                    <div className="flex gap-4 items-center">
                        <Avatar className="h-10 w-10 border border-border bg-white rounded-full">
                            <AvatarImage src={user?.avatarUrl || ''} alt={user?.displayName || 'User'} />
                            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-background/50 h-10 rounded-full border border-border/40 flex items-center px-4 text-muted-foreground group-hover:bg-background transition-colors">
                            {user?.displayName} ơi, bạn đang thắc mắc điều gì?
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-border/40 bg-background/80 backdrop-blur-3xl">
                <DialogHeader className="p-4 border-b border-border/40">
                    <DialogTitle className="text-xl font-bold">Tạo bài viết</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={user?.avatarUrl || ''} />
                            <AvatarFallback>{user?.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{user?.displayName}</span>
                    </div>

                    {/* Topic Selection */}
                    <div>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-fit h-9 rounded-full bg-muted/50 border-border/40 min-w-[120px]">
                                <SelectValue placeholder="Chủ đề" />
                            </SelectTrigger>
                            <SelectContent>
                                {TOPICS.map(topic => (
                                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                        <Input
                            placeholder="Hãy nhập tiêu đề câu hỏi của bạn."
                            className="text-lg font-semibold border-none px-0 shadow-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder={`${user?.displayName || 'Bạn'} đang cảm thấy như thế nào?`}
                            className="min-h-[120px] resize-none border-none px-0 shadow-none focus-visible:ring-0 bg-transparent text-base placeholder:text-muted-foreground/50"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer text-muted-foreground hover:text-primary">
                        <div className="p-3 rounded-full bg-background shadow-sm">
                            <ImagePlus className="w-6 h-6" />
                        </div>
                        <p className="text-sm">
                            Kéo hình ảnh vào đây hoặc <span className="text-primary font-semibold hover:underline">tải tệp lên</span>.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-border/40 bg-muted/10">
                    <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl px-6">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="rounded-xl px-6"
                        disabled={!title.trim() || !content.trim() || createPostMutation.isPending}
                    >
                        {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Đăng bài
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
