'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Heart, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

// Minimal interface based on typical Schema
interface PostUser {
    id: string
    displayName: string
    avatarUrl?: string
}

export interface Post {
    id: string
    content: string
    createdAt: string
    author: PostUser
    _count?: {
        comments: number
        likes: number
    }
    likes?: { userId: string }[]
}

export function QAItem({ post }: { post: Post }) {
    return (
        <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-xl hover:border-primary/20 transition-all duration-300 shadow-sm">
            <div className="flex gap-4">
                <Link href={`/user/${post.author.id}`}>
                    <Avatar className="h-12 w-12 border border-border cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={post.author.avatarUrl} alt={post.author.displayName} />
                        <AvatarFallback>{post.author.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href={`/user/${post.author.id}`}>
                            <span className="font-serif font-bold text-lg hover:underline decoration-primary/50 underline-offset-4">{post.author.displayName}</span>
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">• {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}</span>
                    </div>
                    <Link href={`/qa/${post.id}`}>
                        <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-4 hover:text-foreground transition-colors line-clamp-4">
                            {post.content}
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-6 text-muted-foreground">
                        <Button variant="ghost" size="sm" className="space-x-2 px-0 hover:bg-transparent hover:text-red-500 group">
                            <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{post._count?.likes || 0}</span>
                        </Button>
                        <Link href={`/qa/${post.id}`}>
                            <Button variant="ghost" size="sm" className="space-x-2 px-0 hover:bg-transparent hover:text-primary group">
                                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{post._count?.comments || 0}</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
