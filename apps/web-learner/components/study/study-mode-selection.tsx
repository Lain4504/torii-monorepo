'use client';

import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { AlertCircle, Layers, Target, Zap } from 'lucide-react';

interface StudyModeSelectionProps {
    selectedSetId: string | null;
    selectedCount: number;
    activeMode?: 'review' | 'test' | 'match';
}

export function StudyModeSelection({ selectedSetId, selectedCount, activeMode }: StudyModeSelectionProps) {
    return (
        <section className="w-full max-w-4xl mx-auto space-y-4 pb-2" data-purpose="study-mode-selection">
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
                    <Card
                        className={`flex h-full flex-col items-center justify-between text-center shadow-sm transition-shadow hover:shadow-md ${
                            activeMode === 'review'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-blue-100 bg-white'
                        }`}
                        data-purpose="mode-card-flashcard"
                    >
                        <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                    <Layers className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-slate-900">Flashcard</p>
                                    <p className="text-xs leading-relaxed text-slate-500">
                                        Lật thẻ để xem đáp án. Phù hợp để làm quen với từ vựng mới.
                                    </p>
                                </div>
                            </div>
                            <Button
                                asChild
                                disabled={!selectedSetId || selectedCount === 0}
                                className="mt-4 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/review` : '#'}>
                                    Bắt đầu Flashcard
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Multiple choice test */}
                    <Card
                        className={`flex h-full flex-col items-center justify-between text-center shadow-sm transition-shadow hover:shadow-md ${
                            activeMode === 'test'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-emerald-100 bg-white'
                        }`}
                        data-purpose="mode-card-quiz"
                    >
                        <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                                    <Target className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-slate-900">Trắc nghiệm</p>
                                    <p className="text-xs leading-relaxed text-slate-500">
                                        Xem từ vựng, chọn cách đọc. Kiểm tra nhanh kiến thức.
                                    </p>
                                </div>
                            </div>
                            <Button
                                asChild
                                disabled={!selectedSetId || selectedCount === 0}
                                className="mt-4 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                                <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/test` : '#'}>
                                    Bắt đầu Trắc nghiệm
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Match / active recall */}
                    <Card
                        className={`flex h-full flex-col items-center justify-between text-center shadow-sm transition-shadow hover:shadow-md ${
                            activeMode === 'match'
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-orange-100 bg-white'
                        }`}
                        data-purpose="mode-card-intensive"
                    >
                        <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-slate-900">Nhồi nhét</p>
                                    <p className="text-xs leading-relaxed text-slate-500">
                                        Gõ đáp án để ghi nhớ sâu hơn. Dành cho người muốn thử thách.
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
    );
}
