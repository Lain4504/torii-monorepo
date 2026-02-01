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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-border">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        Kho thẻ nhớ
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                        Hệ thống ghi nhớ dài hạn tích cực. Tạo và quản lý các bộ thẻ của bạn.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm bộ thẻ..."
                            className="pl-10 h-10 rounded-xl bg-background border-input focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { resetForm(); setIsDeckModalOpen(true) }}
                        className="h-10 px-4 rounded-xl font-bold shadow-sm"
                    >
                        <Plus className="size-4 mr-2" />
                        Tạo bộ thẻ
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
                        <Card key={i} className="h-64 animate-pulse bg-muted/10 border-border rounded-2xl" />
                    ))}
                </div>
            ) : decks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/5">
                    <div className="p-4 rounded-full bg-muted/20 mb-4">
                        <Layers className="size-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Không tìm thấy bộ thẻ</h3>
                    <p className="text-sm text-muted-foreground mt-1">Tạo bộ thẻ mới để bắt đầu quá trình ôn tập ghi nhớ.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map((deck) => (
                        <Card key={deck.id} className="group relative overflow-hidden transition-all hover:shadow-lg bg-card border-border rounded-2xl h-full shadow-sm flex flex-col">
                            <div className="p-6 space-y-6 relative z-10 flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Sparkles className="size-6" />
                                    </div>
                                    <div className="flex items-start gap-2">
                                        {deck.jlptLevel && (
                                            <span className="px-2.5 py-0.5 rounded-md bg-muted text-xs font-bold text-muted-foreground">
                                                {deck.jlptLevel}
                                            </span>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-muted text-muted-foreground">
                                                    <MoreVertical className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                                                <DropdownMenuItem
                                                    onClick={() => startEditing(deck)}
                                                    className="text-xs font-medium rounded-lg cursor-pointer"
                                                >
                                                    <Edit className="size-3.5 mr-2" /> Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/dashboard/flashcards/${deck.id}/manage`)}
                                                    className="text-xs font-medium rounded-lg cursor-pointer"
                                                >
                                                    <Layers className="size-3.5 mr-2" /> Quản lý nội dung
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => deleteDeckMutation.mutate(deck.id)}
                                                    className="text-xs font-medium rounded-lg cursor-pointer text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="size-3.5 mr-2" /> Xóa bộ thẻ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                                        {deck.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                                        {deck.description || "Không có mô tả cho bộ thẻ này."}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-border/50 flex flex-col gap-4 mt-auto">
                                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Layers className="size-3.5" />
                                            <span>{deck.cardCount} thẻ</span>
                                        </div>
                                        {deck.lastStudiedAt && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="size-3.5" />
                                                <span>
                                                    {formatDistanceToNow(new Date(deck.lastStudiedAt))} trước
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Link href={`/dashboard/flashcards/${deck.id}`} className="w-full">
                                        <Button className="w-full h-10 rounded-xl font-bold shadow-sm">
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
                <DialogContent className="sm:max-w-[425px] rounded-2xl border-border bg-background shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingDeck ? 'Cập nhật bộ thẻ' : 'Tạo bộ thẻ mới'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Hệ thống quản lý kho tri thức cá nhân
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Tên bộ thẻ</Label>
                            <Input
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                className="h-10 rounded-lg text-sm font-medium"
                                placeholder="VD: 2000 Kanji thông dụng"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Mô tả</Label>
                            <Input
                                value={deckDesc}
                                onChange={(e) => setDeckDesc(e.target.value)}
                                className="h-10 rounded-lg text-sm"
                                placeholder="Mục tiêu học tập của bạn..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Cấp độ JLPT</Label>
                            <Select value={jlptLevel} onValueChange={setJlptLevel}>
                                <SelectTrigger className="h-10 rounded-lg bg-background">
                                    <SelectValue placeholder="Chọn cấp độ" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border">
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
                            className="w-full h-10 rounded-xl font-bold"
                        >
                            {editingDeck ? 'Cập nhật' : 'Xác nhận tạo'}
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

