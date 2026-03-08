'use client';

import { useState } from 'react';
import { useStudyNotes, useDeleteStudyNote } from '@/lib/api/services/academy-study-note-api';
import { useAcademyStudySets, useCreateAcademySetCard } from '@/lib/api/services/academy-study-set-api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { Input } from '@workspace/ui/components/input';
import { Trash2, PlusCircle, PenTool } from 'lucide-react';
import { toast } from 'sonner';

export function StudyNotesList() {
    const { data: notes, isLoading: notesLoading } = useStudyNotes(); // Pass undefined to get all notes
    const { data: studySets } = useAcademyStudySets();
    const deleteNote = useDeleteStudyNote();
    const createCard = useCreateAcademySetCard();

    const [openConvertDialog, setOpenConvertDialog] = useState(false);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [targetSetId, setTargetSetId] = useState('');
    const [cardTerm, setCardTerm] = useState('');
    const [cardDefinition, setCardDefinition] = useState('');

    const handleOpenConvert = (note: any) => {
        setSelectedNote(note);
        setCardTerm(note.content); // Default front is the note content
        setCardDefinition('');
        setTargetSetId('');
        setOpenConvertDialog(true);
    };

    const handleConvert = async () => {
        if (!targetSetId || !cardTerm.trim() || !cardDefinition.trim()) {
            toast.error('Vui lòng điền đủ thông tin thuật ngữ, định nghĩa và chọn bộ thẻ.');
            return;
        }
        try {
            await createCard.mutateAsync({
                setId: targetSetId,
                payload: { term: cardTerm, definition: cardDefinition }
            });
            toast.success('Đã tạo thẻ mới thành công!');
            setOpenConvertDialog(false);
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi tạo thẻ');
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
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Xem lại các ghi chú bạn đã lưu trong quá trình học và chuyển chúng thành thẻ ghi nhớ để ôn tập.
            </p>

            {notesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse h-40 bg-muted/50" />
                    ))}
                </div>
            ) : notes?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note: any) => (
                        <Card key={note.id} className="group hover:shadow-md transition-shadow flex flex-col h-full bg-card">
                            <CardContent className="flex-1 pt-6 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                {note.content}
                            </CardContent>
                            <CardFooter className="pt-4 border-t flex justify-between gap-2 bg-muted/20">
                                <Button variant="default" size="sm" className="w-full flex-1" onClick={() => handleOpenConvert(note)}>
                                    <PlusCircle className="size-4 mr-2" /> Tạo thẻ
                                </Button>
                                <Button variant="outline" size="icon" className="shrink-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" onClick={() => handleDelete(note.id)}>
                                    <Trash2 className="size-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <div className="mx-auto w-24 h-24 mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <PenTool className="size-12 text-primary/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Chưa có ghi chú nào</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                        Trong quá trình xem bài giảng, bạn có thể tạo ghi chú nhanh để lưu lại các kiến thức quan trọng.
                    </p>
                </div>
            )}

            <Dialog open={openConvertDialog} onOpenChange={setOpenConvertDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tạo thẻ ghi nhớ từ ghi chú</DialogTitle>
                        <DialogDescription>
                            Chuyển đổi ghi chú thành một thẻ bao gồm thuật ngữ (thông tin cần nhớ) và định nghĩa (nghĩa/giải thích).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Lưu vào bộ thẻ <span className="text-red-500">*</span></label>
                            <Select value={targetSetId} onValueChange={setTargetSetId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Chọn bộ thẻ --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {studySets?.map((set: any) => (
                                        <SelectItem key={set.id} value={set.id}>{set.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Thuật ngữ <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="Ví dụ: 食べる"
                                value={cardTerm}
                                onChange={(e) => setCardTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Định nghĩa <span className="text-red-500">*</span></label>
                            <Textarea
                                placeholder="Ví dụ: Ăn"
                                value={cardDefinition}
                                onChange={(e) => setCardDefinition(e.target.value)}
                                className="resize-none h-20"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenConvertDialog(false)}>Hủy</Button>
                        <Button onClick={handleConvert} disabled={createCard.isPending || !targetSetId || !cardTerm.trim() || !cardDefinition.trim()}>
                            {createCard.isPending ? 'Đang lưu...' : 'Lưu thẻ'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
