'use client';

import { useEffect } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    Calendar,
    Clock,
    Facebook,
    Twitter,
    Link as LinkIcon,
    Eye,
    MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useBlogBySlug, blogApi } from '@/lib/api/services/blog-api';
import { Skeleton } from "@workspace/ui/components/skeleton";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const CopyLink = LinkIcon;

interface BlogDetailClientProps {
    slug: string;
}

export function BlogDetailClient({ slug }: BlogDetailClientProps) {
    const { data: blog, isLoading, error } = useBlogBySlug(slug);

    // Increment view count on mount
    useEffect(() => {
        if (blog?.id) {
            blogApi.incrementViewCount(blog.id);
        }
    }, [blog?.id]);

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd MMMM, yyyy', { locale: vi });
        } catch {
            return dateString;
        }
    };

    const getReadingTime = (content: string) => {
        try {
            const parsed = JSON.parse(content);
            const text = parsed.blocks?.map((b: any) => b.data.text || '').join(' ') || '';
            const words = text.split(/\s+/).length;
            const minutes = Math.ceil(words / 200);
            return `${minutes} phút đọc`;
        } catch {
            return '5 phút đọc';
        }
    };

    const renderContent = (content: string) => {
        try {
            const parsed = JSON.parse(content);
            return (
                <div className="prose prose-lg max-w-none">
                    {parsed.blocks?.map((block: any, index: number) => {
                        switch (block.type) {
                            case 'header': {
                                const level = block.data.level as 1 | 2 | 3 | 4 | 5 | 6;
                                const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                                return <Tag key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                            }
                            case 'paragraph':
                                return <p key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                            case 'list': {
                                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                                return (
                                    <ListTag key={index}>
                                        {block.data.items?.map((item: string, i: number) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                                        ))}
                                    </ListTag>
                                );
                            }
                            case 'quote':
                                return (
                                    <blockquote key={index}>
                                        <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                                        {block.data.caption && <cite>{block.data.caption}</cite>}
                                    </blockquote>
                                );
                            case 'code':
                                return <pre key={index}><code>{block.data.code}</code></pre>;
                            case 'image':
                                return (
                                    <figure key={index}>
                                        <img src={block.data.file?.url} alt={block.data.caption || ''} />
                                        {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                                    </figure>
                                );
                            case 'delimiter':
                                return <hr key={index} />;
                            case 'table':
                                return (
                                    <table key={index}>
                                        <tbody>
                                            {block.data.content?.map((row: string[], i: number) => (
                                                <tr key={i}>
                                                    {row.map((cell: string, j: number) => (
                                                        <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            );
        } catch {
            return <p>Lỗi hiển thị nội dung</p>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="bg-card border-b border-border py-4">
                    <div className="container mx-auto px-4 lg:px-8">
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <main className="container mx-auto px-4 lg:px-8 py-10 md:py-16">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-8 w-32 mx-auto" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy bài viết</h1>
                    <p className="text-muted-foreground mb-4">Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    <Link href="/dashboard/blogs">
                        <Button>Quay lại danh sách</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <main className="container mx-auto px-4 lg:px-8 py-10 md:py-16">
                {/* Header */}
                <div className="max-w-5xl mx-auto text-center mb-10">
                    {blog.tags && blog.tags.length > 0 && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6 uppercase tracking-wider font-bold">
                            {blog.tags[0]}
                        </Badge>
                    )}
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight md:leading-[1.1] mb-6">
                        {blog.title}
                    </h1>
                    {blog.excerpt && (
                        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                            {blog.excerpt}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
                        {blog.publishedAt && (
                            <>
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4" strokeWidth={2} />
                                    <span>{formatDate(blog.publishedAt.toString())}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-border hidden md:block"></div>
                            </>
                        )}
                        <div className="flex items-center gap-2">
                            <Clock className="size-4" strokeWidth={2} />
                            <span>{getReadingTime(blog.content)}</span>
                        </div>
                        {blog.viewCount !== undefined && (
                            <>
                                <div className="w-1 h-1 rounded-full bg-border hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <Eye className="size-4" strokeWidth={2} />
                                    <span>{blog.viewCount} lượt xem</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto">
                    <div>
                        {renderContent(blog.content)}
                    </div>

                    {/* Social Share */}
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <span className="text-sm font-bold text-muted-foreground">Chia sẻ:</span>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Facebook className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Twitter className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <CopyLink className="size-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
