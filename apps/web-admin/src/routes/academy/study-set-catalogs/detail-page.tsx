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
import { Badge } from '@workspace/ui/components/badge'
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
import { dataTableShellClass, dataTableHeaderClass } from '@/lib/ui-shell'

import { FlashcardFormDialog, type FlashcardFormValues } from '@workspace/ui/components/custom/flashcard-form-dialog'

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

  const openCreate = () => {
    setEditingCard(null)
    setDialogOpen(true)
  }

  const openEdit = (card: any) => {
    setEditingCard(card)
    setDialogOpen(true)
  }

  const handleSave = async (values: FlashcardFormValues) => {
    const payload = {
      term: values.term.trim(),
      definition: values.definition.trim(),
      hint: values.note.trim() || undefined,
      languageDetails: {
        phonetic: values.phonetic.trim(),
        type: values.type
      }
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

  const initialValues: Partial<FlashcardFormValues> = editingCard ? {
    term: editingCard.term,
    definition: editingCard.definition,
    phonetic: editingCard.languageDetails?.phonetic || editingCard.language_details?.phonetic || '',
    note: editingCard.hint || '',
    type: editingCard.languageDetails?.type || editingCard.language_details?.type || 'Từ vựng'
  } : {}

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
        <div className={dataTableShellClass}>
          <Table>
            <TableHeader className={dataTableHeaderClass}>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8 pl-4">#</TableHead>
                <TableHead>Mặt trước / Phiên âm</TableHead>
                <TableHead>Mặt sau / Nghĩa</TableHead>
                <TableHead>Từ loại</TableHead>
                <TableHead className="text-right pr-6 w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card: any, idx: number) => (
                <TableRow key={card.id} className="hover:bg-muted/10">
                  <TableCell className="pl-4 text-muted-foreground text-sm">{idx + 1}</TableCell>
                  <TableCell className="max-w-[240px]">
                    <div className="font-bold text-slate-800">{card.term}</div>
                    {(card.languageDetails?.phonetic || card.language_details?.phonetic) && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        「 {card.languageDetails?.phonetic || card.language_details?.phonetic} 」
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="text-slate-700">{card.definition}</div>
                    {card.hint && (
                      <div className="text-[11px] italic text-muted-foreground mt-0.5">Ghi chú: {card.hint}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {(card.languageDetails?.type || card.language_details?.type) ? (
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 h-5 bg-slate-50 uppercase tracking-tighter">
                        {card.languageDetails?.type || card.language_details?.type}
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

      {/* Shared Card Editor Dialog */}
      <FlashcardFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialValues={initialValues}
        onSave={handleSave}
        isPending={isPending}
        title={editingCard ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
      />
    </div>
  )
}
