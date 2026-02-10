import { useState, useRef } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Upload, X, Loader2, FileText, Paperclip } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/api/services/storage-api';
import { cn } from '@workspace/ui/lib/utils';

interface MultiFileUploadProps {
    onUploadChange: (urls: string[]) => void;
    accept?: string;
    label?: string;
    currentUrls?: string[];
    disabled?: boolean;
    maxFiles?: number;
}

export function MultiFileUpload({ 
    onUploadChange, 
    accept = '*', 
    label = 'Tải lên tài liệu', 
    currentUrls = [], 
    disabled,
    maxFiles = 5
}: MultiFileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [urls, setUrls] = useState<string[]>(currentUrls);

    const handleFiles = async (newFiles: FileList | File[]) => {
        const filesArray = Array.from(newFiles);
        if (filesArray.length === 0) return;

        if (urls.length + filesArray.length > maxFiles) {
            toast.error(`Chỉ được phép tải lên tối đa ${maxFiles} tệp.`);
            return;
        }

        setIsUploading(true);
        const newUrls = [...urls];

        try {
            for (const file of filesArray) {
                // Check if already uploaded (basic check by name, though URLs might differ)
                // In a real app, we might want to check for duplicates more robustly
                
                const response = await storageApi.uploadFile(file, 'assignments');
                newUrls.push(response.fileUrl);
            }

            setUrls(newUrls);
            onUploadChange(newUrls);
            toast.success(`Đã tải lên ${filesArray.length} tệp thành công`);
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error('Tải lên thất bại. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            await handleFiles(event.target.files);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled || isUploading) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await handleFiles(files);
        }
    };

    const handleRemove = (urlToRemove: string) => {
        const updatedUrls = urls.filter(url => url !== urlToRemove);
        setUrls(updatedUrls);
        onUploadChange(updatedUrls);
    };

    const getFileName = (url: string) => {
        try {
            const path = new URL(url).pathname;
            return path.split('/').pop() || 'file';
        } catch {
            return url.split('/').pop() || 'file';
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group bg-muted/5",
                    isDragging ? "border-primary bg-primary/5 shadow-inner" : "border-border/20 hover:border-primary/50 hover:bg-muted/10",
                    (disabled || isUploading || urls.length >= maxFiles) && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && !isUploading && urls.length < maxFiles && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); !disabled && !isUploading && setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={accept}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled || isUploading || urls.length >= maxFiles}
                />
                
                <div className={cn(
                    "p-4 rounded-2xl transition-all",
                    isDragging ? "bg-primary/20 scale-110" : "bg-primary/10 group-hover:bg-primary/20"
                )}>
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                        <Upload className={cn(
                            "h-6 w-6 transition-colors",
                            isDragging ? "text-primary" : "text-primary/70 group-hover:text-primary"
                        )} />
                    )}
                </div>

                <div className="text-center space-y-1">
                    <p className="text-sm font-bold tracking-tight">
                        {isUploading ? 'Đang tải lên...' : label}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                        Kéo thả hoặc click để chọn tệp (Tối đa {maxFiles})
                    </p>
                </div>
            </div>

            {urls.length > 0 && (
                <div className="grid gap-2">
                    {urls.map((url, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-border/10 bg-muted/5 group/item hover:bg-muted/10 transition-colors animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate pr-2">{getFileName(url)}</p>
                                <div className="flex items-center gap-2">
                                    <Paperclip className="h-3 w-3 text-muted-foreground/40" />
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Đã sẵn sàng</span>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(url);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
