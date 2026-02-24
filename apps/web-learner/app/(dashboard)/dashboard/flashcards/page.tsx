'use client'

import { useQuery } from '@tanstack/react-query'
import { flashcardApi } from '@/lib/api/services/flashcard-api'
import { Button } from '@workspace/ui/components/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import { Field, FieldLabel } from '@workspace/ui/components/field'
import { Spinner } from '@workspace/ui/components/spinner'
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
import { useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { toast } from '@workspace/ui/components/sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agentApi } from '@/lib/api/services/agent-api'

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
            const level = (jlptLevel === 'All' ? 'N3' : jlptLevel) as 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight">Kho thẻ nhớ</h1>
                    <p className="text-muted-foreground max-w-xl">
                        Hệ thống ghi nhớ dài hạn tích cực. Tạo và quản lý các bộ thẻ của bạn.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm bộ thẻ..."
                            className="pl-9 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            onClick={() => { resetForm(); setIsDeckModalOpen(true) }}
                            className="flex-1 sm:flex-none font-bold uppercase tracking-widest text-[10px]"
                        >
                            <Plus className="size-3.5 mr-2" />
                            Tạo bộ thẻ
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => { resetForm(); setIsAiDeckModalOpen(true) }}
                            className="flex-1 sm:flex-none border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-primary/10"
                        >
                            <Sparkles className="size-3.5 mr-2" />
                            AI Create Deck
                        </Button>
                    </div>
                </div>
            </div>

            {/* Decks Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-64 animate-pulse bg-muted/50 shadow-none border-border" />
                    ))}
                </div>
            ) : decks.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 border-dashed border-2 shadow-none bg-muted/5">
                    <div className="p-4 rounded-full bg-muted mb-4 text-muted-foreground/40">
                        <Layers className="size-8" />
                    </div>
                    <h3 className="text-lg font-bold">Không tìm thấy bộ thẻ</h3>
                    <p className="text-sm text-muted-foreground mt-1">Tạo bộ thẻ mới để bắt đầu quá trình ôn tập ghi nhớ.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map((deck) => (
                        <Card key={deck.id} className="group flex flex-col shadow-none hover:shadow-md transition-all border-border h-full overflow-hidden">
                            <CardHeader className="flex-none p-6 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Layers className="size-5" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {deck.jlptLevel && (
                                            <Badge variant="secondary" className="font-bold text-[10px] uppercase">
                                                {deck.jlptLevel}
                                            </Badge>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                                                    <MoreVertical className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => startEditing(deck)} className="text-sm font-medium">
                                                    <Edit className="size-3.5 mr-2" /> Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/flashcards/${deck.id}/manage`)} className="text-sm font-medium">
                                                    <BrainCircuit className="size-3.5 mr-2" /> Quản lý nội dung
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => deleteDeckMutation.mutate(deck.id)} className="text-sm font-medium text-destructive focus:text-destructive">
                                                    <Trash2 className="size-3.5 mr-2" /> Xóa bộ thẻ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mt-4">
                                    <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">{deck.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[40px] leading-relaxed">
                                        {deck.description || "Không có mô tả cho bộ thẻ này."}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col justify-end p-6 pt-0 mt-auto">
                                <div className="pt-4 border-t space-y-4">
                                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Layers className="size-3.5 opacity-60" />
                                            <span>{deck.cardCount} THẺ</span>
                                        </div>
                                        {deck.lastStudiedAt && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="size-3.5 opacity-60" />
                                                <span>
                                                    {formatDistanceToNow(new Date(deck.lastStudiedAt))}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Link href={`/dashboard/flashcards/${deck.id}`} className="w-full">
                                        <Button className="w-full font-bold uppercase tracking-widest text-[10px]">
                                            Bắt đầu học
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Deck Modal */}
            <Dialog open={isDeckModalOpen} onOpenChange={setIsDeckModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingDeck ? 'Cập nhật bộ thẻ' : 'Tạo bộ thẻ mới'}
                        </DialogTitle>
                        <DialogDescription>
                            Tạo một không gian để quản lý các thẻ nhớ theo chủ đề riêng của bạn.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <Field>
                            <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Tên bộ thẻ</FieldLabel>
                            <Input
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                placeholder="VD: 2000 Kanji thông dụng"
                                className="h-11"
                            />
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Mô tả</FieldLabel>
                            <Input
                                value={deckDesc}
                                onChange={(e) => setDeckDesc(e.target.value)}
                                placeholder="Mục tiêu học tập của bạn..."
                                className="h-11"
                            />
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Cấp độ JLPT</FieldLabel>
                            <Select value={jlptLevel} onValueChange={setJlptLevel}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Chọn cấp độ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="N5">N5</SelectItem>
                                    <SelectItem value="N4">N4</SelectItem>
                                    <SelectItem value="N3">N3</SelectItem>
                                    <SelectItem value="N2">N2</SelectItem>
                                    <SelectItem value="N1">N1</SelectItem>
                                    <SelectItem value="All">All Levels</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleSaveDeck}
                            className="w-full h-11 font-bold uppercase tracking-widest text-[10px]"
                        >
                            {editingDeck ? 'Cập nhật' : 'Xác nhận tạo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Create Deck Modal */}
            <Dialog open={isAiDeckModalOpen} onOpenChange={setIsAiDeckModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <Sparkles className="size-6 text-primary" />
                            AI Sensei Deck Creator
                        </DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            Tạo bộ thẻ & sinh từ vựng tự động bằng AI.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-4">
                            <BrainCircuit className="size-5 text-primary shrink-0" />
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Nhập tên bộ thẻ và chủ đề. AI sẽ tự động tạo bộ thẻ mới và điền sẵn các từ vựng phù hợp cho bạn.
                            </p>
                        </div>
                        <Field>
                            <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Tên bộ thẻ</FieldLabel>
                            <Input
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                className="h-11 border-primary/20 font-bold"
                                placeholder="VD: Từ vựng Du lịch Nhật Bản"
                            />
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Chủ đề từ khóa (Cho AI)</FieldLabel>
                            <Input
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                className="h-11 border-primary/20 font-bold"
                                placeholder="VD: Nhà hàng, Sân bay, Khách sạn..."
                            />
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Cấp độ JLPT</FieldLabel>
                            <Select value={jlptLevel} onValueChange={setJlptLevel}>
                                <SelectTrigger className="h-11 border-primary/20">
                                    <SelectValue placeholder="Chọn cấp độ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="N5">N5</SelectItem>
                                    <SelectItem value="N4">N4</SelectItem>
                                    <SelectItem value="N3">N3</SelectItem>
                                    <SelectItem value="N2">N2</SelectItem>
                                    <SelectItem value="N1">N1</SelectItem>
                                    <SelectItem value="All">All Levels</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleAiDeckCreate}
                            className="w-full h-11 font-bold uppercase tracking-widest text-[10px]"
                            disabled={!aiTopic.trim() || !deckName.trim() || isGeneratingAi}
                        >
                            {isGeneratingAi ? <Spinner className="mr-2" /> : null}
                            {isGeneratingAi ? 'ĐANG TẠO & SINH THẺ...' : 'TẠO BỘ THẺ AI'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

