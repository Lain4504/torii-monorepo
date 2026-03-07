'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudySet, useUpdateStudySet, useCreateSetCard, useUpdateSetCard, useDeleteSetCard } from '@/lib/api/services/study-set-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function StudySetEditor({ setId }: { setId: string }) {
    const router = useRouter();
    const { data: set, isLoading } = useStudySet(setId);
    const updateSet = useUpdateStudySet();
    const createCard = useCreateSetCard();
    const updateCard = useUpdateSetCard();
    const deleteCard = useDeleteSetCard();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isEditingMeta, setIsEditingMeta] = useState(false);

    // New card state
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [isCreatingCard, setIsCreatingCard] = useState(false);

    // Editing cards state
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editFront, setEditFront] = useState('');
    const [editBack, setEditBack] = useState('');

    useEffect(() => {
        if (set) {
            setTitle(set.title);
            setDescription(set.description || '');
        }
    }, [set]);

    const handleSaveMeta = async () => {
        try {
            await updateSet.mutateAsync({ id: setId, payload: { title, description } });
            toast.success('Đã lưu thông tin bộ thẻ!');
            setIsEditingMeta(false);
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi lưu');
        }
    };

    const handleCreateCard = async () => {
        if (!newFront.trim() || !newBack.trim()) return;
        setIsCreatingCard(true);
        try {
            await createCard.mutateAsync({ setId, payload: { front: newFront, back: newBack } });
            setNewFront('');
            setNewBack('');
            toast.success('Đã thêm thẻ mới!');
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi thêm thẻ');
        } finally {
            setIsCreatingCard(false);
        }
    };

    const startEditingCard = (card: any) => {
        setEditingCardId(card.id);
        setEditFront(card.front);
        setEditBack(card.back);
    };

    const handleSaveCard = async (id: string) => {
        try {
            await updateCard.mutateAsync({ setId, cardId: id, payload: { front: editFront, back: editBack } });
            toast.success('Đã cập nhật thẻ!');
            setEditingCardId(null);
        } catch (e: any) {
            toast.error(e.message || 'Lỗi cập nhật thẻ');
        }
    };

    const handleDeleteCard = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Bạn có chắc muốn xóa thẻ này?')) return;
        try {
            await deleteCard.mutateAsync({ setId, cardId: id });
            toast.success('Đã xóa thẻ!');
        } catch (e: any) {
            toast.error(e.message || 'Lỗi xóa thẻ');
        }
    };

    if (isLoading) return <div className="animate-pulse space-y-6"><div className="h-10 w-48 bg-muted rounded"></div><div className="h-40 bg-muted rounded-xl"></div></div>;
    if (!set) return <div className="text-center py-20">Không tìm thấy bộ thẻ.</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-4" onClick={() => router.push('/dashboard/study-sets')}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>

            <Card className="border-primary/10 bg-card">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                        {isEditingMeta ? (
                            <div className="w-full space-y-4">
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên bộ thẻ" className="text-xl font-bold" />
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả..." />
                                <div className="flex gap-2">
                                    <Button onClick={handleSaveMeta} disabled={updateSet.isPending}><Save className="mr-2 h-4 w-4" /> Lưu thông tin</Button>
                                    <Button variant="outline" onClick={() => setIsEditingMeta(false)}>Hủy</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <CardTitle className="text-3xl font-bold mb-2">{set.title}</CardTitle>
                                    <CardDescription className="text-base">{set.description || 'Không có mô tả'}</CardDescription>
                                </div>
                                <Button variant="outline" onClick={() => setIsEditingMeta(true)}>Sửa thông tin</Button>
                            </>
                        )}
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    Các thẻ trong bộ <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm">{set.cards?.length || 0}</span>
                </h3>

                {set.cards?.map((card: any, index: number) => (
                    <Card key={card.id} className="group transition-all hover:shadow-md">
                        <CardContent className="p-0">
                            {editingCardId === card.id ? (
                                <div className="p-6 space-y-4 bg-muted/20 border-l-4 border-l-primary rounded-l-lg">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Thuật ngữ (Mặt trước)</label>
                                            <Input value={editFront} onChange={e => setEditFront(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Định nghĩa (Mặt sau)</label>
                                            <Input value={editBack} onChange={e => setEditBack(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="outline" onClick={() => setEditingCardId(null)}>Hủy</Button>
                                        <Button onClick={() => handleSaveCard(card.id)} disabled={updateCard.isPending}>Lưu thay đổi</Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="p-6 grid md:grid-cols-2 gap-6 cursor-pointer"
                                    onClick={() => startEditingCard(card)}
                                >
                                    <div className="flex gap-4">
                                        <span className="text-muted-foreground font-mono text-sm w-6 shrink-0">{index + 1}</span>
                                        <div className="border-l-2 pl-4 border-border w-full">
                                            <p className="text-base font-medium">{card.front}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="border-l-2 pl-4 border-border w-full">
                                            <p className="text-base">{card.back}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={(e) => handleDeleteCard(card.id, e)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <Card className="border-dashed border-2 bg-transparent hover:bg-muted/10 transition-colors">
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Thêm thuật ngữ mới</label>
                                <Input placeholder="Mặt trước..." value={newFront} onChange={e => setNewFront(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateCard(); }} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Thêm định nghĩa</label>
                                <Input placeholder="Mặt sau..." value={newBack} onChange={e => setNewBack(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateCard(); }} />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleCreateCard} disabled={isCreatingCard || !newFront.trim() || !newBack.trim()} className="w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Thêm thẻ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
