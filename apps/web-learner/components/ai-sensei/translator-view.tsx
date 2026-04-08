"use client"

import * as React from "react"
import {
    Languages,
    ArrowRightLeft,
    Volume2,
    Copy,
    Sparkles,
    Check,
    ArrowRight,
    ArrowDown,
    X,
    Search,
    History,
    RefreshCw
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
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardFooter,
    CardDescription 
} from "@workspace/ui/components/card"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentTranslateResponseDTO, AgentGrammarCheckResponseDTO } from "@workspace/schemas"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "sonner"

const LANGUAGES = [
    { value: "ja", label: "Tiếng Nhật", flag: "🇯🇵" },
    { value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { value: "en", label: "Tiếng Anh", flag: "🇺🇸" },
]

export function TranslatorView() {
    const [sourceText, setSourceText] = React.useState("")
    const [targetText, setTargetText] = React.useState("")
    const [sourceLang, setSourceLang] = React.useState("ja")
    const [targetLang, setTargetLang] = React.useState("vi")
    const [isTranslating, setIsTranslating] = React.useState(false)
    const [isCheckingGrammar, setIsCheckingGrammar] = React.useState(false)
    const [grammarResult, setGrammarResult] = React.useState<AgentGrammarCheckResponseDTO | null>(null)

    const handleSourceLangChange = (value: string) => {
        if (value === targetLang) {
            setTargetLang(sourceLang)
        }
        setSourceLang(value)
    }

    const handleTargetLangChange = (value: string) => {
        if (value === sourceLang) {
            setSourceLang(targetLang)
        }
        setTargetLang(value)
    }

    const swapLanguages = () => {
        setSourceLang(targetLang)
        setTargetLang(sourceLang)
        setSourceText(targetText)
        setTargetText(sourceText)
    }

    const handleTranslate = async () => {
        if (!sourceText.trim()) return
        setIsTranslating(true)
        setGrammarResult(null)
        try {
            const res = await agentApi.sensei.translate(sourceText, sourceLang, targetLang)
            setTargetText(res.translatedText)
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

    const handleSpeak = (text: string, langCode: string) => {
        if (!text) return
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        const langMap: Record<string, string> = { 'ja': 'ja-JP', 'vi': 'vi-VN', 'en': 'en-US' }
        utterance.lang = langMap[langCode] || langCode
        window.speechSynthesis.speak(utterance)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Đã sao chép")
    }

    return (
        <div className="w-full space-y-4 px-4 pb-8 max-w-full overflow-x-hidden">
            {/* Language Selection Bar - Responsive */}
            <div className="flex w-full items-center gap-1.5 sm:gap-3 bg-card p-1 rounded-lg border border-border mx-auto shadow-sm overflow-hidden">
                <Select value={sourceLang} onValueChange={handleSourceLangChange}>
                    <SelectTrigger className="flex-1 min-w-0 w-full border-none bg-transparent h-8 text-[10px] sm:text-xs font-bold ring-0 focus:ring-0 sm:w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {LANGUAGES.map(lang => (
                            <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                {lang.flag} {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary shrink-0" onClick={swapLanguages}>
                    <ArrowRightLeft className="size-3.5" />
                </Button>

                <Select value={targetLang} onValueChange={handleTargetLangChange}>
                    <SelectTrigger className="flex-1 min-w-0 w-full border-none bg-transparent h-8 text-[10px] sm:text-xs font-bold ring-0 focus:ring-0 sm:w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {LANGUAGES.map(lang => (
                            <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                {lang.flag} {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Translation Main Interface */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="flex flex-col border-border shadow-none bg-card rounded-xl overflow-hidden focus-within:border-primary/30 transition-all min-w-0">
                    <div className="flex-1 relative min-h-[160px] sm:min-h-[180px]">
                        <Textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value.slice(0, 5000))}
                            placeholder="Nhập nội dung..."
                            className="absolute inset-0 min-h-full border-none focus-visible:ring-0 p-4 sm:p-5 text-sm font-medium resize-none shadow-none bg-transparent leading-relaxed"
                        />
                    </div>
                    <div className="p-2 border-t border-border flex items-center justify-between bg-muted/5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleSpeak(sourceText, sourceLang)}
                            disabled={!sourceText}
                        >
                            <Volume2 className="size-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-muted-foreground/30 tabular-nums">{sourceText.length}/5000</span>
                            <Button onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating} className="h-8 rounded-lg px-3 sm:px-4 font-bold text-xs">
                                {isTranslating ? <Spinner className="size-3 mr-2" /> : <Languages className="size-3.5 mr-2" />}
                                Dịch ngay
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className={cn(
                    "flex flex-col border-border shadow-none bg-card rounded-xl relative overflow-hidden min-h-[160px] sm:min-h-[180px] min-w-0",
                    isTranslating && "opacity-60"
                )}>
                    <div className="p-4 sm:p-5 flex-1 text-sm font-bold leading-relaxed text-foreground break-words overflow-hidden">
                        {isTranslating ? (
                            <div className="space-y-4 pt-1">
                                <div className="h-3 bg-muted animate-pulse rounded-lg w-full" />
                                <div className="h-3 bg-muted animate-pulse rounded-lg w-3/4" />
                            </div>
                        ) : (
                            targetText || <span className="text-muted-foreground/20 italic font-medium">Bản dịch hiển thị ở đây...</span>
                        )}
                    </div>
                    <div className="p-2 border-t border-border flex items-center justify-end bg-muted/5 gap-1.5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground" 
                            onClick={() => copyToClipboard(targetText)} 
                            disabled={!targetText}
                        >
                            <Copy className="size-3.5" />
                        </Button>
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
                </Card>
            </div>

            {/* AI Grammar Analysis */}
            {targetText && (
                <div className="flex justify-center pt-2">
                    {!grammarResult && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-bold px-6 h-9 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all text-[11px]"
                            onClick={handleGrammarCheck}
                            disabled={isCheckingGrammar}
                        >
                            {isCheckingGrammar ? <Spinner className="size-3.5 mr-2" /> : <Sparkles className="size-3.5 mr-2" />}
                            Phân tích ngữ pháp AI
                        </Button>
                    )}
                </div>
            )}

            {grammarResult && (
                <Card className="border-border shadow-lg rounded-xl overflow-hidden bg-card animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-full min-w-0">
                    <div className="bg-muted/10 py-2 px-4 sm:px-5 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-3.5 text-primary" />
                            <h3 className="text-xs font-bold tracking-tight text-foreground">Phân tích Sensei AI</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setGrammarResult(null)} className="h-7 w-7 rounded-full">
                            <X className="size-3.5 opacity-40" />
                        </Button>
                    </div>
                    
                    <div className="p-4 sm:p-5 space-y-5 min-w-0 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3.5 rounded-lg bg-muted/20 border border-border min-w-0 overflow-hidden">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1.5 opacity-60">Gốc</p>
                                <p className="text-sm font-medium leading-relaxed break-words">{grammarResult.originalText}</p>
                            </div>
                            <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/10 min-w-0 overflow-hidden">
                                <p className="text-[9px] font-bold text-primary uppercase mb-1.5 opacity-60">Sửa</p>
                                <p className="text-sm font-bold text-primary leading-relaxed break-words">{grammarResult.correctedText}</p>
                            </div>
                        </div>

                        {grammarResult.errors.length > 0 && (
                            <div className="space-y-2.5">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Lỗi chi tiết</p>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {grammarResult.errors.map((error, idx) => (
                                        <div key={idx} className="p-3.5 rounded-lg bg-muted/10 border border-border leading-relaxed flex flex-col sm:flex-row gap-2 sm:gap-3.5 min-w-0 overflow-hidden">
                                            <div className="text-xs font-bold text-primary/40 shrink-0 hidden sm:block">{idx+1}.</div>
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 min-w-0">
                                                    <span className="line-through text-muted-foreground/40 text-[11px] sm:text-xs truncate max-w-[120px] sm:max-w-none">{error.issue}</span>
                                                    <ArrowRight className="size-3 text-muted-foreground/20" />
                                                    <span className="font-bold text-emerald-600 text-xs break-all">{error.correction}</span>
                                                </div>
                                                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium italic opacity-80 leading-normal">{error.explanation}</p>
                                            </div>
                                        </div>
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
