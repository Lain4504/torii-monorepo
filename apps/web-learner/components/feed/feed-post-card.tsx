'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Heart, MessageCircle, Share2, MoreVertical, Trash2, Flag, UserPlus, UserCheck, Edit2 } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
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
import type { FeedResponseDTO } from '@workspace/schemas'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/hooks'
import { feedApi } from '@/apis/services/feed-api'
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

export function FeedPostCard({ post, onLike, onComment, onDelete, onTagClick, onFollow, onPostUpdated }: FeedPostCardProps) {
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
            <div className="bg-background rounded-xl border border-border/40 p-5 space-y-4 hover:border-primary/20 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <Link href={`/user/${post.author?.id}`} className="flex-shrink-0">
                            <Avatar>
                                <AvatarImage src={post.author?.avatarUrl || undefined} />
                                <AvatarFallback>{post.author?.displayName?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <Link href={`/user/${post.author?.id}`} className="font-semibold text-foreground hover:underline block">
                                {post.author?.displayName || 'Unknown User'}
                            </Link>
                            <div className="text-xs text-muted-foreground flex items-center">
                                <span className="text-primary font-medium mr-1 bg-primary/10 px-1.5 rounded text-[10px]">Thành viên mới</span>
                                <span className="mx-1">•</span>
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </div>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isOwnPost ? (
                                <>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setShowEditDialog(true)}
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Xóa bài viết
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={handleReport}
                                >
                                    <Flag className="w-4 h-4 mr-2" />
                                    Báo cáo
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-2">
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {post.tags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs text-primary/80 border-primary/20 bg-primary/5 font-normal cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTagClick?.(tag);
                                    }}
                                >
                                    | {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                    <div className="cursor-pointer">
                        {post.title && <h3 className="font-semibold text-lg text-foreground mb-1">{post.title}</h3>}
                        <p className="text-muted-foreground text-sm line-clamp-3 whitespace-pre-line">
                            {post.content}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-border/40">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 h-8 px-2 ${post.isLiked ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onLike?.(post.id);
                        }}
                    >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs">Yêu thích ({post.likes || 0})</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 h-8 px-2 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onComment?.(post.id);
                        }}
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">Bình luận ({post.comments || 0})</span>
                    </Button>
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 h-8 px-2 ${post.isFollowingAuthor ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (post.author?.id) onFollow?.(post.author.id);
                        }}
                    >
                        {post.isFollowingAuthor ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        <span className="text-xs">{post.isFollowingAuthor ? 'Đang theo dõi' : 'Theo dõi'}</span>
                    </Button> */}
                </div>
            </div>

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
                            className="bg-red-600 hover:bg-red-700"
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
