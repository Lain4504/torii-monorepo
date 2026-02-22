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
import { Calendar, Eye, MessageCircle, User } from 'lucide-react';

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
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Xem chi tiết bài viết</SheetTitle>
                    <SheetDescription>
                        Mã bài viết: {blog.id.substring(0, 8)}...
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="space-y-6 p-6">

                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all group">
                                <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                    <div className="p-2 rounded-xl bg-background/50 text-primary border border-border/10">
                                        <Eye className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Lượt xem</span>
                                </div>
                                <div className="text-4xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                                    {blog.viewCount || 0}
                                </div>
                            </div>
                            <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all group">
                                <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                    <div className="p-2 rounded-xl bg-background/50 text-blue-500 border border-border/10">
                                        <MessageCircle className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Bình luận</span>
                                </div>
                                <div className="text-4xl font-black text-foreground tracking-tight group-hover:text-blue-500 transition-colors">
                                    {blog.commentCount || 0}
                                </div>
                            </div>
                            <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all group">
                                <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                    <div className="p-2 rounded-xl bg-background/50 text-purple-500 border border-border/10">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Cập nhật lần cuối</span>
                                </div>
                                <div className="text-xl font-bold text-foreground font-mono tracking-tight group-hover:text-purple-500 transition-colors pt-2">
                                    {new Date(blog.updatedAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-border/20" />

                        {/* Content Sections */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                <div className="h-px flex-1 bg-border/20" />
                                <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40 text-center">
                                    Chi tiết bài viết
                                </h3>
                                <div className="h-px flex-1 bg-border/20" />
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Tiêu đề</label>
                                <div className="h-14 px-5 rounded-2xl bg-muted/10 border border-border/20 text-sm font-bold uppercase flex items-center">
                                    {blog.title}
                                </div>
                            </div>

                            {/* Author */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Tác giả</label>
                                <div className="h-14 px-5 rounded-2xl bg-muted/10 border border-border/20 text-sm font-bold flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground/60" />
                                    {blog.author?.displayName || 'Không rõ'}
                                </div>
                            </div>

                            {/* Excerpt */}
                            {blog.excerpt && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Mô tả ngắn</label>
                                    <div className="min-h-[80px] px-5 py-4 rounded-2xl bg-muted/10 border border-border/20 text-sm font-bold flex items-start">
                                        {blog.excerpt}
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Nội dung</label>
                                <div className="rounded-2xl border border-border/20 bg-background overflow-hidden">
                                    <TiptapEditor
                                        content={blog.content}
                                        mode="readonly"
                                        className="min-h-[400px]"
                                    />
                                </div>
                            </div>

                            {/* Status & Published At */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Trạng thái</label>
                                    <div className="h-14 px-5 rounded-2xl bg-muted/10 border border-border/20 text-sm font-bold uppercase flex items-center">
                                        {blog.status}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Ngày xuất bản</label>
                                    <div className="h-14 px-5 rounded-2xl bg-muted/10 border border-border/20 text-sm font-bold font-mono flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground/60" />
                                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleString('vi-VN') : 'Chưa xuất bản'}
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            {blog.tags && blog.tags.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Thẻ (Tags)</label>
                                    <div className="px-5 py-4 rounded-2xl bg-muted/10 border border-border/20 flex flex-wrap gap-2">
                                        {blog.tags.map((tag: string, index: number) => (
                                            <Badge key={index} variant="outline" className="uppercase text-[10px] font-black tracking-wider">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cover Image */}
                            {blog.coverImageUrl && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Ảnh bìa</label>
                                    <div className="rounded-2xl overflow-hidden border border-border/40 bg-muted/30 aspect-video relative shadow-sm group max-w-2xl">
                                        <img
                                            src={blog.coverImageUrl}
                                            alt="Cover"
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                        Dữ liệu hệ thống
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Ngày tạo</label>
                                        <div className="h-14 px-5 rounded-2xl bg-muted/10 border border-border/20 text-sm font-bold font-mono flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground/60" />
                                            {new Date(blog.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Cập nhật lần cuối</label>
                                        <div className="h-14 px-5 rounded-2xl bg-muted/10 border border-border/20 text-sm font-bold font-mono flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground/60" />
                                            {new Date(blog.updatedAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
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
