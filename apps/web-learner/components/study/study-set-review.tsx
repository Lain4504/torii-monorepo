'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyStudyCards as useStudyCards, useReviewAcademyCard as useReviewCard } from '@/lib/api/services/academy-study-set-api';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, CheckCircle2, RefreshCw, X, Check, Bot, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { StudyModeSelection } from './study-mode-selection';
import confetti from 'canvas-confetti';
import { useRef } from 'react';

export function StudySetReview({ setId }: { setId: string }) {
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isStarred, setIsStarred] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [displayCards, setDisplayCards] = useState<any[]>([]);
    const [languageMode, setLanguageMode] = useState<'JP->VI' | 'VI->JP'>('JP->VI');
    const [isInitialized, setIsInitialized] = useState(false);

    // Reset state when switching between study sets
    useEffect(() => {
        setIsInitialized(false);
        setCurrentIndex(0);
        setShowAnswer(false);
    }, [setId]);

    // Fetch all cards due for review
    const { data: cards, isLoading, isError, refetch } = useStudyCards(setId);

    useEffect(() => {
        // Only load the card list once from the server to initialize the session.
        // This prevents the list from being cleared if the background API 
        // refresh returns an empty set (0 cards due) while we are in the session.
        if (cards && !isInitialized) {
            setDisplayCards(cards);
            setIsInitialized(true);
        }
    }, [cards, isInitialized]);

    const handleShuffle = () => {
        if (!displayCards.length) return;
        const shuffled = [...displayCards].sort(() => Math.random() - 0.5);
        setDisplayCards(shuffled);
        setCurrentIndex(0);
        setShowAnswer(false);
        toast.success('Đã trộn ngẫu nhiên bộ thẻ!');
    };

    const reviewMutation = useReviewCard();

    const handleRating = async (quality: number) => {
        if (!displayCards || !displayCards[currentIndex]) return;
        try {
            await reviewMutation.mutateAsync({
                cardId: displayCards[currentIndex].id,
                payload: { quality }
            });
            setShowAnswer(false);
            setDirection('forward');
            setCurrentIndex(prev => prev + 1);
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi lưu kết quả ôn tập');
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLoading || !displayCards.length || currentIndex >= displayCards.length) return;

            const key = e.key;
            const keyLower = key.toLowerCase();

            // Toggle Answer (Space, ArrowUp, ArrowDown)
            if (keyLower === ' ' || key === 'ArrowUp' || key === 'ArrowDown') {
                e.preventDefault();
                setShowAnswer(prev => !prev);
            } 
            // Rate Known (Z, 2)
            else if (keyLower === 'z' || key === '2') {
                handleRating(1);
            } 
            // Rate Unknown (X, 1)
            else if (keyLower === 'x' || key === '1') {
                handleRating(0);
            } 
            // Navigate Back (ArrowLeft)
            else if (key === 'ArrowLeft') {
                if (currentIndex > 0) {
                    setCurrentIndex(prev => prev - 1);
                    setShowAnswer(false);
                }
            } 
            // Navigate Forward (ArrowRight)
            else if (key === 'ArrowRight') {
                if (!showAnswer) {
                    setShowAnswer(true);
                } else if (currentIndex < displayCards.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setShowAnswer(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLoading, displayCards, currentIndex, showAnswer, handleRating]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-[#313a4f] rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="text-gray-400 animate-pulse">Đang tải thẻ ôn tập...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 h-full bg-[#313a4f] rounded-2xl text-white">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                    <X className="size-10" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold">Lỗi tải dữ liệu</h2>
                <p className="text-gray-400 max-w-sm text-center">
                    Không thể tải các thẻ ôn tập vào lúc này. Vui lòng thử lại.
                </p>
                <div className="flex gap-4 mt-8">
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => router.push(`/dashboard/study-sets/${setId}`)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Về bộ thẻ
                    </Button>
                    <Button className="bg-white text-[#313a4f] hover:bg-white/90" onClick={() => refetch()}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    const currentCard = displayCards?.[currentIndex];

    if (!displayCards || displayCards.length === 0 || currentIndex >= displayCards.length) {
        return (
            <ReviewCompletionScreen 
                displayCards={displayCards} 
                setId={setId} 
                refetch={refetch} 
                setCurrentIndex={setCurrentIndex} 
                setShowAnswer={setShowAnswer}
            />
        );
    }

    return (
        <div 
            className="min-h-screen flex flex-col p-4 md:p-8 w-full overflow-x-hidden bg-[#eef4ff] font-['Inter',_'Noto_Sans_JP',_sans-serif]" 
            style={{ 
                backgroundImage: 'linear-gradient(#dde8f5 1px, transparent 1px), linear-gradient(90deg, #dde8f5 1px, transparent 1px)',
                backgroundSize: '25px 25px'
            }}
            data-purpose="review-page"
        >
            <div className="w-full max-w-4xl mx-auto space-y-12 pb-20 mt-4 md:mt-12 flex-1 flex flex-col justify-start">
                <section className="w-full bg-[#313a4f] rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[500px] border border-[#2c3652]/20" data-purpose="flashcard-container">
            {/* Header Navigation */}
            <header className="flex justify-between items-center p-6 text-gray-400 border-b border-white/5">
                <button 
                    onClick={() => router.push(`/dashboard/study-sets/${setId}`)}
                    className="flex items-center space-x-2 hover:text-white transition-colors group"
                >
                    <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Quay lại</span>
                </button>
                <button 
                    onClick={() => setIsStarred(!isStarred)}
                    className={`transition-colors ${isStarred ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                >
                    <svg className={`h-6 w-6 ${isStarred ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                </button>
            </header>

            {/* Main Card Content */}
            <main 
                className="flex-1 flex items-center justify-between px-6 relative py-12 cursor-pointer"
                onClick={() => setShowAnswer(!showAnswer)}
            >
                {/* Left Arrow (Previous - Mock placeholder) */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if(currentIndex > 0) {
                            setCurrentIndex(v => v - 1);
                            setShowAnswer(false);
                        }
                    }}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 transition-colors hidden md:block disabled:opacity-20"
                >
                    <ChevronLeft className="h-8 w-8" />
                </button>

                {/* Content Display */}
                <div className="flex-1 text-center px-4 animate-in fade-in zoom-in duration-300">
                    {!showAnswer ? (
                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-widest leading-tight">
                                {languageMode === 'JP->VI' ? currentCard.term : currentCard.definition}
                            </h1>
                            {currentCard.hint && (
                                <p className="text-gray-400 text-lg italic bg-white/5 inline-block px-4 py-2 rounded-lg">
                                    Gợi ý: {currentCard.hint}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                            <p className="text-gray-500 uppercase tracking-[0.3em] font-black text-sm">
                                {languageMode === 'JP->VI' ? 'Định nghĩa' : 'Thuật ngữ (JP)'}
                            </p>
                            <h2 className="text-4xl md:text-6xl font-bold text-white leading-relaxed">
                                {languageMode === 'JP->VI' ? currentCard.definition : currentCard.term}
                            </h2>
                            <p className="text-blue-400 font-medium text-lg border-t border-white/10 pt-6 inline-block">
                                Gốc: {languageMode === 'JP->VI' ? currentCard.term : currentCard.definition}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Arrow (Next - Mock placeholder) */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if(currentIndex < displayCards.length - 1) {
                            setCurrentIndex(v => v + 1);
                            setShowAnswer(false);
                        }
                    }}
                    disabled={currentIndex === displayCards.length - 1}
                    className="p-3 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 transition-colors hidden md:block disabled:opacity-20"
                >
                    <svg className="h-8 w-8 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                </button>
            </main>

            {/* Keyboard Shortcuts Bar */}
            <div className="bg-[#3a445d] py-3 px-6 flex justify-center items-center space-x-6 text-xs text-gray-300 border-y border-white/5">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                        <kbd className="bg-gray-600 px-2 py-1 rounded text-white font-mono shadow-sm">Space / ↑ / ↓</kbd> 
                        <span className="text-gray-400">lật</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <kbd className="bg-gray-600 px-2 py-1 rounded text-white font-mono shadow-sm">Z / 2</kbd> 
                        <span className="text-gray-400 font-bold text-green-400">biết</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <kbd className="bg-gray-600 px-2 py-1 rounded text-white font-mono shadow-sm">X / 1</kbd> 
                        <span className="text-gray-400 font-bold text-red-400">chưa biết</span>
                    </div>
                </div>
            </div>

            {/* Footer Controls */}
            <footer className="bg-[#212a3e] p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button 
                        className="text-gray-400 hover:text-white transition-colors p-2" 
                        onClick={() => {
                            setIsInitialized(false);
                            refetch();
                        }}
                        title="Tải lại"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button 
                        className="text-gray-400 hover:text-white transition-colors p-2" 
                        onClick={handleShuffle}
                        title="Trộn thẻ"
                    >
                        <Shuffle className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex items-center space-x-8">
                    {/* Dislike/Wrong Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleRating(0); }}
                        disabled={reviewMutation.isPending}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-red-900/20 text-red-500 border border-red-500/20 hover:bg-red-800/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <X className="h-7 w-7" strokeWidth={3} />
                    </button>

                    {/* Progress Indicator */}
                    <div className="flex flex-col items-center">
                        <span className="text-white font-black text-xl tracking-tighter">
                            {currentIndex + 1} <span className="text-gray-500 font-normal mx-1">/</span> {displayCards.length}
                        </span>
                        <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-500" 
                                style={{ width: `${((currentIndex + 1) / displayCards.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Like/Correct Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleRating(1); }}
                        disabled={reviewMutation.isPending}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-green-900/20 text-green-500 border border-green-500/20 hover:bg-green-800/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Check className="h-7 w-7" strokeWidth={3} />
                    </button>
                </div>

                <div className="flex items-center space-x-3 text-gray-400">
                    <button 
                        onClick={() => setLanguageMode(prev => prev === 'JP->VI' ? 'VI->JP' : 'JP->VI')}
                        className={`flex items-center px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-colors border ${
                            languageMode === 'VI->JP' 
                                ? 'bg-blue-600 border-blue-500 text-white' 
                                : 'bg-gray-700/50 border-white/5 hover:text-white'
                        }`}
                    >
                        {languageMode}
                    </button>
                    <button className="hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                        <Bot className="h-5 w-5" />
                    </button>
                </div>
            </footer>
        </section>

        {/* Additional Mode Selection */}
        <StudyModeSelection selectedSetId={setId} selectedCount={displayCards.length} activeMode="review" />
        </div>
    </div>
);
}

// Extracted to avoid calling hooks conditionally
function ReviewCompletionScreen({ 
    displayCards, 
    setId, 
    refetch, 
    setCurrentIndex,
    setShowAnswer
}: { 
    displayCards: any[], 
    setId: string, 
    refetch: any, 
    setCurrentIndex: any,
    setShowAnswer: any
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Only trigger fireworks and sound if the user actually completed cards in this session
        if (!displayCards || displayCards.length === 0 || setCurrentIndex === undefined || !canvasRef.current) return;
        
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
        }, 500); // Small delay so the screen is visible first

        return () => clearTimeout(timer);
    }, [displayCards]);

    return (
        <div 
            className="min-h-screen flex flex-col p-4 md:p-8 w-full overflow-x-hidden bg-[#eef4ff] font-['Inter',_'Noto_Sans_JP',_sans-serif]" 
            style={{ 
                backgroundImage: 'linear-gradient(#dde8f5 1px, transparent 1px), linear-gradient(90deg, #dde8f5 1px, transparent 1px)',
                backgroundSize: '25px 25px'
            }}
        >
            <div className="w-full max-w-4xl mx-auto space-y-12 pb-20 mt-4 md:mt-12 flex-1 flex flex-col justify-start">
                
                {/* Completion Card */}
                <section className="w-full bg-[#242c42] rounded-2xl shadow-xl overflow-hidden flex flex-col p-10 md:p-14 text-white relative border border-white/5">
                    
                    {/* Local Canvas for Confetti */}
                    <canvas 
                        ref={canvasRef} 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-16 relative z-10 w-full">
                        <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-wide text-white">
                            Chúc mừng! Bạn đã ôn tập tất cả các thẻ.
                        </h2>
                        <span className="text-5xl ml-4 drop-shadow-lg">🎉</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        {/* Left Col: Stats */}
                        <div className="space-y-6">
                            <h3 className="text-slate-400 font-medium tracking-tight">Tiến độ của bạn</h3>
                            
                            <div className="flex items-center space-x-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                                {/* Circular Progress (100%) */}
                                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="0" className="text-[#00e676] transition-all duration-1000 ease-out" />
                                    </svg>
                                    <span className="absolute text-xl font-bold tracking-tight text-white">100%</span>
                                </div>
                                
                                <div className="space-y-3 flex-1">
                                    <div className="flex justify-between items-center bg-[#00e676]/10 px-4 py-2 rounded-lg">
                                        <span className="text-quiz-green font-bold">Hoàn thành</span>
                                        <span className="font-bold text-lg text-white">{displayCards?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-2 opacity-60">
                                        <span className="text-slate-300 font-medium">Còn lại</span>
                                        <span className="font-bold text-lg text-white">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Actions */}
                        <div className="space-y-6">
                            <h3 className="text-slate-400 font-medium tracking-tight">Bước tiếp theo</h3>
                            <button 
                                onClick={() => {
                                    setShowAnswer(false);
                                    setCurrentIndex(0);
                                    // Removed refetch() because if all cards are reviewed, 
                                    // refetch would return an empty list and keep us on this screen.
                                    toast.success('Đã học lại bộ thẻ này');
                                }}
                                className="w-full py-4 rounded-xl border-2 border-slate-600 hover:border-slate-400 text-white font-bold tracking-wide transition-all hover:bg-white/5 uppercase"
                            >
                                Đặt lại Thẻ ghi nhớ
                            </button>
                        </div>
                    </div>

                    {/* Footer Link */}
                    <div className="mt-16 pt-8 border-t border-white/10 flex relative z-10 w-full">
                        <button 
                            onClick={() => {
                                if (displayCards && displayCards.length > 0) {
                                    setCurrentIndex(displayCards.length - 1);
                                }
                            }}
                            className="flex items-center text-slate-400 hover:text-white transition-colors font-medium text-sm"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Quay lại thẻ cuối cùng
                        </button>
                    </div>
                </section>

                <StudyModeSelection selectedSetId={setId} selectedCount={displayCards?.length || 0} activeMode="review" />
            </div>
        </div>
    );
}
