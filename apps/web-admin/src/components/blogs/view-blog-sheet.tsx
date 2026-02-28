import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import {
    WebPreview,
    WebPreviewBody,
    WebPreviewNavigation,
    WebPreviewNavigationButton,
    WebPreviewUrl
} from "@workspace/ui/components/ai/web-preview";
import type { BlogResponseDTO } from '@workspace/schemas';
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";

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
    const [iframeKey, setIframeKey] = useState(Date.now());
    if (!blog) return null;

    const previewUrl = `http://localhost:3000/blog/preview/${blog.slug}`;

    const refreshPreview = () => {
        setIframeKey(Date.now());
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[90vw] h-[90vh] flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Xem trước bài viết</SheetTitle>
                    <SheetDescription>
                        Bản xem trước này hiển thị bài viết trên giao diện người học.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 min-h-0">
                    <WebPreview defaultUrl={previewUrl}>
                        <WebPreviewNavigation>
                            <WebPreviewNavigationButton tooltip="Reload" onClick={refreshPreview}>
                                <RefreshCcwIcon className="size-4" />
                            </WebPreviewNavigationButton>
                            <WebPreviewUrl />
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                <WebPreviewNavigationButton tooltip="Open in new tab">
                                    <ExternalLinkIcon className="size-4" />
                                </WebPreviewNavigationButton>
                            </a>
                        </WebPreviewNavigation>
                        <WebPreviewBody key={iframeKey} src={previewUrl} />
                    </WebPreview>
                </div>
            </SheetContent>
        </Sheet>
    );
}
