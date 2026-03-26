'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, Eye, UserCircle2 } from 'lucide-react';
import { useAppSelector } from '@/hooks/hooks';
import {
    useAcademyStudySets,
    useCreateAcademyStudySet,
    useShareAcademyStudySet,
    usePublicCatalogStudySets,
} from '@/lib/api/services/academy-study-set-api';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
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
import { toast } from 'sonner';

export function StudySetsList() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { data: mySets, isLoading: mySetsLoading } = useAcademyStudySets({ enabled: isAuthenticated });
    const { data: catalogSets, isLoading: catalogLoading } = usePublicCatalogStudySets();
    const createSet = useCreateAcademyStudySet();
    const shareSet = useShareAcademyStudySet();

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');

    const handleCreateNotebook = async () => {
        if (!title.trim()) return;
        try {
            await createSet.mutateAsync({ title });
            toast.success('Đã tạo sổ tay mới');
            setOpen(false);
            setTitle('');
        } catch (error: any) {
            toast.error(error?.message || 'Không tạo được sổ tay');
        }
    };

    const handleShareToggle = async (setId: string, makePublic: boolean) => {
        try {
            const updated = await shareSet.mutateAsync({
                id: setId,
                payload: { isPublic: makePublic },
            });
            if (makePublic && updated.shareToken) {
                const url = `${window.location.origin}/share/study-sets/${updated.shareToken}`;
                await navigator.clipboard.writeText(url);
                toast.success('Đã bật công khai và sao chép liên kết chia sẻ');
            } else {
                toast.success('Đã tắt công khai bộ thẻ');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Cập nhật chia sẻ thất bại');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Sổ tay</CardTitle>
                        <Link href="/dashboard/study-sets" className="text-sm text-primary hover:underline">
                            Xem thêm
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-4">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    data-requires-auth="true"
                                    className="rounded-xl border border-dashed border-primary/60 bg-primary/5 p-5 text-left transition-colors hover:bg-primary/10"
                                >
                                    <div className="mb-2 inline-flex rounded-full bg-primary/10 p-1 text-primary">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <p className="text-sm font-semibold text-primary">Tạo sổ tay mới</p>
                                </button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tạo sổ tay mới</DialogTitle>
                                    <DialogDescription>Nhập tên bộ thẻ bạn muốn tạo.</DialogDescription>
                                </DialogHeader>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: 50 bai Minna no Nihongo" />
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                                    <Button data-requires-auth="true" onClick={handleCreateNotebook} disabled={createSet.isPending || !title.trim()}>
                                        {createSet.isPending ? 'Đang tạo...' : 'Tạo'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {mySetsLoading ? (
                            <div className="h-24 animate-pulse rounded-xl bg-muted" />
                        ) : (
                            (mySets || []).slice(0, 3).map((set) => (
                                <div key={set.id} className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
                                    <Link href={`/dashboard/study-sets/${set.id}`}>
                                        <p className="line-clamp-1 text-sm font-semibold text-primary">{set.title}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">({(set as any)._count?.setCards || 0} thẻ)</p>
                                    </Link>
                                    <div className="mt-3 flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={set.isPublic ? 'outline' : 'default'}
                                            className="h-7 px-2 text-xs"
                                            data-requires-auth="true"
                                            onClick={() => handleShareToggle(set.id, !set.isPublic)}
                                        >
                                            {set.isPublic ? 'Tắt công khai' : 'Bật công khai'}
                                        </Button>
                                        {set.isPublic && set.shareToken ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-2 text-xs"
                                                data-requires-auth="true"
                                                onClick={async () => {
                                                    const url = `${window.location.origin}/share/study-sets/${set.shareToken}`;
                                                    await navigator.clipboard.writeText(url);
                                                    toast.success('Đã sao chép liên kết chia sẻ');
                                                }}
                                            >
                                                Sao chép liên kết
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Khám phá</CardTitle>
                        <Link href="/dashboard/study-sets" className="text-sm text-primary hover:underline">
                            Xem thêm
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {catalogLoading ? (
                        <div className="grid gap-3 md:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-4">
                            {(catalogSets || []).map((set) => (
                                <Link
                                    key={set.id}
                                    href={`/dashboard/study-sets/${set.id}?catalog=1`}
                                    className="rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                                >
                                    <p className="line-clamp-1 text-sm font-semibold text-primary">{set.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">({(set as any)._count?.setCards || 0} thẻ)</p>
                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><UserCircle2 className="h-3.5 w-3.5" /> Hệ thống</span>
                                        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Công khai</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
