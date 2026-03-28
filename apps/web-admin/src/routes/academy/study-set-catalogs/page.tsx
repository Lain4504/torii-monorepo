import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Switch } from '@workspace/ui/components/switch'
import { Label } from '@workspace/ui/components/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { PageHeader } from '@/components/common/page-header'
import {
  useAcademyStudySetCatalogs,
  useCreateAcademyStudySetCatalog,
  useDeleteAcademyStudySetCatalog,
  useUpdateAcademyStudySetCatalog,
} from '@/lib/api/services/academy-study-set-catalogs'
import type { AcademyStudySetModel } from '@workspace/schemas'
import { toast } from 'sonner'

export default function StudySetCatalogsPage() {
  const { data, isLoading } = useAcademyStudySetCatalogs()
  const navigate = useNavigate()
  const createCatalog = useCreateAcademyStudySetCatalog()
  const updateCatalog = useUpdateAcademyStudySetCatalog()
  const deleteCatalog = useDeleteAcademyStudySetCatalog()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AcademyStudySetModel | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const items = useMemo(
    () => (data || []).filter((x) => (x.sourceType || 'SYSTEM') === 'SYSTEM'),
    [data],
  )

  const resetForm = () => {
    setEditing(null)
    setTitle('')
    setDescription('')
    setIsPublic(true)
  }

  const openCreate = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (item: AcademyStudySetModel) => {
    setEditing(item)
    setTitle(item.title || '')
    setDescription(item.description || '')
    setIsPublic(!!item.isPublic)
    setOpen(true)
  }

  const onSubmit = async () => {
    if (!title.trim()) return
    try {
      if (editing) {
        await updateCatalog.mutateAsync({
          id: editing.id,
          input: { title, description, isPublic },
        })
        toast.success('Da cap nhat bo he thong')
      } else {
        await createCatalog.mutateAsync({ title, description, isPublic })
        toast.success('Da tao bo he thong')
      }
      setOpen(false)
      resetForm()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Khong the luu bo he thong')
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <PageHeader
        title="Study Set Catalogs (System)"
        subtitle="Quản lý bộ thẻ mặc định hệ thống, dùng cho mục Khám phá phía learner."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo bộ hệ thống
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Sửa bộ hệ thống' : 'Tạo bộ hệ thống'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên bộ</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: N5 Kanji co ban" />
                </div>
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mo ta ngan..." />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label>Hiển thị public trong catalog</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                <Button onClick={onSubmit} disabled={!title.trim()}>
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead>Tên bộ</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Public</TableHead>
              <TableHead>Số thẻ</TableHead>
              <TableHead className="text-right pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>Đang tải...</TableCell>
              </TableRow>
            ) : !items.length ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Chưa có bộ hệ thống nào.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description || '—'}</TableCell>
                  <TableCell>{item.isPublic ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{item._count?.setCards ?? 0}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/academy/study-set-catalogs/${item.id}`)}>
                        <BookOpen className="h-3.5 w-3.5 mr-1" />
                        Quản lý thẻ
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (!confirm('Xóa bộ hệ thống này?')) return
                          try {
                            await deleteCatalog.mutateAsync(item.id)
                            toast.success('Da xoa bo he thong')
                          } catch (error: unknown) {
                            toast.error(error instanceof Error ? error.message : 'Khong xoa duoc')
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
