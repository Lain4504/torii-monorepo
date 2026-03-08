'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyCards, useReviewCard } from '@/lib/api/services/study-set-api';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, CheckCircle2, RefreshCw, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export function StudySetReview({ setId }: { setId: string }) {
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // Fetch all cards due for review
    const { data: cards, isLoading, isError, refetch } = useStudyCards(setId);

    const reviewMutation = useReviewCard();

    const handleRating = async (quality: number) => {
        if (!cards || !cards[currentIndex]) return;
        try {
            await reviewMutation.mutateAsync({
                cardId: cards[currentIndex].id,
                payload: { quality }
            });
            setShowAnswer(false);
            setCurrentIndex(prev => prev + 1);
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi lưu kết quả ôn tập');
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Đang tải thẻ ôn tập...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 h-full">
                <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
                    <X className="size-10" />
                </div>
                <h2 className="text-2xl font-bold">Lỗi tải dữ liệu</h2>
                <p className="text-muted-foreground max-w-sm text-center">
                    Không thể tải các thẻ ôn tập vào lúc này. Vui lòng thử lại.
                </p>
                <div className="flex gap-4 mt-8">
                    <Button variant="outline" onClick={() => router.push(`/dashboard/study-sets/${setId}`)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Về bộ thẻ
                    </Button>
                    <Button onClick={() => refetch()}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    const currentCard = cards?.[currentIndex];

    if (!cards || cards.length === 0 || currentIndex >= cards.length) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 h-[60vh]">
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="size-12" />
                </div>
                <h2 className="text-3xl font-bold">Tuyệt vời!</h2>
                <p className="text-muted-foreground text-lg max-w-md text-center">
                    Bạn đã hoàn thành tất cả các thẻ cần ôn trong lúc này. Hãy quay lại sau nhé!
                </p>
                <Button className="mt-8" size="lg" onClick={() => router.push(`/dashboard/study-sets`)}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Trở về Danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col pb-10">
            <div className="mb-4 flex justify-between items-center max-w-4xl mx-auto w-full px-4">
                <Button variant="ghost" onClick={() => router.push(`/dashboard/study-sets`)}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Thoát
                </Button>
                <div className="text-sm font-medium text-muted-foreground">
                    Thẻ {currentIndex + 1} / {cards.length}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8">
                {/* Flashcard Area */}
                <div className="w-full relative perspective-1000 min-h-[400px]">
                    <div className={`w-full h-full min-h-[400px] transition-all duration-500 transform-style-preserve-3d ${showAnswer ? 'rotate-y-180' : ''}`}>

                        {/* Front Side */}
                        <Card className={`absolute inset-0 backface-hidden bg-card border-none shadow-xl flex items-center justify-center p-8 cursor-pointer ${showAnswer ? 'hidden' : 'flex'}`} onClick={() => setShowAnswer(true)}>
                            <CardContent className="text-center p-0 space-y-6 w-full">
                                <span className="text-muted-foreground uppercase tracking-widest text-sm font-semibold opacity-50 block mb-6">Câu hỏi</span>
                                <h3 className="text-4xl md:text-5xl font-bold leading-tight whitespace-pre-wrap">{currentCard?.term}</h3>
                                {currentCard?.hint && (
                                    <p className="text-muted-foreground text-sm italic mt-2">Gợi ý: {currentCard.hint}</p>
                                )}
                                <p className="text-muted-foreground mt-8 text-sm opacity-50 animate-pulse">Nhấn để xem đáp án</p>
                            </CardContent>
                        </Card>

                        {/* Back Side */}
                        <Card className={`absolute inset-0 backface-hidden rotate-y-180 bg-primary/5 border-primary/20 shadow-xl flex items-center justify-center p-8 ${!showAnswer ? 'hidden' : 'flex'}`}>
                            {currentCard && (
                                <CardContent className="text-center p-0 space-y-6 w-full overflow-y-auto">
                                    <span className="text-primary/70 uppercase tracking-widest text-sm font-semibold block mb-6">Gốc: {currentCard.term}</span>
                                    <div className="h-px bg-primary/10 w-1/2 mx-auto my-6" />
                                    <h3 className="text-3xl md:text-4xl leading-relaxed whitespace-pre-wrap font-medium">{currentCard.definition}</h3>
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-xl mx-auto pt-8">
                    {!showAnswer ? (
                        <Button
                            className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                            size="lg"
                            onClick={() => setShowAnswer(true)}
                        >
                            Hiển thị đáp án
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-16 flex flex-col items-center justify-center gap-1 border-destructive/20 hover:border-destructive hover:bg-destructive/10 hover:text-destructive shadow-sm transition-all"
                                onClick={() => handleRating(0)}
                                disabled={reviewMutation.isPending}
                            >
                                <X className="size-5 mb-1" />
                                <span className="font-bold">Chưa nhớ</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-16 flex flex-col items-center justify-center gap-1 border-green-500/20 hover:border-green-500 hover:bg-green-500/10 hover:text-green-500 shadow-sm transition-all"
                                onClick={() => handleRating(1)}
                                disabled={reviewMutation.isPending}
                            >
                                <Check className="size-5 mb-1" />
                                <span className="font-bold">Đã nhớ</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
