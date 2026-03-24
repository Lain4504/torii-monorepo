'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/hooks/hooks';
import {
    useAcademyStudySet,
    usePublicCatalogStudySet,
    useCreateAcademySetCard,
} from '@/lib/api/services/academy-study-set-api';
import { useCreateStudyNote } from '@/lib/api/services/academy-study-note-api';
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
} from '@workspace/ui/components/dialog';
import { Plus, Volume2 } from 'lucide-react';
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
    const canLearn = isAuthenticated && !isCatalogView;
    const canCreateNote = isAuthenticated && !isCatalogView;
    const canCreateCard = isAuthenticated && !isCatalogView;
    const createStudyNote = useCreateStudyNote();
    const createCard = useCreateAcademySetCard();
    const [page] = useState(1);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [newTerm, setNewTerm] = useState('');
    const [newDefinition, setNewDefinition] = useState('');

    if (isLoading) {
        return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
    }

    if (!set) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Khong tim thay bo the</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    const cards = set?.setCards || [];
    const leftColumn = cards.filter((_, idx) => idx % 2 === 0);
    const rightColumn = cards.filter((_, idx) => idx % 2 !== 0);

    const handleCreateNoteFromCard = async (card: any) => {
        if (!canCreateNote) return;
        try {
            await createStudyNote.mutateAsync({
                content: `${card.term}\n${card.definition}`,
                tags: ['study-set', set.title],
                metadata: {
                    sourceType: 'study_set_card',
                    studySetId: set.id,
                    setCardId: card.id,
                },
            });
            toast.success('Da tao study note tu the');
        } catch (e: any) {
            toast.error(e?.message || 'Khong tao duoc study note');
        }
    };

    const openCreateDialog = (card: any) => {
        setSelectedCard(card);
        setCreateDialogOpen(true);
    };

    const handleCreateCard = async () => {
        if (!canCreateCard || !setId) return;
        if (!newTerm.trim() || !newDefinition.trim()) {
            toast.error('Vui long nhap du term va definition');
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
            toast.success('Da tao card moi');
            setNewTerm('');
            setNewDefinition('');
        } catch (e: any) {
            toast.error(e?.message || 'Khong tao duoc card');
        }
    };

    const Row = ({ card }: { card: any }) => (
        <div className="flex items-start justify-between gap-3 border-b py-4">
            <div className="flex items-start gap-3">
                <Volume2 className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                    <p className="text-lg font-semibold">{card.term}</p>
                    <p className="text-[22px] text-muted-foreground">{card.definition}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => openCreateDialog(card)}
                disabled={!canCreateNote || createStudyNote.isPending}
                data-requires-auth={!canCreateNote ? 'true' : undefined}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <Button asChild className="h-11 rounded-xl" disabled={!canLearn} data-requires-auth={!canLearn ? 'true' : undefined}>
                    <Link href={canLearn ? `/dashboard/study-sets/${setId}/review` : '#'}>FlashCard</Link>
                </Button>
                <Button asChild className="h-11 rounded-xl" disabled={!canLearn} data-requires-auth={!canLearn ? 'true' : undefined}>
                    <Link href={canLearn ? `/dashboard/study-sets/${setId}/test` : '#'}>Quizz</Link>
                </Button>
                <Button asChild className="h-11 rounded-xl" disabled={!canLearn} data-requires-auth={!canLearn ? 'true' : undefined}>
                    <Link href={canLearn ? `/dashboard/study-sets/${setId}/match` : '#'}>Match game</Link>
                </Button>
            </div>

            {!canLearn ? (
                <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="py-3 text-sm text-primary">
                        Ban dang xem bo the kham pha. Chi duoc xem ben ngoai, khong the vao che do hoc.
                    </CardContent>
                </Card>
            ) : null}

            <Card>
                <CardHeader>
                    <CardTitle>Tao card moi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        <Input
                            placeholder="Term"
                            value={newTerm}
                            onChange={(e) => setNewTerm(e.target.value)}
                            disabled={!canCreateCard}
                            data-requires-auth={!canCreateCard ? 'true' : undefined}
                        />
                        <Input
                            placeholder="Definition"
                            value={newDefinition}
                            onChange={(e) => setNewDefinition(e.target.value)}
                            disabled={!canCreateCard}
                            data-requires-auth={!canCreateCard ? 'true' : undefined}
                        />
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button
                            onClick={handleCreateCard}
                            disabled={!canCreateCard || createCard.isPending || !newTerm.trim() || !newDefinition.trim()}
                            data-requires-auth={!canCreateCard ? 'true' : undefined}
                        >
                            {createCard.isPending ? 'Dang tao...' : 'Tao card'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3" />
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>{leftColumn.map((card) => <Row key={card.id} card={card} />)}</div>
                        <div>{rightColumn.map((card) => <Row key={card.id} card={card} />)}</div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" disabled>{'<<'}</Button>
                        <Button variant="outline" size="sm" disabled>{'<'}</Button>
                        <Button size="sm">{page}</Button>
                        <Button variant="outline" size="sm" disabled>{'>'}</Button>
                        <Button variant="outline" size="sm" disabled>{'>>'}</Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tao study note tu the</DialogTitle>
                        <DialogDescription>
                            Xac nhan tao study note tu card da chon.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-sm font-semibold">{selectedCard?.term || '-'}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedCard?.definition || '-'}</p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCreateDialogOpen(false);
                                setSelectedCard(null);
                            }}
                        >
                            Huy
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!selectedCard) return;
                                await handleCreateNoteFromCard(selectedCard);
                                setCreateDialogOpen(false);
                                setSelectedCard(null);
                            }}
                            disabled={!selectedCard || createStudyNote.isPending}
                        >
                            {createStudyNote.isPending ? 'Dang tao...' : 'Tao study note'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
