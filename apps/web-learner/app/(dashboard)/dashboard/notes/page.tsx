'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
    FileText, Search, MoreHorizontal, Plus, BookOpen, Upload,
    X, ChevronLeft, BrainCircuit, Trash2, Globe, Lock,
    FileSpreadsheet, Pencil, Layers, Hash, CheckCircle2,
    ArrowRight, Loader2
} from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@workspace/ui/components/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@workspace/ui/components/dropdown-menu'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { Badge } from '@workspace/ui/components/badge'
import { toast } from '@workspace/ui/components/sonner'
import { Switch } from '@workspace/ui/components/switch'
import { useAppSelector } from '@/hooks/hooks'
import * as XLSX from 'xlsx'
import { NotebookFlashcardStudy } from '@/components/flashcard/notebook-flashcard-study'
import { notebookApi, type NotebookDTO, type NoteEntryDTO } from '@/apis/services/notebook-api'

// ============ TYPES ============
// Re-export types with local aliases for backward compat
type Notebook = NotebookDTO
type NoteEntry = NoteEntryDTO

const PART_OF_SPEECH_OPTIONS = [
    { value: 'noun', label: '名詞 - Danh từ' },
    { value: 'verb_ichidan', label: '動詞(一段) - Động từ nhóm 2' },
    { value: 'verb_godan', label: '動詞(五段) - Động từ nhóm 1' },
    { value: 'verb_suru', label: 'するVerb - Động từ する' },
    { value: 'adjective_i', label: 'い形容詞 - Tính từ đuôi い' },
    { value: 'adjective_na', label: 'な形容詞 - Tính từ đuôi な' },
    { value: 'adverb', label: '副詞 - Trạng từ' },
    { value: 'particle', label: '助詞 - Trợ từ' },
    { value: 'conjunction', label: '接続詞 - Liên từ' },
    { value: 'interjection', label: '感動詞 - Thán từ' },
    { value: 'other', label: 'その他 - Khác' },
]

