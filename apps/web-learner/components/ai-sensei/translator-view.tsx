"use client"

import * as React from "react"
import { Languages, ArrowRightLeft, Loader2, Copy, Sparkles, MoveRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { agentApi, TranslateResponse } from "@/apis/services/agent-api"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

export function TranslatorView() {
    // Default to Japanese -> English
    const [sourceLang, setSourceLang] = React.useState("Japanese")
    const [targetLang, setTargetLang] = React.useState("English")
    const [input, setInput] = React.useState("")
    const [result, setResult] = React.useState<TranslateResponse | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const languages = [
        { value: "Japanese", label: "Japanese" },
        { value: "English", label: "English" },
        { value: "Vietnamese", label: "Vietnamese" },
    ]

    const handleTranslate = async () => {
        if (!input.trim()) return
        setIsLoading(true)
        setResult(null)

        try {
            const data = await agentApi.sensei.translate(input, sourceLang, targetLang)
            setResult(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const swapLanguages = () => {
        setSourceLang(targetLang)
        setTargetLang(sourceLang)
        setInput(result?.translatedText || "")
        setResult(null)
    }

    return (
        <div className="h-full flex flex-col p-4 md:p-6 max-w-[1600px] mx-auto w-full gap-4">
            <div className="flex-none flex items-center justify-between px-2">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-serif font-bold italic text-foreground tracking-tight flex items-center gap-2">
                        Sensei <span className="text-blue-500 not-italic">Translate</span>
                    </h2>
                </div>

                <div className="flex items-center gap-2 bg-muted/10 p-1 rounded-full border border-border/40">
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                        <SelectTrigger className="h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0 focus:ring-0">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-muted/20"
                        onClick={swapLanguages}
                    >
                        <ArrowRightLeft className="size-3" />
                    </Button>

                    <Select value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger className="h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-0 focus:ring-0">
                            <SelectValue placeholder="Target" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full pb-4">
                {/* Source Input */}
                <div className="group relative flex flex-col h-full rounded-3xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-sm focus-within:border-blue-500/30 focus-within:bg-background/60 transition-all duration-500 overflow-hidden">
                    <div className="flex-1 relative">
                        <Textarea
                            placeholder="Nhập văn bản cần dịch..."
                            className="absolute inset-0 w-full h-full resize-none bg-transparent border-0 focus-visible:ring-0 text-lg md:text-xl leading-relaxed p-6 placeholder:text-muted-foreground/30 font-medium"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    <div className="flex-none p-4 flex justify-between items-center border-t border-white/5 bg-white/5">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">
                            {input.length} chars
                        </div>
                        <div className="flex gap-2">
                            {input && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors" onClick={() => setInput("")}>
                                    <span className="sr-only">Clear</span>
                                    <span aria-hidden="true" className="text-lg">×</span>
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="h-9 px-6 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest"
                                onClick={handleTranslate}
                                disabled={!input.trim() || isLoading}
                            >
                                {isLoading ? <Loader2 className="size-3 animate-spin mr-2" /> : <Sparkles className="size-3 mr-2" />}
                                Dịch ngay
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Target Output */}
                <div className="group relative flex flex-col h-full rounded-3xl bg-blue-500/5 backdrop-blur-xl border border-blue-500/10 shadow-sm transition-all duration-500 overflow-hidden">
                    {result ? (
                        <div className="flex-1 flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90">
                                    {result.translatedText}
                                </p>
                            </div>

                            {result.culturalNotes && (
                                <div className="flex-none p-4 bg-blue-500/5 border-t border-blue-500/10">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="size-4 text-blue-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500/80">Ghi chú văn hóa</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {result.culturalNotes}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex-none p-4 flex justify-end border-t border-blue-500/10 bg-white/5">
                                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg hover:bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                    <Copy className="size-3 mr-2" /> Sao chép
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/30 p-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-blue-500/5 flex items-center justify-center rotate-3 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Languages className="size-8 opacity-50" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40">Khu vực hiển thị kết quả</p>
                                <p className="text-[10px] text-muted-foreground/20 mt-1">Bản dịch sẽ xuất hiện tại đây sau khi bạn nhấn "Dịch ngay"</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
