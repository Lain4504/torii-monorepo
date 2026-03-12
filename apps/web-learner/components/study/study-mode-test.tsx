'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyTestQuiz as useTestQuiz } from '@/lib/api/services/academy-study-set-api';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, RefreshCw, Trophy, ArrowRight, AlertCircle, Settings, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { StudyModeSelection } from './study-mode-selection';
import confetti from 'canvas-confetti';

interface Question {
    id: string;
    type: 'multiple_choice' | 'true_false';
    question: string;
    options: string[];
    answer: string;
    displayedAnswer?: string;
    hint?: string;
    phonetic?: string;
}

export function StudyModeTest({ setId }: { setId: string }) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [testFinished, setTestFinished] = useState(false);

    const { data: rawQuestions, isLoading, isError, refetch } = useTestQuiz(setId, 10);

    const questions: Question[] = useMemo(() => {
        if (!rawQuestions) return [];
        return rawQuestions.map((q: any) => ({
            id: q.id,
            type: q.type,
            question: q.type === 'true_false' ? `${q.question} có nghĩa là "${q.displayedAnswer}"?` : q.question,
            options: q.type === 'true_false' ? ['Đúng', 'Sai'] : (q.options ?? []),
            answer: q.type === 'true_false' ? (q.correctAnswer ? 'Đúng' : 'Sai') : q.correctAnswer,
            displayedAnswer: q.displayedAnswer,
            hint: q.hint,
            phonetic: q.phonetic || (q.type !== 'true_false' ? q.displayedAnswer : ''),
        } as Question));
    }, [rawQuestions]);

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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLoading || testFinished || !currentQuestion) return;

            if (!isAnswered) {
                const key = e.key;
                if (key >= '1' && key <= '4') {
                    const idx = parseInt(key) - 1;
                    if (currentQuestion.options[idx]) {
                        handleOptionSelect(currentQuestion.options[idx]);
                    }
                }
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                nextQuestion();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLoading, testFinished, currentQuestion, isAnswered]);

    if (isLoading) {
        return (
            <div 
                className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 w-full bg-[#eef4ff] font-['Inter',_'Noto_Sans_JP',_sans-serif]" 
                style={{ 
                    backgroundImage: 'linear-gradient(#dde8f5 1px, transparent 1px), linear-gradient(90deg, #dde8f5 1px, transparent 1px)',
                    backgroundSize: '25px 25px'
                }}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
                    <p className="text-slate-500 animate-pulse font-medium">Đang chuẩn bị bài thi...</p>
                </div>
            </div>
        );
    }

    if (isError || !questions || questions.length === 0) {
        return (
            <div 
                className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 w-full bg-[#eef4ff] font-['Inter',_'Noto_Sans_JP',_sans-serif]" 
                style={{ 
                    backgroundImage: 'linear-gradient(#dde8f5 1px, transparent 1px), linear-gradient(90deg, #dde8f5 1px, transparent 1px)',
                    backgroundSize: '25px 25px'
                }}
            >
                <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
                    <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="size-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Không thể tải bài thi</h2>
                    <p className="text-slate-500">
                        Vui lòng đảm bảo bộ thẻ của bạn có ít nhất 4 thẻ để tạo bài trắc nghiệm.
                    </p>
                    <Button className="mt-4 bg-[#00d26a] hover:bg-[#00b35a] text-white" onClick={() => router.push(`/dashboard/study-sets/${setId}`)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại bộ thẻ
                    </Button>
                </div>
            </div>
        );
    }

const TestResultScreen = ({ score, total, restart, setId, router }: { score: number, total: number, restart: () => void, setId: string, router: any }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const percentage = Math.round((score / total) * 100);

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const myConfetti = confetti.create(canvasRef.current, {
            resize: true,
            useWorker: true
        });

        const timer = setTimeout(() => {
            // Play sound
            const audio = new Audio('/freesound_community-piglevelwin2mp3-14800.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio playback failed:", e));

            // Confetti effect
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                myConfetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.5 },
                    colors: ['#00e676', '#3b82f6', '#f59e0b']
                });
                myConfetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.5 },
                    colors: ['#00e676', '#3b82f6', '#f59e0b']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div 
            className="min-h-screen flex flex-col p-4 md:p-8 w-full overflow-x-hidden bg-[#eef4ff] font-['Inter',_'Noto_Sans_JP',_sans-serif]" 
            style={{ 
                backgroundImage: 'linear-gradient(#dde8f5 1px, transparent 1px), linear-gradient(90deg, #dde8f5 1px, transparent 1px)',
                backgroundSize: '25px 25px'
            }}
        >
            <div className="w-full max-w-4xl mx-auto space-y-12 pb-20 mt-4 md:mt-12 flex-1 flex flex-col justify-start">
                <section className="w-full bg-[#242c42] rounded-3xl shadow-2xl overflow-hidden flex flex-col p-10 md:p-14 text-white relative border border-white/5">
                    
                    {/* Local Canvas for Confetti */}
                    <canvas 
                        ref={canvasRef} 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    />

                    <div className="flex justify-between items-start mb-16 relative z-10 w-full">
                        <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-wide text-white">
                            Tuyệt vời! Bạn đã hoàn thành bài kiểm tra.
                        </h2>
                        <span className="text-5xl ml-4 drop-shadow-lg">🏆</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        {/* Left Col: Stats */}
                        <div className="space-y-6">
                            <h3 className="text-slate-400 font-medium tracking-tight">Kết quả của bạn</h3>
                            
                            <div className="flex items-center space-x-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                                {/* Circular Progress */}
                                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                                        <circle 
                                            cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                            strokeDasharray="251.2" 
                                            strokeDashoffset={251.2 * (1 - percentage / 100)} 
                                            className="text-[#00e676] transition-all duration-1000 ease-out" 
                                        />
                                    </svg>
                                    <span className="absolute text-2xl font-black tracking-tight text-white">{percentage}%</span>
                                </div>
                                
                                <div className="space-y-3 flex-1">
                                    <div className="flex justify-between items-center bg-[#00e676]/10 px-4 py-2 rounded-lg">
                                        <span className="text-quiz-green font-bold">Chính xác</span>
                                        <span className="font-bold text-xl text-white">{score} / {total}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-2 opacity-60">
                                        <span className="text-slate-300 font-medium tracking-wide">Trạng thái</span>
                                        <span className="font-bold text-white uppercase text-xs text-right">Hoàn tất</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Actions */}
                        <div className="space-y-6">
                            <h3 className="text-slate-400 font-medium">Bước tiếp theo</h3>
                            <div className="flex flex-col gap-4">
                                <Button className="h-14 text-lg font-bold rounded-xl bg-[#00d26a] hover:bg-[#00b35a] text-white shadow-xl shadow-[#00d26a]/10" onClick={restart}>
                                    <RefreshCw className="mr-3 size-5" /> THỬ LẠI
                                </Button>
                                <Button variant="outline" className="h-14 text-lg font-bold rounded-xl border-white/10 text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => router.push(`/dashboard/study-sets/${setId}`)}>
                                    <ChevronLeft className="mr-3 size-5" /> KẾT THÚC
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <StudyModeSelection selectedSetId={setId} selectedCount={total} activeMode="test" />
            </div>
        </div>
    );
};

