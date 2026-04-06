'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, Search, Book, Globe, User, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/hooks/hooks';
import { useDebounce } from '@/hooks/use-debounce';
import {
    useAcademyStudySets,
    useCreateAcademyStudySet,
    usePublicCatalogStudySets,
} from '@/lib/api/services/academy-study-set-api';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { toast } from 'sonner';
import { cn } from '@workspace/ui/lib/utils';

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
            toast.success('Đã tạo bộ thẻ mới');
            setOpen(false);
            setTitle('');
        } catch (error: any) {
            toast.error(error?.message || 'Không tạo được bộ thẻ');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* My Sets Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                            <BookOpen className="size-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-bold tracking-tight">Sổ tay của tôi</h2>
                            <p className="text-xs font-medium text-muted-foreground/60">Bộ sưu tập thẻ học cá nhân của bạn.</p>
                        </div>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="rounded-xl h-10 font-bold px-6" data-requires-auth="true">
                                <Plus className="mr-2 size-4" />
                                TẠO BỘ THẺ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle className="text-base font-bold">Tạo sổ tay mới</DialogTitle>
                                <DialogDescription className="text-xs">Nhập tên bộ thẻ bạn muốn tạo để bắt đầu lưu trữ.</DialogDescription>
                            </DialogHeader>
                            <Input 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                placeholder="VD: Từ vựng N3 bài 1..." 
                                className="h-11 rounded-xl"
                            />
                            <DialogFooter className="gap-2 pt-4">
                                <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-10 font-bold">Hủy</Button>
                                <Button onClick={handleCreateNotebook} disabled={createSet.isPending || !title.trim()} className="rounded-xl h-10 font-bold px-8">
                                    {createSet.isPending ? 'Đang tạo...' : 'Tạo ngay'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mySetsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/20 border border-border" />
                        ))
                    ) : (mySets || []).length > 0 ? (
                        (mySets || []).map((set) => (
                            <Link key={set.id} href={`/dashboard/study-sets/${set.id}`} className="group">
                                <Card className="h-full border-border bg-card hover:border-primary/50 transition-all duration-300 rounded-2xl overflow-hidden shadow-none group-hover:shadow-md">
                                    <CardHeader className="p-5 pb-2">
                                        <CardTitle className="text-sm font-bold truncate group-hover:text-primary transition-colors">{set.title}</CardTitle>
                                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                                            {(set as any)._count?.setCards || 0} THẺ HỌC
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-5 rounded-full bg-muted flex items-center justify-center border">
                                                <User className="size-2.5 text-muted-foreground/60" />
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground/60">Bạn</span>
                                        </div>
                                        <ChevronRight className="size-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center rounded-2xl border-2 border-dashed border-border bg-muted/5">
                            <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">Bạn chưa có bộ thẻ nào</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Public Sets Section */}
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shrink-0">
                            <Globe className="size-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-bold tracking-tight">Khám phá cộng đồng</h2>
                            <p className="text-xs font-medium text-muted-foreground/60">Tham khảo các bộ thẻ công khai từ Torii và bạn học.</p>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm bộ thẻ công khai..."
                            className="pl-10 h-10 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {publicLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/20 border border-border" />
                        ))}
                    </div>
                ) : (publicSets || []).length === 0 ? (
                    <div className="py-20 text-center bg-muted/5 rounded-2xl border-2 border-dashed border-border">
                        <p className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">Không tìm thấy bộ thẻ nào phù hợp</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(publicSets || []).map((set) => (
                            <Link key={set.id} href={`/dashboard/study-sets/${set.id}${set.sourceType === 'SYSTEM' ? '?catalog=1' : ''}`} className="group">
                                <Card className={cn(
                                    "h-full border transition-all duration-300 rounded-2xl overflow-hidden shadow-none group-hover:shadow-md",
                                    set.sourceType === 'SYSTEM' ? "bg-primary/[0.02] border-primary/20 hover:border-primary/50" : "bg-card border-border hover:border-emerald-500/50"
                                )}>
                                    <CardHeader className="p-5 pb-2">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <CardTitle className="text-sm font-bold truncate group-hover:text-primary transition-colors">{set.title}</CardTitle>
                                            {set.sourceType === 'SYSTEM' && (
                                                <Badge className="bg-primary/10 text-primary border-none rounded-md px-1.5 py-0 text-[8px] font-black h-4 shrink-0">TORII</Badge>
                                            )}
                                        </div>
                                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                                            {(set as any)._count?.setCards || 0} THẺ HỌC
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className="size-5 rounded-full bg-muted flex items-center justify-center border shrink-0">
                                                <User className="size-2.5 text-muted-foreground/60" />
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 truncate">
                                                {set.sourceType === 'SYSTEM' ? 'Hệ thống' : ((set as any).user?.displayName || 'Thành viên')}
                                            </span>
                                        </div>
                                        <ChevronRight className="size-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function BookOpen({ className, ...props }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    )
}
