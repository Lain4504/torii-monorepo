"use client"

import * as React from "react"
import { Send, Sparkles, RefreshCcw, CheckCircle, AlertCircle, Mic, MicOff, Volume2, VolumeX, Settings, Play } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { agentApi } from "@/apis/services/agent-api"
import { cn } from "@workspace/ui/lib/utils"

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    romaji?: string // For assistant
    english?: string // For assistant
    isFeedback?: boolean
}

export function InteractiveRoleplay() {
    const [topic, setTopic] = React.useState("")
    const [isStarted, setIsStarted] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([])
    const [inputText, setInputText] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [history, setHistory] = React.useState<any[]>([])
    const [isFinished, setIsFinished] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Voice State
    const [isListening, setIsListening] = React.useState(false)
    const [_isSpeaking, setIsSpeaking] = React.useState(false)

    const [autoPlay, setAutoPlay] = React.useState(true) // Auto-play AI responses
    const recognitionRef = React.useRef<any>(null)
    const [voiceError, setVoiceError] = React.useState<string | null>(null)
    const [isSpeechSupported, setIsSpeechSupported] = React.useState(false)
    const [isSupportChecked, setIsSupportChecked] = React.useState(false)

    // TTS Voice Management
    const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([])
    const [selectedVoiceURI, setSelectedVoiceURI] = React.useState<string>("")
    // const [voiceRate, setVoiceRate] = React.useState(1.0)
    // const [voicePitch, setVoicePitch] = React.useState(1.0)
    const voiceRate = 1.0;
    const voicePitch = 1.0;
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
                        setInputText(prev => prev + finalTranscript)
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

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort()
                    recognitionRef.current = null
                } catch {
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

        // ... (rest of speak function unchanged)
        // Check if selected voice is a browser voice
        const isBrowserVoice = availableVoices.some(v => v.voiceURI === selectedVoiceURI)

        // If server voice is explicitly selected (and not found in browser availability)
        if (!isBrowserVoice && (selectedVoiceURI === 'server-voice' || selectedVoiceURI.includes('Neural'))) {
            const voice = selectedVoiceURI === 'server-voice' ? undefined : selectedVoiceURI
            playBackendAudio(text, currentId, voice)
            return
        }
        // ...
        // ...
        // ...
        <Button
            variant="ghost"
            size="sm"
            onClick={() => {
                const newState = !autoPlay
                setAutoPlay(newState)
                if (!newState) stopSpeaking()
            }}
            className={cn("text-muted-foreground", autoPlay && "text-orange-600 bg-orange-50 dark:bg-orange-900/20")}
            title={autoPlay ? "Tắt âm thanh" : "Bật âm thanh"}
        >
            {autoPlay ? <Volume2 className="size-4 mr-2" /> : <VolumeX className="size-4 mr-2" />}
            {autoPlay ? "Âm thanh: Bật" : "Âm thanh: Tắt"}
        </Button>

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

    const handleStart = async () => {
        if (!topic.trim()) return
        setIsStarted(true)
        setIsLoading(true)

        try {
            const data = await agentApi.sensei.roleplay(topic, "", [])

            const aiMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.response,
                romaji: data.romaji,
                english: data.english
            }

            setMessages([aiMsg])
            setHistory([{ role: 'model', content: JSON.stringify(data) }])

            if (data.response && autoPlay) {
                setTimeout(() => speak(data.response), 500)
            }

        } catch (error) {
            console.error("Failed to start roleplay", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return

        // Auto-stop voice recognition when sending
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }

        const userMsgText = inputText
        setInputText("")

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

            const data = await agentApi.sensei.roleplay(topic, userMsgText, nextHistory)

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                romaji: data.romaji,
                english: data.english
            }

            setMessages(prev => [...prev, aiMsg])
            setHistory([...nextHistory, { role: 'model', content: JSON.stringify(data) }])

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

        } catch (error) {
            console.error("Failed to reply", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleReset = () => {
        stopSpeaking()
        setIsStarted(false)
        setMessages([])
        setHistory([])
        setTopic("")
        setInputText("")
        setVoiceError(null)
    }

    const handleFinish = async () => {
        console.log('[DEBUG] handleFinish called', { isLoading, turnCount, historyLength: history.length });
        if (isLoading) return
        setIsLoading(true)

        try {
            console.log('[DEBUG] Calling roleplay API with isFinal=true');
            // Signal backend to finish and generate feedback
            const data = await agentApi.sensei.roleplay(topic, "", history, true) // isFinal = true
            console.log('[DEBUG] Roleplay API response:', data);

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
                        english: data.english
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
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 max-w-2xl mx-auto p-6">
                <div className="w-full space-y-8 p-10 rounded-2xl border border-border bg-card/50 shadow-sm text-center backdrop-blur-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-6">
                        <Sparkles className="size-10 text-orange-600 dark:text-orange-400" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight">Roleplay với Sensei</h2>
                        <p className="text-muted-foreground text-lg">
                            Chọn bất kỳ chủ đề nào và bắt đầu hội thoại. <br />
                            Sensei sẽ đóng vai và đưa ra phản hồi sau khi kết thúc.
                        </p>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        <Input
                            placeholder="Nhập chủ đề (VD: Mua vé tàu, Phỏng vấn xin việc)..."
                            className="h-12 text-lg"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleStart()
                            }}
                        />
                        <Button
                            className="w-full h-12 text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all hover:scale-[1.02]"
                            onClick={handleStart}
                            disabled={!topic.trim() || isLoading}
                        >
                            {isLoading ? "Đang khởi tạo..." : "Bắt đầu hội thoại"}
                        </Button>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Gợi ý chủ đề</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {["Đi siêu thị", "Gọi điện thoại", "Hỏi đường", "Kết bạn mới", "Tại sân bay"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTopic(t)}
                                    className="px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground text-sm transition-colors"
                                >
                                    {t}
                                </button>
                            ))}
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
                    <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <Sparkles className="size-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">{topic}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isFinished ? "Đã kết thúc" : `${turnCount} lượt trao đổi • Đang hội thoại`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Return Button after finish */}
                    {isFinished && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                                setIsStarted(false)
                                setMessages([])
                                setHistory([])
                                setTopic("")
                                setIsFinished(false)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <RefreshCcw className="size-4 mr-2" /> Quay về
                        </Button>
                    )}

                    {/* Finish Button */}
                    {!isFinished && turnCount >= 5 && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleFinish}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isLoading}
                        >
                            <CheckCircle className="size-4 mr-2" /> Kết thúc & Đánh giá
                        </Button>
                    )}

                    <Dialog open={showSettings} onOpenChange={setShowSettings}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                <Settings className="size-4 mr-2" /> Cài đặt ({selectedVoiceURI === 'server-voice' ? "Server Voice" : (selectedVoiceURI ? "Đã chọn" : "Tự động")})
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Cài đặt giọng nói</DialogTitle>
                                <DialogDescription>
                                    Chọn giọng đọc và kiểm tra âm thanh.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Giọng đọc (Voice)</label>
                                    <Select value={selectedVoiceURI} onValueChange={setSelectedVoiceURI}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn giọng đọc..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="server-voice" className="font-medium text-orange-600 dark:text-orange-400">
                                                Server (Google - Cơ bản)
                                            </SelectItem>
                                            <SelectItem value="ja-JP-NanamiNeural" className="font-medium text-indigo-600 dark:text-indigo-400">
                                                Server (Nanami - Nữ, Tự nhiên)
                                            </SelectItem>
                                            <SelectItem value="ja-JP-KeitaNeural" className="font-medium text-blue-600 dark:text-blue-400">
                                                Server (Keita - Nam, Tự nhiên)
                                            </SelectItem>

                                            <div className="mx-2 my-2 text-xs text-muted-foreground font-medium uppercase tracking-wider op-70">
                                                Giọng từ trình duyệt của bạn:
                                            </div>

                                            {availableVoices.length === 0 ? (
                                                <SelectItem value="none" disabled>Không tìm thấy giọng đọc nào</SelectItem>
                                            ) : (
                                                availableVoices.map(voice => (
                                                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                                                        {voice.name} ({voice.lang})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Nếu trình duyệt không có giọng đọc tiếng Nhật, hãy chọn "Server Voice".
                                    </p>
                                </div>

                                <Button onClick={testVoice} className="w-full" variant="secondary">
                                    <Play className="size-4 mr-2" /> Nghe thử giọng nói
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
                        className={cn("text-muted-foreground", autoPlay && "text-orange-600 bg-orange-50 dark:bg-orange-900/20")}
                        title={autoPlay ? "Tắt âm thanh" : "Bật âm thanh"}
                    >
                        {autoPlay ? <Volume2 className="size-4 mr-2" /> : <VolumeX className="size-4 mr-2" />}
                        {autoPlay ? "Âm thanh: Bật" : "Âm thanh: Tắt"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                        <RefreshCcw className="size-4 mr-2" /> Thoát
                    </Button>
                </div>
            </div>

            {/* Browser Incompatibility Warning */}
            {isSupportChecked && !isSpeechSupported && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-4 py-2 text-sm text-center border-b border-yellow-200 dark:border-yellow-900/50 flex items-center justify-center gap-2 relative">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4" />
                        <span>
                            Trình duyệt này có thể không hỗ trợ nhận diện giọng nói hoặc cần quyền truy cập microphone/HTTPS.
                        </span>
                    </div>
                    <button
                        onClick={() => setIsSupportChecked(false)}
                        className="absolute right-4 hover:opacity-70"
                        title="Đóng thông báo"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Error Message Toast */}
            {voiceError && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    {voiceError}
                    <button onClick={() => setVoiceError(null)} className="ml-2 hover:opacity-80">✕</button>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 scroll-smooth" ref={scrollRef}>
                <div className="max-w-4xl mx-auto space-y-4">
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
                                    "relative group",
                                    msg.role === 'user'
                                        ? "ml-auto"
                                        : "mr-auto"
                                )}>
                                    <div className={cn(
                                        "p-4 rounded-2xl text-base leading-relaxed relative",
                                        msg.role === 'user'
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20"
                                            : msg.isFeedback
                                                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 text-green-900 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 dark:text-green-100 shadow-lg"
                                                : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 text-foreground shadow-md"
                                    )}>
                                        {msg.isFeedback ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <div className="markdown-content whitespace-pre-wrap font-medium">{msg.content}</div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-2">
                                                <p className="flex-1">{msg.content}</p>
                                                {/* Speak button for individual messages */}
                                                {msg.role === 'assistant' && (
                                                    <button
                                                        onClick={() => speak(msg.content)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full flex-shrink-0"
                                                        title="Đọc lại"
                                                    >
                                                        <Volume2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Helper text for AI responses */}
                                {msg.role === 'assistant' && !msg.isFeedback && (
                                    <div className="px-3 mt-2 space-y-1 text-left">
                                        {msg.romaji && <p className="text-xs text-muted-foreground font-medium italic">{msg.romaji}</p>}
                                        {msg.english && <p className="text-xs text-muted-foreground opacity-70">{msg.english}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Show Typing Indicator */}
                    {isLoading && (
                        <div className="flex justify-start w-full animate-pulse">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-md flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 bg-background border-t border-border">
                {/* Listening UI */}
                {isListening && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 px-6 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse border border-red-200 backdrop-blur-sm dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-400 z-20">
                        <div className="flex items-center gap-1 h-4">
                            <span className="w-1 h-3 bg-red-500 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" />
                            <span className="w-1 h-2 bg-red-500 rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.2s]" />
                            <span className="w-1 h-4 bg-red-500 rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.4s]" />
                            <span className="w-1 h-2 bg-red-500 rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.1s]" />
                        </div>
                        <span className="font-medium text-sm">Đang lắng nghe...</span>
                    </div>
                )}

                <div className="max-w-3xl mx-auto flex gap-2">
                    <Button
                        size="icon"
                        variant={isListening ? "destructive" : "outline"}
                        className={cn(
                            "h-12 w-12 rounded-xl shadow-sm transition-all relative overflow-hidden",
                            isListening && "ring-2 ring-red-500 ring-offset-2",
                            !isSpeechSupported && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                        )}
                        onClick={toggleListening}
                        title={!isSpeechSupported ? "Trình duyệt của bạn không hỗ trợ tính năng này (thử Chrome/Edge)" : (isListening ? "Dừng ghi âm" : "Nói để nhập liệu (Tiếng Nhật)")}
                        disabled={!isSpeechSupported || isFinished}
                    >
                        {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}

                        {/* Ripple effect for listening state */}
                        {isListening && <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />}
                    </Button>
                    <Input
                        placeholder={isListening ? "Đang lắng nghe..." : (!isSpeechSupported ? "Voice chat không khả dụng trên trình duyệt này" : "Nhập tin nhắn...")}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 h-12 text-base rounded-xl shadow-sm bg-card"
                        disabled={isLoading || isFinished}
                    />
                    <Button
                        size="icon"
                        className={cn("h-12 w-12 rounded-xl shadow-sm", isLoading ? "bg-muted text-muted-foreground" : "bg-orange-600 hover:bg-orange-700 text-white")}
                        onClick={handleSend}
                        disabled={!inputText.trim() || isLoading || isFinished}
                    >
                        <Send className="size-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
