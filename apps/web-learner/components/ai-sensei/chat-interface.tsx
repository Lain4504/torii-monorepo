"use client"

import * as React from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import { agentApi, ChatResponse } from "@/apis/services/agent-api"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

export function ChatInterface() {
    const [messages, setMessages] = React.useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Konnichiwa! I am AI Sensei. How can I help you with your Japanese studies today?",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const history = messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }));

            const data: ChatResponse = await agentApi.sensei.chat(userMessage.content, history);

            const response: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.message || "Sorry, I didn't get that.",
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, response])
        } catch (error: any) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I am having trouble connecting to the Sensei Brain. Please try again later.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        if (scrollRef.current) {
            const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollArea) {
                scrollArea.scrollTop = scrollArea.scrollHeight;
            }
        }
    }, [messages])

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto p-4 md:p-8 gap-6">

            {/* Header Area */}
            <div className="flex-none text-center space-y-1 pt-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-2 shadow-lg shadow-indigo-500/10">
                    <Bot className="size-6 text-indigo-500" />
                </div>
                <h2 className="text-3xl font-serif font-bold italic text-foreground tracking-tight">
                    Sensei <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 not-italic">Chat</span>
                </h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">Trợ lý AI Nhật ngữ của bạn</p>
            </div>

            {/* Main Chat Container */}
            <div className="flex-1 relative group w-full mx-auto min-h-0">
                <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 rounded-[2.5rem] blur-2xl opacity-50"></div>

                <div className="relative h-full flex flex-col rounded-[2rem] bg-background/50 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden">

                    <ScrollArea className="flex-1 p-6 md:p-8" ref={scrollRef}>
                        <div className="space-y-8 pb-4 max-w-3xl mx-auto">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/20 flex items-center justify-center rotate-3 hover:rotate-6 transition-all duration-500 shadow-xl">
                                            <Bot className="w-10 h-10 text-indigo-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-w-md">
                                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Konnichiwa!</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Mình là AI Sensei. Bạn muốn học gì hôm nay?
                                            Ngữ pháp, từ vựng hay chỉ đơn giản là trò chuyện bằng tiếng Nhật?
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-sm">
                                        {[
                                            "Giải thích ngữ pháp N3",
                                            "Luyện giao tiếp xin việc",
                                            "Dịch câu này sang tiếng Nhật",
                                            "Tạo bài tập từ vựng"
                                        ].map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setInput(suggestion)}
                                                className="px-4 py-3 text-xs font-medium text-left rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 truncate"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <Avatar className={`w-10 h-10 border-2 shadow-lg header-image ${message.role === 'user' ? 'border-indigo-200 dark:border-indigo-900' : 'border-purple-200 dark:border-purple-900'}`}>
                                                <AvatarFallback className={`${message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-background text-foreground'}`}>
                                                    {message.role === 'user' ? <User className="size-5" /> : <Bot className="size-5 text-purple-600" />}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div className={`
                                                    rounded-[1.5rem] px-6 py-4 shadow-sm backdrop-blur-md text leading-relaxed relative
                                                    ${message.role === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-500/20'
                                                        : 'bg-white/80 dark:bg-zinc-800/80 text-foreground border border-white/20 rounded-tl-sm shadow-black/5'
                                                    }
                                                `}>
                                                    <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground/40 mt-2 px-2">
                                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex gap-4">
                                            <Avatar className="w-10 h-10 border-2 border-purple-200/20 shadow-sm">
                                                <AvatarFallback className="bg-background"><Bot className="size-5 text-purple-500" /></AvatarFallback>
                                            </Avatar>
                                            <div className="flex items-center gap-1.5 bg-white/60 dark:bg-zinc-800/60 px-5 py-4 rounded-[1.5rem] rounded-tl-sm border border-purple-500/10 shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="flex-none p-4 md:p-6 bg-gradient-to-t from-background/40 to-transparent">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSend()
                            }}
                            className="relative flex items-center gap-2 p-2 rounded-[2rem] border border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl focus-within:border-indigo-500/30 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 max-w-3xl mx-auto"
                        >
                            <div className="pl-4 text-muted-foreground/40">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Hỏi Sensei bất cứ điều gì..."
                                className="flex-1 bg-transparent border-0 focus-visible:ring-0 px-4 h-11 text-base rounded-full placeholder:text-muted-foreground/30"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="h-11 w-11 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 shrink-0"
                                disabled={!input.trim() || isLoading}
                            >
                                <Send className="size-4 text-white ml-0.5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
