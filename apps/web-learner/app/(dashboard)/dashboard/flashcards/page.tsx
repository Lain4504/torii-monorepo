'use client'

import { useQuery } from '@tanstack/react-query'
import { flashcardApi } from '@/apis/services/flashcard-api'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import {
    Sparkles,
    Plus,
    Search,
    Layers,
    Clock,
    BrainCircuit,
    MoreVertical,
    Trash2,
    Edit
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { toast } from '@workspace/ui/components/sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agentApi } from '@/apis/services/agent-api'

export default function FlashcardsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery] = useDebounceValue(searchQuery, 300)
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false)
    const [isAiDeckModalOpen, setIsAiDeckModalOpen] = useState(false)
    const [editingDeck, setEditingDeck] = useState<any>(null)
    const [aiTopic, setAiTopic] = useState('')
    const [isGeneratingAi, setIsGeneratingAi] = useState(false)
    const queryClient = useQueryClient()

    // Form states
    const [deckName, setDeckName] = useState('')
    const [deckDesc, setDeckDesc] = useState('')
    const [jlptLevel, setJlptLevel] = useState('N5')

    const { data: decksData, isLoading } = useQuery({
        queryKey: ['flashcard-decks', debouncedSearchQuery],
        queryFn: () => flashcardApi.getDecks({ search: debouncedSearchQuery }),
    })

    const createDeckMutation = useMutation({
        mutationFn: flashcardApi.createDeck,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            setIsDeckModalOpen(false)
            resetForm()
            toast.success("Bộ thẻ mới đã được tạo!")
        },
        onError: () => toast.error("Không thể tạo bộ thẻ.")
    })

    const updateDeckMutation = useMutation({
        mutationFn: (data: { id: string, input: any }) => flashcardApi.updateDeck(data.id, data.input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            setIsDeckModalOpen(false)
            resetForm()
            toast.success("Đã cập nhật bộ thẻ!")
        },
        onError: () => toast.error("Không thể cập nhật bộ thẻ.")
    })

    const deleteDeckMutation = useMutation({
        mutationFn: flashcardApi.deleteDeck,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            toast.success("Đã xóa bộ thẻ!")
        },
        onError: () => toast.error("Không thể xóa bộ thẻ.")
    })

    const handleSaveDeck = () => {
        if (!deckName) return toast.error("Vui lòng nhập tên bộ thẻ.")

        if (editingDeck) {
            updateDeckMutation.mutate({
                id: editingDeck.id,
                input: { name: deckName, description: deckDesc, jlptLevel }
            })
        } else {
            createDeckMutation.mutate({ name: deckName, description: deckDesc, jlptLevel })
        }
    }

    const resetForm = () => {
        setDeckName('')
        setDeckDesc('')
        setJlptLevel('N5')
        setEditingDeck(null)
    }

    const startEditing = (deck: any) => {
        setEditingDeck(deck)
        setDeckName(deck.name)
        setDeckDesc(deck.description || '')
        setJlptLevel(deck.jlptLevel || 'N5')
        setIsDeckModalOpen(true)
    }

    const decks = decksData?.data || []

    const handleAiDeckCreate = async () => {
        if (!deckName.trim() || !aiTopic.trim()) {
            toast.error("Vui lòng nhập tên bộ thẻ và chủ đề.")
            return
        }
        setIsGeneratingAi(true)
        try {
            // 1. Create Deck
            const deck = await flashcardApi.createDeck({
                name: deckName,
                description: `AI Generated: ${aiTopic}`,
                jlptLevel
            })

            // 2. Generate Cards
            const level = jlptLevel === 'All' ? 'intermediate' : jlptLevel.toLowerCase() as 'beginner' | 'intermediate' | 'advanced'
            const result = await agentApi.sensei.createFlashcard(aiTopic, level)

            // 3. Save Cards
            const createData = result.flashcards.map(card => ({
                deckId: deck.id,
                frontText: card.front,
                backText: card.back,
                furigana: card.reading || '',
                exampleSentence: ''
            }))

            if (createData.length > 0) {
                await flashcardApi.bulkOperations({ create: createData })
            }

            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            setIsAiDeckModalOpen(false)
            resetForm()
            setAiTopic('')
            toast.success("Đã tạo bộ thẻ AI thành công!")
            router.push(`/dashboard/flashcards/${deck.id}/manage`)

        } catch (error: any) {
            toast.error(error.message || "Lỗi khi tạo bộ thẻ AI.")
            console.error(error)
        } finally {
            setIsGeneratingAi(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-serif font-bold italic uppercase tracking-wide">
                        <BrainCircuit className="size-3.5" />
                        Trí nhớ
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Kho <span className="text-primary not-italic">Thẻ Nhớ</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Hệ thống ghi nhớ dài hạn tích cực. Thuật toán SRS đã sẵn sàng.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="TÌM KIẾM BỘ THẺ..."
                            className="pl-10 h-12 rounded-2xl bg-muted/10 border-border/40 focus:bg-background/80 transition-all font-bold uppercase tracking-wider text-[10px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { resetForm(); setIsDeckModalOpen(true) }}
                        className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="size-4 mr-2" />
                        Tạo Bộ Thẻ Mới
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => { resetForm(); setIsAiDeckModalOpen(true) }}
                        className="h-12 px-6 rounded-2xl border-pink-500/20 bg-pink-500/10 text-pink-500 font-black uppercase tracking-widest text-[10px] hover:bg-pink-500/20 transition-all"
                    >
                        <Sparkles className="size-4 mr-2" />
                        AI Create Deck
                    </Button>
                </div>
            </div>

            {/* Decks Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-64 animate-pulse bg-muted/10 border-white/5 rounded-[2rem]" />
                    ))}
                </div>
            ) : decks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-[3rem] bg-white/5">
                    <div className="p-6 rounded-full bg-muted/10 mb-6">
                        <Layers className="size-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight italic text-muted-foreground/50">Không tìm thấy bộ thẻ</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-2">Tạo bộ thẻ mới để bắt đầu quá trình ôn tập ghi nhớ.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map((deck) => (
                        <Card key={deck.id} className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 bg-background/50 backdrop-blur-xl border-border/40 rounded-[2rem] h-full shadow-md">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="p-6 space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                        <Sparkles className="size-6" />
                                    </div>
                                    <div className="flex items-start gap-2">
                                        {deck.jlptLevel && (
                                            <span className="px-3 py-1 rounded-full bg-muted/10 border border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                {deck.jlptLevel}
                                            </span>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-muted/20">
                                                    <MoreVertical className="size-4 text-muted-foreground/40" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-xl bg-background/90 backdrop-blur-3xl p-1">
                                                <DropdownMenuItem
                                                    onClick={() => startEditing(deck)}
                                                    className="text-[10px] font-bold uppercase tracking-wider rounded-lg p-2 cursor-pointer"
                                                >
                                                    <Edit className="size-3 mr-2" /> Chỉnh sửa bộ thẻ
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/dashboard/flashcards/${deck.id}/manage`)}
                                                    className="text-[10px] font-bold uppercase tracking-wider rounded-lg p-2 cursor-pointer"
                                                >
                                                    <Layers className="size-3 mr-2" /> Quản lý nội dung
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => deleteDeckMutation.mutate(deck.id)}
                                                    className="text-[10px] font-bold uppercase tracking-wider rounded-lg p-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                >
                                                    <Trash2 className="size-3 mr-2" /> Xóa bộ thẻ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-black uppercase italic tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                                        {deck.name}
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground/60 line-clamp-2 min-h-[2.5em]">
                                        {deck.description || "Không có mô tả cho bộ thẻ này."}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-border/20 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground/40">
                                            <Layers className="size-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{deck.cardCount} Thẻ</span>
                                        </div>
                                        {deck.lastStudiedAt && (
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <Clock className="size-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                    {formatDistanceToNow(new Date(deck.lastStudiedAt))} trước
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Link href={`/dashboard/flashcards/${deck.id}`} className="w-full">
                                        <Button className="w-full h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                                            Bắt đầu học
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Deck Modal */}
            <Dialog open={isDeckModalOpen} onOpenChange={setIsDeckModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-2xl border-white/10 rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif font-bold italic uppercase tracking-tight">
                            {editingDeck ? 'Cập nhật bộ thẻ' : 'Tạo bộ thẻ mới'}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            Hệ thống quản lý kho tri thức cá nhân
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tên bộ thẻ</Label>
                            <Input
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                className="h-12 rounded-xl bg-white/5 border-white/10 font-bold"
                                placeholder="VD: 2000 Kanji thông dụng"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mô tả</Label>
                            <Input
                                value={deckDesc}
                                onChange={(e) => setDeckDesc(e.target.value)}
                                className="h-12 rounded-xl bg-white/5 border-white/10"
                                placeholder="Mục tiêu học tập của bạn..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Cấp độ JLPT</Label>
                            <Select value={jlptLevel} onValueChange={setJlptLevel}>
                                <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10">
                                    <SelectValue placeholder="Chọn cấp độ" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                                    <SelectItem value="N5">N5</SelectItem>
                                    <SelectItem value="N4">N4</SelectItem>
                                    <SelectItem value="N3">N3</SelectItem>
                                    <SelectItem value="N2">N2</SelectItem>
                                    <SelectItem value="N1">N1</SelectItem>
                                    <SelectItem value="All">All Levels</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleSaveDeck}
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]"
                        >
                            {editingDeck ? 'CẬP NHẬT' : 'XÁC NHẬN TẠO'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Create Deck Modal */}
            <Dialog open={isAiDeckModalOpen} onOpenChange={setIsAiDeckModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-background/80 backdrop-blur-2xl border-pink-500/20 rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif font-bold italic uppercase tracking-tight flex items-center gap-2">
                            <Sparkles className="size-6 text-pink-500" />
                            AI Sensei Deck Creator
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            Tạo bộ thẻ & sinh từ vựng tự động
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-4 flex gap-4">
                            <BrainCircuit className="size-5 text-pink-500 shrink-0" />
                            <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                                Nhập tên bộ thẻ và chủ đề. AI sẽ tự động tạo bộ thẻ mới và điền sẵn các từ vựng phù hợp cho bạn.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tên bộ thẻ</Label>
                            <Input
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                className="h-12 rounded-xl bg-white/5 border-pink-500/20 font-bold"
                                placeholder="VD: Từ vựng Du lịch Nhật Bản"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Chủ đề từ khóa (Cho AI)</Label>
                            <Input
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                className="h-12 rounded-xl bg-white/5 border-pink-500/20 font-bold"
                                placeholder="VD: Nhà hàng, Sân bay, Khách sạn..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Cấp độ JLPT</Label>
                            <Select value={jlptLevel} onValueChange={setJlptLevel}>
                                <SelectTrigger className="h-12 rounded-xl bg-white/5 border-pink-500/20">
                                    <SelectValue placeholder="Chọn cấp độ" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                                    <SelectItem value="N5">N5</SelectItem>
                                    <SelectItem value="N4">N4</SelectItem>
                                    <SelectItem value="N3">N3</SelectItem>
                                    <SelectItem value="N2">N2</SelectItem>
                                    <SelectItem value="N1">N1</SelectItem>
                                    <SelectItem value="All">All Levels</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleAiDeckCreate}
                            className="w-full h-12 rounded-xl bg-pink-500 text-white hover:bg-pink-600 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-pink-500/20"
                            disabled={!aiTopic.trim() || !deckName.trim() || isGeneratingAi}
                        >
                            {isGeneratingAi ? 'ĐANG TẠO & SINH THẺ...' : 'TẠO BỘ THẺ AI'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

