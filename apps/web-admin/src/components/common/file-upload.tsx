import { useState, useRef } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Upload, X, Loader2, FileAudio } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import axios from 'axios';
import { apiClient } from '@/api/api-client';
import { cn } from '@workspace/ui/lib/utils';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    accept?: string;
    label?: string;
    currentValue?: string;
    disabled?: boolean;
}

export function FileUpload({ onUploadComplete, accept = 'audio/*', label = 'Upload File', currentValue, disabled }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentValue);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Check file type manually since drag-and-drop might bypass accept attribute
        if (accept && accept !== '*') {
            const acceptType = accept.replace('*', '');
            if (!file.type.match(acceptType)) {
                toast.error('Invalid file type', {
                    description: `Please upload a valid ${accept.split('/')[0]} file.`
                });
                return;
            }
        }

        setIsUploading(true);
        try {
            // 1. Get Presigned URL using configured apiClient (with correct BaseURL and Auth)
            const { data: presignData } = await apiClient.post('/api/storage/upload-url', {
                filename: file.name,
                contentType: file.type,
                module: 'learning', // Default module
                ownerId: 'user', // Backend will override this with actual user ID
            });

            if (!presignData || !presignData.data || !presignData.data.uploadUrl) {
                throw new Error('Failed to get upload URL');
            }

            const { uploadUrl, fileUrl, fileId } = presignData.data;

            // 2. Upload to R2 (Directly) using raw axios (no custom headers)
            // R2/S3 presigned URLs usually require the specific Content-Type header matched in signature
            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
            });

            // 3. Confirm Upload using apiClient
            await apiClient.post('/api/storage/confirm-upload', {
                fileId: fileId,
            });

            // 4. Success
            setPreviewUrl(fileUrl);
            onUploadComplete(fileUrl);
            toast.success('Upload successfully!');

        } catch (error: any) {
            console.error('Upload failed:', error);
            const message = error.response?.data?.message || error.message || 'Upload failed. Please try again.';
            toast.error('Upload failed', { description: message });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await handleFile(file);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await handleFile(files[0]);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(undefined);
        onUploadComplete('');
    };

    return (
        <div className="space-y-2">
            {!previewUrl ? (
                <div
                    className={cn(
                        "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group",
                        isDragging ? "border-primary bg-primary/5" : "border-border/30 hover:bg-muted/5",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={disabled || isUploading}
                    />
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                        <Upload className={cn(
                            "h-8 w-8 transition-colors",
                            isDragging ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary/70"
                        )} />
                    )}
                    <div className="text-center">
                        <span className={cn(
                            "text-xs font-medium transition-colors block",
                            isDragging ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                        )}>
                            {isUploading ? 'Uploading...' : label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40 mt-1 block">
                            Drag & drop or click to browse
                        </span>
                    </div>
                </div>
            ) : (
                <div className="relative p-4 rounded-xl border border-border/20 bg-muted/5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileAudio className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{previewUrl.split('/').pop()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uploaded</p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
