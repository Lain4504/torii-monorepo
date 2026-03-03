'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { BlogResponseDTO, CommentResponseDTO } from '@workspace/schemas';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/lib/api/services/comment-api';
import { useAppSelector } from '@/hooks/hooks';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    Eye, MessageSquare, Clock, Calendar,
    Share2, Copy, Heart, Send, ChevronDown, Loader2, Tag, ArrowLeft, BookOpen
} from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

// ─── Utils ────────────────────────────────────────────────────────────────────

function fmtViews(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
}

function estimateReadTime(content: string) {
    return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function fmtDate(d: Date | string) {
    return format(new Date(d), "dd 'tháng' MM, yyyy", { locale: vi });
}

function fmtRelative(d: Date | string) {
    return formatDistanceToNow(new Date(d), { addSuffix: true, locale: vi });
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success('Đã sao chép liên kết!'));
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentAvatar({ name, avatarUrl, size = 10 }: { name: string; avatarUrl?: string; size?: number }) {
    const cls = `h-${size} w-${size} rounded-full object-cover bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0`;
    return avatarUrl
        ? <img src={avatarUrl} alt={name} className={`${cls} ring-2 ring-border`} />
        : <div className={cls} style={{ height: `${size * 4}px`, width: `${size * 4}px` }}>{name[0]?.toUpperCase()}</div>;
}

function CommentItem({
    comment, blogId, currentUserId, depth = 0
}: {
    comment: CommentResponseDTO;
    blogId: string;
    currentUserId?: string;
    depth?: number;
}) {
    const queryClient = useQueryClient();
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(depth === 0);
    const [liked, setLiked] = useState(comment.isLiked ?? false);
    const [likeCount, setLikeCount] = useState(comment.likeCount ?? 0);

    const likeMutation = useMutation({
        mutationFn: () => commentApi.toggleLike(comment.id),
        onSuccess: (res) => {
            setLiked(res.isLiked);
            setLikeCount(res.likeCount);
        },
    });

    const replyMutation = useMutation({
        mutationFn: (content: string) => commentApi.create({
            content,
            userId: currentUserId ?? '',
            blogId,
            parentId: comment.id,
        }),
        onSuccess: () => {
            setReplyText('');
            setShowReply(false);
            setShowReplies(true);
            queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] });
            toast.success('Đã gửi trả lời!');
        },
        onError: () => toast.error('Không thể gửi trả lời.'),
    });

    const replies: CommentResponseDTO[] = comment.replies ?? [];
    const authorName = comment.author?.displayName ?? 'Ẩn danh';

    return (
        <div className={`${depth > 0 ? 'ml-10 sm:ml-14 border-l-2 border-border pl-4' : ''}`}>
            <div className="flex gap-3 py-4">
                <CommentAvatar name={authorName} avatarUrl={comment.author?.avatarUrl} size={depth > 0 ? 8 : 10} />
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground">{authorName}</span>
                        <span className="text-xs text-muted-foreground">{fmtRelative(comment.createdAt)}</span>
                    </div>
                    {/* Content */}
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => likeMutation.mutate()}
                            disabled={!currentUserId}
                            className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'} disabled:opacity-50`}
                        >
                            <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
                            {likeCount > 0 && <span>{likeCount}</span>}
                        </button>
                        {depth === 0 && currentUserId && (
                            <button
                                onClick={() => setShowReply(v => !v)}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                                Trả lời
                            </button>
                        )}
                        {replies.length > 0 && depth === 0 && (
                            <button
                                onClick={() => setShowReplies(v => !v)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
                                {replies.length} trả lời
                            </button>
                        )}
                    </div>

                    {/* Reply form */}
                    {showReply && (
                        <div className="mt-3 flex gap-2">
                            <textarea
                                className="flex-1 min-h-[72px] p-3 text-sm bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                placeholder={`Trả lời ${authorName}...`}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && e.metaKey && replyText.trim()) {
                                        replyMutation.mutate(replyText.trim());
                                    }
                                }}
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => { if (replyText.trim()) replyMutation.mutate(replyText.trim()); }}
                                    disabled={replyMutation.isPending || !replyText.trim()}
                                    className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
                                >
                                    {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={() => setShowReply(false)}
                                    className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition text-xs"
                                >
                                    Huỷ
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Nested replies */}
                    {showReplies && replies.length > 0 && (
                        <div className="mt-2 space-y-0 divide-y divide-border/50">
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    blogId={blogId}
                                    currentUserId={currentUserId}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Comment Section ──────────────────────────────────────────────────────────

function CommentSection({ blogId, commentCount }: { blogId: string; commentCount: number }) {
    const { user } = useAppSelector(state => state.auth);
    const queryClient = useQueryClient();
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data: commentsData, isLoading } = useQuery({
        queryKey: ['blog-comments', blogId],
        queryFn: () => commentApi.findAll({ blogId, page: 1, limit: 50, sortOrder: 'desc' }),
    });

    const postMutation = useMutation({
        mutationFn: (content: string) => commentApi.create({
            content,
            userId: user?.id ?? '',
            blogId,
        }),
        onSuccess: () => {
            setText('');
            queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] });
            toast.success('Đã đăng bình luận!');
        },
        onError: () => toast.error('Không thể đăng bình luận. Vui lòng thử lại.'),
    });

    const comments = commentsData?.data ?? [];
    const rootComments = comments.filter(c => !c.parentId);

    return (
        <section id="comments-section" className="mt-12 pt-10 border-t border-border">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                    <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                    Bình luận <span className="text-muted-foreground font-normal text-base ml-1">({commentCount})</span>
                </h2>
            </div>

            {/* Compose */}
            {user ? (
                <div className="flex gap-3 mb-8">
                    <CommentAvatar name={user.displayName ?? 'U'} avatarUrl={user.avatarUrl as string | undefined} />
                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            className="w-full min-h-[100px] p-4 text-sm bg-muted/40 border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-muted-foreground"
                            placeholder="Chia sẻ suy nghĩ của bạn... (Ctrl+Enter để gửi)"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && text.trim()) {
                                    postMutation.mutate(text.trim());
                                }
                            }}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">Ctrl + Enter để gửi</span>
                            <button
                                onClick={() => { if (text.trim()) postMutation.mutate(text.trim()); }}
                                disabled={postMutation.isPending || !text.trim()}
                                className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {postMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Đăng bình luận
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-5 bg-muted/50 rounded-2xl border border-border text-center">
                    <p className="text-muted-foreground text-sm mb-3">Đăng nhập để bình luận bài viết này</p>
                    <Link href="/auth/sign-in" className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition inline-block">
                        Đăng nhập
                    </Link>
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-4 bg-muted rounded w-1/4" />
                                <div className="h-3 bg-muted rounded w-full" />
                                <div className="h-3 bg-muted rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : rootComments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Chưa có bình luận nào.</p>
                    <p className="text-sm mt-1">Hãy là người đầu tiên chia sẻ ý kiến!</p>
                </div>
            ) : (
                <div className="divide-y divide-border/70">
                    {rootComments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            blogId={blogId}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

// ─── Main BlogDetail ──────────────────────────────────────────────────────────

export function BlogDetail({ blog, recentBlogs }: { blog: BlogResponseDTO; recentBlogs: BlogResponseDTO[] }) {
    const coverImage = blog.coverImageUrl
        || 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop';
    const authorName = blog.author?.displayName ?? 'Torii Sensei';
    const authorAvatar = blog.author?.avatarUrl;
    const publishedDate = blog.publishedAt ? fmtDate(blog.publishedAt) : fmtDate(blog.createdAt);
    const readTime = estimateReadTime(blog.content);
    const primaryTag = blog.tags?.[0];

    return (
        <div className="min-h-screen bg-background text-foreground">

            <div className="bg-muted/50 border-b border-border" data-purpose="article-hero">
                <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="mb-8 flex justify-center">
                            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                <ArrowLeft className="h-4 w-4" /> Tất cả bài viết
                            </Link>
                        </div>

                        {primaryTag && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-6">
                                <Tag className="h-3 w-3" /> {primaryTag}
                            </span>
                        )}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight max-w-4xl mx-auto mb-8">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{publishedDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{readTime} phút đọc</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span>{fmtViews(blog.viewCount ?? 0)} lượt xem</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* ── ARTICLE + COMMENTS ───────────────────────────────── */}
                    <div className="flex-1 min-w-0 xl:pr-8">

                        <div className="mb-10 rounded-2xl overflow-hidden aspect-[2/1] relative bg-slate-100 dark:bg-slate-900 border border-border shadow-sm">
                            <img className="w-full h-full object-cover" src={coverImage} alt={blog.title} />
                        </div>

                        {/* Excerpt */}
                        {blog.excerpt && (
                            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 font-medium px-5 py-5 border-l-4 border-primary bg-primary/5 rounded-r-2xl">
                                {blog.excerpt}
                            </p>
                        )}

                        {/* Main content */}
                        <article
                            className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none
                                prose-headings:font-bold prose-headings:scroll-mt-20
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                prose-blockquote:border-primary prose-blockquote:text-muted-foreground
                                prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1
                                prose-img:rounded-xl prose-img:shadow-lg
                                prose-pre:bg-slate-900 prose-pre:text-slate-100
                                prose-strong:text-foreground
                                prose-hr:border-border"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="mt-10 pt-8 border-t border-border">
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-full text-sm font-medium transition cursor-pointer"
                                        >
                                            <Tag className="h-3.5 w-3.5" /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        <CommentSection blogId={blog.id} commentCount={blog.commentCount ?? 0} />
                    </div>

                    {/* ── STICKY SIDEBAR ───────────────────────────────────── */}
                    <aside className="w-full lg:w-72 xl:w-80 shrink-0">
                        <div className="sticky top-6 space-y-6">

                            {/* Article Info */}
                            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Thông tin bài viết</h3>
                                <dl className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <dt className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-4 w-4" /> Ngày đăng</dt>
                                        <dd className="font-medium">{publishedDate}</dd>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <dt className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /> Đọc trong</dt>
                                        <dd className="font-medium">{readTime} phút</dd>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <dt className="flex items-center gap-1.5 text-muted-foreground"><Eye className="h-4 w-4" /> Lượt xem</dt>
                                        <dd className="font-medium">{fmtViews(blog.viewCount ?? 0)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <dt className="flex items-center gap-1.5 text-muted-foreground"><MessageSquare className="h-4 w-4" /> Bình luận</dt>
                                        <dd className="font-medium">{blog.commentCount ?? 0}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Tags cloud */}
                            {blog.tags && blog.tags.length > 0 && (
                                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Chủ đề</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {blog.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium hover:bg-primary/10 hover:text-primary transition cursor-pointer">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Share */}
                            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Chia sẻ bài viết</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(window.location.href)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-muted hover:bg-muted/70 rounded-xl text-sm font-medium transition"
                                    >
                                        <Copy className="h-4 w-4" /> Sao chép link
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (navigator.share) navigator.share({ title: blog.title, url: window.location.href });
                                            else copyToClipboard(window.location.href);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium transition"
                                    >
                                        <Share2 className="h-4 w-4" /> Chia sẻ
                                    </button>
                                </div>
                            </div>

                            {/* Go to comments CTA */}
                            <button
                                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-card border border-border hover:bg-accent rounded-2xl text-sm font-medium transition shadow-sm"
                            >
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Xem {blog.commentCount ?? 0} bình luận
                            </button>

                            <div className="bg-primary rounded-2xl p-5 text-primary-foreground shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="size-5" />
                                    <h3 className="font-bold">Muốn học tiếng Nhật?</h3>
                                </div>
                                <p className="text-xs text-primary-foreground/90 mb-4 leading-relaxed">
                                    Khám phá các khóa học từ N5 đến N1 được thiết kế chuyên biệt.
                                </p>
                                <Link
                                    href="/courses"
                                    className="block w-full text-center py-2.5 bg-background text-primary rounded-xl font-bold text-sm hover:bg-background/90 transition"
                                >
                                    Xem khóa học
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {recentBlogs.length > 0 && (
                <section className="border-t border-border bg-muted/30 py-16">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Bài viết liên quan</h2>
                                <p className="text-muted-foreground text-sm mt-1">Tiếp tục khám phá kiến thức tiếng Nhật</p>
                            </div>
                            <Link href="/blog" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                                Xem tất cả →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentBlogs.slice(0, 3).map(post => (
                                <Link key={post.id} href={`/blog/${post.slug || post.id}`} className="group block">
                                    <article className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all hover:-translate-y-0.5">
                                        {/* Thumbnail */}
                                        <div className="aspect-video overflow-hidden bg-muted">
                                            {post.coverImageUrl
                                                ? <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                : <div className="w-full h-full flex items-center justify-center bg-muted"><BookOpen className="size-12 text-muted-foreground" /></div>
                                            }
                                        </div>
                                        <div className="p-5">
                                            {post.tags?.[0] && (
                                                <span className="text-xs font-bold text-primary uppercase tracking-wider">{post.tags[0]}</span>
                                            )}
                                            <h3 className="text-base font-bold text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{post.publishedAt ? fmtDate(post.publishedAt) : fmtDate(post.createdAt)}</span>
                                                <span>~{estimateReadTime(post.content)} phút đọc</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
