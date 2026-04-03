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
import { Plus, MessageSquare, MoreVertical, Edit, Trash } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@workspace/ui/components/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"

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
import { useAcademyVodPackage } from '@/lib/api/services/academy-vod-packages'
import { useUpdateComment, useDeleteComment } from '@/lib/api/services/comments'

interface ClassDiscussionTabProps {
  classId?: string
  vodPackageId?: string
}



export function ClassDiscussionTab({ classId, vodPackageId }: ClassDiscussionTabProps) {
  const { user, isAuthenticated } = useAuth()
  const createComment = useCreateComment()
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null) // State for delete confirm
  const [editingContent, setEditingContent] = useState('')
  const [replyDraftByTopic, setReplyDraftByTopic] = useState<Record<string, string>>({})

  const { data: academyClass } = useAcademyLiveClass(classId || undefined)
  const { data: vodPackage } = useAcademyVodPackage(vodPackageId || undefined)
  const curriculum = (academyClass as any)?.cohort?.courseProfile || (vodPackage as any)?.courseProfile

  const lessonOptions = useMemo(() => {
    const modules = (curriculum?.modules ?? []) as Array<any>
    const lessons = modules.flatMap((m) => m.lessons ?? [])
    return lessons as Array<{ id: string; title: string }>
  }, [curriculum])

  const isAssignedInstructor = useMemo(() => {
    const instructorId = (academyClass as any)?.instructorId || (vodPackage as any)?.instructorId
    return user?.id === instructorId
  }, [user?.id, academyClass, vodPackage])

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff-academic' || user?.role === 'staff-operations'
  const canPost = isAssignedInstructor && !isAdminOrStaff

  const [selectedLessonId, setSelectedLessonId] = useState<string>('')

  useEffect(() => {
    if (!selectedLessonId && lessonOptions.length) {
      setSelectedLessonId(lessonOptions[0].id)
    }
  }, [lessonOptions, selectedLessonId])

  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
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
    if (!topicContent.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi')
      return
    }

    try {
      await createComment.mutateAsync({
        discussionId: selectedLessonId,
        userId: user.id,
        content: topicContent.trim(),
      } as any)
      setTopicDialogOpen(false)
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
        parentId: topicId, // This is now the specific comment we are replying to
        content: text,
      } as any)
      setReplyDraftByTopic((prev) => ({ ...prev, [topicId]: '' }))
      setActiveReplyId(null)
      refetch()
    } catch (e: any) {
      toast.error(e?.message || 'Không thể gửi trả lời')
    }
  }

  const onUpdate = async (id: string) => {
    if (!editingContent.trim()) {
      toast.error('Nội dung không được để trống')
      return
    }
    try {
      await updateComment.mutateAsync({ id, dto: { content: editingContent.trim() } })
      setEditingCommentId(null)
      refetch()
    } catch (e: any) {
      toast.error(e?.message || 'Không thể cập nhật bình luận')
    }
  }

  const onDelete = async (id: string) => {
    try {
      await deleteComment.mutateAsync(id)
      setDeleteConfirmId(null)
      refetch()
    } catch (e: any) {
      toast.error(e?.message || 'Không thể xóa bình luận')
    }
  }

  const renderReplyTree = (reply: CommentResponseDTO, depth: number): any => {
    const canRecurse = depth < 3 && (reply.replies?.length ?? 0) > 0
    const isReplying = activeReplyId === reply.id
    const isEditing = editingCommentId === reply.id
    const isOwner = reply.author?.id === user?.id
    
    return (
      <div key={reply.id} className={depth === 0 ? '' : 'mt-4'}>
        <div className="rounded-md border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-sm">{reply.author?.displayName || 'Unknown'}</div>
            <div className="flex items-center gap-2">
              {reply.status === 'ANSWERED' && <Badge variant="secondary">Đã trả lời</Badge>}
              {(isOwner || user?.role === 'admin') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-6">
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingCommentId(reply.id); setEditingContent(reply.content) }}>
                      <Edit className="size-3.5 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirmId(reply.id)}>
                      <Trash className="size-3.5 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Hủy</Button>
                <Button size="sm" onClick={() => onUpdate(reply.id)}>Lưu</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
              {reply.content}
            </div>
          )}

          {canPost && !isEditing && (
            <div className="mt-3 flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setActiveReplyId(isReplying ? null : reply.id)}
              >
                {isReplying ? 'Hủy' : 'Trả lời'}
              </Button>
            </div>
          )}
        </div>

        {isReplying && (
          <div className="mt-3 pl-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <Textarea
              value={replyDraftByTopic[reply.id] ?? ''}
              onChange={(e) =>
                setReplyDraftByTopic((prev) => ({
                  ...prev,
                  [reply.id]: e.target.value,
                }))
              }
              placeholder={`Trả lời ${reply.author?.displayName || '...'}`}
              className="min-h-[80px]"
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={() => onReply(reply.id)} disabled={createComment.isPending}>
                Gửi phản hồi
              </Button>
            </div>
          </div>
        )}

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
            Học viên hỏi đáp; Chỉ giảng viên phụ trách mới có quyền trả lời. Admin/Staff chỉ được xem.
          </p>
        </div>

        {!!lessonOptions.length && (
          <div className="min-w-[260px]">
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Chọn bài học" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[400px]">
                {((curriculum?.modules ?? []) as Array<any>).map((m) => (
                  <SelectGroup key={m.id}>
                    <SelectLabel className="bg-muted text-muted-foreground">{m.title}</SelectLabel>
                    {(m.lessons || []).map((l: any) => (
                      <SelectItem key={l.id} value={l.id} className="pl-6">
                        {l.title || l.id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isAuthenticated && canPost && (
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
                <CardHeader className="p-4 cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1" onClick={() => setExpandedTopicId(expanded ? null : topic.id)}>
                      <div className="text-base font-medium text-foreground leading-relaxed line-clamp-3">
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
                      {(topic.author?.id === user?.id || user?.role === 'admin') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-6">
                              <MoreVertical className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setEditingCommentId(topic.id);
                              setEditingContent(topic.content);
                              setExpandedTopicId(topic.id);
                            }}>
                              <Edit className="size-3.5 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(topic.id);
                            }}>
                              <Trash className="size-3.5 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {expanded && (
                  <CardContent className="p-4 pt-0">
                    {editingCommentId === topic.id ? (
                      <div className="mb-4 space-y-2 bg-muted/20 p-3 rounded-lg border">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Hủy</Button>
                          <Button size="sm" onClick={() => onUpdate(topic.id)}>Lưu thay đổi</Button>
                        </div>
                      </div>
                    ) : null}
                    {/* The full content is already visible in the header if it's short, or we can show it here if we want to ensure full visibility when expanded if header was clamped. */}
                    {/* However, the user says it's repeating, so let's remove this redundant block. */}

                    {(topic.replies?.length ?? 0) > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold mb-2">Phản hồi</div>
                        <div className="space-y-4">
                          {(topic.replies ?? []).map((r: any) => renderReplyTree(r as any, 0))}
                        </div>
                      </div>
                    )}

                    {canPost && (
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
                    )}
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
            <DialogDescription>Mô tả chi tiết thắc mắc của bạn.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
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
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thảo luận này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirmId && onDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

