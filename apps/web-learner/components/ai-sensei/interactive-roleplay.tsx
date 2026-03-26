"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Send, User, Sparkles, RefreshCcw, CheckCircle, AlertCircle, Mic, MicOff, Volume2, VolumeX, Settings, Play, Zap } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
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
    const [autoPlay, setAutoPlay] = React.useState(true) // Auto-play AI responses
    const queryClient = useQueryClient()
    const recognitionRef = React.useRef<any>(null)
    const [voiceError, setVoiceError] = React.useState<string | null>(null)
    const [isSpeechSupported, setIsSpeechSupported] = React.useState(false)
    const [isSupportChecked, setIsSupportChecked] = React.useState(false)

    // TTS Voice Management
    const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([])
    const [selectedVoiceURI, setSelectedVoiceURI] = React.useState<string>("")
    const [voiceRate, setVoiceRate] = React.useState(1.0)
    const [voicePitch, setVoicePitch] = React.useState(1.0)
    const [showSettings, setShowSettings] = React.useState(false)
    const audioRef = React.useRef<HTMLAudioElement | null>(null) // Track backend audio instance
    const ttsRequestId = React.useRef<number>(0) // Track TTS requests to prevent race conditions

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
                recognition.lang = 'ja-JP' // Default to Japanese

                recognition.onresult = (event: any) => {
                    let finalTranscript = ''
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript
                        }
                    }
                    if (finalTranscript) {
                        inputForm.setValue("text", inputForm.getValues("text") + finalTranscript)
                        // Optional: Auto-send if silence detected? For now manual send.
                    }
                }

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error)
                    if (event.error === 'not-allowed') {
                        setVoiceError("Vui lòng cấp quyền truy cập microphone để sử dụng tính năng này.")
                        setIsListening(false)
                    } else if (event.error === 'no-speech') {
                        // Ignore no-speech errors
                    } else {
                        setVoiceError(`Lỗi nhận diện giọng nói: ${event.error}`)
                        setIsListening(false)
                    }
                }

                recognition.onend = () => {
                    setIsListening(false)
                }

                recognitionRef.current = recognition
            } else {
                setIsSpeechSupported(false)
            }
        }

        // --- Cleanup deduction logic ---
        const backgroundDeductAndRefresh = async (topic: string, history: any[]) => {
            try {
                console.log('[billing] Background session deduction started');
                await agentApi.sensei.roleplay(topic, "", history, true);
            } catch (err) {
                console.error('[billing] Background deduction failed', err);
            }
        }

        const triggerFinalCleanup = () => {
            // Only trigger if started, not finished, and has at least one user message
            const turnCount = historyRef.current.filter(m => m.role === 'user').length
            if (isStartedRef.current && !isFinishedRef.current && turnCount > 0) {
                backgroundDeductAndRefresh(topicRef.current, historyRef.current);
            }
        }

        const handleBeforeUnload = () => {
            triggerFinalCleanup()
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            triggerFinalCleanup() // Component unmount
            window.removeEventListener('beforeunload', handleBeforeUnload)

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort()
                    recognitionRef.current = null
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        }
    }, [])
    const toggleListening = () => {
        if (!isSpeechSupported || !recognitionRef.current) {
            setVoiceError("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng thử Chrome hoặc Edge.")
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            try {
                recognitionRef.current.start()
                setIsListening(true)
                setVoiceError(null)
            } catch (e: any) {
                console.error("Failed to start recognition", e)
                if (e.message && e.message.includes('already started')) {
                    setIsListening(true)
                    setVoiceError(null)
                } else {
                    setVoiceError("Không thể bắt đầu ghi âm. Vui lòng tải lại trang.")
                    setIsListening(false)
                }
            }
        }
    }

    const speak = (text: string) => {
        // Stop any current audio and invalidate pending requests
        stopSpeaking()

        // If sound is disabled, do nothing
        if (!autoPlay) return

        const currentId = ttsRequestId.current + 1
        ttsRequestId.current = currentId

        // Check if selected voice is a browser voice
        const isBrowserVoice = availableVoices.some(v => v.voiceURI === selectedVoiceURI)

        // If server voice is explicitly selected (and not found in browser availability)
        if (!isBrowserVoice && (selectedVoiceURI === 'server-voice' || selectedVoiceURI.includes('Neural'))) {
            const voice = selectedVoiceURI === 'server-voice' ? undefined : selectedVoiceURI
            playBackendAudio(text, currentId, voice)
            return
        }

        // Try Browser TTS first
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            // window.speechSynthesis.cancel() // Already called in stopSpeaking

            // Retry loading voices if empty
            if (availableVoices.length === 0) {
                const voices = window.speechSynthesis.getVoices()
                if (voices.length > 0) setAvailableVoices(voices)
            }

            // If still no voices and no server voice selected yet, default to backend
            if (availableVoices.length === 0) {
                playBackendAudio(text, currentId)
                return
            }

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'ja-JP'
            utterance.rate = voiceRate
            utterance.pitch = voicePitch

            // Use selected voice or fallback
            const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI)
            if (voice) {
                utterance.voice = voice
            }

            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = (e) => {
                console.error("Browser TTS failed, trying backend...", e)
                setIsSpeaking(false)
                // Fallback to Backend TTS if current request is still valid
                if (ttsRequestId.current === currentId) {
                    playBackendAudio(text, currentId)
                }
            }

            try {
                window.speechSynthesis.speak(utterance)
            } catch (e) {
                console.error("Speech synthesis exception", e)
                if (ttsRequestId.current === currentId) {
                    playBackendAudio(text, currentId)
                }
            }
        } else {
            // No browser support, use backend directly
            playBackendAudio(text, currentId)
        }
    }

    const playBackendAudio = async (text: string, requestId: number, voice?: string) => {
        try {
            if (ttsRequestId.current !== requestId) return // Cancel if new request started

            setIsSpeaking(true)
            console.log("Requesting backend TTS for:", text, "Voice:", voice)
            const data = await agentApi.sensei.tts(text, voice)

            if (ttsRequestId.current !== requestId) return // Check again after await


            console.log("Received backend audio data length:", data.url?.length)

            if (data.url) {
                const audio = new Audio(data.url)
                audioRef.current = audio // Store reference

                audio.onended = () => {
                    if (ttsRequestId.current === requestId) setIsSpeaking(false)
                    if (audioRef.current === audio) audioRef.current = null
                }
                audio.onerror = (e) => {
                    console.error("Backend audio playback failed", e)
                    if (ttsRequestId.current === requestId) setIsSpeaking(false)
                    if (audioRef.current === audio) audioRef.current = null

                    const errorMsg = (audio.error && audio.error.code === 4)
                        ? "Trình duyệt không hỗ trợ định dạng âm thanh này (thiếu codec MP3?)."
                        : "Lỗi phát âm thanh từ server."
                    setVoiceError(errorMsg)
                }
                await audio.play()
            } else {
                console.error("No audio URL returned from backend")
                setIsSpeaking(false)
            }
        } catch (error) {
            if (ttsRequestId.current !== requestId) return
            console.error("Backend TTS request failed", error)
            setIsSpeaking(false)
            setVoiceError("Lỗi kết nối tới máy chủ TTS.")
        }
    }

    const stopSpeaking = () => {
        // Invalidate any pending requests
        ttsRequestId.current += 1

        // Stop Browser TTS
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel()
        }

        // Stop Backend Audio
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

            // Add the initial AI greeting
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

            if (res.response && autoPlay) {
                speak(res.response)
            }
        } catch (error: any) {
            console.error("Failed to start roleplay", error)
            toast.error(error.message || "Không thể bắt đầu hội thoại. Vui lòng thử lại.")
            setIsStarted(false)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSend = async (data: InputFormData) => {
        if (!data.text.trim() || isLoading) return

        // Auto-stop voice recognition when sending
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }

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
            const currentHistory = history
            const nextHistory = [...currentHistory, { role: 'user', content: userMsgText }]

            const data = await agentApi.sensei.roleplay(topicForm.getValues("topic"), userMsgText, nextHistory)
            addTokenUsage(data.tokenUsage)

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                romaji: data.romaji,
                vietnamese: data.vietnamese
            }

            setMessages(prev => [...prev, aiMsg])
            setHistory([...nextHistory, { role: 'model', content: JSON.stringify(data) }])
            queryClient.invalidateQueries({ queryKey: ["quota-status"] })

            if (data.response && autoPlay) {
                speak(data.response)
            }

            if (data.isFinished && data.feedback) {
                const feedbackMsg: Message = {
                    id: (Date.now() + 2).toString(),
                    role: 'assistant',
                    content: data.feedback,
                    isFeedback: true
                }
                setMessages(prev => [...prev, feedbackMsg])
            }

        } catch (error: any) {
            console.error("Failed to reply", error)
            toast.error(error.message || "Không thể gửi tin nhắn. Vui lòng thử lại.")
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
        // Optimistic UI: Close immediately
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
        setVoiceError(null)
        setIsFinished(false)

        // Background deduction
        const userTurns = currentHistory.filter(m => m.role === 'user').length
        if (wasStarted && !wasFinished && userTurns > 0) {
            console.log('[billing] Background deduction triggered by reset');
            agentApi.sensei.roleplay(currentTopic, "", currentHistory, true).catch(err => {
                console.error('[billing] Reset deduction failed', err);
            });
        }
    }

    const handleFinish = async () => {
        console.log('[DEBUG] handleFinish called', { isLoading, turnCount, historyLength: history.length });
        if (isLoading) return
        setIsLoading(true)

        try {
            console.log('[DEBUG] Calling roleplay API with isFinal=true');
            // Signal backend to finish and generate feedback
            const data = await agentApi.sensei.roleplay(topicForm.getValues("topic"), "", history, true) // isFinal = true
            console.log('[DEBUG] Roleplay API response:', data);
            addTokenUsage(data.tokenUsage)

            if (data.isFinished && data.feedback) {
                const feedbackMsg: Message = {
                    id: (Date.now() + 2).toString(),
                    role: 'assistant',
                    content: data.feedback,
                    isFeedback: true
                }
                setMessages(prev => [...prev, feedbackMsg])

                // Final closing message if any
                if (data.response) {
                    const closingMsg: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: data.response,
                        romaji: data.romaji,
                        vietnamese: data.vietnamese
                    }
                    // Insert closing message before feedback
                    setMessages(prev => {
                        const newMsgs = [...prev]
                        newMsgs.pop() // Remove feedback temporarily
                        newMsgs.push(closingMsg)
                        newMsgs.push(feedbackMsg)
                        return newMsgs
                    })

                    if (autoPlay) speak(data.response)
                }

                // Mark as finished to show return button
                setIsFinished(true)
            }
        } catch (error) {
            console.error("Failed to finish roleplay", error)
        } finally {
            setIsLoading(false)
        }
    }

    const testVoice = () => {
        speak("こんにちは、音声テストです。")
    }

    // Calculate turns (user messages count)
    const turnCount = messages.filter(m => m.role === 'user').length

    if (!isStarted) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 max-w-2xl mx-auto p-6 w-full">
                <div className="w-full space-y-6">
                    <div className="text-center space-y-4">
                        <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-8 text-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-2xl font-bold">Roleplay với Sensei</h2>
                            <p className="text-sm text-muted-foreground">
                                Chọn một chủ đề và bắt đầu hội thoại. Sensei sẽ đóng vai và phản hồi sau khi kết thúc.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-4 max-w-md mx-auto">
                            <Controller
                                name="topic"
                                control={topicForm.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Nhập chủ đề (VD: Mua vé tàu, Phỏng vấn xin việc)..."
                                            className="h-11 rounded-xl"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') topicForm.handleSubmit(handleStart)()
                                            }}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Button
                                size="lg"
                                className="w-full h-11 font-bold uppercase tracking-widest text-[10px] rounded-xl"
                                onClick={topicForm.handleSubmit(handleStart)}
                                disabled={!topicForm.watch("topic").trim() || isLoading}
                            >
                                {isLoading ? <Spinner className="mr-2" /> : null}
                                Bắt đầu hội thoại
                            </Button>
                        </div>

                        <div className="pt-6 border-t border-border/30">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-4">Gợi ý chủ đề</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {["Đi siêu thị", "Gọi điện thoại", "Hỏi đường", "Kết bạn mới", "Tại sân bay"].map(t => (
                                    <Button
                                        key={t}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => topicForm.setValue("topic", t)}
                                        className="rounded-full text-[10px] font-bold uppercase tracking-wider h-8"
                                    >
                                        {t}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden relative">
            {/* Header */}
            <div className="flex-none flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="size-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base leading-none">{topicForm.getValues("topic")}</h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                {isFinished ? "Đã kết thúc" : `${turnCount} lượt trao đổi • Đang hội thoại`}
                            </p>
                            {sessionTokens.total > 0 && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                                    <Zap className="size-3 text-yellow-500 shrink-0" />
                                    <span className="text-muted-foreground">{sessionTokens.total.toLocaleString()} tokens</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Return Button after finish */}
                    {isFinished && (
                        <Button
                            variant="default"
                            size="sm"
                            className="h-9 px-4 font-bold uppercase tracking-widest text-[10px]"
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

                    {/* Finish Button */}
                    {!isFinished && turnCount >= 5 && (
                        <Button
                            variant="default"
                            size="sm"
                            className="h-9 px-4 font-bold uppercase tracking-widest text-[10px]"
                            onClick={handleFinish}
                            disabled={isLoading}
                        >
                            <CheckCircle className="size-3.5 mr-2" /> Kết thúc & Đánh giá
                        </Button>
                    )}

                    <Dialog open={showSettings} onOpenChange={setShowSettings}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                                <Settings className="size-3.5 mr-2" /> Cài đặt
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Cài đặt hội thoại</DialogTitle>
                                <DialogDescription>
                                    Tùy chỉnh giọng đọc và hiển thị phụ đề của AI.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <FieldLabel className="text-sm font-bold">Hiển thị Romaji & Tiếng Việt</FieldLabel>
                                        <p className="text-xs text-muted-foreground">
                                            Hiển thị cách phát âm và bản dịch cho câu thoại của Sensei
                                        </p>
                                    </div>
                                    <Switch
                                        checked={showTranslation}
                                        onCheckedChange={setShowTranslation}
                                    />
                                </div>
                                <Field>
                                    <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Giọng đọc (Voice)</FieldLabel>
                                    <Select value={selectedVoiceURI} onValueChange={setSelectedVoiceURI}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn giọng đọc..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="server-voice" className="font-medium">
                                                Server (Google - Cơ bản)
                                            </SelectItem>
                                            <SelectItem value="ja-JP-NanamiNeural" className="font-medium text-primary">
                                                Server (Nanami - Nữ, Tự nhiên)
                                            </SelectItem>
                                            <SelectItem value="ja-JP-KeitaNeural" className="font-medium text-primary">
                                                Server (Keita - Nam, Tự nhiên)
                                            </SelectItem>

                                            {availableVoices.length > 0 && (
                                                <div className="mx-2 my-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                                                    Giọng từ trình duyệt
                                                </div>
                                            )}

                                            {availableVoices.map(voice => (
                                                <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                                                    {voice.name} ({voice.lang})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Button onClick={testVoice} className="w-full font-bold uppercase tracking-widest text-[10px]" variant="secondary">
                                    <Play className="size-3.5 mr-2" /> Nghe thử giọng nói
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const newState = !autoPlay
                            setAutoPlay(newState)
                            if (!newState) stopSpeaking()
                        }}
                        className={cn("h-9 font-bold uppercase tracking-widest text-[10px] transition-colors", autoPlay ? "text-primary bg-primary/10" : "text-muted-foreground")}
                    >
                        {autoPlay ? <Volume2 className="size-3.5 mr-2" /> : <VolumeX className="size-3.5 mr-2" />}
                        {autoPlay ? "Bật" : "Tắt"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                        <RefreshCcw className="size-3.5 mr-2" /> Thoát
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 scroll-smooth" ref={scrollRef}>
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[85%] md:max-w-[75%]",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                {/* Message bubble */}
                                <div className={cn(
                                    "relative space-y-2",
                                    msg.role === 'user' ? "ml-auto" : "mr-auto"
                                )}>
                                    <div className={cn(
                                        "p-4 rounded-xl text-base leading-relaxed border shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : msg.isFeedback
                                                ? "bg-muted border-border font-medium"
                                                : "bg-card border-border"
                                    )}>
                                        {msg.isFeedback ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-4">
                                                <p className="flex-1">{msg.content}</p>
                                                {msg.role === 'assistant' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => speak(msg.content)}
                                                        className="h-8 w-8 rounded-full shrink-0"
                                                    >
                                                        <Volume2 className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Helper text for AI responses */}
                                    {msg.role === 'assistant' && !msg.isFeedback && showTranslation && (
                                        <div className="px-1 space-y-1">
                                            {msg.romaji && <p className="text-[10px] text-primary/70 font-bold italic tracking-wider">{msg.romaji}</p>}
                                            {msg.vietnamese && <p className="text-xs text-muted-foreground font-medium">{msg.vietnamese}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Show Typing Indicator */}
                    {isLoading && (
                        <div className="flex justify-start w-full animate-pulse">
                            <div className="bg-muted border border-border rounded-lg p-4 flex items-center gap-2">
                                <div className="size-2 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="size-2 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="size-2 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 bg-background border-t border-border">
                {/* Listening UI */}
                {isListening && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-destructive/10 text-destructive px-6 py-2 rounded-full border border-destructive/20 backdrop-blur-sm z-20 flex items-center gap-2 animate-pulse">
                        <div className="flex items-center gap-1 h-4">
                            <span className="w-1 h-3 bg-destructive rounded-full" />
                            <span className="w-1 h-2 bg-destructive rounded-full" />
                            <span className="w-1 h-4 bg-destructive rounded-full" />
                            <span className="w-1 h-2 bg-destructive rounded-full" />
                        </div>
                        <span className="font-bold text-sm">Đang lắng nghe...</span>
                    </div>
                )}


                <div className="max-w-3xl mx-auto flex gap-2">
                    <Button
                        size="icon"
                        variant={isListening ? "destructive" : "outline"}
                        className={cn(
                            "h-12 w-12 rounded-lg",
                            isListening && "ring-2 ring-destructive ring-offset-2"
                        )}
                        onClick={toggleListening}
                        disabled={!isSpeechSupported || isFinished}
                    >
                        {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                    </Button>

                    <Controller
                        name="text"
                        control={inputForm.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="flex-1">
                                <div className="relative">
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder={isFinished ? "Cuộc hội thoại đã kết thúc" : "Nhập tin nhắn tiếng Nhật..."}
                                        className="h-12 pr-12"
                                        onKeyDown={handleKeyDown}
                                        disabled={isLoading || isFinished}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <Button
                                        size="icon"
                                        className="absolute right-1 top-1 h-10 w-10"
                                        onClick={inputForm.handleSubmit(handleSend)}
                                        disabled={!field.value.trim() || isLoading || isFinished}
                                    >
                                        <Send className="size-4" />
                                    </Button>
                                </div>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}
