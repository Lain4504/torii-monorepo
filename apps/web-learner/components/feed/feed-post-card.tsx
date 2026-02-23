'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Heart, MessageCircle, MoreVertical, Trash2, Flag, Edit2 } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardHeader, CardContent, CardFooter } from '@workspace/ui/components/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription } from '@workspace/ui/components/item'
import type { FeedResponseDTO } from '@workspace/schemas'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { feedApi } from '@/lib/api/services/feed-api'
import { toast } from '@workspace/ui/components/sonner'
import { FeedEditPostDialog } from './feed-edit-post-dialog'

interface FeedPostCardProps {
    post: FeedResponseDTO
    onLike?: (id: string) => void
    onComment?: (id: string) => void
    onDelete?: () => void
    onTagClick?: (tag: string) => void
    onFollow?: (authorId: string) => void
    onPostUpdated?: (updatedPost: FeedResponseDTO) => void
}

export function FeedPostCard({ post, onLike, onComment, onDelete, onTagClick, onPostUpdated }: FeedPostCardProps) {
    const { user } = useAppSelector(state => state.auth)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Convert both IDs to strings for reliable comparison
    const isOwnPost = user?.id && post.author?.id && String(user.id) === String(post.author.id)

    const handleDelete = async () => {
        try {
            setDeleting(true)
            await feedApi.delete(post.id)
            toast.success('Đã xóa bài viết')
            setShowDeleteDialog(false)
            onDelete?.()
        } catch (error) {
            console.error(error)
            toast.error('Không thể xóa bài viết')
        } finally {
            setDeleting(false)
        }
    }

    const handleReport = () => {
        // TODO: Implement report functionality
        toast.info('Tính năng báo cáo đang được phát triển')
    }

    return (
        <>
            <Card className="shadow-none border border-border/50 hover:bg-muted/30 group transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-start space-y-0 p-6 pb-4">
                    <Item className="p-0 border-none shadow-none hover:bg-transparent">
                        <ItemMedia>
                            <Link href={`/user/${post.author?.id}`}>
                                <Avatar className="size-11 border-2 border-background shadow-sm">
                                    <AvatarImage src={post.author?.avatarUrl || undefined} />
                                    <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                                        {post.author?.displayName?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                        </ItemMedia>
                        <ItemContent className="space-y-0.5">
                            <ItemTitle>
                                <Link href={`/user/${post.author?.id}`} className="font-bold text-base hover:text-primary transition-colors">
                                    {post.author?.displayName || 'Người dùng'}
                                </Link>
                            </ItemTitle>
                            <ItemDescription className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-widest px-2 py-0">
                                    Thành viên
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                    • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                                </span>
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="group-hover:bg-muted rounded-full">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-lg border-border/50">
                            {isOwnPost ? (
                                <>
                                    <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="rounded-lg font-bold text-xs uppercase tracking-wider h-10 px-3 cursor-pointer">
                                        <Edit2 className="size-4 mr-2.5 text-primary" />
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="rounded-lg font-bold text-xs uppercase tracking-wider h-10 px-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="size-4 mr-2.5" />
                                        Xóa bài viết
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem onClick={handleReport} className="rounded-lg font-bold text-xs uppercase tracking-wider h-10 px-3 cursor-pointer">
                                    <Flag className="size-4 mr-2.5 text-primary" />
                                    Báo cáo
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>

                <CardContent className="space-y-4 p-6 pt-0">
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {post.tags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="cursor-pointer font-bold text-[10px] uppercase tracking-widest bg-muted/30 border-border/60 hover:border-primary hover:text-primary transition-all px-2.5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTagClick?.(tag);
                                    }}
                                >
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                    <div className="group/content cursor-pointer">
                        {post.title && (
                            <h3 className="font-bold text-xl mb-2.5 group-hover/content:text-primary transition-colors leading-tight tracking-tight">
                                {post.title}
                            </h3>
                        )}
                        <p className="text-sm font-medium text-muted-foreground/90 leading-relaxed line-clamp-3">
                            {post.content}
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="flex items-center gap-6 p-6 py-4 border-t bg-muted/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-9 px-4 gap-2.5 font-bold text-[10px] uppercase tracking-widest rounded-full transition-all duration-300",
                            post.isLiked ? "text-destructive bg-destructive/5 hover:bg-destructive/10" : "text-muted-foreground hover:bg-muted"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike?.(post.id);
                        }}
                    >
                        <Heart className={cn("size-4", post.isLiked && "fill-current")} />
                        <span>{post.likes || 0} Yêu thích</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 gap-2.5 font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted rounded-full transition-all duration-300"
                        onClick={(e) => {
                            e.stopPropagation();
                            onComment?.(post.id);
                        }}
                    >
                        <MessageCircle className="size-4" />
                        <span>{post.comments || 0} Phản hồi</span>
                    </Button>
                </CardFooter>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            variant="destructive"
                        >
                            {deleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <FeedEditPostDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                post={post}
                onPostUpdated={onPostUpdated}
            />
        </>
    )
}
