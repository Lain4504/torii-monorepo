
import { useState } from 'react';
import { useDiscussions, useDiscussion, useUpdateDiscussion } from '@/lib/api/services/discussion';
import { useComments, useCreateComment } from '@/lib/api/services/comments';
import { Button } from '@workspace/ui/components/button';
import { SmartPagination } from '@/components/common/smart-pagination';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { formatDateTime, formatNumber } from '@/lib/format-utils';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import {
    Empty,
    EmptyContent,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@workspace/ui/components/empty';
import { Spinner } from "@workspace/ui/components/spinner";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@workspace/ui/components/table";
import { toast } from "@workspace/ui/components/sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";

export default function CourseDiscussionsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

    const { data: discussionsData, isLoading } = useDiscussions({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
    });

    const openDetail = (id: string) => {
        setSelectedTopicId(id);
        setViewDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setViewDialogOpen(open);
        if (!open) setSelectedTopicId(null);
    };

    const topics = discussionsData?.data || [];
    const totalPages = discussionsData?.totalPages || 1;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Hỏi đáp & Thảo luận"
                subtitle="Quản lý và giải đáp thắc mắc của học viên trong các bài học"
                stats={[
                    { label: "Tổng số câu hỏi", value: formatNumber(discussionsData?.total) || 0 }
                ]}
            />

            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/40 gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-sm">
                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm câu hỏi..."
                                className="pl-9 bg-background border-border/40"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] bg-background border-border/40">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="OPEN">Chưa trả lời</SelectItem>
                                <SelectItem value="ANSWERED">Đã trả lời</SelectItem>
                                <SelectItem value="CLOSED">Đã đóng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="overflow-hidden border-border/40">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[40%] font-bold">Câu hỏi</TableHead>
                                    <TableHead className="font-bold">Người hỏi</TableHead>
                                    <TableHead className="font-bold">Thời gian</TableHead>
                                    <TableHead className="font-bold">Phản hồi</TableHead>
                                    <TableHead className="font-bold">Trạng thái</TableHead>
                                    <TableHead className="text-right font-bold">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6} className="h-16">
                                                <div className="flex items-center justify-center">
                                                    <Spinner className="h-4 w-4 text-primary/40" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : topics.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-60">
                                            <Empty className="border-none shadow-none bg-transparent">
                                                <EmptyMedia variant="icon"><MessageSquare /></EmptyMedia>
                                                <EmptyContent>
                                                    <EmptyTitle>Chưa có câu hỏi nào</EmptyTitle>
                                                    <EmptyDescription>Học viên chưa đặt câu hỏi nào trong các bài học.</EmptyDescription>
                                                </EmptyContent>
                                            </Empty>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    topics.map((topic) => (
                                        <TableRow key={topic.id} className="hover:bg-muted/10 cursor-pointer" onClick={() => openDetail(topic.id)}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold line-clamp-1">{topic.title}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">{topic.content}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 border">
                                                        <AvatarImage src={topic.author?.avatarUrl ?? undefined} />
                                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                            {topic.author?.displayName?.substring(0, 1).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-medium">{topic.author?.displayName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDateTime(topic.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] font-bold">
                                                    {topic.commentCount || 0} phản hồi
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={topic.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(topic.id); }}>
                                                    Giải đáp
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <SmartPagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={discussionsData?.total || 0}
                    onPageChange={setPage}
                    itemName="câu hỏi"
                />
            </div>

            {/* Detail View & Reply Sheet */}
            <Sheet open={viewDialogOpen} onOpenChange={handleOpenChange}>
                <SheetContent className="w-full sm:max-w-[700px] flex flex-col p-0 border-l border-border/40">
                    {selectedTopicId && (
                        <DiscussionDetail id={selectedTopicId} onClose={() => setViewDialogOpen(false)} />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'OPEN':
            return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">Chưa trả lời</Badge>;
        case 'ANSWERED':
            return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">Đã trả lời</Badge>;
        case 'CLOSED':
            return <Badge className="bg-muted text-muted-foreground border-transparent text-[10px] font-bold">Đã đóng</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function DiscussionDetail({ id }: { id: string, onClose: () => void }) {
    const { data: topic, isLoading: isLoadingTopic } = useDiscussion(id);
    const { data: commentsData, isLoading: isLoadingComments, refetch: refetchComments } = useComments({
        discussionId: id,
        limit: 100,
        page: 1
    });
    const createComment = useCreateComment();
    const updateDiscussion = useUpdateDiscussion();
    const [replyContent, setReplyContent] = useState('');

    const handleSendReply = async () => {
        if (!replyContent.trim()) return;

        try {
            await createComment.mutateAsync({
                discussionId: id,
                content: replyContent.trim(),
                userId: '', // Let backend handle from auth user
            });

            setReplyContent('');
            toast.success('Đã gửi phản hồi thành công');
            refetchComments();

            // Auto mark as answered if it's currently OPEN
            if (topic?.status === 'OPEN') {
                await updateDiscussion.mutateAsync({
                    id,
                    dto: { status: 'ANSWERED' }
                });
            }
        } catch (error) {
            toast.error('Không thể gửi phản hồi. Vui lòng thử lại.');
        }
    };

    if (isLoadingTopic) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-xs text-muted-foreground">Đang tải thảo luận...</p>
            </div>
        );
    }

    if (!topic) return null;

    const comments = commentsData?.data || [];

    return (
        <div className="flex flex-col h-full bg-background">
            <SheetHeader className="p-6 border-b border-border/40">
                <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={topic.status} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(topic.createdAt)}
                    </span>
                </div>
                <SheetTitle className="text-xl font-bold leading-tight">{topic.title}</SheetTitle>
                <SheetDescription className="flex items-center gap-2 pt-1 font-medium">
                    <User className="size-3 text-primary" /> Đặt bởi học viên <span className="text-foreground">{topic.author?.displayName}</span>
                </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {/* Question Content */}
                    <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 shadow-sm">
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">
                            {topic.content}
                        </p>
                    </div>

                    {/* Replies List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Các phản hồi ({comments.length})</h4>
                        </div>

                        {isLoadingComments ? (
                            <div className="flex justify-center py-4">
                                <Spinner className="h-5 w-5 text-primary/40" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="py-10 text-center border border-dashed rounded-xl bg-muted/10">
                                <p className="text-xs text-muted-foreground">Chưa có phản hồi nào cho câu hỏi này.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <Avatar className="h-8 w-8 border shrink-0">
                                            <AvatarImage src={comment.author?.avatarUrl} />
                                            <AvatarFallback className="text-[10px] bg-muted">
                                                {comment.author?.displayName?.substring(0, 1).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-foreground">{comment.author?.displayName}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{formatDateTime(comment.createdAt)}</span>
                                            </div>
                                            <div className="bg-muted/30 rounded-lg p-3 border border-border/20 shadow-sm ring-1 ring-black/5">
                                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>

            {/* Quick Reply Box */}
            <div className="p-6 border-t border-border/40 bg-muted/10 backdrop-blur-sm">
                <div className="flex flex-col gap-3">
                    <Textarea
                        placeholder="Nhập nội dung phản hồi cho học viên..."
                        className="bg-background border-border/40 resize-none min-h-[100px] text-sm focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all font-medium"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-3">
                        {topic.status === 'OPEN' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 font-bold text-xs uppercase tracking-widest gap-2"
                                onClick={() => updateDiscussion.mutate({ id, dto: { status: 'CLOSED' } })}
                            >
                                Đóng câu hỏi
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="h-9 px-6 font-bold text-xs uppercase tracking-widest gap-2"
                            onClick={handleSendReply}
                            disabled={createComment.isPending || !replyContent.trim()}
                        >
                            {createComment.isPending ? <Spinner className="size-3" /> : <Send className="size-3" />}
                            Gửi giải đáp
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
