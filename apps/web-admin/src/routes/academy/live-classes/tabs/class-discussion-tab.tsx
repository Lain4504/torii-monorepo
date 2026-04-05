import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useComments, useCreateComment } from '@/lib/api/services/comments'
import type { CommentResponseDTO } from '@workspace/schemas'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Textarea } from '@workspace/ui/components/textarea'
import { toast } from '@workspace/ui/components/sonner'
import { Plus, MessageSquare, User } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@workspace/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { formatDate } from '@/lib/format-utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { useAcademyLiveClass } from '@/lib/api/services/academy-live-classes'
import { useAcademyVodPackage } from '@/lib/api/services/academy-vod-packages'

interface ClassDiscussionTabProps {
  classId?: string
  vodPackageId?: string
}

export function ClassDiscussionTab({ classId, vodPackageId }: ClassDiscussionTabProps) {
  const { user, isAuthenticated } = useAuth()
  const createComment = useCreateComment()

  const [selectedTopic, setSelectedTopic] = useState<CommentResponseDTO | null>(null)
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [replyDraftByTopic, setReplyDraftByTopic] = useState<Record<string, string>>({})
  const [topicContent, setTopicContent] = useState('')

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

  const params = useMemo(
    () => ({ 
      discussionId: selectedLessonId, 
      classId: classId || vodPackageId,
      page: 1, 
      limit: 100 
    } as any),
    [selectedLessonId, classId, vodPackageId],
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
        classId: classId || vodPackageId,
      } as any)
      setTopicContent('')
      setSelectedTopic(null)
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
        classId: classId || vodPackageId,
      } as any)
      setReplyDraftByTopic((prev) => ({ ...prev, [topicId]: '' }))
      setActiveReplyId(null)
      refetch()
    } catch (e: any) {
      toast.error(e?.message || 'Không thể gửi trả lời')
    }
  }

  const renderReplyTree = (reply: CommentResponseDTO, depth: number): any => {
    const canRecurse = depth < 3 && (reply.replies?.length ?? 0) > 0
    const isReplying = activeReplyId === reply.id
    
    return (
      <div key={reply.id} className={depth === 0 ? '' : 'mt-4'}>
        <div className="rounded-md border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold text-sm text-primary flex items-center gap-2">
               <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="size-3" />
               </div>
               {reply.author?.displayName || 'Unknown'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
              {reply.status === 'ANSWERED' && <Badge variant="secondary" className="text-[9px]">Đã trả lời</Badge>}
            </div>
          </div>

          <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
            {reply.content}
          </div>

          {canPost && (
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
            Học viên hỏi đáp; Chỉ giảng viên phụ trách mới có quyền trả lời.
          </p>
        </div>

        {!!lessonOptions.length && (
          <div className="min-w-[260px]">
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Chọn bài học" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[400px]">
                {(((curriculum?.modules ?? []) as Array<any>)
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                ).map((m) => (
                  <SelectGroup key={m.id}>
                    <SelectLabel className="bg-muted text-muted-foreground">{m.title}</SelectLabel>
                    {((m.lessons || []) as Array<any>)
                      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                      .map((l: any) => (
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
          <Button className="gap-2" onClick={() => setSelectedTopic({ content: '', discussionId: selectedLessonId } as any)}>
            <Plus className="size-4" />
            Đặt câu hỏi
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <div className="p-4 rounded-md border border-destructive/20 bg-destructive/5 text-destructive">
          Không thể tải thảo luận.
        </div>
      ) : topics.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground space-y-2 border border-dashed rounded-lg bg-muted/5">
          <MessageSquare className="h-10 w-10 mx-auto opacity-40" />
          <div className="font-semibold">Chưa có thảo luận nào cho bài học này.</div>
          <div className="text-sm">Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ ý kiến.</div>
        </div>
      ) : (
        <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] pl-4">#</TableHead>
                <TableHead className="w-[200px]">Học viên</TableHead>
                <TableHead>Nội dung câu hỏi</TableHead>
                <TableHead className="w-[140px]">Ngày gửi</TableHead>
                <TableHead className="w-[120px]">Phản hồi</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[144px] text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic, index) => {
                return (
                  <TableRow 
                    key={topic.id} 
                    className="cursor-pointer hover:bg-muted/30 transition-colors group"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <TableCell className="pl-4 text-muted-foreground font-mono text-xs">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {topic.author?.avatarUrl ? (
                            <img src={topic.author.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <User className="size-4 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm truncate font-bold">{topic.author?.displayName || 'Unknown'}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{topic.author?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground/80 line-clamp-1 group-hover:text-primary transition-colors">
                        {topic.content}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(topic.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {topic.replyCount ?? 0} phản hồi
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {topic.status === 'ANSWERED' ? (
                        <Badge variant="success" className="text-[9px] uppercase font-black">Đã trả lời</Badge>
                      ) : (
                        <Badge variant="warning" className="text-[9px] uppercase font-black">Chờ phản hồi</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                        <Button variant="outline" size="sm" className="h-8 font-bold text-xs uppercase tracking-wider">
                           Xem thảo luận
                        </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DiscussionDetailsSheet 
        topic={selectedTopic} 
        open={!!selectedTopic} 
        onOpenChange={(open) => !open && setSelectedTopic(null)}
        canPost={canPost}
        isAuthenticated={isAuthenticated}
        createCommentPending={createComment.isPending}
        replyDraftByTopic={replyDraftByTopic}
        setReplyDraftByTopic={setReplyDraftByTopic}
        onReply={onReply}
        renderReplyTree={renderReplyTree}
        onCreateTopic={onCreateTopic}
        topicContent={topicContent}
        setTopicContent={setTopicContent}
        currentUserDisplayName={user?.displayName}
      />
    </div>
  )
}

interface DiscussionDetailsSheetProps {
    topic: CommentResponseDTO | null
    open: boolean
    onOpenChange: (open: boolean) => void
    canPost: boolean
    isAuthenticated: boolean
    createCommentPending: boolean
    replyDraftByTopic: Record<string, string>
    setReplyDraftByTopic: (val: any) => void
    onReply: (id: string) => Promise<void>
    renderReplyTree: (reply: CommentResponseDTO, depth: number) => any
    onCreateTopic: () => Promise<void>
    topicContent: string
    setTopicContent: (val: string) => void
    currentUserDisplayName?: string
}

function DiscussionDetailsSheet({
    topic,
    open,
    onOpenChange,
    canPost,
    isAuthenticated,
    createCommentPending,
    replyDraftByTopic,
    setReplyDraftByTopic,
    onReply,
    renderReplyTree,
    onCreateTopic,
    topicContent,
    setTopicContent,
    currentUserDisplayName
}: DiscussionDetailsSheetProps) {
    const isNew = topic && !topic.id

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col h-full p-0 overflow-hidden">
                <SheetHeader className="p-6 border-b shrink-0 bg-muted/5">
                    <SheetTitle>{isNew ? 'Đặt câu hỏi mới' : 'Chi tiết thảo luận'}</SheetTitle>
                    <SheetDescription>
                        {isNew ? 'Mô tả chi tiết thắc mắc của bạn bên dưới.' : `Thảo luận bắt đầu từ ${topic?.author?.displayName} vào ${topic ? formatDate(topic.createdAt) : ''}`}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0 bg-background">
                    <div className="p-6 space-y-8">
                        {isNew ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nội dung câu hỏi</label>
                                    <Textarea 
                                        value={topicContent} 
                                        onChange={(e) => setTopicContent(e.target.value)} 
                                        placeholder="Nhập nội dung thắc mắc của bạn..." 
                                        className="min-h-[200px]"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                                    <Button onClick={onCreateTopic} disabled={createCommentPending}>
                                        {createCommentPending ? 'Đang gửi...' : 'Gửi câu hỏi'}
                                    </Button>
                                </div>
                            </div>
                        ) : topic && (
                            <div className="space-y-8">
                                {/* Original Topic */}
                                <div className="bg-primary/5 rounded-xl border border-primary/10 p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                {topic.author?.avatarUrl ? (
                                                    <img src={topic.author.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <User className="size-5 text-primary" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-foreground">{topic.author?.displayName}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{topic.author?.role || 'STUDENT'}</span>
                                            </div>
                                        </div>
                                        <Badge variant={topic.status === 'ANSWERED' ? 'success' : 'warning'} className="text-[9px] font-black">
                                            {topic.status === 'ANSWERED' ? 'ĐÃ TRẢ LỜI' : 'CHỜ PHẢN HỒI'}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-medium leading-relaxed bg-background/50 p-4 rounded-lg border border-primary/5 whitespace-pre-wrap">
                                        {topic.content}
                                    </div>
                                </div>

                                {/* Replies Tree */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-sm font-bold border-b pb-2">
                                        <MessageSquare className="size-4 text-primary" />
                                        <span>Phản hồi ({topic.replyCount ?? 0})</span>
                                    </div>
                                    <div className="pl-4 border-l-2 border-primary/5 ml-2 space-y-6">
                                        {(topic.replies?.length ?? 0) > 0 ? (
                                            topic.replies.map((r: any) => renderReplyTree(r as any, 0))
                                        ) : (
                                            <div className="py-8 text-center bg-muted/10 rounded-lg border border-dashed">
                                                <p className="text-xs text-muted-foreground italic">Chưa có phản hồi nào cho thảo luận này.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {!isNew && topic && canPost && (
                    <div className="p-4 border-t bg-muted/5 shrink-0">
                         <div className="bg-background rounded-xl border p-4 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trả lời thảo luận</span>
                                <span className="text-[10px] text-muted-foreground italic">Trả lời với danh nghĩa {currentUserDisplayName}</span>
                            </div>
                            <Textarea
                                value={replyDraftByTopic[topic.id] ?? ''}
                                onChange={(e) =>
                                    setReplyDraftByTopic((prev: any) => ({
                                        ...prev,
                                        [topic.id]: e.target.value,
                                    }))
                                }
                                placeholder="Viết phản hồi hoặc giải đáp thắc mắc của học viên..."
                                className="min-h-[100px] bg-muted/10 border-muted/20 focus:bg-background transition-all"
                            />
                            <div className="flex justify-end">
                                <Button
                                    disabled={!isAuthenticated || createCommentPending}
                                    onClick={() => onReply(topic.id)}
                                    size="sm"
                                    className="gap-2 font-bold uppercase tracking-wider text-[10px] h-9 px-4"
                                >
                                    <MessageSquare className="size-3.5" />
                                    Gửi phản hồi
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
