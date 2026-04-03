import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Tag, Plus, Edit2, Trash2, X, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  useAcademyQuestionCategories,
  useCreateAcademyQuestionCategory,
  useUpdateAcademyQuestionCategory,
  useDeleteAcademyQuestionCategory,
} from "@/lib/api/services/academy-questions"

interface CategoryManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryManagerDialog({ open, onOpenChange }: CategoryManagerDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  const { data: categories = [], isLoading } = useAcademyQuestionCategories()
  const createMutation = useCreateAcademyQuestionCategory()
  const updateMutation = useUpdateAcademyQuestionCategory()
  const deleteMutation = useDeleteAcademyQuestionCategory()

  const handleCreate = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    const code = trimmed.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '').substring(0, 50) || `CAT_${Date.now()}`
    
    try {
      await createMutation.mutateAsync({ name: trimmed, code, isActive: true })
      toast.success("Tạo danh mục thành công")
      setNewCategoryName("")
    } catch (error: any) {
      toast.error(error.userMessage || error.message || "Không thể tạo danh mục")
    }
  }

  const handleStartEdit = (cat: any) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  const handleSaveEdit = async (cat: any) => {
    const trimmed = editName.trim()
    if (!trimmed || trimmed === cat.name) {
      handleCancelEdit()
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: cat.id,
        dto: { name: trimmed }
      })
      toast.success("Cập nhật danh mục thành công")
      handleCancelEdit()
    } catch (error: any) {
      toast.error(error.userMessage || error.message || "Không thể cập nhật danh mục")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success("Xóa danh mục thành công")
    } catch (error: any) {
      toast.error(error.userMessage || error.message || "Không thể xóa danh mục. Có thể danh mục đang được sử dụng.")
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Quản lý danh mục câu hỏi
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4 overflow-hidden">
            {/* Create new */}
            <div className="flex gap-2">
              <Input
                placeholder="Nhập tên danh mục mới..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
              />
              <Button 
                onClick={handleCreate} 
                disabled={!newCategoryName.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {createMutation.isPending ? "" : "Thêm mới"}
              </Button>
            </div>

            {/* List */}
            <div className="border rounded-md overflow-y-auto flex-1 max-h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                  <TableRow>
                    <TableHead className="w-[60px] text-center">#</TableHead>
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead className="w-[120px]">Mã</TableHead>
                    <TableHead className="text-right w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Đang tải danh sách...
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Không có danh mục nào. Hãy tạo mới.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((cat: any, idx: number) => (
                      <TableRow key={cat.id}>
                        <TableCell
                          className="text-center font-medium text-muted-foreground/60 tabular-nums text-xs"
                        >
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {editingId === cat.id ? (
                            <Input
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(cat)
                                if (e.key === "Escape") handleCancelEdit()
                              }}
                              className="h-8"
                            />
                          ) : (
                            cat.name
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {cat.code}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === cat.id ? (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleSaveEdit(cat)}>
                                {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleCancelEdit}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(cat)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(cat)}>
                                {deleteMutation.isPending && deleteMutation.variables === cat.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa danh mục "{deleteTarget?.name}"? Hành động này không thể hoàn tác nếu danh mục chưa có liên kết dữ liệu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa danh mục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
