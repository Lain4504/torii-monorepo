'use client';

import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { AlertCircle, Layers, Target, Zap } from 'lucide-react';

interface StudyModeSelectionProps {
    selectedSetId: string | null;
    selectedCount: number;
    activeMode?: 'review' | 'test' | 'match';
}

export function StudyModeSelection({ selectedSetId, selectedCount, activeMode }: StudyModeSelectionProps) {
    return (
        <section className="w-full max-w-4xl mx-auto space-y-4 pb-2" data-purpose="study-mode-selection">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="mb-6 text-2xl font-black text-slate-800">Chọn chế độ học</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 text-left">
                    {/* Card 1: Flashcard */}
                    <article className="relative group cursor-pointer" data-purpose="mode-card-flashcard">
                        <div className={`h-full border-2 rounded-2xl p-6 flex flex-col transition-all hover:shadow-lg ${
                            activeMode === 'review' 
                                ? 'bg-[#f8fbff] border-blue-500 ring-2 ring-blue-100' 
                                : selectedSetId ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200'
                        }`}>
                            {activeMode === 'review' && (
                                <span className="absolute -top-3 left-5 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                    Đang học
                                </span>
                            )}
                            <div className="flex items-center mb-4">
                                <div className="text-blue-500 mr-2">
                                    <Layers className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-[#2d3a5a]">Flashcard</h3>
                            </div>
                            <p className="text-slate-600 text-sm flex-grow mb-6 leading-relaxed">
                                Lật thẻ để xem đáp án. Phù hợp để làm quen với từ vựng mới.
                            </p>
                            <Button
                                asChild
                                disabled={!selectedSetId || selectedCount === 0}
                                className="w-full bg-blue-600 text-white font-bold py-6 rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/review` : '#'}>
                                    Bắt đầu Flashcard
                                </Link>
                            </Button>
                        </div>
                    </article>

                    {/* Card 2: Trắc nghiệm */}
                    <article className="relative group cursor-pointer" data-purpose="mode-card-quiz">
                        <div className={`h-full border-2 rounded-2xl p-6 flex flex-col transition-all hover:shadow-lg ${
                            activeMode === 'test'
                                ? 'bg-[#f6fff9] border-green-500 ring-2 ring-green-100'
                                : selectedSetId ? 'bg-white border-slate-100 hover:border-green-500' : 'bg-slate-50 border-slate-200'
                        }`}>
                            {activeMode === 'test' && (
                                <span className="absolute -top-3 left-5 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                    Đang học
                                </span>
                            )}
                            <div className="flex items-center mb-4">
                                <div className="text-green-500 mr-2">
                                    <Target className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-[#2d3a5a]">Trắc nghiệm</h3>
                            </div>
                            <p className="text-slate-600 text-sm flex-grow mb-6 leading-relaxed">
                                Xem từ vựng, chọn cách đọc. Kiểm tra nhanh kiến thức.
                            </p>
                            <Button
                                asChild
                                disabled={!selectedSetId || selectedCount === 0}
                                className="w-full bg-green-600 text-white font-bold py-6 rounded-xl hover:bg-green-700 transition-colors"
                            >
                                <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/test` : '#'}>
                                    Bắt đầu Trắc nghiệm
                                </Link>
                            </Button>
                        </div>
                    </article>

                    {/* Card 3: Nhồi nhét */}
                    <article className="relative group cursor-pointer" data-purpose="mode-card-intensive">
                        <div className={`h-full border-2 rounded-2xl p-6 flex flex-col transition-all hover:shadow-lg ${
                            activeMode === 'match'
                                ? 'bg-[#fffcf5] border-orange-500 ring-2 ring-orange-100'
                                : selectedSetId ? 'bg-white border-slate-100 hover:border-orange-500' : 'bg-slate-50 border-slate-200'
                        }`}>
                            {activeMode === 'match' && (
                                <span className="absolute -top-3 left-5 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                    Đang học
                                </span>
                            )}
                            <div className="flex items-center mb-4">
                                <div className="text-orange-500 mr-2">
                                    <Zap className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-[#2d3a5a]">Nhồi nhét</h3>
                            </div>
                            <p className="text-slate-600 text-sm flex-grow mb-6 leading-relaxed">
                                Gõ đáp án để ghi nhớ sâu hơn. Dành cho người muốn thử thách.
                            </p>
                            <Button
                                asChild
                                disabled={!selectedSetId || selectedCount === 0}
                                className="w-full bg-[#f2540d] text-white font-bold py-6 rounded-xl hover:bg-[#d4490b] transition-colors"
                            >
                                <Link href={selectedSetId ? `/dashboard/study-sets/${selectedSetId}/match` : '#'}>
                                    Bắt đầu Nhồi nhét
                                </Link>
                            </Button>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
