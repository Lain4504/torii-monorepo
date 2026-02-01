"use client"

import * as React from "react"
import { Drama, Scroll, Sparkles, User, Mic, Play, RefreshCw, Clapperboard } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { agentApi, ConversationSimulationResponse } from "@/apis/services/agent-api"

export function RoleplayStudio() {
    const [scenario, setScenario] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [roleplayData, setRoleplayData] = React.useState<ConversationSimulationResponse | null>(null)
    const [isPracticeMode, setIsPracticeMode] = React.useState(false)

    const handleGenerate = async () => {
        if (!scenario.trim()) return
        setIsLoading(true)
        setRoleplayData(null)
        try {
            const data = await agentApi.sensei.simulateConversation(scenario)
            setRoleplayData(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full p-4 md:p-6 space-y-6 max-w-5xl mx-auto flex flex-col">
            <div className="flex-none space-y-1 text-center pb-2">
                <h2 className="text-2xl font-serif font-bold italic text-foreground tracking-tight">Roleplay <span className="text-orange-500 not-italic">Studio</span></h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/50">Luyện hội thoại theo kịch bản</p>
            </div>

            <div className="flex-1 min-h-0 relative">
                {!roleplayData ? (
                    <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-full max-w-md space-y-8 p-10 rounded-[3rem] border border-orange-500/20 bg-background/40 backdrop-blur-3xl shadow-xl text-center relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                <div className="w-32 h-32 bg-orange-500 rounded-full blur-[60px]" />
                            </div>

                            <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center animate-pulse relative z-10">
                                <Clapperboard className="size-10 text-orange-500" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-2xl font-serif font-bold italic">Tạo kịch bản</h3>
                                <p className="text-sm text-muted-foreground">Nhập tình huống hội thoại (VD: Đi tàu điện, Mua sắm, Phỏng vấn...)</p>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                                    {[
                                        "Đặt món nhà hàng",
                                        "Hỏi đường",
                                        "Mua sắm",
                                        "Phỏng vấn",
                                        "Check-in khách sạn",
                                        "Giới thiệu bản thân"
                                    ].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setScenario(s)}
                                            className="px-3 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 text-xs font-bold transition-colors border border-orange-500/10"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    placeholder="Tình huống..."
                                    className="h-14 rounded-2xl text-center text-lg bg-background/50 border-orange-200/50 focus-visible:ring-orange-500/30"
                                    value={scenario}
                                    onChange={(e) => setScenario(e.target.value)}
                                />
                                <Button
                                    size="lg"
                                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-widest uppercase text-xs shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                                    onClick={handleGenerate}
                                    disabled={!scenario.trim() || isLoading}
                                >
                                    {isLoading ? "Đang viết..." : "Tạo Hội thoại"}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Intro Card */}
                        <div className="flex-none p-6 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-orange-500/10 text-orange-600">
                                    <Sparkles className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold font-serif italic tracking-tight">{roleplayData.scenario}</h3>
                                    <p className="text-sm text-muted-foreground italic line-clamp-2">Hội thoại mẫu cho chủ đề: {roleplayData.scenario}</p>
                                </div>
                            </div>
                        </div>

                        {/* Script Area */}
                        <ScrollArea className="flex-1 rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/40 p-6 shadow-sm">
                            <div className="space-y-8 max-w-3xl mx-auto pb-4">
                                {roleplayData.conversation.map((line, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="flex-col items-center gap-2 hidden md:flex w-16 shrink-0">
                                            <Avatar className="size-12 ring-2 ring-background border shadow-md group-hover:scale-110 transition-transform">
                                                <AvatarFallback className={line.speaker === 'Sensei' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}>
                                                    {line.speaker[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{line.speaker}</span>
                                        </div>

                                        <div className="flex-1 space-y-2 pt-1">
                                            <div className="flex items-center gap-2 md:hidden mb-1">
                                                <span className="text-xs font-bold uppercase text-orange-500">{line.speaker}</span>
                                            </div>
                                            <div className="relative">
                                                <p className={`text-lg font-medium leading-relaxed text-foreground/90 transition-all duration-300 ${isPracticeMode ? 'blur-md hover:blur-none select-none cursor-pointer' : ''}`}>
                                                    {line.japanese}
                                                </p>
                                                {isPracticeMode && <span className="absolute top-1/2 left-0 -translate-y-1/2 text-xs font-bold text-muted-foreground/30 pointer-events-none uppercase tracking-widest">Chạm để xem</span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground italic font-serif">{line.english}</p>
                                        </div>

                                        <div className="flex-none self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-orange-500/10 hover:text-orange-500">
                                                <Mic className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Actions */}
                        <div className="flex-none flex justify-center gap-4 pt-2">
                            <Button
                                variant="outline"
                                className="h-12 rounded-2xl border-border/50 hover:bg-background/80"
                                onClick={() => setRoleplayData(null)}
                            >
                                <RefreshCw className="size-4 mr-2" /> Thử lại
                            </Button>
                            <Button
                                className={`h-12 px-8 rounded-2xl ${isPracticeMode ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'} text-white shadow-lg font-black uppercase tracking-widest text-xs transition-all duration-300`}
                                onClick={() => setIsPracticeMode(!isPracticeMode)}
                            >
                                <Play className="size-4 mr-2" /> {isPracticeMode ? "Đang Luyện tập" : "Luyện tập"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
