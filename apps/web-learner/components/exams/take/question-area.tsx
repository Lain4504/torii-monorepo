'use client'

import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Flag, ArrowLeft, ArrowRight, Play, Pause } from "lucide-react"
import { useState, useRef } from 'react'

export interface Question {
    id: string
    content: string
    type: 'single' | 'listening' | 'reading'
    audioUrl?: string
    readingPassage?: string
    options: { id: string; label: string }[]
}

interface QuestionAreaProps {
    question: Question
    selectedOption?: string
    isFlagged: boolean
    onAnswer: (questionId: string, optionId: string) => void
    onFlag: (questionId: string) => void
    onNext: () => void
    onPrev: () => void
    isFirst: boolean
    isLast: boolean
}

export function QuestionArea({
    question,
    selectedOption,
    isFlagged,
    onAnswer,
    onFlag,
    onNext,
    onPrev,
    isFirst,
    isLast
}: QuestionAreaProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const toggleAudio = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    return (
        <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Listening Section */}
            {question.type === 'listening' && question.audioUrl && (
                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl flex items-center gap-4">
                    <Button
                        size="icon"
                        className="h-12 w-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={toggleAudio}
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </Button>
                    <div className="flex-1">
                        <div className="h-1 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 w-1/3 animate-pulse" />
                        </div>
                    </div>
                    <audio
                        ref={audioRef}
                        src={question.audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                    />
                </div>
            )}

            {/* Reading Passage */}
            {question.type === 'reading' && question.readingPassage && (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl prose dark:prose-invert max-w-none">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Đọc đoạn văn sau</h4>
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {question.readingPassage}
                    </p>
                </div>
            )}

            {/* Question Content */}
            <div>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white leading-relaxed mb-6">
                    {question.content}
                </h2>

                <RadioGroup
                    value={selectedOption}
                    onValueChange={(val) => onAnswer(question.id, val)}
                    className="space-y-4"
                >
                    {question.options.map((opt) => (
                        <div
                            key={opt.id}
                            className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${selectedOption === opt.id
                                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-1 ring-teal-500"
                                : "border-slate-200 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 bg-white dark:bg-slate-900"
                                }`}
                            onClick={() => onAnswer(question.id, opt.id)}
                        >
                            <RadioGroupItem value={opt.id} id={opt.id} className="text-teal-600 border-slate-400" />
                            <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-medium text-slate-700 dark:text-slate-300 text-base">
                                {opt.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                <Button
                    variant="ghost"
                    onClick={onPrev}
                    disabled={isFirst}
                    className="text-slate-500"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Câu trước
                </Button>

                <Button
                    variant={isFlagged ? "secondary" : "ghost"}
                    className={isFlagged ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "text-slate-500 hover:text-orange-600 hover:bg-orange-50"}
                    onClick={() => onFlag(question.id)}
                >
                    <Flag className={`w-4 h-4 mr-2 ${isFlagged ? "fill-current" : ""}`} />
                    {isFlagged ? "Đã đánh dấu" : "Đánh dấu xem lại"}
                </Button>

                <Button
                    onClick={onNext}
                    className="bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
                >
                    {isLast ? "Nộp bài" : "Câu tiếp"}
                    {!isLast && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
            </div>
        </div>
    )
}
