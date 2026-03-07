'use client';

import { useState } from 'react';
import { useStudySets, useCreateStudySet, useDeleteStudySet } from '@/lib/api/services/study-set-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { BrainCircuit, Play, Edit, Trash2, PlusCircle, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function StudySetsList() {
    const { data: studySets, isLoading } = useStudySets();
    const createSet = useCreateStudySet();
    const deleteSet = useDeleteStudySet();

    const [openDialog, setOpenDialog] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        if (!title.trim()) return;
        try {
            await createSet.mutateAsync({ title, description, tags: [] });
            toast.success('Đã tạo bộ thẻ thành công!');
            setOpenDialog(false);
            setTitle('');
            setDescription('');
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi tạo bộ thẻ');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bộ thẻ này? Tất cả thẻ bên trong cũng sẽ bị xóa.')) return;
        try {
            await deleteSet.mutateAsync(id);
            toast.success('Đã xóa bộ thẻ!');
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi xóa bộ thẻ');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                    Quản lý và ôn tập từ vựng, ngữ pháp hiệu quả bằng hệ thống lặp lại ngắt quãng (SRS).
                </p>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tạo bộ thẻ mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
                            <DialogDescription>
                                Đặt tên và tùy chọn mô tả cho bộ thẻ ghi nhớ của bạn.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Tên bộ thẻ <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="title"
                                    placeholder="Nhập tên bộ thẻ..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Mô tả
                                </label>
                                <Textarea
                                    id="description"
                                    placeholder="Nội dung, mục tiêu của bộ thẻ này..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenDialog(false)}>Hủy</Button>
                            <Button onClick={handleCreate} disabled={createSet.isPending || !title.trim()}>
                                {createSet.isPending ? 'Đang tạo...' : 'Tạo mới'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-muted/50 rounded-t-xl" />
                            <CardContent className="h-32" />
                        </Card>
                    ))}
                </div>
            ) : studySets?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studySets.map((set) => (
                        <Card key={set.id} className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-gradient-to-br from-card to-card/50 border-primary/10">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 pr-6">
                                        <CardTitle className="leading-tight break-words line-clamp-2">
                                            {set.title}
                                        </CardTitle>
                                        {set.description && (
                                            <CardDescription className="line-clamp-2">
                                                {set.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <LayoutGrid className="size-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                                        <BrainCircuit className="size-4" />
                                        <span className="font-medium text-foreground">{set._count?.cards || 0} thẻ</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-muted-foreground flex gap-1 items-center">
                                    <span>Tạo ngày {new Date(set.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t flex justify-between gap-2">
                                <Button asChild variant="default" className="w-full flex-1" disabled={set._count?.cards === 0}>
                                    <Link href={`/dashboard/study-sets/${set.id}/review`}>
                                        <Play className="size-4 mr-2" /> Học bài
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="icon" className="shrink-0 group-hover:bg-primary/5">
                                    <Link href={`/dashboard/study-sets/${set.id}`}>
                                        <Edit className="size-4 text-primary" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="icon" className="shrink-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" onClick={() => handleDelete(set.id)}>
                                    <Trash2 className="size-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <div className="mx-auto w-24 h-24 mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <BrainCircuit className="size-12 text-primary/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Chưa có bộ thẻ nào</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                        Tạo bộ thẻ đầu tiên của bạn để bắt đầu ghi nhớ từ vựng và kiến thức hiệu quả hơn!
                    </p>
                    <Button onClick={() => setOpenDialog(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tạo bộ thẻ ngay
                    </Button>
                </div>
            )}
        </div>
    );
}
