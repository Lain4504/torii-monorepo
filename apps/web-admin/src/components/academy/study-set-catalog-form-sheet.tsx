import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Switch } from '@workspace/ui/components/switch'
import { Field, FieldLabel, FieldDescription } from '@workspace/ui/components/field'
import { Spinner } from '@workspace/ui/components/spinner'
import type { AcademyStudySetModel } from '@workspace/schemas'

export interface StudySetCatalogFormValues {
  title: string
  description: string
  isPublic: boolean
}

interface StudySetCatalogFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: AcademyStudySetModel | null
  onSubmit: (values: StudySetCatalogFormValues) => Promise<void>
  isPending: boolean
}

export function StudySetCatalogFormSheet({
  open,
  onOpenChange,
  editing,
  onSubmit,
  isPending,
}: StudySetCatalogFormSheetProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setTitle(editing.title || '')
      setDescription(editing.description || '')
      setIsPublic(!!editing.isPublic)
    } else {
      setTitle('')
      setDescription('')
      setIsPublic(true)
    }
  }, [open, editing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), isPublic })
    } catch {
      /* toast ở parent */
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) onOpenChange(v)
      }}
    >
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <SheetHeader className="border-b px-6 py-4 text-left">
            <SheetTitle>{editing ? 'Sửa bộ hệ thống' : 'Tạo bộ hệ thống'}</SheetTitle>
            <SheetDescription>
              Bộ thẻ mặc định dùng trong mục Khám phá phía học viên khi bật hiển thị public.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-5 px-6 py-4">
              <Field>
                <FieldLabel htmlFor="catalog-title">Tên bộ</FieldLabel>
                <Input
                  id="catalog-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: N5 Kanji cơ bản"
                  autoComplete="off"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="catalog-desc">Mô tả</FieldLabel>
                <Textarea
                  id="catalog-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn cho catalog…"
                  rows={3}
                />
              </Field>

              <Field orientation="horizontal" className="items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="catalog-public" className="text-sm font-medium">
                    Hiển thị trong catalog
                  </FieldLabel>
                  <FieldDescription>
                    Học viên thấy bộ này ở trang khám phá khi bật.
                  </FieldDescription>
                </div>
                <Switch
                  id="catalog-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </Field>
            </div>
          </ScrollArea>

          <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isPending && onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending && <Spinner className="mr-2" />}
              {editing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
