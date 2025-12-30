import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import type { BlogPostResponseDTO } from '@workspace/schemas';
import { Calendar, Eye, MessageCircle, User } from 'lucide-react';

interface ViewBlogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog: BlogPostResponseDTO | null;
}

export function ViewBlogDialog({
    open,
    onOpenChange,
    blog,
}: ViewBlogDialogProps) {
    if (!blog) return null;

    const statusVariant = blog.status === 'published' ? 'default' : blog.status === 'draft' ? 'secondary' : 'outline';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{blog.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{blog.author?.fullName || 'Unknown'}</span>
                        </div>
                        {blog.publishedAt && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>{blog.viewCount || 0} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            <span>{blog.commentCount || 0} comments</span>
                        </div>
                        <Badge variant={statusVariant} className="capitalize">
                            {blog.status}
                        </Badge>
                    </div>

                    {/* Excerpt */}
                    {blog.excerpt && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Excerpt</h3>
                            <p className="text-muted-foreground">{blog.excerpt}</p>
                        </div>
                    )}

                    {/* Content */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Content</h3>
                        <div className="prose max-w-none">
                            <p className="whitespace-pre-wrap">{blog.content}</p>
                        </div>
                    </div>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {blog.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SEO Info */}
                    {(blog.seoTitle || blog.seoDescription) && (
                        <div className="space-y-2 border-t pt-4">
                            <h3 className="font-semibold">SEO Information</h3>
                            {blog.seoTitle && (
                                <div>
                                    <span className="text-sm text-muted-foreground">SEO Title: </span>
                                    <span className="text-sm">{blog.seoTitle}</span>
                                </div>
                            )}
                            {blog.seoDescription && (
                                <div>
                                    <span className="text-sm text-muted-foreground">SEO Description: </span>
                                    <span className="text-sm">{blog.seoDescription}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="space-y-1 border-t pt-4 text-xs text-muted-foreground">
                        <div>Created: {new Date(blog.createdAt).toLocaleString()}</div>
                        <div>Updated: {new Date(blog.updatedAt).toLocaleString()}</div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


