import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useAcademyStudySetCatalogById,
  useAdminCreateSetCard,
  useAdminUpdateSetCard,
  useAdminDeleteSetCard,
} from '@/lib/api/services/academy-study-set-catalogs'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import { Badge } from '@workspace/ui/components/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

interface CardFormState {
  term: string
  definition: string
  hint: string
}

const emptyForm: CardFormState = { term: '', definition: '', hint: '' }

export default function StudySetCatalogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setId = id!

  const { data: set, isLoading } = useAcademyStudySetCatalogById(setId)
  const createCard = useAdminCreateSetCard(setId)
  const updateCard = useAdminUpdateSetCard(setId)
  const deleteCard = useAdminDeleteSetCard(setId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<any | null>(null)
  const [form, setForm] = useState<CardFormState>(emptyForm)

  const openCreate = () => {
    setEditingCard(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (card: any) => {
    setEditingCard(card)
    setForm({ term: card.term, definition: card.definition, hint: card.hint || '' })
    setDialogOpen(true)
  }

  const onSubmit = async () => {
    if (!form.term.trim() || !form.definition.trim()) {
      toast.error('Vui lòng nhập cả mặt trước và mặt sau của thẻ')
      return
    }
    const payload = {
      term: form.term.trim(),
      definition: form.definition.trim(),
      hint: form.hint.trim() || undefined,
    }
    try {
      if (editingCard) {
        await updateCard.mutateAsync({ cardId: editingCard.id, input: payload })
        toast.success('Đã cập nhật thẻ')
      } else {
        await createCard.mutateAsync(payload)
        toast.success('Đã thêm thẻ mới')
      }
      setDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu thẻ')
    }
  }

  const onDelete = async (card: any) => {
    if (!confirm(`Xóa thẻ "${card.term}"?`)) return
    try {
      await deleteCard.mutateAsync(card.id)
      toast.success('Đã xóa thẻ')
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa thẻ')
    }
  }

  const isPending = createCard.isPending || updateCard.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!set) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Không tìm thấy bộ thẻ.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
    )
  }

  const cards = (set as any).setCards ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <PageHeader
            title={set.title}
            subtitle={set.description || 'Quản lý các thẻ flashcard bên trong bộ này'}
            stats={[
              { label: 'Số thẻ', value: cards.length },
              { label: 'Trạng thái', value: set.isPublic ? 'Public' : 'Ẩn' },
            ]}
            actions={
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm thẻ
              </Button>
            }
          />
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-20 gap-4 text-muted-foreground">
          <BookOpen className="w-12 h-12" />
          <p className="text-lg font-medium">Bộ thẻ này chưa có thẻ nào</p>
          <p className="text-sm">Nhấn "Thêm thẻ" để bắt đầu tạo nội dung</p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm thẻ đầu tiên
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8 pl-4">#</TableHead>
                <TableHead>Mặt trước (Term)</TableHead>
                <TableHead>Mặt sau (Definition)</TableHead>
                <TableHead>Gợi ý</TableHead>
                <TableHead className="text-right pr-6 w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card: any, idx: number) => (
                <TableRow key={card.id} className="hover:bg-muted/10">
                  <TableCell className="pl-4 text-muted-foreground text-sm">{idx + 1}</TableCell>
                  <TableCell className="font-medium max-w-[240px]">
                    <div className="line-clamp-2">{card.term}</div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="line-clamp-2 text-muted-foreground">{card.definition}</div>
                  </TableCell>
                  <TableCell>
                    {card.hint ? (
                      <Badge variant="outline" className="text-xs font-normal">
                        {card.hint}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(card)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(card)}
                        disabled={deleteCard.isPending && deleteCard.variables === card.id}
                      >
                        {deleteCard.isPending && deleteCard.variables === card.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Card Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>
                Mặt trước (Term) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="VD: 日本語 / にほんご"
                value={form.term}
                onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
                rows={2}
                className="resize-none"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>
                Mặt sau (Definition) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="VD: Tiếng Nhật"
                value={form.definition}
                onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Gợi ý (không bắt buộc)</Label>
              <Input
                placeholder="VD: N5"
                value={form.hint}
                onChange={(e) => setForm((f) => ({ ...f, hint: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={onSubmit} disabled={!form.term.trim() || !form.definition.trim() || isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingCard ? 'Cập nhật' : 'Thêm thẻ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
