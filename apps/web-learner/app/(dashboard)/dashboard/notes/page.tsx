'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@workspace/ui/components/card'
import {
    FileText, Search, Plus, MoreVertical, Trash2, Edit, 
    Calendar, LayoutGrid, List, Layers, Sparkles
} from 'lucide-react'
import { Spinner } from '@workspace/ui/components/spinner'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@workspace/ui/components/dialog'
import { Badge } from '@workspace/ui/components/badge'
import { toast } from '@workspace/ui/components/sonner'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { apiClient } from '@/lib/api/api-client'
import { flashcardApi } from '@/lib/api/services/flashcard-api'

const notesApi = {
    getNotes: async () => {
        const res = await apiClient.get('/api/notes')
        return res.data.data
    },
    createNote: async (dto: any) => {
        const res = await apiClient.post('/api/notes', dto)
        return res.data.data
    },
    updateNote: async (id: string, dto: any) => {
        const res = await apiClient.patch(`/api/notes/${id}`, dto)
        return res.data.data
    },
    deleteNote: async (id: string) => {
        await apiClient.delete(`/api/notes/${id}`)
    }
}

export default function NotesPage() {
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
    const [isToFlashcardOpen, setIsToFlashcardOpen] = useState(false)
    const [editingNote, setEditingNote] = useState<any>(null)
    const [targetNote, setTargetNote] = useState<any>(null)
    const [selectedDeckId, setSelectedDeckId] = useState('')
    
    const [noteContent, setNoteContent] = useState('')
    const [noteTags, setNoteTags] = useState('')

    const { data: notes, isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: notesApi.getNotes,
    })

    const { data: decks } = useQuery({
        queryKey: ['flashcard-decks'],
        queryFn: () => flashcardApi.getMyDecks(),
    })

    const filteredNotes = notes?.filter((n: any) => 
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || []

    const createMutation = useMutation({
        mutationFn: notesApi.createNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            setIsNoteModalOpen(false)
            resetForm()
            toast.success("Đã ghi chú!")
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, dto }: any) => notesApi.updateNote(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            setIsNoteModalOpen(false)
            resetForm()
            toast.success("Đã cập nhật!")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: notesApi.deleteNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            toast.success("Đã xóa!")
        }
    })

    const toFlashcardMutation = useMutation({
        mutationFn: async ({ noteId, deckId }: any) => {
            return apiClient.post(`/api/notes/${noteId}/to-flashcard`, { deckId })
        },
        onSuccess: () => {
            setIsToFlashcardOpen(false)
            toast.success("Đã chuyển thành thẻ học!")
        },
        onError: () => toast.error("Không thể chuyển đổi.")
    })

    const resetForm = () => {
        setNoteContent('')
        setNoteTags('')
        setEditingNote(null)
    }

    const handleSave = () => {
        if (!noteContent.trim()) return toast.error("Nhập nội dung ghi chú.")
        const dto = {
            content: noteContent,
            tags: noteTags.split(',').map(t => t.trim()).filter(Boolean)
        }
        if (editingNote) {
            updateMutation.mutate({ id: editingNote.id, dto })
        } else {
            createMutation.mutate(dto)
        }
    }

    const startEditing = (note: any) => {
        setEditingNote(note)
        setNoteContent(note.content)
        setNoteTags(note.tags?.join(', ') || '')
        setIsNoteModalOpen(true)
    }

    return (
        <div className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Ghi chú</h1>
                <Button onClick={() => { resetForm(); setIsNoteModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Soạn mới
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Tìm kiếm ghi chú..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex border rounded-md p-1">
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Spinner /></div>
            ) : filteredNotes.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredNotes.map((note: any) => (
                        <Card key={note.id} className="relative">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-normal text-muted-foreground">
                                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: vi })}
                                </CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => startEditing(note)}><Edit className="mr-2 h-4 w-4" /> Sửa</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setTargetNote(note); setIsToFlashcardOpen(true); }}><Layers className="mr-2 h-4 w-4" /> Chuyển thành Flashcard</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => { if(confirm("Xóa ghi chú?")) deleteMutation.mutate(note.id) }}><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm scale-100 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                                <div className="flex flex-wrap gap-1">
                                    {note.tags?.map((tag: string) => (
                                        <Badge key={tag} variant="secondary">#{tag}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Trống trơn...</p>
                </div>
            )}

            <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingNote ? "Sửa ghi chú" : "Ghi chú mới"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nội dung</Label>
                            <Textarea 
                                placeholder="Viết gì đó..." 
                                className="min-h-[200px]"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tags (phân cách bằng dấu phẩy)</Label>
                            <Input 
                                placeholder="n2, từ vựng..." 
                                value={noteTags}
                                onChange={(e) => setNoteTags(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsNoteModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isToFlashcardOpen} onOpenChange={setIsToFlashcardOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chuyển thành Flashcard</DialogTitle>
                        <DialogDescription>Chọn bộ thẻ mục tiêu.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Bộ thẻ</Label>
                            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                                {decks?.map((deck: any) => (
                                    <Button
                                        key={deck.id}
                                        variant={selectedDeckId === deck.id ? "default" : "outline"}
                                        className="h-auto py-3 px-4 justify-start text-left"
                                        onClick={() => setSelectedDeckId(deck.id)}
                                    >
                                        <div className="font-semibold">{deck.name}</div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsToFlashcardOpen(false)}>Hủy</Button>
                        <Button 
                            disabled={!selectedDeckId || toFlashcardMutation.isPending}
                            onClick={() => toFlashcardMutation.mutate({ noteId: targetNote.id, deckId: selectedDeckId })}
                        >
                            Chuyển đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
