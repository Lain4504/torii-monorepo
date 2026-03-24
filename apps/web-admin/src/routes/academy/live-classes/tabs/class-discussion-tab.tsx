import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useComments, useCreateComment } from '@/lib/api/services/comments'
import type { CommentResponseDTO } from '@workspace/schemas'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Textarea } from '@workspace/ui/components/textarea'
import { toast } from '@workspace/ui/components/sonner'
import { Plus, MessageSquare } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { useAcademyLiveClass } from '@/lib/api/services/academy-live-classes'

interface ClassDiscussionTabProps {
  classId: string
}

function getTopicTitle(content: string) {
  return (content || '').split('\n')[0]?.trim() || 'Không có tiêu đề'
}

export function ClassDiscussionTab({ classId }: ClassDiscussionTabProps) {
  const { user, isAuthenticated } = useAuth()
  const createComment = useCreateComment()

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)
  const [replyDraftByTopic, setReplyDraftByTopic] = useState<Record<string, string>>({})

  const { data: academyClass } = useAcademyLiveClass(classId)
  const curriculum = (academyClass as any)?.cohort?.courseProfile

  const lessonOptions = useMemo(() => {
    const modules = (curriculum?.modules ?? []) as Array<any>
    const lessons = modules.flatMap((m) => m.lessons ?? [])
    return lessons as Array<{ id: string; title: string }>
  }, [curriculum])

  const [selectedLessonId, setSelectedLessonId] = useState<string>('')

  useEffect(() => {
    if (!selectedLessonId && lessonOptions.length) {
      setSelectedLessonId(lessonOptions[0].id)
    }
  }, [lessonOptions, selectedLessonId])

  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [topicTitle, setTopicTitle] = useState('')
  const [topicContent, setTopicContent] = useState('')

  const params = useMemo(
    () => ({ discussionId: selectedLessonId, page: 1, limit: 100 } as any),
    [selectedLessonId],
  )

  const { data, isLoading, isError, refetch } = useComments(params as any)

  const topics = (data?.data ?? []) as CommentResponseDTO[]

  const onCreateTopic = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi')
      return
    }
    if (!selectedLessonId) {
      toast.error('Chưa chọn bài học')
      return
    }
    if (!topicTitle.trim() || !topicContent.trim()) {
      toast.error('Vui lòng nhập đủ tiêu đề và nội dung')
      return
    }

    try {
      await createComment.mutateAsync({
        discussionId: selectedLessonId,
        userId: user.id,
        content: `${topicTitle.trim()}\n\n${topicContent.trim()}`,
      } as any)
      setTopicDialogOpen(false)
      setTopicTitle('')
      setTopicContent('')
      refetch()
    } catch (e: any) {
      toast.error(e?.message || 'Không thể tạo thảo luận')
    }
  }

  const onReply = async (topicId: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Vui lòng đăng nhập để trả lời')
      return
    }
    const text = (replyDraftByTopic[topicId] ?? '').trim()
    if (!text) {
      toast.error('Nội dung trả lời không được để trống')
      return
    }

    try {
      await createComment.mutateAsync({
        discussionId: selectedLessonId,
        userId: user.id,
        parentId: topicId,
        content: text,
      } as any)
      setReplyDraftByTopic((prev) => ({ ...prev, [topicId]: '' }))
      refetch()
    } catch (e: any) {
      toast.error(e?.message || 'Không thể gửi trả lời')
    }
  }

  const renderReplyTree = (reply: CommentResponseDTO, depth: number): any => {
    const canRecurse = depth < 3 && (reply.replies?.length ?? 0) > 0
    return (
      <div key={reply.id} className={depth === 0 ? '' : 'mt-4'}>
        <div className="rounded-md border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-sm">{reply.author?.displayName || 'Unknown'}</div>
            {reply.status === 'ANSWERED' && <Badge variant="secondary">Đã trả lời</Badge>}
          </div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
            {reply.content}
          </div>
        </div>
        {canRecurse && (
          <div className="ml-4 border-l border-primary/10 pl-4 mt-3">
            {reply.replies?.map((r: any) => renderReplyTree(r as any, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            Thảo luận bài học
          </h3>
          <p className="text-sm text-muted-foreground">
            User hỏi đáp; lecture/staff-lms có thể trả lời trong cùng luồng.
          </p>
        </div>

        {!!lessonOptions.length && (
          <div className="min-w-[260px]">
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn bài học" />
              </SelectTrigger>
              <SelectContent>
                {lessonOptions.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.title || l.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isAuthenticated && (
          <Button className="gap-2" onClick={() => setTopicDialogOpen(true)}>
            <Plus className="size-4" />
            Đặt câu hỏi
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <div className="p-4 rounded-md border border-destructive/20 bg-destructive/5 text-destructive">
          Không thể tải thảo luận.
        </div>
      ) : topics.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground space-y-2 border border-dashed rounded-lg">
          <MessageSquare className="h-10 w-10 mx-auto opacity-40" />
          <div className="font-semibold">Chưa có thảo luận nào.</div>
          <div className="text-sm">Hãy là người đầu tiên đặt câu hỏi.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => {
            const expanded = expandedTopicId === topic.id
            return (
              <Card
                key={topic.id}
                className="border-border/50 hover:border-primary/20 transition-colors overflow-hidden"
              >
                <CardHeader className="p-4 cursor-pointer" onClick={() => setExpandedTopicId(expanded ? null : topic.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">
                        {getTopicTitle(topic.content)}
                      </CardTitle>
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {topic.content}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {topic.status === 'ANSWERED' && (
                        <Badge variant="secondary" className="uppercase text-[10px]">
                          Đã trả lời
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {topic.replyCount ?? 0} phản hồi
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                {expanded && (
                  <CardContent className="p-4 pt-0">
                    <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {topic.content}
                    </div>

                    {(topic.replies?.length ?? 0) > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold mb-2">Phản hồi</div>
                        <div className="space-y-4">
                          {(topic.replies ?? []).map((r: any) => renderReplyTree(r as any, 0))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <div className="text-sm font-semibold mb-2">Trả lời</div>
                      <Textarea
                        value={replyDraftByTopic[topic.id] ?? ''}
                        onChange={(e) =>
                          setReplyDraftByTopic((prev) => ({
                            ...prev,
                            [topic.id]: e.target.value,
                          }))
                        }
                        placeholder="Viết câu trả lời..."
                      />
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          disabled={!isAuthenticated}
                          onClick={() => onReply(topic.id)}
                        >
                          Gửi trả lời
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt câu hỏi cho lớp</DialogTitle>
            <DialogDescription>Tiêu đề sẽ hiển thị trên danh sách thảo luận.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} placeholder="Tiêu đề câu hỏi" />
            <Textarea value={topicContent} onChange={(e) => setTopicContent(e.target.value)} placeholder="Nội dung câu hỏi..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopicDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={onCreateTopic} disabled={createComment.isPending}>
              {createComment.isPending ? 'Đang tạo...' : 'Gửi câu hỏi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

