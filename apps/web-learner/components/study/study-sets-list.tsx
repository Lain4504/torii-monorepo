'use client';

import { useEffect, useState } from 'react';
import {
    useAcademyStudySets as useStudySets,
    useCreateAcademyStudySet as useCreateStudySet,
    useDeleteAcademyStudySet as useDeleteStudySet,
    useAcademyStudySet,
    useCreateAcademySetCard,
    useUpdateAcademySetCard,
    useDeleteAcademySetCard,
} from '@/lib/api/services/academy-study-set-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog';
import { AlertCircle, Bot, BrainCircuit, LayoutGrid, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { StudyModeSelection } from './study-mode-selection';

export function StudySetsList() {
    const { data: studySets, isLoading } = useStudySets();
    const createSet = useCreateStudySet();
    const deleteSet = useDeleteStudySet();
    const createCard = useCreateAcademySetCard();
    const updateCard = useUpdateAcademySetCard();
    const deleteCard = useDeleteAcademySetCard();

    const [openDialog, setOpenDialog] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

    const { data: selectedSet, isLoading: isLoadingSelected } = useAcademyStudySet(selectedSetId || undefined);

    useEffect(() => {
        const firstSetId = studySets?.[0]?.id;
        if (!selectedSetId && firstSetId) {
            setSelectedSetId(firstSetId);
        }
    }, [studySets, selectedSetId]);

    const handleCreate = async () => {
        if (!title.trim()) return;
        try {
            const created = await createSet.mutateAsync({ title, description });
            toast.success('Đã tạo bộ thẻ thành công!');
            setOpenDialog(false);
            setTitle('');
            setDescription('');
            setSelectedSetId(created.id);
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi tạo bộ thẻ');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bộ thẻ này? Tất cả thẻ bên trong cũng sẽ bị xóa.')) return;
        try {
            await deleteSet.mutateAsync(id);
            toast.success('Đã xóa bộ thẻ!');
            if (selectedSetId === id) {
                const remaining = (studySets || []).filter((s) => s.id !== id);
                setSelectedSetId(remaining[0]?.id ?? null);
            }
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi xóa bộ thẻ');
        }
    };

    const selectedCount = selectedSet?.setCards?.length ?? 0;

    // New card state (tạo thẻ ngay trên trang danh sách)
    const [newTerm, setNewTerm] = useState('');
    const [newDefinition, setNewDefinition] = useState('');

    // Inline editing state (click row -> edit form)
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editTerm, setEditTerm] = useState('');
    const [editDefinition, setEditDefinition] = useState('');

    const handleCreateCard = async () => {
        if (!selectedSetId) {
            toast.error('Hãy chọn một bộ thẻ trước khi thêm thẻ mới.');
            return;
        }
        if (!newTerm.trim() || !newDefinition.trim()) return;
        try {
            await createCard.mutateAsync({
                setId: selectedSetId,
                payload: { term: newTerm, definition: newDefinition },
            });
            setNewTerm('');
            setNewDefinition('');
            toast.success('Đã thêm thẻ mới!');
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi thêm thẻ');
        }
    };

    const startEditingCard = (card: any) => {
        setEditingCardId(card.id);
        setEditTerm((card.term ?? '').toString());
        setEditDefinition((card.definition ?? '').toString());
    };

    const cancelEditingCard = () => {
        setEditingCardId(null);
        setEditTerm('');
        setEditDefinition('');
    };

    const handleSaveCard = async (cardId: string) => {
        if (!selectedSetId) return;
        const term = editTerm.trim();
        const definition = editDefinition.trim();
        if (!term || !definition) {
            toast.error('Vui lòng nhập đủ mặt trước và mặt sau.');
            return;
        }
        try {
            await updateCard.mutateAsync({
                setId: selectedSetId,
                cardId,
                payload: { term, definition },
            });
            toast.success('Đã cập nhật thẻ!');
            cancelEditingCard();
        } catch (e: any) {
            toast.error(e.message || 'Lỗi cập nhật thẻ');
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!selectedSetId) return;
        if (!confirm('Bạn có chắc muốn xóa thẻ này?')) return;
        try {
            await deleteCard.mutateAsync({ setId: selectedSetId, cardId });
            toast.success('Đã xóa thẻ!');
            if (editingCardId === cardId) cancelEditingCard();
        } catch (e: any) {
            toast.error(e.message || 'Lỗi xóa thẻ');
        }
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] bg-transparent">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Page header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Học tự chủ</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tự tạo bộ thẻ và chọn chế độ học phù hợp với bạn.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                        asChild
                    >
                        <Link href="/ai-sensei/chat">
                            <span className="rounded-md bg-primary/10 p-1 text-primary">
                                <Bot className="h-4 w-4" />
                            </span>
                            Hướng dẫn
                        </Link>
                    </Button>
                </div>

                {/* Study sets list (Danh sách bài) */}
                <Card className="border-border bg-card/90 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">Danh sách bài</CardTitle>
                            <CardDescription className="text-xs">
                                Mỗi bộ thẻ tương ứng với một bài học/tập từ vựng riêng.
                            </CardDescription>
                        </div>
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1">
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    Tạo bài mới
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[420px]">
                                <DialogHeader>
                                    <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
                                    <DialogDescription>
                                        Đặt tên và mô tả cho bộ thẻ dùng để học tự chủ.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="title"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Tên bộ thẻ <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="title"
                                            placeholder="N5 – Trường học, giáo viên…"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="description"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Mô tả
                                        </label>
                                        <Textarea
                                            id="description"
                                            placeholder="Mục tiêu, nội dung chính của bộ thẻ này…"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="resize-none"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                                        Hủy
                                    </Button>
                                    <Button onClick={handleCreate} disabled={createSet.isPending || !title.trim()}>
                                        {createSet.isPending ? 'Đang tạo...' : 'Tạo mới'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-20 animate-pulse rounded-xl bg-muted"
                                    />
                                ))}
                            </div>
                        ) : !(studySets && studySets.length) ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <BrainCircuit className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Chưa có bộ thẻ nào</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Tạo bộ thẻ đầu tiên để bắt đầu xây dựng bộ từ vựng riêng của bạn.
                                    </p>
                                </div>
                                <Button size="sm" className="mt-1" onClick={() => setOpenDialog(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tạo bộ thẻ ngay
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                {studySets.map((set) => {
                                    const count = (set as any)._count?.setCards || 0;
                                    const isActive = selectedSetId === set.id;

                                    return (
                                        <button
                                            key={set.id}
                                            type="button"
                                            onClick={() => setSelectedSetId(set.id)}
                                            className={`flex h-full flex-col items-start rounded-xl border p-4 text-left transition-all ${
                                                isActive
                                                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                                    : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="mb-2 flex w-full items-start justify-between gap-2">
                                                <div>
                                                    <div
                                                        className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                            isActive
                                                                ? 'bg-primary/20 text-primary'
                                                                : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        Bài {studySets.indexOf(set) + 1}
                                                    </div>
                                                    <p className={`line-clamp-2 text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                                        {set.title}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(set.id);
                                                    }}
                                                    className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <p className={`text-xs ${isActive ? 'text-primary/80' : 'text-muted-foreground'}`}>
                                                {count} thẻ
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Vocabulary list for selected set */}
                <Card className="border-border bg-card/95 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Danh sách thẻ ({selectedCount})
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs">
                                Nhấn vào một thẻ để chỉnh sửa nhanh (chỉ gồm mặt trước / mặt sau).
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!selectedSetId ? (
                            <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                Hãy chọn một bộ thẻ ở trên để xem danh sách thẻ tương ứng.
                            </div>
                        ) : isLoadingSelected ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((row) => (
                                    <div
                                        key={row}
                                        className="h-10 animate-pulse rounded-lg bg-muted"
                                    />
                                ))}
                            </div>
                        ) : !selectedSet?.setCards?.length ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <LayoutGrid className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Bộ thẻ này chưa có thẻ nào</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Thêm thẻ mới ngay bên dưới bằng form “Thêm thẻ”.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            <th className="pb-2 pr-4">#</th>
                                            <th className="pb-2 pr-4">Mặt trước</th>
                                            <th className="pb-2 pr-4">Mặt sau</th>
                                            <th className="pb-2 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {selectedSet.setCards.map((card, index) => (
                                            editingCardId === card.id ? (
                                                <tr key={card.id} className="bg-muted/30">
                                                    <td className="py-3 pr-4 text-xs text-muted-foreground align-top">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-3 pr-4 align-top">
                                                        <Input
                                                            value={editTerm}
                                                            onChange={(e) => setEditTerm(e.target.value)}
                                                            placeholder="Mặt trước..."
                                                        />
                                                    </td>
                                                    <td className="py-3 pr-4 align-top">
                                                        <Input
                                                            value={editDefinition}
                                                            onChange={(e) => setEditDefinition(e.target.value)}
                                                            placeholder="Mặt sau..."
                                                        />
                                                    </td>
                                                    <td className="py-3 text-right align-top">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={cancelEditingCard}
                                                            >
                                                                Hủy
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSaveCard(card.id)}
                                                                disabled={updateCard.isPending}
                                                            >
                                                                {updateCard.isPending ? 'Đang lưu...' : 'Lưu'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDeleteCard(card.id)}
                                                                disabled={deleteCard.isPending}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr
                                                    key={card.id}
                                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                                    onClick={() => startEditingCard(card)}
                                                >
                                                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-3 pr-4 text-base font-medium text-foreground">
                                                        {card.term}
                                                    </td>
                                                    <td className="py-3 pr-4 text-sm text-foreground/80">
                                                        {card.definition}
                                                    </td>
                                                    <td className="py-3 text-right text-xs text-muted-foreground">
                                                        Nhấn để sửa
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedSetId && (
                            <div className="mt-4 border-t border-border pt-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                            Thêm thẻ (mặt trước)
                                        </label>
                                        <Input
                                            placeholder="Mặt trước..."
                                            value={newTerm}
                                            onChange={e => setNewTerm(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleCreateCard();
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                            Thêm thẻ (mặt sau)
                                        </label>
                                        <Input
                                            placeholder="Mặt sau..."
                                            value={newDefinition}
                                            onChange={e => setNewDefinition(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleCreateCard();
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <Button
                                        onClick={handleCreateCard}
                                        disabled={createCard.isPending || !newTerm.trim() || !newDefinition.trim()}
                                        className="w-full md:w-auto text-xs"
                                    >
                                        <PlusCircle className="mr-2 h-3 w-3" /> Thêm thẻ
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Study modes section */}
                <StudyModeSelection selectedSetId={selectedSetId} selectedCount={selectedCount} />
            </div>
        </div>
    );
}
