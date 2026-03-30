"use client"

import * as React from "react"
import {
    Languages,
    ArrowRightLeft,
    Volume2,
    Copy,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Check,
    ArrowRight,
    ArrowDown,
    X,
    ChevronDown,
    Search
} from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Card, CardContent } from "@workspace/ui/components/card"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentTranslateResponseDTO, AgentGrammarCheckResponseDTO } from "@workspace/schemas"
import { Spinner } from "@workspace/ui/components/spinner"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "sonner"

export function TranslatorView() {
    const [sourceText, setSourceText] = React.useState("")
    const [targetText, setTargetText] = React.useState("")
    const [sourceLang, setSourceLang] = React.useState("ja")
    const [targetLang, setTargetLang] = React.useState("vi")
    const [isTranslating, setIsTranslating] = React.useState(false)
    const [isCheckingGrammar, setIsCheckingGrammar] = React.useState(false)
    const [translationResult, setTranslationResult] = React.useState<AgentTranslateResponseDTO | null>(null)
    const [grammarResult, setGrammarResult] = React.useState<AgentGrammarCheckResponseDTO | null>(null)

    const handleSourceLangChange = (value: string) => {
        if (value === targetLang) {
            setTargetLang(sourceLang)
            setSourceText(targetText)
            setTargetText(sourceText)
        }
        setSourceLang(value)
    }

    const handleTargetLangChange = (value: string) => {
        if (value === sourceLang) {
            setSourceLang(targetLang)
            setSourceText(targetText)
            setTargetText(sourceText)
        }
        setTargetLang(value)
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        if (value.length <= 5000) {
            setSourceText(value)
        } else {
            setSourceText(value.slice(0, 5000))
            toast.error("Vượt quá giới hạn 5000 ký tự")
        }
    }

    const handleTranslate = async () => {
        if (!sourceText.trim()) return
        setIsTranslating(true)
        setGrammarResult(null) // Clear old check results
        try {
            const res = await agentApi.sensei.translate(sourceText, sourceLang, targetLang)
            setTargetText(res.translatedText)
            setTranslationResult(res)
        } catch (error) {
            toast.error("Không thể dịch văn bản")
        } finally {
            setIsTranslating(false)
        }
    }

    const handleGrammarCheck = async () => {
        if (!sourceText.trim()) return
        setIsCheckingGrammar(true)
        try {
            const res = await agentApi.sensei.checkGrammar(sourceText)
            setGrammarResult(res)
        } catch (error) {
            toast.error("Không thể kiểm tra ngữ pháp")
        } finally {
            setIsCheckingGrammar(false)
        }
    }

    const swapLanguages = () => {
        setSourceLang(targetLang)
        setTargetLang(sourceLang)
        setSourceText(targetText)
        setTargetText(sourceText)
    }

    const handleSpeak = (text: string, lang: string) => {
        if (!text) return
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Map language codes to supported speech synthesis locales
        const langMap: Record<string, string> = {
            'ja': 'ja-JP',
            'vi': 'vi-VN',
            'en': 'en-US'
        }
        
        utterance.lang = langMap[lang] || lang
        window.speechSynthesis.speak(utterance)
    }

    return (
        <div className="w-full space-y-6">
            {/* Language Selector Bar */}
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
                <Select value={sourceLang} onValueChange={handleSourceLangChange}>
                    <SelectTrigger className="w-[140px] border-none shadow-none font-medium h-9 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={swapLanguages}>
                    <ArrowRightLeft className="size-4" />
                </Button>
                <Select value={targetLang} onValueChange={handleTargetLangChange}>
                    <SelectTrigger className="w-[140px] border-none shadow-none font-medium h-9 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Translation Layout (2 Columns) */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Source Input */}
                <div className="bg-background rounded-2xl border border-border overflow-hidden group relative">
                    <div className="flex flex-col h-[320px]">
                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar relative">
                            {sourceText && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-full z-10 transition-colors" 
                                    onClick={() => setSourceText("")}
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                            <Textarea
                                value={sourceText}
                                onChange={handleTextChange}
                                placeholder="Nhập văn bản cần dịch..."
                                className="min-h-full border-none focus-visible:ring-0 p-0 pr-10 text-xl resize-none shadow-none leading-relaxed bg-transparent"
                            />
                        </div>
                        <div className="p-4 border-t bg-muted/20 flex items-center justify-between shrink-0">
                            <div className="flex gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground"
                                    onClick={() => handleSpeak(sourceText, sourceLang)}
                                    disabled={!sourceText}
                                >
                                    <Volume2 className="size-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "text-[10px] font-medium uppercase tracking-wider",
                                    sourceText.length >= 5000 ? "text-destructive" : "text-muted-foreground"
                                )}>
                                    {sourceText.length}/5000
                                </span>
                                <Button size="sm" onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating} className="font-bold">
                                    {isTranslating ? <Spinner className="size-3 mr-2" /> : <Languages className="size-3 mr-2" />}
                                    Dịch
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Target Output */}
                <div className="bg-background rounded-2xl border border-border/100 overflow-hidden">
                    <div className="flex flex-col h-[320px]">
                        <div className="p-4 flex-1 text-xl font-medium leading-relaxed overflow-y-auto custom-scrollbar">
                            {isTranslating ? (
                                <div className="space-y-4 pt-2">
                                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                                    <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
                                </div>
                            ) : (
                                targetText || <span className="text-muted-foreground/30 font-normal italic">Kết quả dịch...</span>
                            )}
                        </div>
                        <div className="p-4 border-t border-border/30 flex items-center justify-between shrink-0">
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => navigator.clipboard.writeText(targetText)} disabled={!targetText}><Copy className="size-4" /></Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground" 
                                    onClick={() => handleSpeak(targetText, targetLang)}
                                    disabled={!targetText}
                                >
                                    <Volume2 className="size-4" />
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Grammar Section */}
            {targetText && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-primary flex items-center gap-2">
                                    <Sparkles className="size-4" />
                                    Kiểm tra ngữ pháp Nhật ngữ
                                </h3>
                                <p className="text-muted-foreground text-sm">Phát hiện lỗi sai và gợi ý cách dùng từ tự nhiên hơn cho câu văn này.</p>
                            </div>
                            <Button
                                className="font-bold px-8 gap-2"
                                onClick={handleGrammarCheck}
                                disabled={isCheckingGrammar}
                            >
                                {isCheckingGrammar ? <Spinner className="size-4" /> : <Search className="size-4" />}
                                Phân tích ngữ pháp
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Detailed Grammar Analysis Result */}
            {grammarResult && (
                <Card className="shadow-none border-border animate-in zoom-in-95 duration-500 overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {grammarResult.isCorrect ? (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white uppercase tracking-widest text-[9px] font-bold">Chính xác</Badge>
                                ) : (
                                    <Badge variant="destructive" className="uppercase tracking-widest text-[9px] font-bold">Cần lưu ý</Badge>
                                )}
                                <span className="font-bold text-lg">Phân tích chi tiết ngữ pháp</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setGrammarResult(null)} className="h-8 w-8"><X className="size-4" /></Button>
                        </div>

                        {/* Comparison box */}
                        <div className="grid sm:grid-cols-[1fr,32px,1fr] gap-4 items-center">
                            <div className="p-5 rounded-lg bg-muted/30 border border-border space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Câu văn gốc</p>
                                <p className="text-lg font-medium leading-relaxed">{grammarResult.originalText}</p>
                            </div>
                            <div className="flex justify-center opacity-30">
                                <ArrowRight className="size-5 hidden sm:block" />
                                <ArrowDown className="size-5 sm:hidden" />
                            </div>
                            <div className="p-5 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Đề xuất hoàn thiện</p>
                                <p className="text-lg font-bold leading-relaxed text-primary">{grammarResult.correctedText}</p>
                            </div>
                        </div>

                        {/* Errors List */}
                        {grammarResult.errors.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Danh sách chỉnh sửa</p>
                                <div className="grid gap-3">
                                    {grammarResult.errors.map((error, idx) => (
                                        <div key={idx} className="flex gap-4 p-5 rounded-lg bg-card border hover:border-primary/30 transition-all">
                                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-2 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="font-bold text-muted-foreground line-through decoration-destructive/30">{error.issue}</span>
                                                    <ArrowRight className="size-4 text-muted-foreground" />
                                                    <span className="font-bold text-primary text-lg">{error.correction}</span>
                                                    <Badge variant="outline" className="text-[9px] px-2 uppercase font-bold tracking-wider">{error.type}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground italic leading-relaxed break-words">{error.explanation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {grammarResult.suggestions.length > 0 && (
                            <div className="pt-4 border-t space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cách diễn đạt khác</p>
                                <div className="flex flex-wrap gap-2">
                                    {grammarResult.suggestions.map((s, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1.5 font-medium rounded-md text-sm bg-transparent border flex items-center gap-2">
                                            <Check className="size-3 text-primary" />
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}
