'use client'

import { useState } from 'react'
import { useAppSelector } from '@/hooks/hooks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentApi } from '@/lib/api/services/comment-api'
import { CommentTargetType, type CommentResponseDTO } from '@workspace/schemas'
import { CommentSection } from '@/components/blog/comment-section'
import {
    MessageSquare,
    Plus,
    User,
    ChevronDown,
    ChevronUp,
    Clock,
    MessageCircle,
    Send,
    AlertCircle,
    Shield,
    MoreVertical,
    Pencil,
    Trash2
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@workspace/ui/lib/utils'
import { Separator } from '@workspace/ui/components/separator'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"

interface LessonDiscussionProps {
    classId: string
    moduleId?: string
    lessonId: string
}

// Local hooks to replace missing discussion-topic-api
function useDiscussions(lessonId: string, classId: string) {
    return useQuery({
        queryKey: ['discussions', lessonId, classId],
        queryFn: () => commentApi.findAll({ discussionId: lessonId, classId, limit: 100, page: 1 }),
        enabled: !!lessonId
    })
}

function useCreateDiscussion() {
    const queryClient = useQueryClient()
    const { user } = useAppSelector(state => state.auth)

    return useMutation({
        mutationFn: (data: { content: string, classId: string, moduleId?: string, lessonId: string, category: string }) => {
            return commentApi.create({
                entityId: data.lessonId,
                targetType: CommentTargetType.DISCUSSION,
                discussionId: data.lessonId,
                classId: data.classId,
                userId: user?.id || '',
                content: data.content,
            })
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['discussions', variables.lessonId, variables.classId] })
        }
    })
}

function useUpdateDiscussion() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, content }: { id: string, content: string }) => commentApi.update(id, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discussions'] })
        }
    })
}

function useDeleteDiscussion() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => commentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discussions'] })
        }
    })
}


