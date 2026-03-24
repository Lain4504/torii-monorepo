import { useMemo, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useAcademyCourseEditions } from '@/lib/api/services/academy-course-editions'
import type { AcademyCourseEditionModel } from '@workspace/schemas'
import { CourseEditionSheet } from './components/course-edition-sheet'

export default function CourseEditionsPage() {
  const [q, setQ] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedEdition, setSelectedEdition] = useState<AcademyCourseEditionModel | null>(null)

  const debouncedQ = useMemo(() => q.trim(), [q])

  const { data: editions, isLoading } = useAcademyCourseEditions({
    q: debouncedQ || undefined,
  })

  const activeEditions = useMemo(
    () => (editions ?? []).filter((edition) => edition.isActive),
    [editions],
  )

  const openCreate = () => {
    setSelectedEdition(null)
    setSheetOpen(true)
  }

  const openEdit = (edition: AcademyCourseEditionModel) => {
    setSelectedEdition(edition)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <PageHeader
        title="CourseEdition Groups"
        subtitle="Tạo/duy trì nhóm edition logic (vd: N5, N4, ...). CourseProfile phải trỏ vào edition đã tồn tại."
        actions={
          <Button size="lg" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo edition mới
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Tìm theo key / title / level..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[160px]">Key</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[120px]">Level</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[180px]">Cập nhật</TableHead>
              <TableHead className="text-right pr-6 w-[140px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : activeEditions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                  Không có edition nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              activeEditions.map((edition) => (
                <TableRow key={edition.id} className="group hover:bg-muted/5 transition-colors">
                  <TableCell className="font-mono font-bold text-xs text-primary">{edition.key}</TableCell>
                  <TableCell className="font-medium">{edition.title ?? '—'}</TableCell>
                  <TableCell>{edition.level ?? '—'}</TableCell>
                  <TableCell>
                    {edition.isActive ? (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-none">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-none">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {edition.updatedAt ? new Date(edition.updatedAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 border-sky-500/30 text-sky-700 bg-transparent hover:bg-sky-50 hover:text-sky-700"
                        onClick={() => openEdit(edition)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Sửa</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CourseEditionSheet open={sheetOpen} onOpenChange={setSheetOpen} edition={selectedEdition} />
    </div>
  )
}

