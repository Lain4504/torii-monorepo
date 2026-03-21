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
        <section className="w-full space-y-4 pb-2" data-purpose="study-mode-selection">
            <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AlertCircle className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-foreground/90">
                    Nên dùng bộ gõ tiếng Việt hoặc Nhật cho các chế độ luyện gõ để tăng hiệu quả ghi nhớ.
                </p>
            </div>
            <div>
                <h2 className="mb-4 text-lg font-bold text-foreground">Chọn chế độ học</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Flashcard / SRS */}
                    <Card
                        className={`flex h-full flex-col items-center justify-between text-center shadow-sm transition-shadow hover:shadow-md ${
                            activeMode === 'review'
                                ? 'border-blue-500/50 bg-blue-500/5'
                                : 'border-border bg-card'
                        }`}
                        data-purpose="mode-card-flashcard"
                    >
                        <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                    <Layers className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-foreground">Flashcard</p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Lật thẻ để xem đáp án. Phù hợp để làm quen với từ vựng mới.
                                    </p>
                                </div>
                            </div>
                            <Button
                                asChild
                                disabled={!selectedSetId || selectedCount === 0}
                                className="mt-4 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
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
                                ? 'border-orange-500/50 bg-orange-500/5'
                                : 'border-border bg-card'
                        }`}
                        data-purpose="mode-card-quiz"
                    >
                        <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                                    <Target className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-foreground">Trắc nghiệm</p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Trả lời câu hỏi trắc nghiệm để kiểm tra mức độ nhớ từ.
                                    </p>
                                </div>
                            </div>
                            <Button
                                asChild
                                disabled={!selectedSetId || selectedCount === 0}
                                className="mt-4 w-full rounded-xl bg-orange-500 text-white hover:bg-orange-600"
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
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-border bg-card'
                        }`}
                        data-purpose="mode-card-intensive"
                    >
                        <CardContent className="flex h-full flex-col items-center justify-between space-y-4 p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-foreground">Match</p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Ghép cặp thuật ngữ và định nghĩa để tăng phản xạ ghi nhớ.
                                    </p>
                                </div>
                            </div>
                            <Button
                                asChild
                                disabled={!selectedSetId || selectedCount === 0}
                                className="mt-4 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/match` : '#'}>
                                    Bắt đầu Match
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
