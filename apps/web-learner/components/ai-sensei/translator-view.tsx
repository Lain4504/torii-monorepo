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
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "sonner"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

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
    const [translationResult, setTranslationResult] = React.useState<AgentTranslateResponseDTO | null>(null)
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
        toast.success("Đã sao chép vào bộ nhớ tạm")
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 pb-12">
            {/* Language Selection Bar */}
            <div className="flex items-center justify-between gap-1 bg-card p-1.5 rounded-2xl border border-border/40 shadow-sm sm:max-w-md mx-auto">
                <Select value={sourceLang} onValueChange={handleSourceLangChange}>
                    <SelectTrigger className="flex-1 bg-muted/20 border-none font-bold text-xs h-10 rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LANGUAGES.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                                <span className="flex items-center gap-2">
                                    <span className="text-sm">{lang.flag}</span>
                                    {lang.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="shrink-0 hover:rotate-180 transition-transform duration-500 rounded-xl h-10 w-10 text-muted-foreground/40" onClick={swapLanguages}>
                    <ArrowRightLeft className="size-3.5" />
                </Button>

                <Select value={targetLang} onValueChange={handleTargetLangChange}>
                    <SelectTrigger className="flex-1 bg-muted/20 border-none font-bold text-xs h-10 rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LANGUAGES.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                                <span className="flex items-center gap-2">
                                    <span className="text-sm">{lang.flag}</span>
                                    {lang.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Translation Main Interface */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Source Input Card */}
                <Card className="flex flex-col shadow-none overflow-hidden border-border/40 rounded-2xl bg-card">
                    <CardHeader className="py-2.5 px-4 border-b border-border/20 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-[10px] font-bold flex items-center gap-2 text-muted-foreground/50">
                                <Languages className="size-3" />
                                {LANGUAGES.find(l => l.value === sourceLang)?.label}
                            </CardDescription>
                            {sourceText && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={() => setSourceText("")}>
                                    <X className="size-3" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative">
                        <Textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value.slice(0, 5000))}
                            placeholder="Nhập văn bản..."
                            className="min-h-[160px] lg:min-h-[220px] border-none focus-visible:ring-0 p-5 text-base leading-relaxed resize-none shadow-none bg-transparent"
                        />
                    </CardContent>
                    <CardFooter className="py-2.5 px-4 border-t border-border/20 bg-muted/5 flex items-center justify-between">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground/40 hover:text-primary"
                            onClick={() => handleSpeak(sourceText, sourceLang)}
                            disabled={!sourceText}
                        >
                            <Volume2 className="size-3.5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "text-[9px] font-bold opacity-30",
                                sourceText.length >= 5000 && "text-destructive opacity-100"
                            )}>
                                {sourceText.length}/5000
                            </span>
                            <Button size="sm" onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating} className="h-8 rounded-xl px-4 font-bold text-[11px] shadow-sm">
                                {isTranslating ? <Spinner className="size-3 mr-1.5" /> : <ArrowRight className="size-3.5 mr-1.5" />}
                                Dịch ngay
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Target Output Card */}
                <Card className={cn(
                    "flex flex-col shadow-none overflow-hidden border-border/40 rounded-2xl transition-all duration-500 bg-card",
                    isTranslating && "border-primary/40 bg-primary/[0.01]"
                )}>
                    <CardHeader className="py-2.5 px-4 border-b border-border/20 bg-muted/10">
                        <CardDescription className="text-[10px] font-bold flex items-center gap-2 text-muted-foreground/50">
                            <RefreshCw className={cn("size-3", isTranslating && "animate-spin")} />
                            Kết quả dịch ({LANGUAGES.find(l => l.value === targetLang)?.label})
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 min-h-[160px] lg:min-h-[220px]">
                        {isTranslating ? (
                            <div className="space-y-3 pt-1">
                                <div className="h-4 bg-muted/50 animate-pulse rounded w-3/4" />
                                <div className="h-4 bg-muted/50 animate-pulse rounded w-1/2" />
                            </div>
                        ) : (
                            <div className="text-base leading-relaxed font-medium">
                                {targetText ? (
                                    <p className="whitespace-pre-wrap">{targetText}</p>
                                ) : (
                                    <span className="text-muted-foreground/20 font-normal italic flex flex-col items-center justify-center h-full gap-2 py-8">
                                        <Languages className="size-8 opacity-5" />
                                        <span className="text-[11px] font-bold uppercase tracking-tight">KẾT QUẢ HIỂN THỊ TẠI ĐÂY</span>
                                    </span>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="py-2.5 px-4 border-t border-border/20 bg-muted/5 flex items-center justify-between">
                        <div className="flex gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground/40 hover:text-primary" 
                                onClick={() => copyToClipboard(targetText)} 
                                disabled={!targetText}
                            >
                                <Copy className="size-3.5" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground/40 hover:text-primary" 
                                onClick={() => handleSpeak(targetText, targetLang)}
                                disabled={!targetText}
                            >
                                <Volume2 className="size-3.5" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* AI Magic Actions Overlay */}
            {targetText && !grammarResult && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <Card className="border-primary/20 bg-primary/[0.02] shadow-none rounded-2xl">
                        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-center md:text-left">
                                <div className="p-2.5 bg-primary/10 rounded-xl shrink-0 hidden sm:block">
                                    <Sparkles className="size-5 text-primary animate-pulse" />
                                </div>
                                <div>
                                    <CardTitle className="text-base flex items-center justify-center md:justify-start gap-2">
                                        Nâng tầm câu văn AI
                                    </CardTitle>
                                    <CardDescription className="text-xs">Dùng AI phân tích sâu cấu trúc ngữ pháp và gợi ý từ vựng chuẩn Nhật.</CardDescription>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="font-bold px-6 gap-2 rounded-xl h-9 shadow-sm"
                                onClick={handleGrammarCheck}
                                disabled={isCheckingGrammar}
                            >
                                {isCheckingGrammar ? <Spinner className="size-3.5" /> : <Search className="size-3.5" />}
                                Phân tích ngữ pháp
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Grammar Analysis Dashboard */}
            {grammarResult && (
                <Card className="animate-in slide-in-from-bottom-6 fade-in duration-500 border-primary/20 shadow-none rounded-2xl overflow-hidden bg-card">
                    <CardHeader className="bg-primary/5 py-3 px-4 border-b border-border/20 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            {grammarResult.isCorrect ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none text-[10px] font-bold">
                                    Chuẩn ngữ pháp
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shadow-none text-[10px] font-bold">
                                    Cần cải thiện
                                </Badge>
                            )}
                            <CardTitle className="text-base font-bold">Phân tích Sensei AI</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setGrammarResult(null)} className="h-8 w-8 rounded-xl">
                            <X className="size-4 opacity-40 hover:opacity-100" />
                        </Button>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <ScrollArea className="max-h-[70vh]">
                            <div className="p-4 sm:p-6 space-y-6">
                                {/* Result Comparison Panel */}
                                <div className="grid md:grid-cols-[1fr,40px,1fr] items-stretch gap-3">
                                    <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border/40 space-y-2">
                                        <Badge variant="outline" className="opacity-40 text-[9px] font-bold h-4">NGUYÊN BẢN</Badge>
                                        <p className="text-base font-medium leading-relaxed">{grammarResult.originalText}</p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="hidden md:flex size-8 rounded-xl bg-primary/10 items-center justify-center">
                                            <ArrowRight className="size-4 text-primary" />
                                        </div>
                                        <div className="md:hidden size-8 rounded-xl bg-primary/10 items-center justify-center">
                                            <ArrowDown className="size-4 text-primary" />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-primary/[0.03] border border-primary/20 space-y-2">
                                        <Badge className="bg-primary/10 text-primary border-primary/10 shadow-none text-[9px] font-bold h-4">ĐỀ XUẤT AI</Badge>
                                        <p className="text-base font-bold leading-relaxed text-primary">{grammarResult.correctedText}</p>
                                    </div>
                                </div>

                                {/* List of corrections */}
                                {grammarResult.errors.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                        <CardDescription className="font-bold flex items-center gap-2 text-[10px] text-muted-foreground/40 uppercase tracking-wider">
                                            <History className="size-3.5" />
                                            Chi tiết lỗi & sửa đổi
                                        </CardDescription>
                                        <div className="grid gap-2">
                                            {grammarResult.errors.map((error, idx) => (
                                                <div key={idx} className="group p-4 rounded-xl bg-muted/10 border border-border/40 hover:border-primary/20 transition-all flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                                    <div className="size-8 rounded-lg bg-background border border-border/60 flex items-center justify-center font-bold text-primary shrink-0 shadow-none text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 space-y-2 min-w-0 w-full">
                                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                                            <span className="text-muted-foreground line-through decoration-destructive/30 font-medium">
                                                                {error.issue}
                                                            </span>
                                                            <ArrowRight className="size-3 text-muted-foreground/30" />
                                                            <span className="font-bold text-base text-emerald-600">
                                                                {error.correction}
                                                            </span>
                                                            <Badge variant="outline" className="text-[9px] h-4 bg-muted/20 border-none shadow-none font-bold">
                                                                {error.type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/5 p-2.5 rounded-lg border border-border/20">
                                                            "{error.explanation}"
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Contextual Suggestions */}
                                {grammarResult.suggestions.length > 0 && (
                                    <div className="pt-4 border-t border-border/20 space-y-3">
                                        <CardDescription className="font-bold flex items-center gap-2 text-[10px] text-muted-foreground/40 uppercase tracking-tight">
                                            <Sparkles className="size-3.5 text-amber-500" />
                                            Cách diễn đạt tự nhiên hơn
                                        </CardDescription>
                                        <div className="flex flex-wrap gap-1.5">
                                            {grammarResult.suggestions.map((s, i) => (
                                                <div key={i} className="px-3 py-1.5 font-bold rounded-xl text-[11px] border border-border/40 bg-muted/10 hover:border-primary/20 transition-colors flex items-center gap-2">
                                                    <span className="text-primary text-[10px] opacity-40">#{i+1}</span>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
