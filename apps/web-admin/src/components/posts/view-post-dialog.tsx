import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import type { PostResponseDTO } from '@workspace/schemas';
import { Calendar, Eye, MessageCircle, User } from 'lucide-react';

interface ViewPostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: PostResponseDTO | null;
}

export function ViewPostDialog({
    open,
    onOpenChange,
    post,
}: ViewPostDialogProps) {
    if (!post) return null;

    const statusVariant = post.status === 'published' ? 'default' : post.status === 'draft' ? 'secondary' : 'outline';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{post.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{post.author?.displayName || 'Unknown'}</span>
                        </div>
                        {post.publishedAt && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>{post.viewCount || 0} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.commentCount || 0} comments</span>
                        </div>
                        <Badge variant={statusVariant} className="capitalize">
                            {post.status}
                        </Badge>
                    </div>

                    {/* Excerpt */}
                    {post.excerpt && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Excerpt</h3>
                            <p className="text-muted-foreground">{post.excerpt}</p>
                        </div>
                    )}

                    {/* Content */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Content</h3>
                        <div className="prose max-w-none">
                            <p className="whitespace-pre-wrap">{post.content}</p>
                        </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SEO Info */}
                    {(post.seoTitle || post.seoDescription) && (
                        <div className="space-y-2 border-t pt-4">
                            <h3 className="font-semibold">SEO Information</h3>
                            {post.seoTitle && (
                                <div>
                                    <span className="text-sm text-muted-foreground">SEO Title: </span>
                                    <span className="text-sm">{post.seoTitle}</span>
                                </div>
                            )}
                            {post.seoDescription && (
                                <div>
                                    <span className="text-sm text-muted-foreground">SEO Description: </span>
                                    <span className="text-sm">{post.seoDescription}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="space-y-1 border-t pt-4 text-xs text-muted-foreground">
                        <div>Created: {new Date(post.createdAt).toLocaleString()}</div>
                        <div>Updated: {new Date(post.updatedAt).toLocaleString()}</div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}



