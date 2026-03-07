"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { flashcardApi } from "@/lib/api/services/flashcard-api"
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
    FileUp,
    MoreVertical,
    Info,
    Sparkles,
    RefreshCw
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
import {
    Flashcard,
    FlashcardHeader,
    FlashcardContent,
    FlashcardFooter,
    FlashcardFront,
    FlashcardBack,
    FlashcardFurigana,
    FlashcardExample
} from "@workspace/ui/components/flashcard"
import { cn } from "@workspace/ui/lib/utils"

const flashcardSchema = z.object({
    frontText: z.string().min(1, "Mặt trước không được để trống"),
    backText: z.string().min(1, "Mặt sau không được để trống"),
    furigana: z.string().optional(),
    exampleSentence: z.string().optional(),
})

type FlashcardFormValues = z.infer<typeof flashcardSchema>

export default function ManageDeckPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const deckId = params.deckId as string

    const [searchQuery, setSearchQuery] = React.useState("")
    const [isAddCardOpen, setIsAddCardOpen] = React.useState(false)
    const [isImportOpen, setIsImportOpen] = React.useState(false)
    const [isAiImportOpen, setIsAiImportOpen] = React.useState(false)
    const [editingCardId, setEditingCardId] = React.useState<string | null>(null)
    const [tsvContent, setTsvContent] = React.useState("")
    const [aiTopic, setAiTopic] = React.useState("")
    const [isGeneratingAi, setIsGeneratingAi] = React.useState(false)

    const form = useForm<FlashcardFormValues>({
        resolver: zodResolver(flashcardSchema),
        defaultValues: {
            frontText: "",
            backText: "",
            furigana: "",
            exampleSentence: "",
        },
    })

    // Data Fetching
    const { data: deck, isLoading: isLoadingDeck } = useQuery({
        queryKey: ["flashcard-deck", deckId],
        queryFn: () => flashcardApi.getDeckById(deckId),
    })

    const { data: flashcardsData, isLoading: isLoadingCards } = useQuery({
        queryKey: ["flashcards", deckId, searchQuery],
        queryFn: () => flashcardApi.getFlashcards({ deckId: deckId, search: searchQuery, limit: 100 }),
    })

    // Mutations
    const createCardMutation = useMutation({
        mutationFn: flashcardApi.createFlashcard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] })
            setIsAddCardOpen(false)
            resetCardForm()
            toast.success("Thẻ mới đã được thêm!")
        },
        onError: () => toast.error("Không thể thêm thẻ.")
    })

    const updateCardMutation = useMutation({
        mutationFn: flashcardApi.updateFlashcard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] })
            setEditingCardId(null)
            setIsAddCardOpen(false)
            resetCardForm()
            toast.success("Thẻ đã được cập nhật!")
        },
        onError: () => toast.error("Không thể cập nhật thẻ.")
    })

    const deleteCardMutation = useMutation({
        mutationFn: flashcardApi.deleteFlashcard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] })
            toast.success("Đã xóa thẻ!")
        },
        onError: () => toast.error("Không thể xóa thẻ.")
    })

    const bulkImportMutation = useMutation({
        mutationFn: flashcardApi.bulkOperations,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] })
            setIsImportOpen(false)
            setTsvContent("")
            toast.success("Đã nhập thẻ thành công!")
        },
        onError: () => toast.error("Lỗi khi nhập thẻ từ TSV.")
    })

    const handleSaveCard = (values: FlashcardFormValues) => {
        if (editingCardId) {
            updateCardMutation.mutate({
                id: editingCardId,
                ...values
            })
        } else {
            createCardMutation.mutate({
                deckId,
                ...values
            })
        }
    }

    const handleBulkImport = () => {
        if (!tsvContent.trim()) {
            toast.error("Vui lòng nhập nội dung TSV.")
            return
        }

        const lines = tsvContent.trim().split("\n")
        const createData = lines.map(line => {
            const parts = line.split("\t")
            return {
                deckId,
                frontText: parts[0]?.trim() || "",
                backText: parts[1]?.trim() || "",
                furigana: parts[2]?.trim() || "",
                exampleSentence: parts[3]?.trim() || ""
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
            const result = await agentApi.sensei.createFlashcard(aiTopic, "N3")

            const createData = result.flashcards.map(card => ({
                deckId,
                frontText: card.front,
                backText: card.back,
                furigana: card.reading || "",
                exampleSentence: ""
            }))

            if (createData.length > 0) {
                bulkImportMutation.mutate({ create: createData }, {
                    onSuccess: () => {
                        setIsAiImportOpen(false)
                        setAiTopic("")
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
        form.reset({
            frontText: "",
            backText: "",
            furigana: "",
            exampleSentence: "",
        })
        setEditingCardId(null)
    }

    const startEditing = (card: any) => {
        setEditingCardId(card.id)
        form.reset({
            frontText: card.frontText,
            backText: card.backText,
            furigana: card.furigana || "",
            exampleSentence: card.exampleSentence || "",
        })
        setIsAddCardOpen(true)
    }

    const cards = flashcardsData?.data || []

    if (isLoadingDeck) return <PageLoading text="Tải dữ liệu bộ thẻ..." />

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b">
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard/flashcards")}
                        className="h-8 px-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hover:bg-transparent"
                    >
                        <ArrowLeft className="size-3 mr-2" />
                        Quay lại kho thẻ
                    </Button>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{deck?.name}</h1>
                            <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider">{deck?.jlptLevel || "ALL"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {cards.length} thẻ trong bộ // Quản lý và cập nhật nội dung kiến thức.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => { resetCardForm(); setIsAddCardOpen(true) }}
                        className="w-full sm:w-auto font-bold uppercase tracking-widest text-[10px]"
                    >
                        <Plus className="size-3.5 mr-2" />
                        Thêm thẻ lẻ
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsImportOpen(true)}
                        className="w-full sm:w-auto font-bold uppercase tracking-widest text-[10px]"
                    >
                        <FileUp className="size-3.5 mr-2" />
                        Import TSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsAiImportOpen(true)}
                        className="w-full sm:w-auto border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-primary/10"
                    >
                        <Sparkles className="size-3.5 mr-2" />
                        AI Sensei
                    </Button>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="relative group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Tìm kiếm thẻ theo nội dung..."
                    className="pl-11 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Cards Grid */}
            {isLoadingCards ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse border border-border" />
                    ))}
                </div>
            ) : cards.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 border-dashed border-2 shadow-none bg-muted/5">
                    <div className="p-4 rounded-full bg-muted mb-4 text-muted-foreground/40">
                        <BrainCircuit className="size-8" />
                    </div>
                    <h3 className="text-lg font-bold">Chưa có thẻ nào</h3>
                    <p className="text-sm text-muted-foreground mt-1">Bắt đầu bằng cách thêm thẻ lẻ hoặc nhập từ AI.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card: any) => (
                        <Flashcard key={card.id} className="h-full border-border shadow-none hover:shadow-md transition-all group">
                            <FlashcardHeader className="pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-wider">
                                        LEVEL {card.intervalDays === 0 ? "0" : Math.floor(Math.log2(card.intervalDays + 1))}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="size-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32">
                                            <DropdownMenuItem onClick={() => startEditing(card)} className="text-xs font-bold uppercase">
                                                <Edit className="size-3 mr-2" /> Sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => deleteCardMutation.mutate(card.id)} className="text-xs font-bold uppercase text-destructive focus:text-destructive">
                                                <Trash2 className="size-3 mr-2" /> Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <FlashcardFront className="p-0 border-none bg-transparent h-auto">
                                    {card.furigana && <FlashcardFurigana className="mb-1">{card.furigana}</FlashcardFurigana>}
                                    <div className="text-xl font-bold tracking-tight">{card.frontText}</div>
                                </FlashcardFront>
                            </FlashcardHeader>
                            <FlashcardContent className="space-y-3">
                                <FlashcardBack className="p-0 border-none bg-transparent h-auto text-sm text-muted-foreground">
                                    {card.backText}
                                </FlashcardBack>
                                {card.exampleSentence && (
                                    <FlashcardExample className="p-0 border-none bg-transparent h-auto italic text-xs opacity-70">
                                        "{card.exampleSentence}"
                                    </FlashcardExample>
                                )}
                            </FlashcardContent>
                        </Flashcard>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingCardId ? "Cập nhật thẻ" : "Thêm thẻ mới"}
                        </DialogTitle>
                        <DialogDescription>
                            Nhập thông tin cho thẻ nhớ của bạn.
                        </DialogDescription>
                    </DialogHeader>

                    <form id="card-form" onSubmit={form.handleSubmit(handleSaveCard)} className="space-y-6 py-4">
                        <Controller
                            name="frontText"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Mặt trước (Kanji/Từ vựng)</FieldLabel>
                                    <Input {...field} placeholder="VD: 勉強" className="h-11" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="furigana"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Cách đọc (Furigana)</FieldLabel>
                                    <Input {...field} placeholder="VD: べんきょう" className="h-11 font-mono" />
                                </Field>
                            )}
                        />
                        <Controller
                            name="backText"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Mặt sau (Nghĩa)</FieldLabel>
                                    <Input {...field} placeholder="VD: Học tập" className="h-11" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="exampleSentence"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Ví dụ (Sentence)</FieldLabel>
                                    <Textarea {...field} placeholder="VD: 毎日勉強します。" className="min-h-[100px] italic" />
                                </Field>
                            )}
                        />
                    </form>

                    <DialogFooter>
                        <Button
                            form="card-form"
                            type="submit"
                            className="w-full h-11 font-bold uppercase tracking-widest text-[10px]"
                            disabled={createCardMutation.isPending || updateCardMutation.isPending}
                        >
                            {createCardMutation.isPending || updateCardMutation.isPending ? <Spinner className="mr-2" /> : null}
                            {editingCardId ? "CẬP NHẬT THẺ" : "XÁC NHẬN THÊM"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Import Modal */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Nhập thẻ từ TSV</DialogTitle>
                        <DialogDescription>Hỗ trợ định dạng Anki TSV (Mặt trước [Tab] Mặt sau [Tab] Cách đọc [Tab] Ví dụ).</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-4">
                            <Info className="size-5 text-primary shrink-0" />
                            <div className="text-xs leading-relaxed text-muted-foreground">
                                <p className="font-bold text-primary mb-1 uppercase tracking-widest">Cách dùng:</p>
                                <p>Tách các trường bằng phím Tab. Mỗi thẻ một dòng.</p>
                                <p className="mt-2 text-muted-foreground/60 italic font-mono">Ví dụ: 先生 [Tab] Giáo viên [Tab] せんせい [Tab] 先生は怖いです。</p>
                            </div>
                        </div>

                        <Field>
                            <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Nội dung TSV</FieldLabel>
                            <Textarea
                                value={tsvContent}
                                onChange={(e) => setTsvContent(e.target.value)}
                                className="min-h-[300px] font-mono text-xs p-6"
                                placeholder="Dán dữ liệu vào đây..."
                            />
                        </Field>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsImportOpen(false)} className="flex-1 font-bold uppercase tracking-widest text-[10px]">HỦY</Button>
                        <Button onClick={handleBulkImport} className="flex-[2] font-bold uppercase tracking-widest text-[10px]" disabled={bulkImportMutation.isPending}>
                            {bulkImportMutation.isPending ? <Spinner className="mr-2" /> : null}
                            NHẬP TOÀN BỘ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Generation Modal */}
            <Dialog open={isAiImportOpen} onOpenChange={setIsAiImportOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <Sparkles className="size-6 text-primary" />
                            AI Sensei Generator
                        </DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            Tạo thẻ từ vựng tự động theo chủ đề.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-4">
                            <BrainCircuit className="size-5 text-primary shrink-0" />
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Nhập chủ đề bạn muốn học. AI sẽ tạo danh sách thẻ và tự động thêm vào bộ này.
                            </p>
                        </div>
                        <Field>
                            <FieldLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Chủ đề từ vựng</FieldLabel>
                            <Input
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                className="h-12 border-primary/20 font-bold"
                                placeholder="VD: Món ăn Nhật Bản, Du lịch..."
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleAiGenerate}
                            className="w-full h-11 font-bold uppercase tracking-widest text-[10px]"
                            disabled={!aiTopic.trim() || isGeneratingAi || bulkImportMutation.isPending}
                        >
                            {isGeneratingAi || bulkImportMutation.isPending ? <Spinner className="mr-2" /> : null}
                            {isGeneratingAi || bulkImportMutation.isPending ? "ĐANG TẠO & LƯU..." : "TẠO & THÊM VÀO BỘ THẺ"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
