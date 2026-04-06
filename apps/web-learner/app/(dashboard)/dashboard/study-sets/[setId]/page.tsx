'use client';

import Link from 'next/link';
import * as React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/hooks';
import {
    useAcademyStudySet,
    usePublicCatalogStudySet,
    useCreateAcademySetCard,
    useUpdateAcademySetCard,
    useDeleteAcademySetCard,
    useShareAcademyStudySet,
} from '@/lib/api/services/academy-study-set-api';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
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
import { Pencil, Trash2, Plus, ArrowLeft, Share2, Globe, Lock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { FlashcardFormDialog, type FlashcardFormValues } from '@workspace/ui/components/custom/flashcard-form-dialog';
import { cn } from '@workspace/ui/lib/utils';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';

export default function StudySetDetailPage() {
    const params = useParams<{ setId: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();
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
    const shareSet = useShareAcademyStudySet();
    
    const [page, setPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [editingCard, setEditingCard] = React.useState<any | null>(null);
    const [deletingCard, setDeletingCard] = React.useState<any | null>(null);

    // Filter and Paginate
    const [cards, setCards] = React.useState<any[]>([]);
    React.useEffect(() => {
        if (set?.setCards) setCards(set.setCards);
    }, [set?.setCards]);

    const filteredCards = cards.filter(c => 
        c.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pageSize = 25;
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginatedCards = filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (isLoading) {
        return (
            <div className="container max-w-5xl py-6 space-y-8 animate-in fade-in">
                <div className="h-20 w-full animate-pulse rounded-lg bg-muted" />
                <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
            </div>
        );
    }

    if (!set) {
        return (
            <div className="container py-20 text-center space-y-4">
                <p className="text-muted-foreground uppercase tracking-widest text-sm">Không tìm thấy bộ thẻ</p>
                <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
            </div>
        );
    }

    const handleCreateCard = async (values: FlashcardFormValues) => {
        if (!canCreateCard || !setId) return;
        try {
            await createCard.mutateAsync({
                setId,
                payload: {
                    term: values.term.trim(),
                    definition: values.definition.trim(),
                    hint: values.note.trim() || undefined,
                    languageDetails: {
                        phonetic: values.phonetic.trim(),
                        type: values.type,
                    }
                },
            });
            toast.success('Đã tạo thẻ mới');
            setOpenCreateDialog(false);
            setPage(1);
        } catch (e: any) {
            toast.error(e?.message || 'Lỗi tạo thẻ');
        }
    };

    const handleOpenEdit = (card: any) => {
        setEditingCard(card);
        setOpenEditDialog(true);
    };

    const handleSaveEdit = async (values: FlashcardFormValues) => {
        if (!editingCard) return;
        try {
            await updateCard.mutateAsync({
                cardId: editingCard.id,
                payload: {
                    term: values.term.trim(),
                    definition: values.definition.trim(),
                    hint: values.note.trim() || undefined,
                    languageDetails: {
                        phonetic: values.phonetic.trim(),
                        type: values.type,
                    }
                },
            });
            toast.success('Đã cập nhật thẻ');
            setOpenEditDialog(false);
            setEditingCard(null);
        } catch (e: any) {
            toast.error(e?.message || 'Lỗi cập nhật');
        }
    };

    const handleDeleteCard = async () => {
        if (!deletingCard || !setId) return;
        try {
            await deleteCard.mutateAsync({ cardId: deletingCard.id, setId });
            toast.success('Đã xóa thẻ');
            setOpenDeleteDialog(false);
            setDeletingCard(null);
        } catch (e: any) {
            toast.error(e?.message || 'Lỗi xóa thẻ');
        }
    };

    const handleShareToggle = async (makePublic: boolean) => {
        if (!setId) return;
        try {
            const updated = await shareSet.mutateAsync({
                id: setId,
                payload: { isPublic: makePublic },
            });
            if (makePublic && updated.shareToken) {
                const url = `${window.location.origin}/share/study-sets/${updated.shareToken}`;
                await navigator.clipboard.writeText(url);
                toast.success('Đã bật công khai và sao chép link');
            } else {
                toast.success('Đã tắt công khai bộ thẻ');
            }
        } catch (e: any) {
            toast.error(e?.message || 'Thất bại');
        }
    };

    return (
        <div className="container mx-auto max-w-5xl py-12 space-y-8 animate-in fade-in">
            {/* Header - Standard Shadcn */}
            <div className="space-y-6">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push('/dashboard/study-sets')}
                    className="h-8 -ml-3 text-muted-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Danh sách bộ thẻ
                </Button>
                
                <div className="flex flex-col gap-6 md:flex-row md:items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{set.title}</h1>
                            {isAuthenticated && isOwner && !isCatalogView && (
                                <Badge variant={set.isPublic ? "default" : "secondary"}>
                                    {set.isPublic ? "Công khai" : "Riêng tư"}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {cards.length} thẻ ghi nhớ trong bộ này
                        </p>
                    </div>

                    {isAuthenticated && isOwner && !isCatalogView && (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={shareSet.isPending}
                                onClick={() => handleShareToggle(!set.isPublic)}
                            >
                                {set.isPublic ? <Lock className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}
                                {set.isPublic ? 'Tắt công khai' : 'Bật công khai'}
                            </Button>
                            {set.isPublic && set.shareToken && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                        const url = `${window.location.origin}/share/study-sets/${set.shareToken}`;
                                        await navigator.clipboard.writeText(url);
                                        toast.success('Đã sao chép liên kết chia sẻ');
                                    }}
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Chia sẻ
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Learning Modes */}
            <StudyModeSelection
                selectedSetId={setId || null}
                selectedCount={cards.length}
                canAccessLearning={canLearn}
            />

            {!isAuthenticated && (
                <div className="rounded-lg border bg-muted/50 p-4 text-center">
                    <p className="text-sm font-medium">Bạn đang ở chế độ công khai. Đăng nhập để lưu tiến độ học tập.</p>
                </div>
            )}

            {/* Content Module */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold tracking-tight">Chi tiết thẻ ghi nhớ</h2>
                        <Badge variant="secondary">{filteredCards.length}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                         <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm nhanh..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 w-full sm:w-64"
                            />
                        </div>
                        {canCreateCard && (
                            <Button
                                size="sm"
                                onClick={() => setOpenCreateDialog(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tạo thẻ
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {paginatedCards.length > 0 ? (
                        paginatedCards.map((card) => (
                            <Card key={card.id} className="hover:bg-muted/5 transition-all shadow-none group">
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 shrink-0">
                                            <p className="font-bold text-foreground">{card.term}</p>
                                            {card.languageDetails?.phonetic && (
                                                <p className="text-xs text-muted-foreground">[{card.languageDetails.phonetic}]</p>
                                            )}
                                        </div>
                                        <Separator orientation="vertical" className="hidden sm:block h-3" />
                                        <p className="text-sm text-muted-foreground truncate">{card.definition}</p>
                                        {card.hint && (
                                            <p className="text-[10px] text-muted-foreground italic shrink-0">Note: {card.hint}</p>
                                        )}
                                    </div>

                                    {canCreateCard && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleOpenEdit(card)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/5"
                                                onClick={() => {
                                                    setDeletingCard(card);
                                                    setOpenDeleteDialog(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) )
                    ) : (
                        <div className="py-20 text-center rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">Không có thẻ ghi nhớ nào</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            disabled={currentPage === 1} 
                            onClick={() => setPage(1)} 
                            className="h-8 w-8"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            disabled={currentPage === 1} 
                            onClick={() => setPage(p => Math.max(1, p - 1))} 
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1 text-sm font-medium px-4">
                             <span>{currentPage}</span>
                             <span className="text-muted-foreground">/</span>
                             <span>{totalPages}</span>
                        </div>

                        <Button 
                            variant="outline" 
                            size="icon" 
                            disabled={currentPage === totalPages} 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            disabled={currentPage === totalPages} 
                            onClick={() => setPage(totalPages)} 
                            className="h-8 w-8"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <FlashcardFormDialog
                open={openCreateDialog}
                onOpenChange={setOpenCreateDialog}
                onSave={handleCreateCard}
                isPending={createCard.isPending}
                title="Tạo thẻ mới"
            />

            <FlashcardFormDialog
                open={openEditDialog}
                onOpenChange={setOpenEditDialog}
                initialValues={editingCard ? {
                    term: editingCard.term,
                    definition: editingCard.definition,
                    phonetic: editingCard.languageDetails?.phonetic || "",
                    note: editingCard.hint || "",
                    type: editingCard.languageDetails?.type || "Từ vựng"
                } : undefined}
                onSave={handleSaveEdit}
                isPending={updateCard.isPending}
                title="Chỉnh sửa thẻ"
            />

            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa thẻ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa thẻ <span className="font-semibold text-foreground">"{deletingCard?.term || ''}"</span>?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCard}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteCard.isPending ? 'Đang xóa...' : 'Xóa ngay'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
