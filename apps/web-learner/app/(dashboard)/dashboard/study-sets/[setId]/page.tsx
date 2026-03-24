'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/hooks/hooks';
import { useAcademyStudySet, usePublicCatalogStudySet } from '@/lib/api/services/academy-study-set-api';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Plus, Volume2 } from 'lucide-react';

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
    const [showWord, setShowWord] = useState(true);
    const [showPhonetic, setShowPhonetic] = useState(true);
    const [showMeaning, setShowMeaning] = useState(true);
    const [page] = useState(1);

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

    const Row = ({ card }: { card: any }) => (
        <div className="flex items-start justify-between gap-3 border-b py-4">
            <div className="flex items-start gap-3">
                <Volume2 className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                    {showWord ? <p className="text-lg font-semibold">{card.term}</p> : null}
                    {showPhonetic ? <p className="text-sm text-muted-foreground">-</p> : null}
                    {showMeaning ? <p className="text-[22px] text-muted-foreground">{card.definition}</p> : null}
                </div>
            </div>
            <button type="button" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Button className="h-11 rounded-xl">FlashCard</Button>
                <Button className="h-11 rounded-xl" variant="default" disabled={!canLearn} data-requires-auth={!canLearn ? 'true' : undefined}>
                    Quizz
                </Button>
                <Button className="h-11 rounded-xl" variant="default" disabled={!canLearn} data-requires-auth={!canLearn ? 'true' : undefined}>
                    Luyen noi, viet
                </Button>
                <Button className="h-11 rounded-xl" variant="default" disabled={!canLearn} data-requires-auth={!canLearn ? 'true' : undefined}>
                    Mini Test
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
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={showWord} onChange={(e) => setShowWord(e.target.checked)} />
                            Tu vung
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={showPhonetic} onChange={(e) => setShowPhonetic(e.target.checked)} />
                            Phien am
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={showMeaning} onChange={(e) => setShowMeaning(e.target.checked)} />
                            Nghia
                        </label>
                    </div>
                </CardHeader>
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
        </div>
    );
}