if (testFinished) {
    return (
        <TestResultScreen 
            score={score} 
            total={questions.length} 
            restart={restart} 
            setId={setId} 
            router={router} 
        />
    );
}

    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div 
            className="min-h-screen flex flex-col items-center p-4 md:p-8 w-full overflow-x-hidden bg-[#eef4ff] font-['Inter',_'Noto_Sans_JP',_sans-serif]" 
            style={{ 
                backgroundImage: 'linear-gradient(#dde8f5 1px, transparent 1px), linear-gradient(90deg, #dde8f5 1px, transparent 1px)',
                backgroundSize: '25px 25px'
            }}
            data-purpose="quiz-page"
        >
            <div className="w-full max-w-5xl mx-auto flex flex-col space-y-4">
                
                {/* Top Navigation (Outside Card) */}
                <div className="flex justify-between items-center text-slate-500 font-medium px-2">
                    <button 
                        onClick={() => router.push(`/dashboard/study-sets/${setId}`)}
                        className="flex items-center gap-2 hover:text-slate-800 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>Quay lại</span>
                    </button>
                    <div className="text-sm font-semibold">
                        {currentIndex + 1} / {questions.length}
                    </div>
                </div>

                {/* Progress Bar (Outside Card, Above Header) */}
                <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden mb-2">
                    <div 
                        className="h-full bg-quiz-green transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* BEGIN: MainQuizCard */}
                <main className="w-full bg-[#2c3652] rounded-[2rem] shadow-2xl p-8 md:p-12 relative overflow-hidden flex flex-col min-h-[600px] text-white" data-purpose="quiz-card">
                    {/* BEGIN: Card Header */}
                    <header className="flex justify-between items-center mb-16 relative z-10 w-full px-2">
                        {/* Left side: Label */}
                        <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5" data-purpose="quiz-label">
                            <span className="text-xl">🎯</span>
                            <span className="text-[#00e676] font-bold text-lg tracking-wide">Trắc nghiệm</span>
                        </div>
                    </header>
                    {/* END: Card Header */}

                    {/* Question Section */}
                    <section className="text-center mb-16 flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500 relative z-10 w-full" data-purpose="question-display">
                        <h1 className="text-4xl md:text-5xl font-medium mb-6 tracking-wide text-white px-4 leading-snug max-w-4xl mx-auto">
                            {currentQuestion?.question}
                        </h1>
                        <div className="flex flex-col items-center">
                            {currentQuestion?.phonetic && (
                                <span className="text-blue-400 font-medium text-[15px] uppercase tracking-widest mb-2">
                                    {currentQuestion.phonetic}
                                </span>
                            )}
                            {currentQuestion?.hint && (
                                <span className="text-slate-400 text-[15px]">
                                    {currentQuestion.hint}
                                </span>
                            )}
                        </div>
                    </section>

                    {/* BEGIN: AnswerOptions */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10 w-full px-4" data-purpose="answer-options">
                        {currentQuestion?.options.map((option, idx) => {
                            const isSelected = selectedOption === option;
                            const isCorrectAnswer = isAnswered && option === currentQuestion.answer;
                            const isWrongSelection = isAnswered && isSelected && !isCorrect;

                            let cardStyle = "p-6 rounded-[1rem] flex items-center group transition-all duration-200 text-left w-full h-[88px] border ";
                            
                            if (isAnswered) {
                                if (isCorrectAnswer) {
                                    cardStyle += "bg-quiz-green/20 border-quiz-green ring-2 ring-quiz-green/20";
                                } else if (isWrongSelection) {
                                    cardStyle += "bg-red-500/20 border-red-500 ring-2 ring-red-500/20";
                                } else {
                                    cardStyle += "bg-white/5 border-white/10 opacity-40";
                                }
                            } else {
                                cardStyle += "bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20 active:scale-[0.99]";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={isAnswered}
                                    className={cardStyle}
                                >
                                    <span className={`font-bold mr-6 transition-colors text-lg ${
                                        isAnswered && (isCorrectAnswer || isWrongSelection) ? 'text-white' : 'text-slate-500 group-hover:text-white'
                                    }`}>
                                        {idx + 1}
                                    </span>
                                    <span className={`text-2xl font-normal tracking-wide flex-1 ${
                                        isAnswered && isCorrectAnswer ? 'text-[#00d26a] font-bold' : isAnswered && isWrongSelection ? 'text-red-400 font-bold' : 'text-white drop-shadow-sm'
                                    }`}>
                                        {option}
                                    </span>
                                </button>
                            );
                        })}
                    </section>
                    {/* END: AnswerOptions */}

                    {/* BEGIN: FooterActions */}
                    <footer className="flex justify-between items-center mt-auto pt-6 relative z-10 w-full px-4 min-h-[50px]">
                        <div className="flex-1">
                            {isAnswered && (
                                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                                    <span className={`font-bold uppercase tracking-widest text-sm ${isCorrect ? 'text-quiz-green' : 'text-red-400'}`}>
                                        {isCorrect ? 'Chính xác!' : `Đáp án: ${currentQuestion?.answer}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center">
                            {!isAnswered ? (
                                <button className="flex items-center text-slate-400 hover:text-white transition text-sm font-medium group">
                                    <ExternalLink className="h-4 w-4 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    <span>Bạn không biết?</span>
                                </button>
                            ) : (
                                <Button 
                                    onClick={nextQuestion}
                                    className="bg-quiz-green hover:bg-[#00b35a] text-white font-bold px-8 py-5 rounded-xl flex items-center gap-2 group shadow-xl transition-all"
                                >
                                    {currentIndex === questions.length - 1 ? 'XEM KẾT QUẢ' : 'TIẾP THEO'}
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            )}
                        </div>
                    </footer>
                    {/* END: FooterActions */}
                </main>
                {/* END: MainQuizCard */}

                {/* Keyboard Shortcut Info - Styled outside the card */}
                <div className="mt-6 text-center text-slate-500 text-sm font-medium tracking-tight">
                    Nhấn <span className="bg-white/60 px-2 py-1 rounded-sm text-slate-600 font-mono text-[11px] mx-1 border border-slate-200 shadow-sm">1-4</span> để chọn, 
                    <span className="bg-white/60 px-2 py-1 rounded-sm text-slate-600 font-mono text-[11px] mx-1 border border-slate-200 shadow-sm">Space</span> để tiếp tục
                </div>

                {/* Reusable Mode Selection */}
                <div className="pt-8 max-w-4xl mx-auto w-full">
                    <StudyModeSelection selectedSetId={setId} selectedCount={questions.length} activeMode="test" />
                </div>
                
                <footer className="py-8 text-center text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">
                    © 2026 TORII LEARNING SYSTEM
                </footer>
            </div>
        </div>
    );
}