// ============ MAIN PAGE ============
export default function NotesPage() {
    const { user } = useAppSelector((state) => state.auth)
    const userId = user?.id || ''

    const [myNotebooks, setMyNotebooks] = useState<Notebook[]>([])
    const [publicNotebooks, setPublicNotebooks] = useState<Notebook[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null)
    const [entrySearch, setEntrySearch] = useState('')

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isAddWordOpen, setIsAddWordOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [isStudyMode, setIsStudyMode] = useState(false)

    // Loading states
    const [isSaving, setIsSaving] = useState(false)

    // Create notebook form
    const [newNotebookName, setNewNotebookName] = useState('')
    const [newNotebookDesc, setNewNotebookDesc] = useState('')
    const [newNotebookPublic, setNewNotebookPublic] = useState(false)
    const [nameError, setNameError] = useState('')

    // Add word form
    const [wordForm, setWordForm] = useState({ word: '', phonetic: '', meaning: '', note: '', partOfSpeech: 'noun' })
    const [editingEntry, setEditingEntry] = useState<NoteEntry | null>(null)

    // Import Excel
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importPreview, setImportPreview] = useState<Omit<NoteEntry, 'id' | 'notebookId' | 'createdAt' | 'updatedAt'>[]>([])
    const [importFileName, setImportFileName] = useState('')

    // ---- LOAD DATA ----
    const loadData = useCallback(async () => {
        if (!userId) return
        try {
            setIsLoading(true)
            const [mine, pub] = await Promise.all([
                notebookApi.getMyNotebooks(),
                notebookApi.getPublicNotebooks(),
            ])
            setMyNotebooks(mine)
            setPublicNotebooks(pub)
        } catch (err: any) {
            toast.error('Không thể tải dữ liệu sổ tay')
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadData()
    }, [loadData])

    const filteredMyNotebooks = myNotebooks.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const filteredPublicNotebooks = publicNotebooks.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredEntries = activeNotebook?.entries.filter(e =>
        e.word.toLowerCase().includes(entrySearch.toLowerCase()) ||
        e.meaning.toLowerCase().includes(entrySearch.toLowerCase())
    ) || []

    // ---- CREATE NOTEBOOK ----
    const handleCreateNotebook = async () => {
        const trimmedName = newNotebookName.trim()
        if (!trimmedName) { setNameError('Vui lòng nhập tên sổ tay'); return }

        try {
            setIsSaving(true)
            const notebook = await notebookApi.createNotebook({
                name: trimmedName,
                description: newNotebookDesc.trim() || undefined,
                isPublic: newNotebookPublic,
            })
            setMyNotebooks(prev => [notebook, ...prev])
            setIsCreateOpen(false)
            setNewNotebookName('')
            setNewNotebookDesc('')
            setNewNotebookPublic(false)
            setNameError('')
            toast.success('Đã tạo sổ tay mới!')
            setActiveNotebook(notebook)
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Tạo sổ tay thất bại'
            setNameError(msg)
        } finally {
            setIsSaving(false)
        }
    }

    // ---- DELETE NOTEBOOK ----
    const handleDeleteNotebook = async (id: string) => {
        try {
            await notebookApi.deleteNotebook(id)
            setMyNotebooks(prev => prev.filter(n => n.id !== id))
            if (activeNotebook?.id === id) setActiveNotebook(null)
            toast.success('Đã xóa sổ tay')
        } catch {
            toast.error('Xóa sổ tay thất bại')
        }
    }

    // ---- TOGGLE PUBLIC ----
    const handleTogglePublic = async (notebookId: string) => {
        const nb = myNotebooks.find(n => n.id === notebookId)
        if (!nb) return
        try {
            const updated = await notebookApi.updateNotebook(notebookId, { isPublic: !nb.isPublic })
            setMyNotebooks(prev => prev.map(n => n.id === notebookId ? updated : n))
            if (activeNotebook?.id === notebookId) setActiveNotebook(updated)
            toast.success(updated.isPublic ? 'Sổ tay đã được công khai' : 'Sổ tay đã chuyển sang riêng tư')
        } catch {
            toast.error('Cập nhật thất bại')
        }
    }

    // ---- ADD / EDIT WORD ----
    const handleSaveWord = async () => {
        if (!wordForm.word.trim()) { toast.error('Vui lòng nhập từ'); return }
        if (!wordForm.meaning.trim()) { toast.error('Vui lòng nhập nghĩa của từ'); return }
        if (!activeNotebook) return

        try {
            setIsSaving(true)
            if (editingEntry) {
                // Update
                const updated = await notebookApi.updateEntry(activeNotebook.id, editingEntry.id, {
                    word: wordForm.word.trim(),
                    phonetic: wordForm.phonetic.trim() || undefined,
                    meaning: wordForm.meaning.trim(),
                    note: wordForm.note.trim() || undefined,
                    partOfSpeech: wordForm.partOfSpeech,
                })
                const updatedNotebook = {
                    ...activeNotebook,
                    entries: activeNotebook.entries.map(e => e.id === editingEntry.id ? updated : e),
                }
                setActiveNotebook(updatedNotebook)
                setMyNotebooks(prev => prev.map(n => n.id === activeNotebook.id ? updatedNotebook : n))
                toast.success('Đã cập nhật từ')
            } else {
                // Create
                const entry = await notebookApi.addEntry(activeNotebook.id, {
                    word: wordForm.word.trim(),
                    phonetic: wordForm.phonetic.trim() || undefined,
                    meaning: wordForm.meaning.trim(),
                    note: wordForm.note.trim() || undefined,
                    partOfSpeech: wordForm.partOfSpeech,
                })
                const updatedNotebook = {
                    ...activeNotebook,
                    entries: [...activeNotebook.entries, entry],
                    entryCount: activeNotebook.entryCount + 1,
                }
                setActiveNotebook(updatedNotebook)
                setMyNotebooks(prev => prev.map(n => n.id === activeNotebook.id ? updatedNotebook : n))
                toast.success('Đã thêm từ mới!')
            }

            setIsAddWordOpen(false)
            setWordForm({ word: '', phonetic: '', meaning: '', note: '', partOfSpeech: 'noun' })
            setEditingEntry(null)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Lưu từ thất bại')
        } finally {
            setIsSaving(false)
        }
    }

    const openEditEntry = (entry: NoteEntry) => {
        setEditingEntry(entry)
        setWordForm({
            word: entry.word,
            phonetic: entry.phonetic || '',
            meaning: entry.meaning,
            note: entry.note || '',
            partOfSpeech: entry.partOfSpeech,
        })
        setIsAddWordOpen(true)
    }

    // ---- DELETE WORD ----
    const handleDeleteEntry = async (entryId: string) => {
        if (!activeNotebook) return
        try {
            await notebookApi.deleteEntry(activeNotebook.id, entryId)
            const updatedNotebook = {
                ...activeNotebook,
                entries: activeNotebook.entries.filter(e => e.id !== entryId),
                entryCount: Math.max(0, activeNotebook.entryCount - 1),
            }
            setActiveNotebook(updatedNotebook)
            setMyNotebooks(prev => prev.map(n => n.id === activeNotebook.id ? updatedNotebook : n))
            toast.success('Đã xóa từ')
        } catch {
            toast.error('Xóa từ thất bại')
        }
    }

    // ---- IMPORT EXCEL ----
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
            toast.error('Chỉ hỗ trợ file Excel (.xlsx, .xls) hoặc CSV')
            return
        }

        setImportFileName(file.name)
        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const data = evt.target?.result
                const workbook = XLSX.read(data, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName!]
                const rows: any[] = XLSX.utils.sheet_to_json(sheet!, { header: 1 })

                const entries: typeof importPreview = []
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i]
                    if (!row || !row[0]) continue
                    const word = String(row[0] || '').trim()
                    if (!word) continue
                    entries.push({
                        word,
                        phonetic: String(row[1] || '').trim() || undefined,
                        meaning: String(row[2] || '').trim(),
                        note: String(row[3] || '').trim() || undefined,
                        partOfSpeech: String(row[4] || 'noun').trim(),
                    })
                }

                const validEntries = entries.filter(e => e.word)
                if (validEntries.length === 0) {
                    toast.error('Không tìm thấy dữ liệu. Hãy kiểm tra file có đúng định dạng chưa (xem hướng dẫn bên dưới)')
                } else {
                    const missingMeaning = validEntries.filter(e => !e.meaning).length
                    if (missingMeaning > 0) {
                        toast.warning(`${missingMeaning} từ chưa có nghĩa (cột C), bạn có thể bổ sung sau`)
                    }
                    setImportPreview(validEntries)
                }
            } catch {
                toast.error('Không thể đọc file, vui lòng kiểm tra lại định dạng')
            }
        }
        reader.readAsArrayBuffer(file)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleConfirmImport = async () => {
        if (!activeNotebook || importPreview.length === 0) return
        try {
            setIsSaving(true)
            const result = await notebookApi.bulkCreateEntries(activeNotebook.id, importPreview)

            // Reload the active notebook to get updated entries
            const updated = await notebookApi.getNotebook(activeNotebook.id)
            setActiveNotebook(updated)
            setMyNotebooks(prev => prev.map(n => n.id === activeNotebook.id ? updated : n))

            setIsImportOpen(false)
            setImportPreview([])
            setImportFileName('')
            if (fileInputRef.current) fileInputRef.current.value = ''
            toast.success(`Đã nhập ${result.count} từ thành công!`)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Import thất bại')
        } finally {
            setIsSaving(false)
        }
    }

    const posLabel = (val: string) => PART_OF_SPEECH_OPTIONS.find(o => o.value === val)?.label || val

    // ============ RENDER: STUDY MODE ============
    if (activeNotebook && isStudyMode) {
        return (
            <div className="animate-in fade-in duration-300 pb-20">
                <NotebookFlashcardStudy
                    entries={activeNotebook.entries}
                    notebookName={activeNotebook.name}
                    onClose={() => setIsStudyMode(false)}
                />
            </div>
        )
    }

    // ============ RENDER: NOTEBOOK DETAIL VIEW ============
    if (activeNotebook) {
        const isOwner = activeNotebook.userId === userId
        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                {/* Back + Header */}
                <div className="flex flex-col gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveNotebook(null)}
                        className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="size-4 mr-1" />
                        Quay lại sổ tay
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-border">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                    <BookOpen className="size-5" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">{activeNotebook.name}</h1>
                                    {activeNotebook.description && (
                                        <p className="text-sm text-muted-foreground">{activeNotebook.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 ml-1">
                                <Badge variant={activeNotebook.isPublic ? 'default' : 'secondary'} className="text-xs font-medium">
                                    {activeNotebook.isPublic ? <><Globe className="size-3 mr-1" />Công khai</> : <><Lock className="size-3 mr-1" />Riêng tư</>}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {activeNotebook.entries.length} từ
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {isOwner && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTogglePublic(activeNotebook.id)}
                                    >
                                        {activeNotebook.isPublic ? <Lock className="size-3.5 mr-1.5" /> : <Globe className="size-3.5 mr-1.5" />}
                                        {activeNotebook.isPublic ? 'Đặt riêng tư' : 'Công khai'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setIsImportOpen(true) }}
                                    >
                                        <FileSpreadsheet className="size-3.5 mr-1.5" />
                                        Nhập Excel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => { setEditingEntry(null); setWordForm({ word: '', phonetic: '', meaning: '', note: '', partOfSpeech: 'noun' }); setIsAddWordOpen(true) }}
                                    >
                                        <Plus className="size-3.5 mr-1.5" />
                                        Thêm từ mới
                                    </Button>
                                </>
                            )}
                            {activeNotebook.entries.length > 0 && (
                                <Button
                                    size="sm"
                                    onClick={() => setIsStudyMode(true)}
                                    className="h-9 rounded-xl text-xs font-black uppercase tracking-widest bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
                                >
                                    <BrainCircuit className="size-3.5 mr-1.5" />
                                    Học Flashcard
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Search entries */}
                    {activeNotebook.entries.length > 0 && (
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm từ trong sổ tay..."
                                className="pl-10"
                                value={entrySearch}
                                onChange={e => setEntrySearch(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Empty state */}
                {activeNotebook.entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-8">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="size-8 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Sổ tay chưa có từ nào</h3>
                            <p className="text-sm text-muted-foreground">Bạn muốn thêm từ vào sổ tay này bằng cách nào?</p>
                        </div>

                        {isOwner && (
                            <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg">
                                <Card
                                    className="border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group rounded-2xl"
                                    onClick={() => setIsImportOpen(true)}
                                >
                                    <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20 transition-colors">
                                            <FileSpreadsheet className="size-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">Nhập từ Excel</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Tải lên file .xlsx hoặc .csv</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    className="border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group rounded-2xl"
                                    onClick={() => { setEditingEntry(null); setWordForm({ word: '', phonetic: '', meaning: '', note: '', partOfSpeech: 'noun' }); setIsAddWordOpen(true) }}
                                >
                                    <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20 transition-colors">
                                            <Plus className="size-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">Thêm từ mới</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Nhập từng từ thủ công</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Word List */
                    <div className="space-y-3">
                        {filteredEntries.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground">
                                <Search className="size-8 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">Không tìm thấy từ nào</p>
                            </div>
                        ) : (
                            filteredEntries.map((entry, idx) => (
                                <Card key={entry.id} className="border-border bg-card rounded-2xl hover:shadow-sm transition-all group">
                                    <CardContent className="p-4 flex items-start gap-4">
                                        <div className="flex items-center justify-center size-9 rounded-xl bg-muted/40 text-muted-foreground font-bold text-sm shrink-0 mt-0.5">
                                            {idx + 1}
                                        </div>

                                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_1px_1fr] gap-3 sm:gap-4">
                                            {/* Left: word info */}
                                            <div className="space-y-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-foreground">{entry.word}</span>
                                                    {entry.phonetic && (
                                                        <span className="text-sm text-muted-foreground font-medium">[{entry.phonetic}]</span>
                                                    )}
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0">
                                                    {posLabel(entry.partOfSpeech)}
                                                </Badge>
                                            </div>

                                            {/* Divider */}
                                            <div className="hidden sm:block w-px bg-border/60 my-1" />

                                            {/* Right: meaning + note */}
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">{entry.meaning}</p>
                                                {entry.note && (
                                                    <p className="text-xs text-muted-foreground leading-relaxed">{entry.note}</p>
                                                )}
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                    <DropdownMenuItem
                                                        onClick={() => openEditEntry(entry)}
                                                        className="text-xs font-medium rounded-lg cursor-pointer"
                                                    >
                                                        <Pencil className="size-3.5 mr-2" />Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteEntry(entry.id)}
                                                        className="text-xs font-medium rounded-lg cursor-pointer text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="size-3.5 mr-2" />Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* ---- DIALOG: Add/Edit Word ---- */}
                <Dialog open={isAddWordOpen} onOpenChange={(open) => { setIsAddWordOpen(open); if (!open) { setEditingEntry(null); setWordForm({ word: '', phonetic: '', meaning: '', note: '', partOfSpeech: 'noun' }) } }}>
                    <DialogContent className="sm:max-w-[480px] rounded-2xl border-border bg-background shadow-xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">{editingEntry ? 'Chỉnh sửa từ' : 'Thêm từ mới'}</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Thêm từ vào sổ tay "{activeNotebook.name}"
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-2">
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Từ <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={wordForm.word}
                                    onChange={e => setWordForm(f => ({ ...f, word: e.target.value }))}
                                    placeholder="VD: 食べる, たべる..."
                                    onKeyDown={e => e.key === 'Enter' && handleSaveWord()}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phonetic</Label>
                                <Input
                                    value={wordForm.phonetic}
                                    onChange={e => setWordForm(f => ({ ...f, phonetic: e.target.value }))}
                                    placeholder="VD: taberu, /tɑːbɛru/..."
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Nghĩa của từ <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={wordForm.meaning}
                                    onChange={e => setWordForm(f => ({ ...f, meaning: e.target.value }))}
                                    placeholder="VD: Ăn, To eat..."
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Thêm ghi chú</Label>
                                <Textarea
                                    value={wordForm.note}
                                    onChange={e => setWordForm(f => ({ ...f, note: e.target.value }))}
                                    className="rounded-lg text-sm resize-none h-20"
                                    placeholder="Câu ví dụ, ghi chú thêm..."
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Từ loại</Label>
                                <Select value={wordForm.partOfSpeech} onValueChange={v => setWordForm(f => ({ ...f, partOfSpeech: v }))}>
                                    <SelectTrigger className="h-10 rounded-lg bg-background text-sm">
                                        <SelectValue placeholder="Chọn từ loại" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border max-h-60">
                                        {PART_OF_SPEECH_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setIsAddWordOpen(false)}>Hủy</Button>
                            <Button onClick={handleSaveWord} disabled={isSaving}>
                                {isSaving && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                                Xong
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ---- DIALOG: Import Excel ---- */}
                <Dialog open={isImportOpen} onOpenChange={v => { setIsImportOpen(v); if (!v) { setImportPreview([]); setImportFileName(''); if (fileInputRef.current) fileInputRef.current.value = '' } }}>
                    <DialogContent className="sm:max-w-[540px] rounded-2xl border-border bg-background shadow-xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <FileSpreadsheet className="size-5 text-emerald-600" />
                                Nhập từ Excel
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Chọn file Excel hoặc CSV để nhập từ vào sổ tay
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Format guide */}
                            <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">📋 Định dạng file Excel</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                                                <td className="pr-3 pb-1.5">Cột A <span className="text-destructive">*</span></td>
                                                <td className="pr-3 pb-1.5">Cột B</td>
                                                <td className="pr-3 pb-1.5">Cột C</td>
                                                <td className="pr-3 pb-1.5">Cột D</td>
                                                <td className="pb-1.5">Cột E</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="text-[10px] font-bold text-muted-foreground border-b border-border/50">
                                                <td className="pr-3 pb-1.5">Từ vựng</td>
                                                <td className="pr-3 pb-1.5">Phonetic</td>
                                                <td className="pr-3 pb-1.5">Nghĩa</td>
                                                <td className="pr-3 pb-1.5">Ghi chú</td>
                                                <td className="pb-1.5">Từ loại</td>
                                            </tr>
                                            <tr className="text-xs text-foreground/70">
                                                <td className="pr-3 pt-1.5 font-bold">食べる</td>
                                                <td className="pr-3 pt-1.5">taberu</td>
                                                <td className="pr-3 pt-1.5">Ăn</td>
                                                <td className="pr-3 pt-1.5">Câu ví dụ</td>
                                                <td className="pt-1.5">verb_ichidan</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[10px] text-muted-foreground/50">Dòng đầu tiên là tiêu đề (sẽ bị bỏ qua). Chỉ cần cột A là bắt buộc.</p>
                            </div>

                            {/* Upload zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all text-center"
                            >
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                                    <Upload className="size-6" />
                                </div>
                                {importFileName ? (
                                    <div>
                                        <p className="font-bold text-sm text-foreground">{importFileName}</p>
                                        <p className="text-xs text-emerald-600 font-medium mt-0.5">{importPreview.length} từ được tìm thấy</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-bold text-sm text-foreground">Nhấp để chọn file</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Hỗ trợ .xlsx, .xls, .csv</p>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

                            {/* Preview */}
                            {importPreview.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Xem trước ({importPreview.length} từ)</p>
                                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                                        {importPreview.slice(0, 5).map((entry, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm">
                                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                                <span className="font-bold text-foreground">{entry.word}</span>
                                                {entry.phonetic && <span className="text-muted-foreground">[{entry.phonetic}]</span>}
                                                <ArrowRight className="size-3 text-muted-foreground/40 shrink-0" />
                                                <span className="text-foreground/80 truncate">{entry.meaning}</span>
                                            </div>
                                        ))}
                                        {importPreview.length > 5 && (
                                            <p className="text-xs text-muted-foreground text-center py-1 font-medium">
                                                ... và {importPreview.length - 5} từ khác
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setIsImportOpen(false)} className="rounded-xl">Hủy</Button>
                            <Button
                                onClick={handleConfirmImport}
                                disabled={importPreview.length === 0 || isSaving}
                                className="rounded-xl font-bold"
                            >
                                {isSaving && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                                Nhập {importPreview.length > 0 ? `${importPreview.length} từ` : ''}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    // ============ RENDER: NOTEBOOK LIST VIEW ============
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-border">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">Sổ tay từ vựng</h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-xl">
                        Tạo sổ tay để ghi chép từ vựng, xem sổ tay công khai từ cộng đồng và tạo flashcard để ôn luyện.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm sổ tay..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { setNewNotebookName(''); setNewNotebookDesc(''); setNewNotebookPublic(false); setNameError(''); setIsCreateOpen(true) }}
                    >
                        <Plus className="size-4 mr-2" />
                        Tạo sổ tay
                    </Button>
                </div>
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-muted-foreground/50" />
                </div>
            ) : (
                <Tabs defaultValue="my">
                    <TabsList>
                        <TabsTrigger value="my">
                            Sổ tay của tôi
                            {myNotebooks.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">{myNotebooks.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="explore">
                            Khám phá
                            {publicNotebooks.length > 0 && (
                                <Badge variant="outline" className="ml-2 h-4 px-1.5 text-[10px]">{publicNotebooks.length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>


                    {/* MY NOTEBOOKS */}
                    <TabsContent value="my" className="mt-6">
                        {filteredMyNotebooks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/5">
                                <div className="p-4 rounded-full bg-muted/20 mb-4">
                                    <BookOpen className="size-8 text-muted-foreground/40" />
                                </div>
                                {myNotebooks.length === 0 ? (
                                    <>
                                        <h3 className="text-lg font-bold text-foreground">Bạn chưa có sổ tay nào</h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-4">Tạo sổ tay đầu tiên để bắt đầu ghi chép từ vựng.</p>
                                        <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl font-bold">
                                            <Plus className="size-4 mr-2" />Tạo sổ tay đầu tiên
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-bold text-foreground">Không tìm thấy kết quả</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Thử tìm kiếm với từ khóa khác.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMyNotebooks.map(nb => (
                                    <NotebookCard
                                        key={nb.id}
                                        notebook={nb}
                                        isOwner
                                        onOpen={() => { setActiveNotebook(nb); setEntrySearch('') }}
                                        onDelete={() => handleDeleteNotebook(nb.id)}
                                        onTogglePublic={() => handleTogglePublic(nb.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* EXPLORE */}
                    <TabsContent value="explore" className="mt-6">
                        {filteredPublicNotebooks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-muted/5">
                                <div className="p-4 rounded-full bg-muted/20 mb-4">
                                    <Globe className="size-8 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Chưa có sổ tay công khai</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Các sổ tay được chia sẻ từ cộng đồng sẽ xuất hiện ở đây.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPublicNotebooks.map(nb => (
                                    <NotebookCard
                                        key={nb.id}
                                        notebook={nb}
                                        isOwner={false}
                                        onOpen={() => { setActiveNotebook(nb); setEntrySearch('') }}
                                        onDelete={() => { }}
                                        onTogglePublic={() => { }}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}

            {/* ---- DIALOG: Create Notebook ---- */}
            <Dialog open={isCreateOpen} onOpenChange={v => { setIsCreateOpen(v); if (!v) setNameError('') }}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl border-border bg-background shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Tạo sổ tay mới</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Đặt tên cho sổ tay từ vựng của bạn
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Tên sổ tay <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={newNotebookName}
                                onChange={e => { setNewNotebookName(e.target.value); setNameError('') }}
                                className={`h-10 rounded-lg text-sm font-medium ${nameError ? 'border-destructive ring-1 ring-destructive' : ''}`}
                                placeholder="VD: Từ vựng N4 - Chủ đề gia đình"
                                onKeyDown={e => e.key === 'Enter' && handleCreateNotebook()}
                                autoFocus
                            />
                            {nameError && <p className="text-xs text-destructive font-medium">{nameError}</p>}
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mô tả (tùy chọn)</Label>
                            <Input
                                value={newNotebookDesc}
                                onChange={e => setNewNotebookDesc(e.target.value)}
                                className="h-10 rounded-lg text-sm"
                                placeholder="Mô tả ngắn về sổ tay này..."
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                            <div className="flex items-center gap-3">
                                <Globe className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-bold text-foreground">Công khai</p>
                                    <p className="text-xs text-muted-foreground">Cho phép cộng đồng xem sổ tay này</p>
                                </div>
                            </div>
                            <Switch checked={newNotebookPublic} onCheckedChange={setNewNotebookPublic} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Hủy</Button>
                        <Button onClick={handleCreateNotebook} className="rounded-xl font-bold px-6" disabled={isSaving}>
                            {isSaving && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                            Tạo sổ tay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// ============ NOTEBOOK CARD COMPONENT ============
function NotebookCard({
    notebook,
    isOwner,
    onOpen,
    onDelete,
    onTogglePublic,
}: {
    notebook: Notebook
    isOwner: boolean
    onOpen: () => void
    onDelete: () => void
    onTogglePublic: () => void
}) {
    const lastUpdated = new Date(notebook.updatedAt).toLocaleDateString('vi-VN')
    const wordCount = notebook.entryCount

    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg bg-card border-border rounded-2xl h-full shadow-sm flex flex-col cursor-pointer"
            onClick={onOpen}
        >
            <CardContent className="p-6 space-y-4 flex-1 flex flex-col relative z-10">
                <div className="flex justify-between items-start">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <BookOpen className="size-6" />
                    </div>
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <Badge
                            variant={notebook.isPublic ? 'default' : 'secondary'}
                            className="text-[10px] font-bold h-5 px-2"
                        >
                            {notebook.isPublic ? <Globe className="size-2.5 mr-1" /> : <Lock className="size-2.5 mr-1" />}
                            {notebook.isPublic ? 'Công khai' : 'Riêng tư'}
                        </Badge>
                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-lg hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl p-1">
                                    <DropdownMenuItem
                                        onClick={onTogglePublic}
                                        className="text-xs font-medium rounded-lg cursor-pointer"
                                    >
                                        {notebook.isPublic ? <Lock className="size-3.5 mr-2" /> : <Globe className="size-3.5 mr-2" />}
                                        {notebook.isPublic ? 'Đặt riêng tư' : 'Công khai'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={onDelete}
                                        className="text-xs font-medium rounded-lg cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="size-3.5 mr-2" />Xóa sổ tay
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5 flex-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {notebook.name}
                    </h3>
                    {notebook.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{notebook.description}</p>
                    )}
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        <span>{wordCount} từ</span>
                    </div>
                    <span>{lastUpdated}</span>
                </div>
            </CardContent>
        </Card>
    )
}
