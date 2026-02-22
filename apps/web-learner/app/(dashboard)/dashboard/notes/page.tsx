'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
    FileText, Search, MoreHorizontal, Plus, BookOpen, Upload,
    X, ChevronLeft, BrainCircuit, Trash2, Globe, Lock,
    FileSpreadsheet, Pencil, Layers, Hash, CheckCircle2,
    ArrowRight
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

// ============ TYPES ============
interface NoteEntry {
    id: string
    word: string
    phonetic: string
    meaning: string
    note: string
    partOfSpeech: string
    createdAt: string
}

interface Notebook {
    id: string
    name: string
    description?: string
    isPublic: boolean
    entries: NoteEntry[]
    createdAt: string
    updatedAt: string
    userId: string
}

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

const STORAGE_KEY = 'torii_notebooks'

// ============ HELPERS ============
function loadNotebooks(): Notebook[] {
    if (typeof window === 'undefined') return []
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
        return []
    }
}

function saveNotebooks(notebooks: Notebook[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks))
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getPublicNotebooks(notebooks: Notebook[], currentUserId: string): Notebook[] {
    return notebooks.filter(n => n.isPublic && n.userId !== currentUserId)
}

// ============ MAIN PAGE ============
export default function NotesPage() {
    const { user } = useAppSelector((state) => state.auth)
    const userId = user?.id || 'guest'

    const [notebooks, setNotebooks] = useState<Notebook[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null)
    const [entrySearch, setEntrySearch] = useState('')

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isAddWordOpen, setIsAddWordOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [isStudyMode, setIsStudyMode] = useState(false)

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
    const [importPreview, setImportPreview] = useState<NoteEntry[]>([])
    const [importFileName, setImportFileName] = useState('')



    useEffect(() => {
        setNotebooks(loadNotebooks())
    }, [])

    const myNotebooks = notebooks.filter(n => n.userId === userId)
    const publicNotebooks = notebooks.filter(n => n.isPublic && n.userId !== userId)

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
    const handleCreateNotebook = () => {
        const trimmedName = newNotebookName.trim()
        if (!trimmedName) {
            setNameError('Vui lòng nhập tên sổ tay')
            return
        }
        const duplicate = myNotebooks.find(n => n.name.toLowerCase() === trimmedName.toLowerCase())
        if (duplicate) {
            setNameError('Bạn đã có sổ tay với tên này rồi')
            return
        }

        const notebook: Notebook = {
            id: generateId(),
            name: trimmedName,
            description: newNotebookDesc.trim() || undefined,
            isPublic: newNotebookPublic,
            entries: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId,
        }
        const updated = [...notebooks, notebook]
        setNotebooks(updated)
        saveNotebooks(updated)
        setIsCreateOpen(false)
        setNewNotebookName('')
        setNewNotebookDesc('')
        setNewNotebookPublic(false)
        setNameError('')
        toast.success('Đã tạo sổ tay mới!')
        // Open the new notebook
        setActiveNotebook(notebook)
    }

    // ---- DELETE NOTEBOOK ----
    const handleDeleteNotebook = (id: string) => {
        const updated = notebooks.filter(n => n.id !== id)
        setNotebooks(updated)
        saveNotebooks(updated)
        if (activeNotebook?.id === id) setActiveNotebook(null)
        toast.success('Đã xóa sổ tay')
    }

    // ---- TOGGLE PUBLIC ----
    const handleTogglePublic = (notebookId: string) => {
        const updated = notebooks.map(n => {
            if (n.id === notebookId) return { ...n, isPublic: !n.isPublic, updatedAt: new Date().toISOString() }
            return n
        })
        setNotebooks(updated)
        saveNotebooks(updated)
        const nb = updated.find(n => n.id === notebookId)
        if (activeNotebook?.id === notebookId) setActiveNotebook(nb || null)
        toast.success(nb?.isPublic ? 'Sổ tay đã được công khai' : 'Sổ tay đã chuyển sang riêng tư')
    }

    // ---- ADD / EDIT WORD ----
    const handleSaveWord = () => {
        if (!wordForm.word.trim()) {
            toast.error('Vui lòng nhập từ')
            return
        }
        if (!wordForm.meaning.trim()) {
            toast.error('Vui lòng nhập nghĩa của từ')
            return
        }
        if (!activeNotebook) return

        const entry: NoteEntry = {
            id: editingEntry?.id || generateId(),
            word: wordForm.word.trim(),
            phonetic: wordForm.phonetic.trim(),
            meaning: wordForm.meaning.trim(),
            note: wordForm.note.trim(),
            partOfSpeech: wordForm.partOfSpeech,
            createdAt: editingEntry?.createdAt || new Date().toISOString(),
        }

        const updatedEntries = editingEntry
            ? activeNotebook.entries.map(e => e.id === editingEntry.id ? entry : e)
            : [...activeNotebook.entries, entry]

        const updatedNotebook = { ...activeNotebook, entries: updatedEntries, updatedAt: new Date().toISOString() }
        const updated = notebooks.map(n => n.id === activeNotebook.id ? updatedNotebook : n)
        setNotebooks(updated)
        saveNotebooks(updated)
        setActiveNotebook(updatedNotebook)

        setIsAddWordOpen(false)
        setWordForm({ word: '', phonetic: '', meaning: '', note: '', partOfSpeech: 'noun' })
        setEditingEntry(null)
        toast.success(editingEntry ? 'Đã cập nhật từ' : 'Đã thêm từ mới!')
    }

    const openEditEntry = (entry: NoteEntry) => {
        setEditingEntry(entry)
        setWordForm({
            word: entry.word,
            phonetic: entry.phonetic,
            meaning: entry.meaning,
            note: entry.note,
            partOfSpeech: entry.partOfSpeech,
        })
        setIsAddWordOpen(true)
    }

    // ---- DELETE WORD ----
    const handleDeleteEntry = (entryId: string) => {
        if (!activeNotebook) return
        const updatedEntries = activeNotebook.entries.filter(e => e.id !== entryId)
        const updatedNotebook = { ...activeNotebook, entries: updatedEntries, updatedAt: new Date().toISOString() }
        const updated = notebooks.map(n => n.id === activeNotebook.id ? updatedNotebook : n)
        setNotebooks(updated)
        saveNotebooks(updated)
        setActiveNotebook(updatedNotebook)
        toast.success('Đã xóa từ')
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
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

                // Skip header row, process data rows
                const entries: NoteEntry[] = []
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i]
                    if (!row || !row[0]) continue
                    entries.push({
                        id: generateId(),
                        word: String(row[0] || '').trim(),
                        phonetic: String(row[1] || '').trim(),
                        meaning: String(row[2] || '').trim(),
                        note: String(row[3] || '').trim(),
                        partOfSpeech: String(row[4] || 'noun').trim(),
                        createdAt: new Date().toISOString(),
                    })
                }
                setImportPreview(entries.filter(e => e.word && e.meaning))
                if (entries.length === 0) toast.error('Không tìm thấy dữ liệu trong file')
            } catch {
                toast.error('Không thể đọc file, vui lòng kiểm tra lại định dạng')
            }
        }
        reader.readAsBinaryString(file)
    }

    const handleConfirmImport = () => {
        if (!activeNotebook || importPreview.length === 0) return
        const updatedEntries = [...activeNotebook.entries, ...importPreview]
        const updatedNotebook = { ...activeNotebook, entries: updatedEntries, updatedAt: new Date().toISOString() }
        const updated = notebooks.map(n => n.id === activeNotebook.id ? updatedNotebook : n)
        setNotebooks(updated)
        saveNotebooks(updated)
        setActiveNotebook(updatedNotebook)
        setIsImportOpen(false)
        setImportPreview([])
        setImportFileName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        toast.success(`Đã nhập ${importPreview.length} từ thành công!`)
    }

    // ---- STUDY MODE ----
    // Inline flashcard study — no API, no dialog needed

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
                            {activeNotebook.userId === userId && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTogglePublic(activeNotebook.id)}
                                        className="h-9 rounded-xl text-xs font-bold"
                                    >
                                        {activeNotebook.isPublic ? <Lock className="size-3.5 mr-1.5" /> : <Globe className="size-3.5 mr-1.5" />}
                                        {activeNotebook.isPublic ? 'Đặt riêng tư' : 'Công khai'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => { setIsImportOpen(true) }}
                                        className="h-9 rounded-xl text-xs font-bold"
                                    >
                                        <FileSpreadsheet className="size-3.5 mr-1.5" />
                                        Nhập Excel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => { setEditingEntry(null); setWordForm({ word: '', phonetic: '', meaning: '', note: '', partOfSpeech: 'noun' }); setIsAddWordOpen(true) }}
                                        className="h-9 rounded-xl text-xs font-bold"
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
                                className="pl-10 h-10 rounded-xl text-sm"
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

                                        {activeNotebook.userId === userId && (
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
                                    className="h-10 rounded-lg text-sm font-medium"
                                    placeholder="VD: 食べる, たべる..."
                                    onKeyDown={e => e.key === 'Enter' && handleSaveWord()}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phonetic</Label>
                                <Input
                                    value={wordForm.phonetic}
                                    onChange={e => setWordForm(f => ({ ...f, phonetic: e.target.value }))}
                                    className="h-10 rounded-lg text-sm"
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
                                    className="h-10 rounded-lg text-sm"
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
                            <Button variant="outline" onClick={() => setIsAddWordOpen(false)} className="rounded-xl">Hủy</Button>
                            <Button onClick={handleSaveWord} className="rounded-xl font-bold px-6">Xong</Button>
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
                                File Excel cần có các cột theo thứ tự: <strong>Từ | Phonetic | Nghĩa | Ghi chú | Từ loại</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
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
                                disabled={importPreview.length === 0}
                                className="rounded-xl font-bold"
                            >
                                Nhập {importPreview.length > 0 ? `${importPreview.length} từ` : ''}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Flashcard dialog removed — now uses inline study mode */}
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
                            className="pl-10 h-10 rounded-xl bg-background border-input text-sm font-medium"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { setNewNotebookName(''); setNewNotebookDesc(''); setNewNotebookPublic(false); setNameError(''); setIsCreateOpen(true) }}
                        className="h-10 px-4 rounded-xl font-bold shadow-sm shrink-0"
                    >
                        <Plus className="size-4 mr-2" />
                        Tạo sổ tay
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="my">
                <TabsList className="h-10 rounded-xl bg-muted/50 p-1">
                    <TabsTrigger value="my" className="rounded-lg text-xs font-bold uppercase tracking-wider px-4">
                        Sổ tay của tôi
                        {myNotebooks.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black">{myNotebooks.length}</span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="explore" className="rounded-lg text-xs font-bold uppercase tracking-wider px-4">
                        Khám phá
                        {publicNotebooks.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-black">{publicNotebooks.length}</span>
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
                        <Button onClick={handleCreateNotebook} className="rounded-xl font-bold px-6">Tạo sổ tay</Button>
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
    const wordCount = notebook.entries.length

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
