'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTestQuiz } from '@/lib/api/services/study-set-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, Check, X, RefreshCw, Trophy, ArrowRight } from 'lucide-react';
import { Progress } from '@workspace/ui/components/progress';

interface Question {
    id: string;
    type: 'multiple_choice' | 'true_false';
    question: string;
    options: string[];
    answer: string;
}

export function StudyModeTest({ setId }: { setId: string }) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [testFinished, setTestFinished] = useState(false);

    const { data: questions, isLoading, isError, refetch } = useTestQuiz(setId, 10);

    const currentQuestion = useMemo(() => {
        return questions?.[currentIndex] as Question | undefined;
    }, [questions, currentIndex]);

    const handleOptionSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
        const correct = option === currentQuestion?.answer;
        setIsCorrect(correct);
        if (correct) setScore(s => s + 1);
    };

    const nextQuestion = () => {
        if (!questions) return;
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setTestFinished(true);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setTestFinished(false);
        refetch();
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Đang chuẩn bị bài thi...</p>
            </div>
        );
    }

    if (isError || !questions || questions.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 h-[60vh]">
                <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
                    <X className="size-10" />
                </div>
                <h2 className="text-2xl font-bold">Lỗi tải dữ liệu</h2>
                <p className="text-muted-foreground text-center max-w-sm">
                    Không thể chuẩn bị bài kiểm tra vào lúc này. Vui lòng đảm bảo bộ thẻ có ít nhất 4 thẻ.
                </p>
                <Button className="mt-4" onClick={() => router.push(`/dashboard/study-sets/${setId}`)}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Về bộ thẻ
                </Button>
            </div>
        );
    }

    if (testFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4 text-center">
                <Card className="w-full border-primary/10 shadow-xl overflow-hidden">
                    <div className="bg-primary/5 py-12 flex flex-col items-center border-b border-primary/10">
                        <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/5">
                            <Trophy className="size-12" />
                        </div>
                        <h2 className="text-4xl font-bold mb-2">Hoàn thành!</h2>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-5xl font-extrabold text-primary">{score}</span>
                            <span className="text-xl text-muted-foreground">/ {questions.length}</span>
                        </div>
                        <p className="text-muted-foreground mt-2 font-medium">Bạn đạt {percentage}% câu trả lời đúng</p>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-xl space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đã trả lời đúng</p>
                                <p className="text-2xl font-bold text-green-600">{score}</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đã trả lời sai</p>
                                <p className="text-2xl font-bold text-red-500">{questions.length - score}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex flex-col gap-3">
                        <Button className="w-full h-12 text-lg font-bold" onClick={restart}>
                            <RefreshCw className="mr-2 size-5" /> Làm bài lại
                        </Button>
                        <Button variant="outline" className="w-full h-12 text-lg" onClick={() => router.push(`/dashboard/study-sets/${setId}`)}>
                            <ChevronLeft className="mr-2 size-5" /> Kết thúc
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
            <div className="flex justify-between items-center mb-8">
                <Button variant="ghost" onClick={() => router.push(`/dashboard/study-sets/${setId}`)}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Thoát
                </Button>
                <div className="flex-1 max-w-[200px] mx-8">
                    <Progress value={progress} className="h-2" />
                </div>
                <div className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {currentIndex + 1} / {questions.length}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <Card className="border-none shadow-none bg-transparent flex-1 mb-10 overflow-visible">
                    <CardHeader className="text-center pb-12 px-0">
                        <span className="text-primary font-semibold uppercase tracking-[0.2em] text-xs mb-4 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {currentQuestion?.type === 'multiple_choice' ? 'Câu hỏi trắc nghiệm' : 'Đúng hay Sai?'}
                        </span>
                        <h3 className="text-3xl md:text-5xl font-bold leading-tight balance animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {currentQuestion?.question}
                        </h3>
                    </CardHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-900">
                        {currentQuestion?.options.map((option, idx) => {
                            const isSelected = selectedOption === option;
                            const isCorrectAnswer = isAnswered && option === currentQuestion.answer;
                            const isWrongSelection = isAnswered && isSelected && !isCorrect;

                            let variant: "outline" | "default" = "outline";
                            let className = "relative h-24 text-lg font-medium transition-all group overflow-hidden ";

                            if (isAnswered) {
                                if (isCorrectAnswer) {
                                    className += "border-green-500 bg-green-500/10 text-green-700 ring-4 ring-green-500/10";
                                } else if (isWrongSelection) {
                                    className += "border-red-500 bg-red-500/10 text-red-600 ring-4 ring-red-500/10";
                                } else {
                                    className += "opacity-40 grayscale-[0.5]";
                                }
                            } else {
                                className += "hover:border-primary hover:bg-primary/5 hover:translate-y-[-2px] hover:shadow-md";
                            }

                            return (
                                <Button
                                    key={idx}
                                    variant={variant}
                                    className={className}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={isAnswered}
                                >
                                    <span className="z-10">{option}</span>
                                    {isCorrectAnswer && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500 text-white p-1 rounded-full">
                                            <Check className="size-4" />
                                        </div>
                                    )}
                                    {isWrongSelection && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white p-1 rounded-full">
                                            <X className="size-4" />
                                        </div>
                                    )}
                                    <div className="absolute left-0 top-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            );
                        })}
                    </div>
                </Card>

                <div className="mt-auto pt-8 border-t flex justify-center sticky bottom-6 bg-background/80 flex-col gap-4">
                    {isAnswered && (
                        <div className={`p-4 rounded-xl flex items-center gap-4 animate-in zoom-in-95 duration-300 ${isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {isCorrect ? <Check className="size-6" /> : <X className="size-6" />}
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                    {isCorrect ? 'Chính xác!' : 'Rất tiếc, chưa đúng'}
                                </p>
                                {!isCorrect && (
                                    <p className="text-sm text-red-600/80">Đáp án đúng là: <span className="font-bold underline">{currentQuestion?.answer}</span></p>
                                )}
                            </div>
                            <Button size="lg" className="h-12 px-8 font-bold text-lg" onClick={nextQuestion}>
                                {currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Tiếp theo'} <ArrowRight className="ml-2 size-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
