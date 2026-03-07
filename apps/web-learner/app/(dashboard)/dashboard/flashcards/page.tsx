'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flashcardApi } from '@/lib/api/services/flashcard-api'
import type { FlashcardDeck } from '@/lib/api/services/flashcard-api'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Spinner } from '@workspace/ui/components/spinner'
import {
    Plus,
    Search,
    BrainCircuit,
    Layers,
    Clock,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { toast } from '@workspace/ui/components/sonner'
import { agentApi } from '@/lib/api/services/agent-api'
import { DeckCard } from '@/components/flashcard/deck-card'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'

export default function FlashcardsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery] = useDebounceValue(searchQuery, 300)
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false)
    const [isAiDeckModalOpen, setIsAiDeckModalOpen] = useState(false)
    const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null)
    const [aiTopic, setAiTopic] = useState('')
    const [isGeneratingAi, setIsGeneratingAi] = useState(false)
    const queryClient = useQueryClient()

    // Form states
    const [deckName, setDeckName] = useState('')
    const [deckDesc, setDeckDesc] = useState('')

    const { data: decks, isLoading } = useQuery({
        queryKey: ['flashcard-decks'],
        queryFn: () => flashcardApi.getMyDecks(),
    })

    const filteredDecks = useMemo(() => {
        if (!decks) return []
        if (!debouncedSearchQuery) return decks
        const query = debouncedSearchQuery.toLowerCase()
        return decks.filter(deck =>
            deck.name.toLowerCase().includes(query) ||
            deck.description?.toLowerCase().includes(query)
        )
    }, [decks, debouncedSearchQuery])

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
                input: { name: deckName, description: deckDesc }
            })
        } else {
            createDeckMutation.mutate({ name: deckName, description: deckDesc })
        }
    }

    const resetForm = () => {
        setDeckName('')
        setDeckDesc('')
        setEditingDeck(null)
    }

    const startEditing = (deck: FlashcardDeck) => {
        setEditingDeck(deck)
        setDeckName(deck.name)
        setDeckDesc(deck.description || '')
        setIsDeckModalOpen(true)
    }

    const handleAiDeckCreate = async () => {
        if (!deckName.trim() || !aiTopic.trim()) {
            toast.error("Vui lòng nhập tên bộ thẻ và chủ đề.")
            return
        }
        setIsGeneratingAi(true)
        try {
            const deckResult = await flashcardApi.createDeck({
                name: deckName,
                description: `AI Generated: ${aiTopic}`,
            })

            const level = 'N3'
            const result = await agentApi.sensei.createFlashcard(aiTopic, level as any)
            
            if (result && result.flashcards) {
                for (const card of result.flashcards) {
                    await flashcardApi.addCard(deckResult.id, {
                        term: card.front,
                        definition: card.back,
                        hint: card.reading,
                        languageDetails: card
                    })
                }
                toast.success(`Đã tạo bộ thẻ AI với ${result.flashcards.length} thẻ!`)
            }
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            setIsAiDeckModalOpen(false)
            resetForm()
            setAiTopic('')
        } catch (error) {
            toast.error("Lỗi khi tạo bộ thẻ bằng AI.")
        } finally {
            setIsGeneratingAi(false)
        }
    }

    return (
        <div className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Flashcards</h1>
                    <p className="text-muted-foreground mt-1">Học sâu, nhớ lâu với hệ thống SRS.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => { resetForm(); setIsAiDeckModalOpen(true); }}
                    >
                        <BrainCircuit className="mr-2 h-4 w-4" /> 
                        Tạo bằng AI
                    </Button>
                    <Button 
                        onClick={() => { resetForm(); setIsDeckModalOpen(true); }}
                    >
                        <Plus className="mr-2 h-4 w-4" /> 
                        Tạo bộ thẻ
                    </Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm bộ thẻ..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spinner />
                </div>
            ) : filteredDecks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDecks.map((deck) => (
                        <DeckCard 
                            key={deck.id} 
                            deck={deck} 
                            onEdit={startEditing} 
                            onDelete={(id) => {
                                if (confirm("Xóa bộ thẻ này?")) {
                                    deleteDeckMutation.mutate(id)
                                }
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Không tìm thấy bộ thẻ nào.</p>
                </div>
            )}

            <Dialog open={isDeckModalOpen} onOpenChange={setIsDeckModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDeck ? "Sửa bộ thẻ" : "Tạo bộ thẻ"}</DialogTitle>
                        <DialogDescription>Tổ chức thẻ học theo chủ đề.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên bộ thẻ</Label>
                            <Input 
                                placeholder="Nhập tên..." 
                                value={deckName} 
                                onChange={(e) => setDeckName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mô tả</Label>
                            <Textarea 
                                placeholder="Nhập mô tả..." 
                                value={deckDesc} 
                                onChange={(e) => setDeckDesc(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeckModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSaveDeck}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAiDeckModalOpen} onOpenChange={setIsAiDeckModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tạo nhanh bằng AI</DialogTitle>
                        <DialogDescription>AI sẽ tự động soạn thảo bộ thẻ cho bạn.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên bộ thẻ</Label>
                            <Input 
                                placeholder="Nhập tên..." 
                                value={deckName} 
                                onChange={(e) => setDeckName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Chủ đề</Label>
                            <Input 
                                placeholder="Ví dụ: 20 từ vựng về kinh tế..." 
                                value={aiTopic} 
                                onChange={(e) => setAiTopic(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAiDeckModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleAiDeckCreate} disabled={isGeneratingAi}>
                            {isGeneratingAi ? <Spinner className="mr-2" /> : null}
                            Tạo thẻ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
