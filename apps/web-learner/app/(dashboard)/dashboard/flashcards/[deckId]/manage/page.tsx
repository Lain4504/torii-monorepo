'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flashcardApi } from '@/apis/services/flashcard-api'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Card } from '@workspace/ui/components/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    Plus,
    Search,
    BrainCircuit,
    ArrowLeft,
    Trash2,
    Edit,
    FileUp,
    Download,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Info,
    Sparkles
} from 'lucide-react'
import { agentApi } from '@/apis/services/agent-api'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { toast } from '@workspace/ui/components/sonner'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Badge } from '@workspace/ui/components/badge'

export default function ManageDeckPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const deckId = params.deckId as string

    const [searchQuery, setSearchQuery] = useState('')
    const [isAddCardOpen, setIsAddCardOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [isAiImportOpen, setIsAiImportOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<any>(null)
    const [tsvContent, setTsvContent] = useState('')
    const [aiTopic, setAiTopic] = useState('')
    const [isGeneratingAi, setIsGeneratingAi] = useState(false)

    // Form states for individual card
    const [frontText, setFrontText] = useState('')
    const [backText, setBackText] = useState('')
    const [furigana, setFurigana] = useState('')
    const [exampleSentence, setExampleSentence] = useState('')

    // Data Fetching
    const { data: deck, isLoading: isLoadingDeck } = useQuery({
        queryKey: ['flashcard-deck', deckId],
        queryFn: () => flashcardApi.getDeckById(deckId),
    })

    const { data: flashcardsData, isLoading: isLoadingCards } = useQuery({
        queryKey: ['flashcards', deckId, searchQuery],
        queryFn: () => flashcardApi.getFlashcards({ deckId: deckId, search: searchQuery, limit: 100 }),
    })

    // Mutations
    const createCardMutation = useMutation({
        mutationFn: flashcardApi.createFlashcard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] })
            setIsAddCardOpen(false)
            resetCardForm()
            toast.success("Thẻ mới đã được thêm!")
        },
        onError: () => toast.error("Không thể thêm thẻ.")
    })

    const updateCardMutation = useMutation({
        mutationFn: flashcardApi.updateFlashcard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] })
            setEditingCard(null)
            resetCardForm()
            toast.success("Thẻ đã được cập nhật!")
        },
        onError: () => toast.error("Không thể cập nhật thẻ.")
    })

    const deleteCardMutation = useMutation({
        mutationFn: flashcardApi.deleteFlashcard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] })
            toast.success("Đã xóa thẻ!")
        },
        onError: () => toast.error("Không thể xóa thẻ.")
    })

    const bulkImportMutation = useMutation({
        mutationFn: flashcardApi.bulkOperations,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] })
            setIsImportOpen(false)
            setTsvContent('')
            toast.success("Đã nhập thẻ thành công!")
        },
        onError: () => toast.error("Lỗi khi nhập thẻ từ TSV.")
    })

    const handleSaveCard = () => {
        if (!frontText || !backText) {
            toast.error("Vui lòng điền đủ mặt trước và mặt sau.")
            return
        }

        if (editingCard) {
            updateCardMutation.mutate({
                id: editingCard.id,
                frontText,
                backText,
                furigana,
                exampleSentence
            })
        } else {
            createCardMutation.mutate({
                deckId,
                frontText,
                backText,
                furigana,
                exampleSentence
            })
        }
    }

    const handleBulkImport = () => {
        if (!tsvContent.trim()) {
            toast.error("Vui lòng nhập nội dung TSV.")
            return
        }

        const lines = tsvContent.trim().split('\n')
        const createData = lines.map(line => {
            const parts = line.split('\t')
            return {
                deckId,
                frontText: parts[0]?.trim() || '',
                backText: parts[1]?.trim() || '',
                furigana: parts[2]?.trim() || '',
                exampleSentence: parts[3]?.trim() || ''
            }
        }).filter(item => item.frontText && item.backText) as any[]

        if (createData.length === 0) {
            toast.error("Không tìm thấy dữ liệu hợp lệ.")
            return
        }

        bulkImportMutation.mutate({ create: createData })
    }

    const handleAiGenerate = async () => {
        if (!aiTopic.trim()) return
        setIsGeneratingAi(true)
        try {
            const result = await agentApi.sensei.createFlashcard(aiTopic, 'intermediate')

            const createData = result.flashcards.map(card => ({
                deckId,
                frontText: card.front,
                backText: card.back,
                furigana: card.reading || '',
                exampleSentence: '' // AI doesn't return example sentence in this format currently
            }))

            if (createData.length > 0) {
                bulkImportMutation.mutate({ create: createData }, {
                    onSuccess: () => {
                        setIsAiImportOpen(false)
                        setAiTopic('')
                    }
                })
            }
        } catch (error) {
            toast.error("Lỗi khi tạo thẻ bằng AI.")
            console.error(error)
        } finally {
            setIsGeneratingAi(false)
        }
    }

    const resetCardForm = () => {
        setFrontText('')
        setBackText('')
        setFurigana('')
        setExampleSentence('')
        setEditingCard(null)
    }

    const startEditing = (card: any) => {
        setEditingCard(card)
        setFrontText(card.frontText)
        setBackText(card.backText)
        setFurigana(card.furigana || '')
        setExampleSentence(card.exampleSentence || '')
        setIsAddCardOpen(true)
    }

    const cards = flashcardsData?.data || []

    if (isLoadingDeck) return <PageLoading text="Tải dữ liệu bộ thẻ..." />

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/dashboard/flashcards')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="size-3" />
                        Quay lại kho thẻ
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-sans font-bold italic uppercase tracking-wide">
                        <BrainCircuit className="size-3.5" />
                        Quản lý nội dung
                    </div>
                    <h1 className="text-3xl md:text-5xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        {deck?.name}
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        {cards.length} THẺ TRONG BỘ // {deck?.jlptLevel || 'ALL LEVELS'}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => { resetCardForm(); setIsAddCardOpen(true) }}
                        className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="size-4 mr-2" />
                        Thêm thẻ lẻ
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsImportOpen(true)}
                        className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                    >
                        <FileUp className="size-4 mr-2" />
                        Import TSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsAiImportOpen(true)}
                        className="h-12 px-6 rounded-2xl border-pink-500/20 bg-pink-500/10 text-pink-500 font-black uppercase tracking-widest text-[10px] hover:bg-pink-500/20 transition-all"
                    >
                        <Sparkles className="size-4 mr-2" />
                        AI Sensei
                    </Button>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="relative group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="TÌM KIẾM THẺ (MẶT TRƯỚC, MẶT SAU)..."
                    className="pl-12 h-14 rounded-2xl bg-muted/10 border-border/40 focus:bg-background/80 transition-all font-bold uppercase tracking-wider text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Cards Table */}
            <Card className="overflow-hidden border-border/40 bg-background/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="w-[30%] text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 py-6 pl-8">Mặt trước / Cách đọc</TableHead>
                                <TableHead className="w-[40%] text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 py-6">Mặt sau / Ví dụ</TableHead>
                                <TableHead className="w-[20%] text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 py-6">Trạng thái SRS</TableHead>
                                <TableHead className="w-[10%] text-right pr-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingCards ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-50">
                                            <div className="size-2 bg-primary rounded-full animate-bounce" />
                                            <div className="size-2 bg-primary rounded-full animate-bounce delay-150" />
                                            <div className="size-2 bg-primary rounded-full animate-bounce delay-300" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : cards.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <BrainCircuit className="size-12 mb-4" />
                                            <p className="font-sans italic text-lg capitalize">Chưa có thẻ nào trong bộ này</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cards.map((card: any) => (
                                    <TableRow key={card.id} className="group border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <TableCell className="py-6 pl-8">
                                            <div className="space-y-1">
                                                <div className="text-base font-bold text-foreground">{card.frontText}</div>
                                                {card.furigana && <div className="text-[10px] font-medium text-primary/60 font-mono tracking-wider">{card.furigana}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-muted-foreground">{card.backText}</div>
                                                {card.exampleSentence && <div className="text-[10px] italic text-muted-foreground/40 line-clamp-1">"{card.exampleSentence}"</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                                                Level {card.intervalDays === 0 ? '0 (New)' : Math.floor(Math.log2(card.intervalDays + 1))}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-6 pr-8 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-muted/20">
                                                        <MoreVertical className="size-4 text-muted-foreground/40" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl bg-background/90 backdrop-blur-3xl p-1">
                                                    <DropdownMenuItem
                                                        onClick={() => startEditing(card)}
                                                        className="text-[10px] font-bold uppercase tracking-wider rounded-lg p-2 cursor-pointer"
                                                    >
                                                        <Edit className="size-3 mr-2 text-primary" /> Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => deleteCardMutation.mutate(card.id)}
                                                        className="text-[10px] font-bold uppercase tracking-wider rounded-lg p-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                    >
                                                        <Trash2 className="size-3 mr-2" /> Xóa thẻ
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                <DialogContent className="sm:max-w-[500px] bg-background/80 backdrop-blur-2xl border-white/10 rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-sans font-bold italic uppercase tracking-tight">
                            {editingCard ? 'Cập nhật thẻ' : 'Thêm thẻ mới'}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            Hệ thống ghi nhớ Torii SRS
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mặt trước (Kanji/Từ vựng)</Label>
                            <Input
                                value={frontText}
                                onChange={(e) => setFrontText(e.target.value)}
                                className="h-12 rounded-xl bg-white/5 border-white/10 font-bold"
                                placeholder="VD: 勉強"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Cách đọc (Furigana/Romaji)</Label>
                            <Input
                                value={furigana}
                                onChange={(e) => setFurigana(e.target.value)}
                                className="h-12 rounded-xl bg-white/5 border-white/10 font-mono"
                                placeholder="VD: べんきょう"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Mặt sau (Nghĩa)</Label>
                            <Input
                                value={backText}
                                onChange={(e) => setBackText(e.target.value)}
                                className="h-12 rounded-xl bg-white/5 border-white/10 font-bold"
                                placeholder="VD: Học tập"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ví dụ (Sentence)</Label>
                            <Textarea
                                value={exampleSentence}
                                onChange={(e) => setExampleSentence(e.target.value)}
                                className="min-h-[100px] rounded-xl bg-white/5 border-white/10 font-sans italic"
                                placeholder="VD: 毎日勉強します。"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleSaveCard}
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]"
                            disabled={createCardMutation.isPending || updateCardMutation.isPending}
                        >
                            {(createCardMutation.isPending || updateCardMutation.isPending) ? (
                                'ĐANG LƯU...'
                            ) : (
                                editingCard ? 'CẬP NHẬT THẺ' : 'XÁC NHẬN THÊM'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Import Modal */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-[700px] bg-background/80 backdrop-blur-2xl border-white/10 rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-sans font-bold italic uppercase tracking-tight">
                            Nhập thẻ từ TSV
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            Hỗ trợ Anki tsv format (Tab separated values)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-4">
                            <Info className="size-5 text-primary shrink-0" />
                            <div className="text-[10px] leading-relaxed text-muted-foreground/80">
                                <p className="font-bold text-primary mb-1 uppercase tracking-widest">Định dạng file:</p>
                                <p>Mặt trước [Tab] Mặt sau [Tab] Cách đọc [Tab] Ví dụ</p>
                                <p className="mt-2 text-muted-foreground/40 uppercase">VÍ DỤ: 先生 [Tab] Giáo viên [Tab] せんせい [Tab] 先生は怖いです。</p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Dán nội dung TSV của bạn vào đây</Label>
                            <Textarea
                                value={tsvContent}
                                onChange={(e) => setTsvContent(e.target.value)}
                                className="min-h-[300px] rounded-2xl bg-white/5 border-white/10 font-mono text-xs p-6"
                                placeholder="Paste TSV data here..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl border-white/10"
                            onClick={() => setIsImportOpen(false)}
                        >
                            HỦY
                        </Button>
                        <Button
                            onClick={handleBulkImport}
                            className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]"
                            disabled={bulkImportMutation.isPending}
                        >
                            {bulkImportMutation.isPending ? 'Đang xử lý...' : 'NHẬP TOÀN BỘ'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Generation Modal */}
            <Dialog open={isAiImportOpen} onOpenChange={setIsAiImportOpen}>
                <DialogContent className="sm:max-w-[500px] bg-background/80 backdrop-blur-2xl border-pink-500/20 rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif font-bold italic uppercase tracking-tight flex items-center gap-2">
                            <Sparkles className="size-6 text-pink-500" />
                            AI Sensei Generator
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            Tạo thẻ từ vựng tự động theo chủ đề
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-4 flex gap-4">
                            <BrainCircuit className="size-5 text-pink-500 shrink-0" />
                            <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                                Nhập chủ đề bạn muốn học (VD: "Đồ dùng nhà bếp", "Từ lóng giới trẻ", "Email công việc"). AI sẽ tạo danh sách thẻ và tự động thêm vào bộ này.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Chủ đề từ vựng</Label>
                            <Input
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                className="h-14 rounded-xl bg-white/5 border-pink-500/20 font-bold text-lg"
                                placeholder="VD: Món ăn Nhật Bản..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleAiGenerate}
                            className="w-full h-12 rounded-xl bg-pink-500 text-white hover:bg-pink-600 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-pink-500/20"
                            disabled={!aiTopic.trim() || isGeneratingAi || bulkImportMutation.isPending}
                        >
                            {isGeneratingAi || bulkImportMutation.isPending ? 'ĐANG TẠO & LƯU...' : 'TẠO & THÊM VÀO BỘ THẺ'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