export function LessonDiscussion({ classId, moduleId, lessonId }: LessonDiscussionProps) {
    const { isAuthenticated, user } = useAppSelector(state => state.auth)
    const { data: discussions, isLoading, isError } = useDiscussions(lessonId, classId)
    const createDiscussion = useCreateDiscussion()
    const updateDiscussion = useUpdateDiscussion()
    const deleteDiscussion = useDeleteDiscussion()

    const [isCreating, setIsCreating] = useState(false)
    const [content, setContent] = useState('')
    const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')

    const handleCreateTopic = async () => {
        if (!content.trim() || !isAuthenticated) return;
        try {
            await createDiscussion.mutateAsync({ content: content.trim(), classId, moduleId, lessonId, category: 'QUESTION' })
            setContent(''); setIsCreating(false);
            toast.success('Gửi câu hỏi thành công! 🚀')
        } catch (error: any) {
            toast.error('Gửi câu hỏi thất bại.')
        }
    }

    const handleUpdateTopic = async (id: string) => {
        if (!editContent.trim()) return;
        try {
            await updateDiscussion.mutateAsync({ id, content: editContent.trim() })
            setEditingTopicId(null); setEditContent('');
            toast.success('Cập nhật thành công.')
        } catch (error: any) {
            toast.error('Lỗi khi cập nhật.')
        }
    }

    const handleDeleteTopic = async (id: string) => {
        try {
            await deleteDiscussion.mutateAsync(id)
            toast.success('Đã xóa thảo luận.')
        } catch (error: any) {
            toast.error('Lỗi khi xóa.')
        }
    }

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <Spinner className="size-6 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Linh hồn thảo luận đang tập hợp...</p>
        </div>
    )

    const topics = discussions?.data || []

    return (
        <div className="max-w-4xl mx-auto space-y-16 pb-20">
            {/* ── HEADER ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-8 border-b border-border/40">
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <h3 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Thảo luận</h3>
                        <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 px-3 h-6 text-[11px] font-black">
                            {topics.length}
                        </Badge>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed">Kết nối trí tuệ — Giải đáp thắc mắc</p>
                </div>

                {!isCreating && (
                    <Button 
                        onClick={() => setIsCreating(true)} 
                        className="rounded-full px-10 h-12 gap-3 bg-foreground text-background hover:bg-foreground/90 transition-all font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95"
                    >
                        <Plus className="size-4" /> Đặt câu hỏi
                    </Button>
                )}
            </div>

            {/* ── CREATE QUESTION ─────────────────────────────────── */}
            {isCreating && (
                <Card className="border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden bg-muted/30 rounded-3xl animate-in fade-in slide-in-from-top-6 duration-700">
                    <CardContent className="p-8 space-y-6">
                        <Textarea
                            placeholder="Vấn đề bạn đang gặp phải là gì?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[160px] bg-background border-none focus-visible:ring-0 transition-all resize-none p-6 text-base font-medium leading-relaxed rounded-2xl shadow-inner italic"
                            autoFocus
                        />
                        <div className="flex items-center justify-end gap-4">
                            <Button variant="ghost" onClick={() => setIsCreating(false)} className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-transparent">Hủy bỏ</Button>
                            <Button onClick={handleCreateTopic} disabled={createDiscussion.isPending || !content.trim()} className="rounded-full px-12 h-12 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">Gửi thảo luận</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── TOPICS LIST ─────────────────────────────────────── */}
            <div className="space-y-4">
                {topics.length === 0 ? (
                    <div className="py-24 text-center space-y-8 animate-in fade-in duration-1000">
                        <div className="size-24 rounded-[3rem] bg-muted/20 flex items-center justify-center mx-auto border-2 border-dashed border-border/60">
                            <MessageCircle className="size-10 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black tracking-tight">Chưa có ai lên tiếng</p>
                            <p className="text-sm text-muted-foreground/60 font-bold uppercase tracking-tighter">Hãy là người đầu tiên khơi mào cho bài học này.</p>
                        </div>
                    </div>
                ) : (
                    topics.map((topic, index) => (
                        <div key={topic.id} className="group">
                            <Collapsible
                                open={expandedTopicId === topic.id}
                                onOpenChange={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                            >
                                <div className={cn(
                                    "relative py-10 px-6 transition-all duration-700 rounded-[2.5rem]",
                                    expandedTopicId === topic.id ? "bg-muted/40 ring-1 ring-border/40" : "hover:bg-muted/20"
                                )}>
                                    <div className="flex items-start gap-6">
                                        <Avatar className="size-12 border-2 border-background shadow-xl shrink-0">
                                            <AvatarImage src={topic.author?.avatarUrl || undefined} />
                                            <AvatarFallback className="bg-primary/5 text-primary font-black text-xs">{(topic.author?.displayName || 'U')[0]}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0 space-y-4">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={cn("text-xs font-black uppercase tracking-widest", topic.isOfficialReply ? "text-primary" : "text-foreground")}>
                                                    {topic.author?.displayName || 'Unknown Warrior'}
                                                </span>
                                                {topic.isOfficialReply && topic.authorRoleLabel && (
                                                    <Badge className="bg-foreground text-background border-none text-[8px] font-black uppercase tracking-tighter px-2 h-4">Verified Source</Badge>
                                                )}
                                                <span className="text-[10px] font-mono font-bold text-muted-foreground/40 uppercase tracking-tighter">{formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true, locale: vi })}</span>
                                            </div>

                                            {editingTopicId === topic.id ? (
                                                <div className="space-y-4 pt-2">
                                                    <Textarea
                                                        value={editContent} onChange={(e) => setEditContent(e.target.value)}
                                                        className="min-h-[140px] bg-background border-none focus-visible:ring-1 ring-primary/20 p-6 text-sm rounded-[2rem] shadow-sm italic"
                                                        autoFocus
                                                    />
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Button variant="ghost" onClick={() => setEditingTopicId(null)} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hủy</Button>
                                                        <Button onClick={() => handleUpdateTopic(topic.id)} disabled={updateDiscussion.isPending || !editContent.trim()} className="rounded-full px-8 h-10 text-[10px] font-black uppercase tracking-widest">Cập nhật</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <CollapsibleTrigger asChild>
                                                    <h4 className="text-lg font-bold leading-relaxed text-foreground/90 cursor-pointer hover:text-primary transition-colors tracking-tight [text-wrap:balance]">
                                                        {topic.content}
                                                    </h4>
                                                </CollapsibleTrigger>
                                            )}

                                            <div className="flex items-center gap-8 pt-2">
                                                <button
                                                    onClick={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-all group/btn"
                                                >
                                                    <MessageCircle className="size-4 group-hover/btn:scale-110 transition-transform" />
                                                    {expandedTopicId === topic.id ? 'Thu gọn thảo luận' : `${topic.replies?.length || 0} Phản hồi`}
                                                </button>

                                                {user?.id === topic.author?.id && (
                                                    <div className="flex items-center gap-4">
                                                        <button onClick={() => { setEditingTopicId(topic.id); setEditContent(topic.content); }} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors">Chỉnh sửa</button>
                                                        <button onClick={() => { if(confirm('Xác nhận xóa thảo luận này?')) handleDeleteTopic(topic.id); }} className="text-[10px] font-black uppercase tracking-widest text-destructive/40 hover:text-destructive transition-colors">Xóa</button>
                                                    </div>
                                                )}
                                                
                                                {topic.status === 'ANSWERED' && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black uppercase px-2 h-4">Solved</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <CollapsibleContent className="animate-in fade-in slide-in-from-top-4 duration-1000">
                                        <div className="pt-10 mt-10 border-t border-border/40">
                                            <CommentSection discussionId={topic.id} classId={classId} />
                                        </div>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                            {index < topics.length - 1 && <div className="h-px bg-border/20 mx-10 my-2" />}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
