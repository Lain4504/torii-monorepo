'use client';

import { useEffect, useState } from 'react';
import {
    useAcademyStudySets as useStudySets,
    useCreateAcademyStudySet as useCreateStudySet,
    useDeleteAcademyStudySet as useDeleteStudySet,
    useAcademyStudySet,
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
import { AlertCircle, Bot, BrainCircuit, Layers, LayoutGrid, Play, Target, Trash2, Zap, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function StudySetsList() {
    const { data: studySets, isLoading } = useStudySets();
    const createSet = useCreateStudySet();
    const deleteSet = useDeleteStudySet();

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

    return (
        <div className="min-h-[calc(100vh-6rem)] rounded-3xl bg-[#f0f4f8] p-6 md:p-8">
            <style>{`
        .nhai-blueprint-bg {
          background-color: #dbeafe;
          background-image:
            linear-gradient(to right, rgba(0, 132, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 132, 255, 0.08) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
            <div className="mx-auto max-w-5xl space-y-8 rounded-2xl bg-white/60 p-4 shadow-sm ring-1 ring-slate-200 nhai-blueprint-bg">
                {/* Page header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Học tự chủ</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Tự tạo bộ thẻ và chọn chế độ học phù hợp với bạn.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="inline-flex items-center gap-2 rounded-xl border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        asChild
                    >
                        <Link href="/ai-sensei/chat">
                            <span className="rounded-md bg-blue-100 p-1 text-blue-600">
                                <Bot className="h-4 w-4" />
                            </span>
                            Hướng dẫn
                        </Link>
                    </Button>
                </div>

                {/* Study sets list (Danh sách bài) */}
                <Card className="border-slate-200 bg-white/90 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold text-slate-900">Danh sách bài</CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Mỗi bộ thẻ tương ứng với một bài học/tập từ vựng riêng.
                            </CardDescription>
                        </div>
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                            <DialogTrigger asChild>
                                <Button className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                                    <PlusCircle className="h-4 w-4" />
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
                                            className="text-sm font-medium leading-none text-slate-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Tên bộ thẻ <span className="text-red-500">*</span>
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
                                            className="text-sm font-medium leading-none text-slate-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                    <CardContent>
                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-20 animate-pulse rounded-xl bg-slate-100"
                                    />
                                ))}
                            </div>
                        ) : !(studySets && studySets.length) ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                                    <BrainCircuit className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Chưa có bộ thẻ nào</p>
                                    <p className="mt-1 text-xs text-slate-500">
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
                                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="mb-2 flex w-full items-start justify-between gap-2">
                                                <div>
                                                    <div
                                                        className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                            isActive
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        Bài {studySets.indexOf(set) + 1}
                                                    </div>
                                                    <p className={`line-clamp-2 text-sm font-semibold ${isActive ? 'text-blue-800' : 'text-slate-900'}`}>
                                                        {set.title}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(set.id);
                                                    }}
                                                    className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <p className={`text-xs ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
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
                <Card className="border-slate-200 bg-white/95 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Danh sách thẻ ({selectedCount})
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs text-slate-500">
                                Xem nhanh các thẻ trong bộ được chọn. Sửa chi tiết tại màn hình chỉnh sửa bộ thẻ.
                            </CardDescription>
                        </div>
                        {selectedSetId && (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="rounded-lg border-slate-200 text-xs font-medium text-slate-700"
                            >
                                <Link href={`/dashboard/study-sets/${selectedSetId}`}>
                                    Chỉnh sửa bộ thẻ
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!selectedSetId ? (
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                Hãy chọn một bộ thẻ ở trên để xem danh sách thẻ tương ứng.
                            </div>
                        ) : isLoadingSelected ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((row) => (
                                    <div
                                        key={row}
                                        className="h-10 animate-pulse rounded-lg bg-slate-100"
                                    />
                                ))}
                            </div>
                        ) : !selectedSet?.setCards?.length ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                    <LayoutGrid className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Bộ thẻ này chưa có thẻ nào</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Thêm thẻ mới tại màn hình chỉnh sửa bộ thẻ để bắt đầu học.
                                    </p>
                                </div>
                                {selectedSetId && (
                                    <Button
                                        asChild
                                        size="sm"
                                        className="mt-1"
                                    >
                                        <Link href={`/dashboard/study-sets/${selectedSetId}`}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Thêm thẻ mới
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                            <th className="pb-2 pr-4">#</th>
                                            <th className="pb-2 pr-4">Thuật ngữ</th>
                                            <th className="pb-2 pr-4">Định nghĩa</th>
                                            <th className="pb-2 pr-4">Gợi ý</th>
                                            <th className="pb-2 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedSet.setCards.map((card, index) => (
                                            <tr
                                                key={card.id}
                                                className="transition-colors hover:bg-slate-50"
                                            >
                                                <td className="py-3 pr-4 text-xs text-slate-500">
                                                    {index + 1}
                                                </td>
                                                <td className="py-3 pr-4 text-base font-medium text-slate-900">
                                                    {card.term}
                                                </td>
                                                <td className="py-3 pr-4 text-sm text-slate-700">
                                                    {card.definition}
                                                </td>
                                                <td className="py-3 pr-4 text-xs text-slate-500">
                                                    {card.hint || '—'}
                                                </td>
                                                <td className="py-3 text-right text-xs">
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                                    >
                                                        <Link href={`/dashboard/study-sets/${selectedSet.id}`}>
                                                            <Layers className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Study modes section */}
                <section className="space-y-4 pb-2">
                    <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50/80 px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-medium text-orange-800">
                            Nên dùng bộ gõ tiếng Việt hoặc Nhật cho các chế độ luyện gõ để tăng hiệu quả ghi nhớ.
                        </p>
                    </div>
                    <div>
                        <h2 className="mb-4 text-lg font-bold text-slate-900">Chọn chế độ học</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Flashcard / SRS */}
                            <Card className="flex h-full flex-col items-center justify-between border-blue-100 bg-white text-center shadow-sm transition-shadow hover:shadow-md">
                                <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                            <Layers className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-slate-900">Flashcard</p>
                                            <p className="text-xs leading-relaxed text-slate-500">
                                                Lật thẻ theo hệ thống SRS để làm quen và củng cố từ vựng.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        disabled={!selectedSetId || selectedCount === 0}
                                        className="mt-4 w-full rounded-xl bg-[#0084ff] text-white hover:bg-blue-600"
                                    >
                                        <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/review` : '#'}>
                                            <Play className="mr-2 h-4 w-4" />
                                            Bắt đầu Flashcard
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Multiple choice test */}
                            <Card className="flex h-full flex-col items-center justify-between border-emerald-100 bg-white text-center shadow-sm transition-shadow hover:shadow-md">
                                <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-slate-900">Trắc nghiệm</p>
                                            <p className="text-xs leading-relaxed text-slate-500">
                                                Xem thuật ngữ, chọn đáp án đúng. Phù hợp để kiểm tra nhanh.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        disabled={!selectedSetId || selectedCount === 0}
                                        className="mt-4 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                                    >
                                        <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/test` : '#'}>
                                            <Zap className="mr-2 h-4 w-4" />
                                            Bắt đầu Trắc nghiệm
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Match / active recall */}
                            <Card className="flex h-full flex-col items-center justify-between border-orange-100 bg-white text-center shadow-sm transition-shadow hover:shadow-md">
                                <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                            <Zap className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-slate-900">Nhồi nhét</p>
                                            <p className="text-xs leading-relaxed text-slate-500">
                                                Luyện tập chủ động với trò chơi ghép cặp – tăng độ “nhai lại” của vốn từ.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        disabled={!selectedSetId || selectedCount === 0}
                                        className="mt-4 w-full rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                                    >
                                        <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/match` : '#'}>
                                            Bắt đầu Nhồi nhét
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
