import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { TiptapEditor } from '@workspace/ui/components/tiptap-editor';
import type { BlogResponseDTO } from '@workspace/schemas';
import { formatDateTime } from '@/lib/format-utils';
import { Calendar, Eye, MessageCircle, User } from 'lucide-react';
import {
    Item,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
} from '@workspace/ui/components/item';

interface ViewBlogSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog: BlogResponseDTO | null;
}

export function ViewBlogSheet({
    open,
    onOpenChange,
    blog,
}: ViewBlogSheetProps) {
    if (!blog) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Xem chi tiết bài viết</SheetTitle>
                    <SheetDescription>
                        Mã bài viết: {blog.id.substring(0, 8)}...
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">

                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                            <Item variant="outline">
                                <ItemMedia>
                                    <Eye className="size-4" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Lượt xem</ItemTitle>
                                    <ItemDescription className="text-3xl font-black text-foreground">{blog.viewCount || 0}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia>
                                    <MessageCircle className="size-4" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Bình luận</ItemTitle>
                                    <ItemDescription className="text-3xl font-black text-foreground">{blog.commentCount || 0}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia>
                                    <Calendar className="size-4" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Cập nhật lần cuối</ItemTitle>
                                    <ItemDescription className="text-sm font-bold font-mono">
                                        {formatDateTime(blog.updatedAt, 'MMM d, yyyy')}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>

                        <Separator className="bg-border/20" />

                        {/* Content Sections */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                <div className="h-px flex-1 bg-border/20 min-h-0" />
                                <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40 text-center">
                                    Chi tiết bài viết
                                </h3>
                                <div className="h-px flex-1 bg-border/20 min-h-0" />
                            </div>

                            {/* Title */}
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Tiêu đề</ItemTitle>
                                    <ItemDescription className="text-sm font-bold text-foreground uppercase">{blog.title}</ItemDescription>
                                </ItemContent>
                            </Item>

                            {/* Author */}
                            <Item variant="outline">
                                <ItemMedia><User className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Tác giả</ItemTitle>
                                    <ItemDescription className="text-sm font-bold text-foreground">{blog.author?.displayName || 'Không rõ'}</ItemDescription>
                                </ItemContent>
                            </Item>

                            {/* Excerpt */}
                            {blog.excerpt && (
                                <Item variant="outline">
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Mô tả ngắn</ItemTitle>
                                        <ItemDescription className="text-sm">{blog.excerpt}</ItemDescription>
                                    </ItemContent>
                                </Item>
                            )}

                            {/* Content */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Nội dung</h4>
                                <div className="rounded-lg border bg-background overflow-hidden">
                                    <TiptapEditor content={blog.content} mode="readonly" className="min-h-[400px]" />
                                </div>
                            </div>

                            {/* Status & Published At */}
                            <div className="grid grid-cols-2 gap-4">
                                <Item variant="outline">
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Trạng thái</ItemTitle>
                                        <ItemDescription className="text-sm font-bold uppercase">{blog.status}</ItemDescription>
                                    </ItemContent>
                                </Item>
                                <Item variant="outline">
                                    <ItemMedia><Calendar className="size-4" /></ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Ngày xuất bản</ItemTitle>
                                        <ItemDescription className="text-sm font-mono">
                                            {blog.publishedAt ? formatDateTime(blog.publishedAt) : 'Chưa xuất bản'}
                                        </ItemDescription>
                                    </ItemContent>
                                </Item>
                            </div>

                            {/* Tags */}
                            {blog.tags && blog.tags.length > 0 && (
                                <Item variant="outline">
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2">Ảnh bìa (Tags)</ItemTitle>
                                        <ItemDescription className="flex flex-wrap gap-2">
                                            {blog.tags.map((tag: string, index: number) => (
                                                <Badge key={index} variant="outline" className="uppercase text-[10px] font-black tracking-wider">{tag}</Badge>
                                            ))}
                                        </ItemDescription>
                                    </ItemContent>
                                </Item>
                            )}

                            {/* Cover Image */}
                            {blog.coverImageUrl && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-1">Ảnh bìa</h4>
                                    <div className="rounded-lg overflow-hidden border aspect-video relative">
                                        <img src={blog.coverImageUrl} alt="Cover" className="object-cover w-full h-full" />
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-4">
                                <Item variant="outline">
                                    <ItemMedia><Calendar className="size-4" /></ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Ngày tạo</ItemTitle>
                                        <ItemDescription className="text-sm font-mono">{formatDateTime(blog.createdAt)}</ItemDescription>
                                    </ItemContent>
                                </Item>
                                <Item variant="outline">
                                    <ItemMedia><Calendar className="size-4" /></ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Cập nhật lần cuối</ItemTitle>
                                        <ItemDescription className="text-sm font-mono">{formatDateTime(blog.updatedAt)}</ItemDescription>
                                    </ItemContent>
                                </Item>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
