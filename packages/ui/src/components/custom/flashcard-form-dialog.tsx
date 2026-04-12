"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Loader2, Sparkles } from "lucide-react"

export interface FlashcardFormValues {
  term: string
  phonetic: string
  definition: string
  note: string
  type: string
}

interface FlashcardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Partial<FlashcardFormValues>
  onSave: (values: FlashcardFormValues) => Promise<void>
  onAutoFill?: (term: string) => Promise<Partial<FlashcardFormValues>>
  isAutoFillPending?: boolean
  isPending?: boolean
  title?: string
}

export function FlashcardFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
  onAutoFill,
  isAutoFillPending = false,
  isPending = false,
  title = "Thêm từ mới",
}: FlashcardFormDialogProps) {
  const [values, setValues] = React.useState<FlashcardFormValues>({
    term: "",
    phonetic: "",
    definition: "",
    note: "",
    type: "Từ vựng",
  })
  const [autoFillError, setAutoFillError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setValues({
        term: initialValues?.term || "",
        phonetic: initialValues?.phonetic || "",
        definition: initialValues?.definition || "",
        note: initialValues?.note || "",
        type: initialValues?.type || "Từ vựng",
      })
      setAutoFillError(null)
    }
  }, [open, initialValues])

  const handleAutoFill = async () => {
    const term = values.term.trim()
    if (!onAutoFill || !term || isAutoFillPending) return

    setAutoFillError(null)
    try {
      const generated = await onAutoFill(term)
      setValues((prev) => ({
        ...prev,
        term: (generated.term ?? prev.term).trim() || prev.term,
        phonetic: (generated.phonetic ?? prev.phonetic).trim(),
        definition: (generated.definition ?? prev.definition).trim(),
        note: (generated.note ?? prev.note).trim(),
        type: (generated.type as string) || prev.type,
      }))
    } catch (err: any) {
      setAutoFillError(err?.message || "AI chưa thể điền thông tin lúc này")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.term.trim() || !values.definition.trim()) return
    try {
      await onSave(values)
    } catch {
      /* toast tại caller */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Nhập mặt trước, nghĩa và tùy chọn phiên âm / từ loại.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="flash-term">Từ</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="flash-term"
                placeholder="Nhập từ…"
                value={values.term}
                onChange={(e) => setValues({ ...values, term: e.target.value })}
                autoComplete="off"
              />
              {onAutoFill && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutoFill}
                  disabled={isAutoFillPending || !values.term.trim()}
                  className="shrink-0"
                >
                  {isAutoFillPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gợi ý AI
                    </>
                  )}
                </Button>
              )}
            </div>
            {autoFillError && (
              <p className="text-xs text-destructive">{autoFillError}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="flash-phonetic">Phiên âm (Romaji)</FieldLabel>
            <Input
              id="flash-phonetic"
              placeholder="Vi du: taberu"
              value={values.phonetic}
              onChange={(e) => setValues({ ...values, phonetic: e.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="flash-def">Nghĩa</FieldLabel>
            <Textarea
              id="flash-def"
              placeholder="Giải nghĩa…"
              value={values.definition}
              onChange={(e) => setValues({ ...values, definition: e.target.value })}
              rows={4}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="flash-note">Ghi chú</FieldLabel>
            <Input
              id="flash-note"
              placeholder="Tùy chọn…"
              value={values.note}
              onChange={(e) => setValues({ ...values, note: e.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="flash-type">Từ loại</FieldLabel>
            <Select
              value={values.type}
              onValueChange={(val) => setValues({ ...values, type: val })}
            >
              <SelectTrigger id="flash-type" className="w-full">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Từ vựng">Từ vựng</SelectItem>
                <SelectItem value="Ngữ pháp">Ngữ pháp</SelectItem>
                <SelectItem value="Hán tự">Hán tự</SelectItem>
                <SelectItem value="Mẫu câu">Mẫu câu</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !values.term.trim() || !values.definition.trim()}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
