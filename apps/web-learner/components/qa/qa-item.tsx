'use client'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Heart, MessageSquare, Share2, Flag } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAppSelector } from '@/hooks/hooks'
import { qaApi } from '@/apis/services/qa-api'
import { toast } from '@workspace/ui/components/sonner'

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
    tags?: string[] // Assuming tags are strings or objects
    virtualLikeCount?: number // For optimistic updates if needed
    isLiked?: boolean
}

export function QAItem({ post: initialPost }: { post: Post }) {
    const { user, isAuthenticated } = useAppSelector(state => state.auth)
    const [post, setPost] = useState(initialPost)
    const [isLiked, setIsLiked] = useState(() => {
        // specific check if current user is in the likes list
        return initialPost.likes?.some(l => l.userId === user?.id) || false
    })
    const [likeCount, setLikeCount] = useState(initialPost._count?.likes || 0)
    const [isLiking, setIsLiking] = useState(false)

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thực hiện hành động này')
            return
        }

        if (isLiking) return

        // Optimistic Update
        const previousLiked = isLiked
        const previousCount = likeCount

        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
        setIsLiking(true)

        try {
            if (previousLiked) {
                await qaApi.unlike(post.id)
            } else {
                await qaApi.like(post.id)
            }
        } catch (error) {
            // Revert
            setIsLiked(previousLiked)
            setLikeCount(previousCount)
            toast.error('Có lỗi xảy ra, vui lòng thử lại')
        } finally {
            setIsLiking(false)
        }
    }

    return (
        <div className="p-6 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-xl hover:border-primary/20 transition-all duration-300 shadow-sm group/card">
            <div className="flex gap-4">
                <Link href={post.author ? `/user/${post.author.id}` : '#'}>
                    <Avatar className="h-12 w-12 border border-border cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={post.author?.avatarUrl} alt={post.author?.displayName} />
                        <AvatarFallback>{post.author?.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href={post.author ? `/user/${post.author.id}` : '#'}>
                            <span className="font-serif font-bold text-lg hover:underline decoration-primary/50 underline-offset-4">{post.author?.displayName || 'Unknown User'}</span>
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">• {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}</span>
                    </div>

                    {/* Tags if any */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 mb-2">
                            {post.tags.map((tag, i) => (
                                <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <Link href={`/qa/${post.id}`}>
                        <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-4 hover:text-foreground transition-colors line-clamp-4 group-hover/card:line-clamp-none">
                            {post.content}
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/10">
                        <div className="flex items-center gap-6 text-muted-foreground">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLike}
                                className={`space-x-2 px-0 hover:bg-transparent ${isLiked ? 'text-red-500' : 'hover:text-red-500'} group transition-colors`}
                            >
                                <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{likeCount}</span>
                            </Button>

                            <Link href={`/qa/${post.id}`}>
                                <Button variant="ghost" size="sm" className="space-x-2 px-0 hover:bg-transparent hover:text-primary group">
                                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{post._count?.comments || 0}</span>
                                </Button>
                            </Link>

                            <Button variant="ghost" size="sm" className="space-x-2 px-0 hover:bg-transparent hover:text-blue-500 group">
                                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </Button>
                        </div>

                        <Button variant="ghost" size="icon" className="text-muted-foreground/40 hover:text-destructive">
                            <Flag className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
