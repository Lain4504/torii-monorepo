"use client"

import * as React from "react"
import { Languages, ArrowRightLeft, Copy, Sparkles } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { agentApi } from "@/apis/services/agent-api"
import { AgentTranslateResponseDTO as TranslateResponse } from "@workspace/schemas"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Spinner } from '@workspace/ui/components/spinner'

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
        <div className="flex flex-col h-full max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex-none flex items-center justify-between pb-2 border-b border-border/40">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Translator</h2>
                    <p className="text-sm text-muted-foreground">Dịch thuật & Giải thích văn hóa</p>
                </div>

                <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg shadow-sm">
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                        <SelectTrigger className="w-[120px] border-0 focus:ring-0 text-sm font-medium">
                            <SelectValue placeholder="Nguồn" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={swapLanguages}>
                        <ArrowRightLeft className="size-3.5" />
                    </Button>

                    <Select value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger className="w-[120px] border-0 focus:ring-0 text-sm font-medium">
                            <SelectValue placeholder="Đích" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                {/* Source Input */}
                <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <div className="flex-1 relative">
                        <Textarea
                            placeholder="Nhập văn bản cần dịch..."
                            className="absolute inset-0 w-full h-full resize-none border-0 focus-visible:ring-0 p-6 text-lg leading-relaxed bg-transparent"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    <div className="flex-none p-4 flex justify-between items-center border-t border-border/50 bg-muted/20">
                        <span className="text-xs font-medium text-muted-foreground">{input.length} ký tự</span>
                        <div className="flex gap-2">
                            {input && (
                                <Button variant="ghost" size="sm" onClick={() => setInput("")} className="px-3 text-muted-foreground hover:text-foreground">
                                    Xóa
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="px-4 font-semibold"
                                onClick={handleTranslate}
                                disabled={!input.trim() || isLoading}
                            >
                                {isLoading ? <Spinner className="size-3.5 animate-spin mr-2" /> : <Sparkles className="size-3.5 mr-2" />}
                                Dịch
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Target Output */}
                <div className="flex flex-col rounded-xl border border-border bg-muted/30 shadow-sm overflow-hidden">
                    {result ? (
                        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                <p className="text-lg leading-relaxed">{result.translatedText}</p>
                            </div>

                            {result.culturalNotes && (
                                <div className="flex-none p-4 bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/20">
                                    <div className="flex gap-3">
                                        <Sparkles className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Ghi chú văn hóa</p>
                                            <p className="text-sm text-foreground/80 leading-relaxed">{result.culturalNotes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex-none p-4 flex justify-end border-t border-border/50">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Copy className="size-3.5" /> Sao chép
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                <Languages className="size-6 text-muted-foreground/60" />
                            </div>
                            <p className="text-sm font-medium">Bản dịch sẽ xuất hiện tại đây</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
