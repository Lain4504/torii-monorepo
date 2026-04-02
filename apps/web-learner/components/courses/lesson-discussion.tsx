'use client'

import { useState } from 'react'
import { FEATURE_FLAGS } from '@/lib/feature-flags'
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
    Shield
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { toast } from '@workspace/ui/components/sonner'
import { Spinner } from '@workspace/ui/components/spinner'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@workspace/ui/lib/utils'

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

export function LessonDiscussion({ classId, moduleId, lessonId }: LessonDiscussionProps) {
    const { isAuthenticated, user } = useAppSelector(state => state.auth)
    const { data: discussions, isLoading, isError } = useDiscussions(lessonId, classId)
    const createDiscussion = useCreateDiscussion()

    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)

    const handleCreateTopic = async () => {
        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung câu hỏi')
            return
        }

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đặt câu hỏi')
            return
        }

        try {
            await createDiscussion.mutateAsync({
                content: content.trim(),
                classId,
                moduleId,
                lessonId,
                category: 'QUESTION'
            })

            setContent('')
            setIsCreating(false)
            toast.success('Đã gửi câu hỏi thành công')
        } catch (error: any) {
            console.error('Failed to create discussion:', error)
            toast.error('Không thể gửi câu hỏi. Vui lòng thử lại.')
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Spinner className="size-8 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Đang tải thảo luận...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <AlertCircle className="size-10 text-destructive/50" />
                <div className="space-y-1">
                    <p className="text-base font-bold text-foreground">Không thể tải nội dung thảo luận</p>
                    <p className="text-sm text-muted-foreground">Vui lòng làm mới trang hoặc thử lại sau</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Thử lại
                </Button>
            </div>
        )
    }

    const topics = discussions?.data || []

    return (
        <div className="space-y-8 pb-10">
            {/* Header & New Question Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        <MessageSquare className="size-5 text-primary" />
                        Hỏi đáp bài học
                        <Badge variant="secondary" className="ml-1 font-bold">
                            {topics.length}
                        </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Nơi trao đổi, giải đáp thắc mắc về nội dung bài học.
                    </p>
                </div>

                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)} className="gap-2 shrink-0">
                        <Plus className="size-4" /> Đặt câu hỏi mới
                    </Button>
                )}
            </div>

            {/* Create Question Form */}
            {isCreating && (
                <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Đặt câu hỏi mới</CardTitle>
                        <CardDescription>Mô tả chi tiết thắc mắc của bạn để nhận được phản hồi chính xác nhất.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nội dung câu hỏi</label>
                            <Textarea
                                placeholder="Hãy mô tả chi tiết thắc mắc của bạn..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[120px] bg-background border-border/40 focus:border-primary/40 transition-all resize-none p-4"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="font-bold text-xs uppercase tracking-widest">
                                Hủy bỏ
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCreateTopic}
                                disabled={createDiscussion.isPending || !content.trim()}
                                className="gap-2 font-bold text-xs uppercase tracking-widest px-6"
                            >
                                {createDiscussion.isPending ? <Spinner className="size-3" /> : <Send className="size-3" />}
                                Gửi câu hỏi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List of Discussions */}
            <div className="space-y-4">
                {topics.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                        <div className="size-16 bg-background rounded-full flex items-center justify-center border shadow-sm mb-4">
                            <MessageCircle className="size-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-base font-bold text-foreground/70 mb-1">Chưa có thảo luận nào</p>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                            Hãy là người đầu tiên đặt câu hỏi để nhận được sự giải đáp từ giảng viên.
                        </p>
                        {!isCreating && (
                            <Button variant="outline" size="sm" onClick={() => setIsCreating(true)} className="gap-2">
                                <Plus className="size-4" /> Đặt câu hỏi đầu tiên
                            </Button>
                        )}
                    </div>
                ) : (
                    topics.map((topic) => (
                        <Card
                            key={topic.id}
                            className={cn(
                                "group border-border/40 hover:border-primary/30 transition-all duration-300 overflow-hidden",
                                expandedTopicId === topic.id ? "ring-1 ring-primary/20 shadow-lg translate-y-[-2px]" : "hover:bg-muted/5"
                            )}
                        >
                            <CardHeader
                                className="cursor-pointer p-6 select-none"
                                onClick={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4 min-w-0">
                                        <Avatar className="size-10 border border-border/60 shrink-0">
                                            <AvatarImage src={topic.author?.avatarUrl || undefined} />
                                            <AvatarFallback className="bg-muted text-muted-foreground">
                                                <User className="size-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={cn("text-sm font-bold truncate", (topic.isOfficialReply && FEATURE_FLAGS.ENABLE_OFFICIAL_DISCUSSION_BADGE) ? "text-primary" : "text-foreground/90")}>
                                                    {topic.author?.displayName || 'Unknown Student'}
                                                </span>
                                                {topic.isOfficialReply && FEATURE_FLAGS.ENABLE_OFFICIAL_DISCUSSION_BADGE && (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-wider h-5 flex items-center gap-1 shadow-none">
                                                        <Shield className="size-2.5 fill-current" />
                                                        {topic.authorRoleLabel || 'Torii Support'}
                                                    </Badge>
                                                )}
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 flex items-center gap-1.5 shrink-0">
                                                    <Clock className="size-3" />
                                                    {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true, locale: vi })}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed whitespace-pre-wrap">
                                                {topic.content}
                                            </CardTitle>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-muted-foreground font-bold">
                                                <MessageCircle className="size-4" />
                                                <span className="text-xs">{topic.replyCount || 0}</span>
                                            </div>
                                            {expandedTopicId === topic.id ? <ChevronUp className="size-5 text-primary" /> : <ChevronDown className="size-5 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />}
                                        </div>
                                        {topic.status === 'ANSWERED' && (
                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] font-black uppercase tracking-wider h-5">
                                                Đã trả lời
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {expandedTopicId === topic.id && (
                                <CardContent className="pt-0 border-t border-border/10 bg-muted/5 animate-in fade-in duration-500">
                                    <div className="py-6 px-4">
                                        {/* Replies Section using existing CommentSection.
                                            Backend enables self-target by topic.id, so the topic + its nested replies will be returned. */}
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <CommentSection discussionId={topic.id} classId={classId} />
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
