"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Send, User, Sparkles, RefreshCcw, CheckCircle, Mic, MicOff, Volume2, PhoneOff, Settings, Play, Zap } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { Spinner } from "@workspace/ui/components/spinner"
import { agentApi } from "@/lib/api/services/agent-api"
import { cn } from "@workspace/ui/lib/utils"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useAppDispatch } from "@/hooks/hooks"

const topicSchema = z.object({
    topic: z.string().min(1, "Vui lòng nhập hoặc chọn chủ đề"),
})

const inputSchema = z.object({
    text: z.string().min(1, "Nội dung tin nhắn không được để trống"),
})

type TopicFormData = z.infer<typeof topicSchema>
type InputFormData = z.infer<typeof inputSchema>

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    romaji?: string // For assistant
    vietnamese?: string // For assistant
    isFeedback?: boolean
}

export function InteractiveRoleplay() {
    const dispatch = useAppDispatch()
    const [isStarted, setIsStarted] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [showTranslation, setShowTranslation] = React.useState(true)
    const [history, setHistory] = React.useState<any[]>([])
    const [isFinished, setIsFinished] = React.useState(false)
    const [sessionTokens, setSessionTokens] = React.useState({ prompt: 0, completion: 0, total: 0 })

    const topicForm = useForm<TopicFormData>({
        resolver: zodResolver(topicSchema),
        defaultValues: { topic: "" },
    })

    const inputForm = useForm<InputFormData>({
        resolver: zodResolver(inputSchema),
        defaultValues: { text: "" },
    })

    const currentTopic = topicForm.watch("topic")
    const inputText = inputForm.watch("text")
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Tracking for cleanup
    const isStartedRef = React.useRef(isStarted)
    const isFinishedRef = React.useRef(isFinished)
    const historyRef = React.useRef(history)
    const topicRef = React.useRef(currentTopic)

    React.useEffect(() => { isStartedRef.current = isStarted }, [isStarted])
    React.useEffect(() => { isFinishedRef.current = isFinished }, [isFinished])
    React.useEffect(() => { historyRef.current = history }, [history])
    React.useEffect(() => { topicRef.current = currentTopic }, [currentTopic])

    // Voice State
    const [isListening, setIsListening] = React.useState(false)
    const [isSpeaking, setIsSpeaking] = React.useState(false)
    const [autoPlay, setAutoPlay] = React.useState(true) 
    const queryClient = useQueryClient()
    const recognitionRef = React.useRef<any>(null)
    const [isSpeechSupported, setIsSpeechSupported] = React.useState(false)

    // TTS Voice Management
    const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([])
    const [selectedVoiceURI, setSelectedVoiceURI] = React.useState<string>("ja-JP-NanamiNeural")
    const [showSettings, setShowSettings] = React.useState(false)
    const audioRef = React.useRef<HTMLAudioElement | null>(null)
    const ttsRequestId = React.useRef<number>(0)

    // Scroll to bottom on new messages
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    // Load voices
    React.useEffect(() => {
        const loadVoices = () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const voices = window.speechSynthesis.getVoices()
                if (voices.length > 0) {
                    setAvailableVoices(voices)
                }
            }
        }
        loadVoices()
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices
        }
    }, [])

    // Initialize Speech Recognition
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                setIsSpeechSupported(true)
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = 'ja-JP'

                recognition.onresult = (event: any) => {
                    let finalTranscript = ''
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript
                        }
                    }
                    if (finalTranscript) {
                        inputForm.setValue("text", inputForm.getValues("text") + finalTranscript)
                    }
                }

                recognition.onend = () => {
                    setIsListening(false)
                }

                recognitionRef.current = recognition
            }
        }

        const backgroundDeductAndRefresh = async (topic: string, history: any[]) => {
            try {
                await agentApi.sensei.roleplay(topic, "", history, true);
            } catch (err) {
                console.error('[billing] Background deduction failed', err);
            }
        }

        const triggerFinalCleanup = () => {
            const turnCount = historyRef.current.filter(m => m.role === 'user').length
            if (isStartedRef.current && !isFinishedRef.current && turnCount > 0) {
                backgroundDeductAndRefresh(topicRef.current, historyRef.current);
            }
        }

        const handleBeforeUnload = () => triggerFinalCleanup()
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            triggerFinalCleanup()
            window.removeEventListener('beforeunload', handleBeforeUnload)
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort()
                    recognitionRef.current = null
                } catch (e) {}
            }
        }
    }, [])

    const toggleListening = () => {
        if (!isSpeechSupported || !recognitionRef.current) {
            toast.error("Trình duyệt không hỗ trợ nhận diện giọng nói.")
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
        } else {
            try {
                recognitionRef.current.start()
                setIsListening(true)
            } catch (e: any) {
                console.error("Failed to start recognition", e)
                setIsListening(false)
            }
        }
    }

    const speak = (text: string) => {
        stopSpeaking()
        if (!autoPlay) return

        const currentId = ttsRequestId.current + 1
        ttsRequestId.current = currentId

        const isBrowserVoice = availableVoices.some(v => v.voiceURI === selectedVoiceURI)

        if (!isBrowserVoice && (selectedVoiceURI === 'server-voice' || selectedVoiceURI.includes('Neural'))) {
            const voice = selectedVoiceURI === 'server-voice' ? undefined : selectedVoiceURI
            playBackendAudio(text, currentId, voice)
            return
        }

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'ja-JP'
            const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI)
            if (voice) utterance.voice = voice

            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = () => {
                setIsSpeaking(false)
                if (ttsRequestId.current === currentId) playBackendAudio(text, currentId)
            }
            window.speechSynthesis.speak(utterance)
        } else {
            playBackendAudio(text, currentId)
        }
    }

    const playBackendAudio = async (text: string, requestId: number, voice?: string) => {
        try {
            if (ttsRequestId.current !== requestId) return
            setIsSpeaking(true)
            const data = await agentApi.sensei.tts(text, voice)
            if (ttsRequestId.current !== requestId) return

            if (data.url) {
                const audio = new Audio(data.url)
                audioRef.current = audio
                audio.onended = () => {
                    if (ttsRequestId.current === requestId) setIsSpeaking(false)
                }
                audio.onerror = () => {
                    if (ttsRequestId.current === requestId) setIsSpeaking(false)
                }
                await audio.play()
            } else {
                setIsSpeaking(false)
            }
        } catch (error) {
            if (ttsRequestId.current === requestId) setIsSpeaking(false)
        }
    }

    const stopSpeaking = () => {
        ttsRequestId.current += 1
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
        setIsSpeaking(false)
    }

    const addTokenUsage = (usage?: { promptTokens: number; completionTokens: number; totalTokens: number }) => {
        if (!usage) return
        setSessionTokens(prev => ({
            prompt: prev.prompt + usage.promptTokens,
            completion: prev.completion + usage.completionTokens,
            total: prev.total + usage.totalTokens,
        }))
    }

    const handleStart = async (data?: TopicFormData) => {
        const topicValue = data?.topic || topicForm.getValues("topic")
        if (!topicValue.trim()) return
        setIsStarted(true)
        setIsLoading(true)

        try {
            const res = await agentApi.sensei.roleplay(topicValue, "", [])
            addTokenUsage(res.tokenUsage)
            const aiMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: res.response,
                romaji: res.romaji,
                vietnamese: res.vietnamese
            }
            setMessages([aiMsg])
            setHistory([{ role: 'model', content: JSON.stringify(res) }])
            queryClient.invalidateQueries({ queryKey: ["quota-status"] })
            if (res.response && autoPlay) speak(res.response)
        } catch (error: any) {
            toast.error(error.message || "Không thể bắt đầu hội thoại.")
            setIsStarted(false)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSend = async (data: InputFormData) => {
        if (!data.text.trim() || isLoading) return
        if (isListening && recognitionRef.current) recognitionRef.current.stop()

        const userMsgText = data.text
        inputForm.reset({ text: "" })

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMsgText
        }

        setMessages(prev => [...prev, newUserMsg])
        setIsLoading(true)

        try {
            const nextHistory = [...history, { role: 'user', content: userMsgText }]
            const res = await agentApi.sensei.roleplay(topicForm.getValues("topic"), userMsgText, nextHistory)
            addTokenUsage(res.tokenUsage)

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: res.response,
                romaji: res.romaji,
                vietnamese: res.vietnamese
            }

            setMessages(prev => [...prev, aiMsg])
            setHistory([...nextHistory, { role: 'model', content: JSON.stringify(res) }])
            queryClient.invalidateQueries({ queryKey: ["quota-status"] })

            if (res.response && autoPlay) speak(res.response)

            if (res.isFinished && res.feedback) {
                const feedbackMsg: Message = {
                    id: (Date.now() + 2).toString(),
                    role: 'assistant',
                    content: res.feedback,
                    isFeedback: true
                }
                setMessages(prev => [...prev, feedbackMsg])
                setIsFinished(true)
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể gửi tin nhắn.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            inputForm.handleSubmit(handleSend)()
        }
    }

    const handleReset = () => {
        const wasStarted = isStarted
        const wasFinished = isFinished
        const currentHistory = history
        const currentTopic = topicForm.getValues("topic")

        setIsStarted(false)
        setMessages([])
        setHistory([])
        setSessionTokens({ prompt: 0, completion: 0, total: 0 })
        topicForm.reset({ topic: "" })
        inputForm.reset({ text: "" })
        setIsFinished(false)

        const userTurns = currentHistory.filter(m => m.role === 'user').length
        if (wasStarted && !wasFinished && userTurns > 0) {
            agentApi.sensei.roleplay(currentTopic, "", currentHistory, true).catch(() => {});
        }
    }

    const handleFinish = async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            const data = await agentApi.sensei.roleplay(topicForm.getValues("topic"), "", history, true)
            addTokenUsage(data.tokenUsage)
            if (data.isFinished && data.feedback) {
                const feedbackMsg: Message = {
                    id: (Date.now() + 2).toString(),
                    role: 'assistant',
                    content: data.feedback,
                    isFeedback: true
                }
                if (data.response) {
                    const closingMsg: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: data.response,
                        romaji: data.romaji,
                        vietnamese: data.vietnamese
                    }
                    setMessages(prev => [...prev, closingMsg, feedbackMsg])
                    if (autoPlay) speak(data.response)
                } else {
                    setMessages(prev => [...prev, feedbackMsg])
                }
                setIsFinished(true)
            }
        } catch (error) {} finally {
            setIsLoading(false)
        }
    }

    const turnCount = messages.filter(m => m.role === 'user').length

    if (!isStarted) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 p-4 sm:p-6">
                <Card className="w-full max-w-2xl border-border/40 shadow-none rounded-3xl overflow-hidden bg-card relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                    <CardContent className="p-8 sm:p-12 flex flex-col items-center gap-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                            <div className="relative size-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-inner group">
                                <Sparkles className="size-10 text-primary transition-transform duration-700 group-hover:rotate-12" />
                            </div>
                        </div>
                        <div className="text-center space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Hội thoại với Sensei</h2>
                            <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                                Chọn một chủ đề và bắt đầu luyện tập hội thoại tiếng Nhật tự do cùng AI Sensei.
                            </p>
                        </div>
                        <div className="w-full max-w-md space-y-4">
                            <Controller
                                name="topic"
                                control={topicForm.control}
                                render={({ field, fieldState }) => (
                                    <div className="space-y-2">
                                        <Input
                                            {...field}
                                            placeholder="Nhập chủ đề (VD: Đi du lịch, Mua sắm...)"
                                            className="h-12 rounded-2xl px-6 text-base border-border/40 focus:ring-primary/20 transition-all shadow-sm"
                                            onKeyDown={(e) => { if (e.key === 'Enter') topicForm.handleSubmit(handleStart)() }}
                                        />
                                        {fieldState.invalid && <p className="text-[10px] font-bold text-destructive px-4">{fieldState.error?.message}</p>}
                                    </div>
                                )}
                            />
                            <Button
                                size="lg"
                                className="w-full h-12 font-bold rounded-2xl text-sm shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-100 transition-all"
                                onClick={topicForm.handleSubmit(handleStart)}
                                disabled={!currentTopic.trim() || isLoading}
                            >
                                {isLoading ? <Spinner className="mr-2" /> : <Play className="mr-2 size-4" />}
                                Bắt đầu ngay
                            </Button>
                        </div>
                        <div className="w-full border-t border-border/40 pt-8">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-5 opacity-40">Chủ đề gợi ý</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {["Tại sân bay", "Gọi món ăn", "Kết bạn mới", "Phỏng vấn", "Hỏi đường"].map(t => (
                                    <Button
                                        key={t}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => topicForm.setValue("topic", t)}
                                        className="rounded-xl text-[10px] font-bold h-8 px-4 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
                                    >
                                        {t}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background/50 overflow-hidden relative">
            <div className="flex-none w-full px-4 pt-4 pb-2 z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between p-3 sm:p-4 bg-card border border-border/40 rounded-3xl shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <Sparkles className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-sm sm:text-base leading-none truncate">{topicForm.getValues("topic")}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight opacity-50 shrink-0">
                                    {isFinished ? "Hoàn thành" : `${turnCount} lượt nói • Đang học`}
                                </p>
                                {sessionTokens.total > 0 && (
                                    <div className="flex items-center gap-1 text-[9px] font-bold tracking-tight bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 text-muted-foreground shrink-0">
                                        <Zap className="size-2.5 text-yellow-500" />
                                        {sessionTokens.total.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {isFinished && (
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 px-4 font-bold text-[10px] rounded-xl shadow-md shadow-primary/10"
                                onClick={() => {
                                    setIsStarted(false)
                                    setMessages([])
                                    setHistory([])
                                    topicForm.reset({ topic: "" })
                                    setIsFinished(false)
                                }}
                            >
                                <RefreshCcw className="size-3.5 mr-2" /> Quay về
                            </Button>
                        )}

                        {!isFinished && turnCount >= 5 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 font-bold text-[10px] rounded-xl border-primary/40 text-primary hover:bg-primary/5 hidden sm:flex"
                                onClick={handleFinish}
                                disabled={isLoading}
                            >
                                <CheckCircle className="size-3.5 mr-2" /> Kết thúc
                            </Button>
                        )}

                        <Dialog open={showSettings} onOpenChange={setShowSettings}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground/40 hover:text-primary transition-colors">
                                    <Settings className="size-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px] rounded-3xl border-border/40 shadow-2xl">
                                <DialogHeader className="text-center sm:text-left">
                                    <DialogTitle className="text-xl font-bold tracking-tight">Học cùng Sensei AI</DialogTitle>
                                    <DialogDescription className="text-sm">
                                        Thiết lập giọng nói và hỗ trợ để học hiệu quả hơn.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/40">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold">Dịch thuật & Phiên âm</p>
                                            <p className="text-[10px] text-muted-foreground">Hiển thị Romaji và nghĩa tiếng Việt</p>
                                        </div>
                                        <Switch checked={showTranslation} onCheckedChange={setShowTranslation} />
                                    </div>
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">Giọng nói Nhật Bản</p>
                                        <Select value={selectedVoiceURI} onValueChange={setSelectedVoiceURI}>
                                            <SelectTrigger className="h-12 rounded-2xl border-border/40 bg-card">
                                                <SelectValue placeholder="Chọn giọng..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-xl">
                                                <SelectItem value="ja-JP-NanamiNeural" className="font-bold text-sm text-primary py-3">Nanami (Nữ - Tự nhiên)</SelectItem>
                                                <SelectItem value="ja-JP-KeitaNeural" className="font-bold text-sm text-primary py-3">Keita (Nam - Tự nhiên)</SelectItem>
                                                <SelectItem value="server-voice" className="text-sm py-3">Google Voice (Mặc định)</SelectItem>
                                                {availableVoices.length > 0 && <div className="mx-2 my-2 border-t pt-2 text-[9px] font-bold uppercase opacity-30">Local Browser</div>}
                                                {availableVoices.map(voice => (
                                                    <SelectItem key={voice.voiceURI} value={voice.voiceURI} className="text-sm py-3">{voice.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={() => speak("こんにちは")} className="w-full font-bold h-11 rounded-2xl text-xs bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-all" variant="outline">
                                        <Play className="size-3.5 mr-2" /> Kiểm tra âm thanh
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("w-full h-11 rounded-2xl font-bold text-xs transition-colors", autoPlay ? "text-primary bg-primary/5" : "text-muted-foreground bg-muted/20")}
                                        onClick={() => { setAutoPlay(!autoPlay); if (autoPlay) stopSpeaking(); }}
                                    >
                                        {autoPlay ? <Volume2 className="size-3.5 mr-2" /> : <Volume2 className="size-3.5 mr-2 opacity-30" />}
                                        Tự động phát âm thanh: {autoPlay ? "Bật" : "Tắt"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleReset} 
                            className="h-9 w-9 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all"
                        >
                            <PhoneOff className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 pt-4 scroll-smooth scrollbar-none" ref={scrollRef}>
                <div className="max-w-4xl mx-auto space-y-8">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-3 duration-500", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn("flex gap-3 items-end max-w-[85%] sm:max-w-[70%]", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn("size-8 rounded-xl border flex items-center justify-center shrink-0 transition-opacity", msg.role === 'user' ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border shadow-sm")}>
                                    {msg.role === 'user' ? <User className="size-4" /> : <Sparkles className="size-4 text-primary" />}
                                </div>
                                <div className={cn("space-y-2", msg.role === 'user' ? "text-right" : "text-left")}>
                                    <div className={cn("relative p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm border transition-shadow hover:shadow-md",
                                        msg.role === 'user' ? "bg-primary text-primary-foreground border-primary rounded-tr-none" : msg.isFeedback ? "bg-muted/80 border-border/60 font-medium text-sm backdrop-blur-sm rounded-tl-none" : "bg-card border-border/50 text-foreground rounded-tl-none shadow-border/5")}>
                                        {msg.isFeedback ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none"><div className="whitespace-pre-wrap leading-relaxed opacity-90">{msg.content}</div></div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                {msg.role === 'assistant' && (
                                                    <div className="flex justify-end border-t border-border/10 pt-2 -mx-1">
                                                        <Button variant="ghost" size="icon" onClick={() => speak(msg.content)} className="h-7 w-7 rounded-lg text-muted-foreground/30 hover:text-primary transition-colors">
                                                            <Volume2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'assistant' && !msg.isFeedback && showTranslation && (
                                        <div className="px-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-500">
                                            {msg.romaji && <p className="text-[10px] text-primary/60 font-bold italic tracking-tight">{msg.romaji}</p>}
                                            {msg.vietnamese && <p className="text-[11px] text-muted-foreground/70 font-medium leading-relaxed">{msg.vietnamese}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start w-full animate-in fade-in duration-300">
                            <div className="flex gap-2 items-center px-4 py-3 bg-muted/40 border border-border/40 rounded-2xl rounded-tl-none">
                                <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="size-1.5 bg-primary/40 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-none w-full p-4 pb-6 sm:pb-8">
                <div className="max-w-3xl mx-auto relative">
                    {isListening && (
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-5 py-2 rounded-2xl border border-destructive/20 shadow-2xl backdrop-blur-md z-30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-1 h-3 shrink-0">
                                <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.2s]" />
                                <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.1s]" />
                                <span className="w-1 h-2 bg-white rounded-full animate-bounce" />
                            </div>
                            <span className="font-bold text-[11px] uppercase tracking-wider">Sensei đang nghe...</span>
                            <div className="size-2 bg-white rounded-full animate-ping" />
                        </div>
                    )}

                    <div className={cn("flex items-end gap-3 p-2 bg-card border border-border/40 rounded-[2rem] shadow-xl transition-all relative overflow-hidden", isListening && "border-destructive/40 shadow-destructive/10")}>
                        <Button
                            size="icon"
                            variant={isListening ? "destructive" : "ghost"}
                            className={cn("h-12 w-12 rounded-full shrink-0 transition-all", isListening ? "animate-pulse" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/5")}
                            onClick={toggleListening}
                            disabled={!isSpeechSupported || isFinished}
                        >
                            {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                        </Button>

                        <Controller
                            name="text"
                            control={inputForm.control}
                            render={({ field, fieldState }) => (
                                <div className="flex-1 relative pb-1">
                                    <Textarea
                                        {...field}
                                        id={field.name}
                                        rows={1}
                                        placeholder={isFinished ? "Hội thoại đã hoàn thành" : "Nhập lời thoại tiếng Nhật..."}
                                        className="w-full min-h-[48px] max-h-[120px] py-3 px-1 text-base border-none focus-visible:ring-0 resize-none bg-transparent shadow-none"
                                        onKeyDown={handleKeyDown}
                                        disabled={isLoading || isFinished}
                                    />
                                    {fieldState.invalid && <p className="absolute -bottom-4 left-0 text-[9px] font-bold text-destructive">{fieldState.error?.message}</p>}
                                </div>
                            )}
                        />

                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full shrink-0 shadow-lg shadow-primary/20 transition-all active:scale-95"
                            onClick={inputForm.handleSubmit(handleSend)}
                            disabled={!inputText.trim() || isLoading || isFinished}
                        >
                            {isLoading ? <Spinner className="size-4" /> : <Send className="size-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
