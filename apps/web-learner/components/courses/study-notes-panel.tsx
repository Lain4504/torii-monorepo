'use client';

import { useState } from 'react';
import { useStudyNotes, useCreateStudyNote, useDeleteStudyNote } from '@/lib/api/services/academy-study-note-api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Edit3, Trash2, PenTool } from 'lucide-react';
import { toast } from 'sonner';

interface StudyNotesPanelProps {
    lessonId: string;
}

export function StudyNotesPanel({ lessonId }: StudyNotesPanelProps) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const { data: notes, isLoading } = useStudyNotes(lessonId);
    const createNote = useCreateStudyNote();
    const deleteNote = useDeleteStudyNote();

    const handleSave = async () => {
        if (!content.trim()) return;
        try {
            await createNote.mutateAsync({ content, lessonId });
            setContent('');
            toast.success('Đã lưu ghi chú thành công!');
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi lưu ghi chú');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) return;
        try {
            await deleteNote.mutateAsync(id);
            toast.success('Đã xóa ghi chú!');
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi xóa ghi chú');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="fixed bottom-24 right-6 h-14 w-14 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center z-[60] hover:scale-105 active:scale-95 transition-transform"
                    aria-label="Ghi chú học tập"
                >
                    <PenTool className="h-6 w-6" />
                </button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PenTool className="size-5 text-amber-500" />
                        Ghi chú bài học
                    </DialogTitle>
                    <DialogDescription>
                        Tạo và xem ghi chú cá nhân của bạn cho bài học này.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Create Form */}
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Nhập nội dung ghi chú ở đây..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="resize-none h-32"
                        />
                        <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={handleSave}
                            disabled={createNote.isPending || !content.trim()}
                        >
                            {createNote.isPending ? 'Đang lưu...' : 'Lưu ghi chú'}
                        </Button>
                    </div>

                    {/* List Notes */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Ghi chú đã lưu ({notes?.length || 0})
                        </h4>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : notes?.length ? (
                            <div className="space-y-3">
                                {notes.map((note: any) => (
                                    <div
                                        key={note.id}
                                        className="p-4 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow group relative"
                                    >
                                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pr-8">
                                            {note.content}
                                        </p>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                                                title="Xóa ghi chú"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <Edit3 className="size-10 mx-auto mb-3" />
                                <p className="text-sm">Chưa có ghi chú nào cho bài học này.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
