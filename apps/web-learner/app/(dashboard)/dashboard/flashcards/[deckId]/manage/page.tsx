"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { flashcardApi } from "@/lib/api/services/flashcard-api"
import type { Flashcard } from "@/lib/api/services/flashcard-api"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import {
    Plus,
    Search,
    BrainCircuit,
    ArrowLeft,
    Trash2,
    Edit,
    MoreVertical,
    Sparkles,
} from "lucide-react"
import { agentApi } from "@/lib/api/services/agent-api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { Spinner } from "@workspace/ui/components/spinner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
import { cn } from "@workspace/ui/lib/utils"

const flashcardSchema = z.object({
    term: z.string().min(1, "Mặt trước không được để trống"),
    definition: z.string().min(1, "Mặt sau không được để trống"),
    hint: z.string().optional(),
    languageDetails: z.record(z.any()).optional(),
})

type FlashcardFormValues = z.infer<typeof flashcardSchema>

export default function ManageDeckPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const deckId = params.deckId as string

    const [searchQuery, setSearchQuery] = React.useState("")
    const [isAddCardOpen, setIsAddCardOpen] = React.useState(false)
    const [isAiImportOpen, setIsAiImportOpen] = React.useState(false)
    const [editingCard, setEditingCard] = React.useState<Flashcard | null>(null)
    const [aiTopic, setAiTopic] = React.useState("")
    const [isGeneratingAi, setIsGeneratingAi] = React.useState(false)
    
    // For Japanese language details
    const [furigana, setFurigana] = React.useState("")
    const [romaji, setRomaji] = React.useState("")

    const form = useForm<FlashcardFormValues>({
        resolver: zodResolver(flashcardSchema),
        defaultValues: {
            term: "",
            definition: "",
            hint: "",
            languageDetails: {},
        },
    })

    // Data Fetching
    const { data: deck, isLoading: isLoadingDeck } = useQuery({
        queryKey: ["flashcard-deck", deckId],
        queryFn: () => flashcardApi.getDeckById(deckId),
    })

    const { data: cards, isLoading: isLoadingCards } = useQuery({
        queryKey: ["flashcards-deck-cards", deckId],
        queryFn: () => flashcardApi.getDeckCards(deckId),
    })

    // Filter cards by search
    const filteredCards = React.useMemo(() => {
        if (!cards) return []
        if (!searchQuery) return cards
        const query = searchQuery.toLowerCase()
        return cards.filter(card =>
            card.term.toLowerCase().includes(query) ||
            card.definition.toLowerCase().includes(query) ||
            card.hint?.toLowerCase().includes(query)
        )
    }, [cards, searchQuery])

    // Mutations
    const createCardMutation = useMutation({
        mutationFn: (data: Omit<FlashcardFormValues, 'languageDetails'> & { languageDetails?: Record<string, any> }) =>
            flashcardApi.addCard(deckId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards-deck-cards", deckId] })
            queryClient.invalidateQueries({ queryKey: ["flashcard-deck", deckId] })
            setIsAddCardOpen(false)
            resetCardForm()
            toast.success("Thẻ mới đã được thêm!")
        },
        onError: () => toast.error("Không thể thêm thẻ.")
    })

    const updateCardMutation = useMutation({
        mutationFn: (data: { id: string; updates: Partial<FlashcardFormValues> }) =>
            flashcardApi.updateCard(data.id, data.updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards-deck-cards", deckId] })
            setEditingCard(null)
            setIsAddCardOpen(false)
            resetCardForm()
            toast.success("Thẻ đã được cập nhật!")
        },
        onError: () => toast.error("Không thể cập nhật thẻ.")
    })

    const deleteCardMutation = useMutation({
        mutationFn: flashcardApi.deleteCard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards-deck-cards", deckId] })
            queryClient.invalidateQueries({ queryKey: ["flashcard-deck", deckId] })
            toast.success("Đã xóa thẻ!")
        },
        onError: () => toast.error("Không thể xóa thẻ.")
    })

    const handleSaveCard = (values: FlashcardFormValues) => {
        // Build languageDetails from furigana/romaji if Japanese
        const languageDetails: Record<string, any> = {}
        if (furigana) languageDetails.furigana = furigana
        if (romaji) languageDetails.romaji = romaji

        if (editingCard) {
            updateCardMutation.mutate({
                id: editingCard.id,
                updates: {
                    ...values,
                    languageDetails: Object.keys(languageDetails).length > 0 ? languageDetails : undefined
                }
            })
        } else {
            createCardMutation.mutate({
                ...values,
                languageDetails: Object.keys(languageDetails).length > 0 ? languageDetails : undefined
            })
        }
    }

    const handleAiGenerate = async () => {
        if (!aiTopic.trim()) return
        setIsGeneratingAi(true)
        try {
            const result = await agentApi.sensei.createFlashcard(aiTopic, "N3")

            for (const card of result.flashcards) {
                await flashcardApi.addCard(deckId, {
                    term: card.front,
                    definition: card.back,
                    languageDetails: card.reading ? { furigana: card.reading } : undefined
                })
            }

            queryClient.invalidateQueries({ queryKey: ["flashcards-deck-cards", deckId] })
            queryClient.invalidateQueries({ queryKey: ["flashcard-deck", deckId] })
            setIsAiImportOpen(false)
            setAiTopic("")
            toast.success(`Đã thêm ${result.flashcards.length} thẻ từ AI!`)
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi sinh thẻ từ AI.")
        } finally {
            setIsGeneratingAi(false)
        }
    }

    const resetCardForm = () => {
        form.reset()
        setFurigana("")
        setRomaji("")
        setEditingCard(null)
    }

    const startEditing = (card: Flashcard) => {
        setEditingCard(card)
        form.setValue("term", card.term)
        form.setValue("definition", card.definition)
        form.setValue("hint", card.hint || "")
        setFurigana((card.languageDetails?.furigana as string) || "")
        setRomaji((card.languageDetails?.romaji as string) || "")
        setIsAddCardOpen(true)
    }

    if (isLoadingDeck) {
        return <PageLoading text="Đang tải..." />
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/flashcards")}>
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-bold tracking-tight">{deck?.title}</h1>
                        <p className="text-muted-foreground">
                            Quản lý nội dung bộ thẻ • {deck?.stats?.cardCount || 0} thẻ
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => { resetCardForm(); setIsAddCardOpen(true) }}
                        className="font-bold uppercase tracking-widest text-[10px]"
                    >
                        <Plus className="size-3.5 mr-2" />
                        Thêm thẻ
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsAiImportOpen(true)}
                        className="border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-primary/10"
                    >
                        <Sparkles className="size-3.5 mr-2" />
                        AI Generate
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative group w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Tìm kiếm thẻ..."
                    className="pl-9 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Cards Grid */}
            {isLoadingCards ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-48 animate-pulse bg-muted/50 shadow-none border-border" />
                    ))}
                </div>
            ) : filteredCards.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 border-dashed border-2 shadow-none bg-muted/5">
                    <div className="p-4 rounded-full bg-muted mb-4 text-muted-foreground/40">
                        <BrainCircuit className="size-8" />
                    </div>
                    <h3 className="text-lg font-bold">Chưa có thẻ nào</h3>
                    <p className="text-sm text-muted-foreground mt-1">Thêm thẻ mới để bắt đầu học tập.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCards.map((card) => (
                        <Card key={card.id} className="group hover:shadow-md transition-all">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="text-[10px]">
                                        {card.srsState}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8">
                                                <MoreVertical className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => startEditing(card)}>
                                                <Edit className="size-3.5 mr-2" /> Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => deleteCardMutation.mutate(card.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="size-3.5 mr-2" /> Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-[10px] mb-1">Mặt trước</p>
                                    <p className="text-xl font-bold">{card.term}</p>
                                    {card.languageDetails?.furigana && (
                                        <p className="text-sm text-primary/60">{card.languageDetails.furigana as string}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-[10px] mb-1">Mặt sau</p>
                                    <p className="text-base">{card.definition}</p>
                                </div>
                                {card.hint && (
                                    <div>
                                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-[10px] mb-1">Gợi ý</p>
                                        <p className="text-sm italic text-muted-foreground">{card.hint}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Card Dialog */}
            <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingCard ? "Chỉnh sửa thẻ" : "Thêm thẻ mới"}</DialogTitle>
                        <DialogDescription>
                            Nhập nội dung cho mặt trước và mặt sau của thẻ.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(handleSaveCard)} className="space-y-6 py-4">
                        <Field>
                            <FieldLabel>Mặt trước (Term)</FieldLabel>
                            <Controller
                                name="term"
                                control={form.control}
                                render={({ field }) => <Input {...field} placeholder="VD: 猫" />}
                            />
                            <FieldError>{form.formState.errors.term?.message}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel>Mặt sau (Definition)</FieldLabel>
                            <Controller
                                name="definition"
                                control={form.control}
                                render={({ field }) => <Input {...field} placeholder="VD: Con mèo" />}
                            />
                            <FieldError>{form.formState.errors.definition?.message}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel>Gợi ý (Hint)</FieldLabel>
                            <Controller
                                name="hint"
                                control={form.control}
                                render={({ field }) => <Textarea {...field} placeholder="VD: Ví dụ câu hoặc gợi nhớ" rows={2} />}
                            />
                        </Field>

                        {/* Japanese Language Details */}
                        {deck?.subject === 'JAPANESE' && (
                            <>
                                <Field>
                                    <FieldLabel>Furigana (Optional)</FieldLabel>
                                    <Input
                                        value={furigana}
                                        onChange={(e) => setFurigana(e.target.value)}
                                        placeholder="VD: ねこ"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>Romaji (Optional)</FieldLabel>
                                    <Input
                                        value={romaji}
                                        onChange={(e) => setRomaji(e.target.value)}
                                        placeholder="VD: neko"
                                    />
                                </Field>
                            </>
                        )}

                        <DialogFooter>
                            <Button type="submit" className="w-full font-bold uppercase tracking-widest text-[10px]">
                                {editingCard ? "Cập nhật" : "Thêm thẻ"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* AI Generate Dialog */}
            <Dialog open={isAiImportOpen} onOpenChange={setIsAiImportOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="size-5 text-primary" />
                            AI Generate Cards
                        </DialogTitle>
                        <DialogDescription>
                            Nhập chủ đề và AI sẽ tự động sinh thẻ cho bạn.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <Field>
                            <FieldLabel>Chủ đề</FieldLabel>
                            <Input
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="VD: Từ vựng nhà hàng, Động từ di chuyển..."
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleAiGenerate}
                            disabled={!aiTopic.trim() || isGeneratingAi}
                            className="w-full font-bold uppercase tracking-widest text-[10px]"
                        >
                            {isGeneratingAi ? <Spinner className="mr-2" /> : null}
                            {isGeneratingAi ? "ĐANG SINH..." : "SINH THẺ"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
