'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/hooks/hooks';
import {
    useAcademyStudySet,
    usePublicCatalogStudySet,
    useCreateAcademySetCard,
    useUpdateAcademySetCard,
    useDeleteAcademySetCard,
} from '@/lib/api/services/academy-study-set-api';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { StudyModeSelection } from '@/components/study/study-mode-selection';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StudySetDetailPage() {
    const params = useParams<{ setId: string }>();
    const searchParams = useSearchParams();
    const setId = params?.setId;
    const isCatalogView = searchParams.get('catalog') === '1';
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const privateSet = useAcademyStudySet(setId, {
        enabled: !!setId && isAuthenticated && !isCatalogView,
    });
    const catalogSet = usePublicCatalogStudySet(setId, {
        enabled: !!setId && isCatalogView,
    });

    const set = isCatalogView ? catalogSet.data : privateSet.data;
    const isLoading = isCatalogView ? catalogSet.isLoading : privateSet.isLoading;

    const { user: currentUser } = useAppSelector((state) => state.auth);
    const isOwner = set?.userId === currentUser?.id;

    const canLearn = isAuthenticated;
    const canCreateCard = isAuthenticated && !isCatalogView && isOwner;
    const createCard = useCreateAcademySetCard();
    const updateCard = useUpdateAcademySetCard();
    const deleteCard = useDeleteAcademySetCard();
    const [page, setPage] = useState(1);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [newTerm, setNewTerm] = useState('');
    const [newDefinition, setNewDefinition] = useState('');
    const [editingCard, setEditingCard] = useState<any | null>(null);
    const [editTerm, setEditTerm] = useState('');
    const [editDefinition, setEditDefinition] = useState('');
    const [deletingCard, setDeletingCard] = useState<any | null>(null);

    if (isLoading) {
        return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
    }

    if (!set) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Không tìm thấy bộ thẻ</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    const cards = set?.setCards || [];
    const pageSize = 20;
    const totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginatedCards = cards.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const leftColumn = paginatedCards.filter((_, idx) => idx % 2 === 0);
    const rightColumn = paginatedCards.filter((_, idx) => idx % 2 !== 0);

    const handleCreateCard = async () => {
        if (!canCreateCard || !setId) return;
        if (!newTerm.trim() || !newDefinition.trim()) {
            toast.error('Vui lòng nhập đủ từ vựng và định nghĩa');
            return;
        }
        try {
            await createCard.mutateAsync({
                setId,
                payload: {
                    term: newTerm.trim(),
                    definition: newDefinition.trim(),
                },
            });
            toast.success('Đã tạo thẻ mới');
            setOpenCreateDialog(false);
            setNewTerm('');
            setNewDefinition('');
            setPage(1);
        } catch (e: any) {
            toast.error(e?.message || 'Không tạo được thẻ');
        }
    };

    const handleOpenEdit = (card: any) => {
        setEditingCard(card);
        setEditTerm(card.term || '');
        setEditDefinition(card.definition || '');
        setOpenEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!editingCard) return;
        if (!editTerm.trim() || !editDefinition.trim()) {
            toast.error('Vui lòng nhập đủ từ vựng và định nghĩa');
            return;
        }
        try {
            await updateCard.mutateAsync({
                cardId: editingCard.id,
                payload: {
                    term: editTerm.trim(),
                    definition: editDefinition.trim(),
                },
            });
            toast.success('Đã cập nhật thẻ');
            setOpenEditDialog(false);
            setEditingCard(null);
            setEditTerm('');
            setEditDefinition('');
        } catch (e: any) {
            toast.error(e?.message || 'Không cập nhật được thẻ');
        }
    };

    const handleOpenDelete = (card: any) => {
        setDeletingCard(card);
        setOpenDeleteDialog(true);
    };

    const handleDeleteCard = async () => {
        if (!deletingCard || !setId) return;
        try {
            await deleteCard.mutateAsync({ cardId: deletingCard.id, setId });
            toast.success('Đã xóa thẻ');
            setOpenDeleteDialog(false);
            setDeletingCard(null);
            if (currentPage > 1 && paginatedCards.length === 1) {
                setPage((prev) => Math.max(1, prev - 1));
            }
        } catch (e: any) {
            toast.error(e?.message || 'Không xóa được thẻ');
        }
    };

    const Row = ({ card }: { card: any }) => (
        <div className="rounded-xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-semibold">{card.term}</p>
                    <p className="text-[22px] text-muted-foreground">{card.definition}</p>
                </div>
                {canCreateCard ? (
                    <div className="flex items-center gap-1">
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => handleOpenEdit(card)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleOpenDelete(card)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <StudyModeSelection
                selectedSetId={setId || null}
                selectedCount={cards.length}
                canAccessLearning={canLearn}
            />

            {!isAuthenticated ? (
                <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="py-3 text-sm text-primary">
                        Bạn đang ở chế độ tham quan. Đăng nhập để bắt đầu học flashcard, trắc nghiệm và match.
                    </CardContent>
                </Card>
            ) : null}

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle>Danh sách thẻ ({cards.length})</CardTitle>
                        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                            <DialogTrigger asChild>
                                <Button
                                    data-requires-auth={!canCreateCard ? 'true' : undefined}
                                    disabled={!canCreateCard}
                                >
                                    Tạo thẻ
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tạo thẻ mới</DialogTitle>
                                    <DialogDescription>
                                        Nhập từ vựng và định nghĩa để thêm vào bộ thẻ.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-3">
                                    <Input
                                        placeholder="Từ vựng (ví dụ: 勉強)"
                                        value={newTerm}
                                        onChange={(e) => setNewTerm(e.target.value)}
                                    />
                                    <Input
                                        placeholder="Định nghĩa (ví dụ: Học tập)"
                                        value={newDefinition}
                                        onChange={(e) => setNewDefinition(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setOpenCreateDialog(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleCreateCard}
                                        disabled={createCard.isPending || !newTerm.trim() || !newDefinition.trim()}
                                    >
                                        {createCard.isPending ? 'Đang tạo...' : 'Tạo thẻ'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">{leftColumn.map((card) => <Row key={card.id} card={card} />)}</div>
                        <div className="space-y-3">{rightColumn.map((card) => <Row key={card.id} card={card} />)}</div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(1)}>{'<<'}</Button>
                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>{'<'}</Button>
                        <Button size="sm">{currentPage}</Button>
                        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>{'>'}</Button>
                        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>{'>>'}</Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa thẻ</DialogTitle>
                        <DialogDescription>
                            Cập nhật từ vựng và định nghĩa của thẻ đã chọn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <Input
                            placeholder="Từ vựng"
                            value={editTerm}
                            onChange={(e) => setEditTerm(e.target.value)}
                        />
                        <Input
                            placeholder="Định nghĩa"
                            value={editDefinition}
                            onChange={(e) => setEditDefinition(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={updateCard.isPending || !editTerm.trim() || !editDefinition.trim()}
                        >
                            {updateCard.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa thẻ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa thẻ <span className="font-semibold">{deletingCard?.term || ''}</span> không?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCard}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteCard.isPending ? 'Đang xóa...' : 'Xóa thẻ'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
