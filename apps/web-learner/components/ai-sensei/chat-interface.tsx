"use client"

import * as React from "react"
import { Send, Bot, User } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { agentApi } from "@/apis/services/agent-api"
import { AgentChatResponseDTO as ChatResponse } from "@workspace/schemas"

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
                content: data?.message || "Sorry, I didn't get that.",
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
        <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">

            {/* Header Area */}
            <div className="flex-none pb-2 border-b border-border/40">
                <h2 className="text-2xl font-bold tracking-tight">AI Sensei Chat</h2>
                <p className="text-sm text-muted-foreground">Trợ lý ảo hỗ trợ học tập 24/7</p>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-6 pb-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Bot className="size-8 text-primary" />
                            </div>
                            <div className="space-y-2 max-w-md">
                                <h3 className="text-lg font-bold">Konnichiwa!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Mình là AI Sensei. Bạn muốn học gì hôm nay?
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                {[
                                    "Giải thích ngữ pháp N3",
                                    "Luyện giao tiếp xin việc",
                                    "Dịch câu này",
                                    "Tạo bài tập từ vựng"
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(suggestion)}
                                        className="px-4 py-3 text-sm font-medium text-left rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <Avatar className="w-8 h-8 border border-border">
                                        <AvatarFallback className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                                            {message.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                            rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
                                            ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                : 'bg-card border border-border text-card-foreground rounded-tl-sm'
                                            }
                                        `}>
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground mt-2 px-1">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4">
                                    <Avatar className="w-8 h-8 border border-border">
                                        <AvatarFallback className="bg-muted"><Bot className="size-4" /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-1.5 bg-card px-4 py-3 rounded-2xl rounded-tl-sm border border-border shadow-sm">
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex-none pt-2">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="relative flex items-center gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 min-h-[48px] pr-12 rounded-xl bg-background border-border focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 rounded-lg hover:bg-primary/90"
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="size-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
