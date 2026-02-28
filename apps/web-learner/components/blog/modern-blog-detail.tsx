'use client';

import React from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    Calendar,
    Clock,
    Globe,
    Rss,
    Mail,
    ThumbsUp,
    ChevronDown,
    User,
    ExternalLink,
    Twitter,
    Facebook,
    Link as LinkIcon
} from 'lucide-react';

import { formatDate } from '@/utils/format-utils';
import type { BlogResponseDTO } from '@workspace/schemas';
import { TiptapEditor } from '@workspace/ui/components/tiptap-editor';
import { Button } from '@workspace/ui/components/button';

interface ModernBlogDetailProps {
    blog: BlogResponseDTO;
    recentBlogs: BlogResponseDTO[];
}

export function ModernBlogDetail({ blog, recentBlogs }: ModernBlogDetailProps) {
    // Estimate reading time
    const wordCount = blog.content ? blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200) || 1;

    return (
        <div className="bg-[#f8f6f6] dark:bg-[#221610] text-slate-900 dark:text-slate-100 antialiased font-sans min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
                    <Link className="hover:text-[#ec5b13]" href="/">Home</Link>
                    <ChevronRight className="size-3" />
                    <Link className="hover:text-[#ec5b13]" href="/blog">Blog</Link>
                    <ChevronRight className="size-3" />
                    <span className="text-slate-900 dark:text-slate-100 truncate max-w-[200px]">Article</span>
                </nav>

                {/* Article Header */}
                <article>
                    <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-8 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                        <img
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            src={blog.coverImageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop"}
                        />
                        <div className="absolute bottom-6 left-6 z-20">
                            <div className="flex gap-2 mb-3">
                                {blog.tags?.slice(0, 2).map((tag) => (
                                    <span key={tag} className="bg-[#ec5b13] px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                                {!blog.tags?.length && (
                                    <span className="bg-[#ec5b13] px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                                        Learning
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-6">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 border-b border-[#ec5b13]/10 pb-8 mb-8 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full border border-[#ec5b13]/20 bg-slate-200 flex items-center justify-center overflow-hidden">
                                {blog.author?.avatarUrl ? (
                                    <img src={blog.author.avatarUrl} alt={blog.author.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="size-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{blog.author?.displayName || 'Torii Instructor'}</p>
                                <p>Japanese Instructor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="size-4" />
                            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="size-4" />
                            <span>{readingTime} min read</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 leading-relaxed">
                        <TiptapEditor
                            content={blog.content}
                            mode="readonly"
                            className="border-none p-0 bg-transparent shadow-none"
                        />
                    </div>

                    {/* Author Profile */}
                    <section className="mt-16 bg-slate-100 dark:bg-[#ec5b13]/5 rounded-2xl p-8 border border-[#ec5b13]/10">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="h-24 w-24 rounded-full border-4 border-white shadow-md bg-slate-200 flex items-center justify-center overflow-hidden">
                                {blog.author?.avatarUrl ? (
                                    <img src={blog.author.avatarUrl} alt={blog.author.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="size-12 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-2">{blog.author?.displayName || 'Torii Instructor'}</h4>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                    Our professional Japanese instructors have years of experience teaching business etiquette and advanced grammar to international learners. We specialize in making complex linguistic concepts accessible and practical.
                                </p>
                                <div className="flex justify-center md:justify-start gap-4 text-[#ec5b13]">
                                    <Link href="#"><Globe className="size-5 hover:opacity-80" /></Link>
                                    <Link href="#"><Rss className="size-5 hover:opacity-80" /></Link>
                                    <Link href="#"><Mail className="size-5 hover:opacity-80" /></Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Related Articles */}
                    {recentBlogs.length > 0 && (
                        <section className="mt-16">
                            <h3 className="text-2xl font-bold mb-8">Continue Learning</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {recentBlogs.slice(0, 2).map((related) => (
                                    <Link key={related.id} href={`/blog/${related.id}`} className="group cursor-pointer">
                                        <div className="aspect-video rounded-xl overflow-hidden mb-4 relative">
                                            <img
                                                src={related.coverImageUrl || "https://images.unsplash.com/photo-1544894079-e81a9eb1da8b?q=80&w=800&auto=format&fit=crop"}
                                                alt={related.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#1a110c]/90 px-2 py-1 rounded text-xs font-bold text-[#ec5b13]">
                                                {related.tags?.[0] || 'Article'}
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold group-hover:text-[#ec5b13] transition-colors line-clamp-2 text-slate-900 dark:text-slate-100">
                                            {related.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                                            {related.excerpt}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Comments Section */}
                    <section className="mt-16 mb-24 border-t border-[#ec5b13]/10 pt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold font-sans">Comments ({blog.commentCount || 0})</h3>
                            <div className="flex items-center gap-2 text-sm font-medium text-[#ec5b13] cursor-pointer">
                                <span>Sort by: Newest</span>
                                <ChevronDown className="size-4" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#ec5b13]/5 rounded-xl p-6 shadow-sm border border-[#ec5b13]/10 mb-8">
                            <textarea
                                className="w-full rounded-lg border-[#ec5b13]/20 bg-[#f8f6f6] dark:bg-[#221610] p-4 text-sm focus:border-[#ec5b13] focus:ring-1 focus:ring-[#ec5b13] outline-none min-h-[120px] transition-all"
                                placeholder="Join the discussion..."
                            ></textarea>
                            <div className="flex justify-end mt-4">
                                <button className="bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white font-bold py-2.5 px-8 rounded-full transition-all shadow-lg shadow-[#ec5b13]/20 active:scale-95">
                                    Post Comment
                                </button>
                            </div>
                        </div>

                        {(blog.commentCount || 0) > 0 ? (
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full border border-[#ec5b13]/20 bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        <User className="size-6 text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-bold">Kenji S.</h5>
                                            <span className="text-xs text-slate-500">2 hours ago</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                            This guide is incredibly helpful! I always get confused between different concepts. The explanation really cleared things up for my next session.
                                        </p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#ec5b13] transition-colors">
                                                <ThumbsUp className="size-3" /> 4
                                            </button>
                                            <button className="text-xs font-bold text-slate-500 hover:text-[#ec5b13] transition-colors">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-8">No comments yet. Be the first to join the discussion!</p>
                        )}
                    </section>
                </article>
            </main>
        </div>
    );
}
