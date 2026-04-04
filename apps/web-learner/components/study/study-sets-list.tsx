'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, Eye, UserCircle2, Search } from 'lucide-react';
import { useAppSelector } from '@/hooks/hooks';
import { useDebounce } from '@/hooks/use-debounce';
import {
    useAcademyStudySets,
    useCreateAcademyStudySet,
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

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const { data: publicSets, isLoading: publicLoading } = usePublicCatalogStudySets(debouncedSearch);

    const createSet = useCreateAcademyStudySet();

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
                                <Link
                                    key={set.id}
                                    href={`/dashboard/study-sets/${set.id}`}
                                    className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
                                >
                                    <p className="line-clamp-1 text-sm font-semibold text-primary">{set.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">({(set as any)._count?.setCards || 0} thẻ)</p>
                                </Link>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-xl">Khám phá</CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm bộ thẻ công khai..."
                                className="pl-8 h-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {publicLoading ? (
                        <div className="grid gap-3 md:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                            ))}
                        </div>
                    ) : (publicSets || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl border border-dashed">
                            <p className="text-sm text-muted-foreground">Không tìm thấy bộ thẻ công khai nào.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-4">
                            {(publicSets || []).map((set) => (
                                <Link
                                    key={set.id}
                                    href={`/dashboard/study-sets/${set.id}${set.sourceType === 'SYSTEM' ? '?catalog=1' : ''}`}
                                    className={`rounded-xl border p-4 transition-colors ${set.sourceType === 'SYSTEM' ? 'bg-muted/30 hover:bg-muted/50' : 'bg-card hover:bg-muted/30'}`}
                                >
                                    <p className="line-clamp-1 text-sm font-semibold text-primary">{set.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">({(set as any)._count?.setCards || 0} thẻ)</p>
                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <UserCircle2 className="h-3.5 w-3.5" />
                                            {set.sourceType === 'SYSTEM' ? 'Hệ thống' : ((set as any).user?.displayName || 'Người dùng')}
                                        </span>
                                        {set.sourceType === 'SYSTEM' && (
                                            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Công khai</span>
                                        )}
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
