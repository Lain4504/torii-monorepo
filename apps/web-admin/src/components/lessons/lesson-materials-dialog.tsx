import { useState } from 'react';
import { useUploadMaterial, useDeleteMaterial, useLessonMaterials } from '@/api/services/lesson-materials';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Loader2, Upload, Trash2, FileText, Video, FileSpreadsheet } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import type { LessonResponseDTO, LessonMaterialCreateDTO, MaterialType } from '@workspace/schemas';

interface LessonMaterialsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lesson: LessonResponseDTO | null;
}

export function LessonMaterialsDialog({ open, onOpenChange, lesson }: LessonMaterialsDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [materialType, setMaterialType] = useState<MaterialType>('slides');
    const [materialTitle, setMaterialTitle] = useState('');

    const { data: materials, isLoading: loadingMaterials } = useLessonMaterials(lesson?.id || '');
    const uploadMutation = useUploadMaterial();
    const deleteMutation = useDeleteMaterial();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            if (!materialTitle) {
                setMaterialTitle(e.target.files[0].name);
            }
        }
    };

    const handleUpload = async () => {
        if (!lesson || !selectedFile) return;

        const dto: LessonMaterialCreateDTO = {
            lessonId: lesson.id,
            type: materialType,
            title: materialTitle || selectedFile.name,
            mimeType: selectedFile.type,
            fileName: selectedFile.name,
        };

        try {
            await uploadMutation.mutateAsync({ dto, file: selectedFile });
            toast.success('Material uploaded successfully');
            setSelectedFile(null);
            setMaterialTitle('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to upload material');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Material deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete material');
        }
    };

    const getMaterialIcon = (type: MaterialType) => {
        switch (type) {
            case 'video':
                return Video;
            case 'slides':
                return FileSpreadsheet;
            case 'reading':
                return FileText;
            case 'assignment':
                return FileText;
            default:
                return FileText;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manage Lesson Materials</DialogTitle>
                    <DialogDescription>
                        Upload and manage materials for <strong>{lesson?.title}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Upload Section */}
                    <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                        <h4 className="text-sm font-semibold">Upload New Material</h4>

                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="material-type">Material Type</Label>
                                <select
                                    id="material-type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={materialType}
                                    onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                                >
                                    <option value="slides">Slides</option>
                                    <option value="video">Video</option>
                                    <option value="reading">Reading Material</option>
                                    <option value="assignment">Assignment</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="material-title">Title (Optional)</Label>
                                <input
                                    id="material-title"
                                    type="text"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={materialTitle}
                                    onChange={(e) => setMaterialTitle(e.target.value)}
                                    placeholder="Enter material title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="material-file">File</Label>
                                <input
                                    id="material-file"
                                    type="file"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                                    onChange={handleFileChange}
                                    accept=".pdf,.ppt,.pptx,.mp4,.png,.jpg,.jpeg"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Allowed: PDF, PPT, PPTX, MP4, PNG, JPEG
                                </p>
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploadMutation.isPending}
                                className="w-full"
                            >
                                {uploadMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Material
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Materials List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Uploaded Materials</h4>
                        {loadingMaterials ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : !materials || materials.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                No materials uploaded yet
                            </p>
                        ) : (
                            <ScrollArea className="h-[200px] rounded-lg border">
                                <div className="p-4 space-y-2">
                                    {materials.map((material) => {
                                        const Icon = getMaterialIcon(material.type);
                                        return (
                                            <div
                                                key={material.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {material.title || 'Untitled'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {material.type} • {material.fileAsset.mimeType}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(material.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
