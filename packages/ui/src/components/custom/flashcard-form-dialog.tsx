"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Loader2, Volume2 } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"

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
  isPending?: boolean
  title?: string
}

export function FlashcardFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
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

  React.useEffect(() => {
    if (open) {
      setValues({
        term: initialValues?.term || "",
        phonetic: initialValues?.phonetic || "",
        definition: initialValues?.definition || "",
        note: initialValues?.note || "",
        type: initialValues?.type || "Từ vựng",
      })
    }
  }, [open, initialValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.term.trim() || !values.definition.trim()) return
    await onSave(values)
  }

  const handlePreviewAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!values.term.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(values.term);
    
    // Detect Japanese
    const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(values.term);
    utterance.lang = isJapanese ? 'ja-JP' : 'en-US';
    utterance.rate = 0.9;

    utterance.onerror = () => {
      toast.error("Lỗi phát âm thanh xem trước.");
    };

    window.speechSynthesis.speak(utterance);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="term" className="text-sm font-semibold text-slate-600 ml-1">
              Từ
            </Label>
            <div className="relative">
              <Input
                id="term"
                placeholder="Nhập từ..."
                value={values.term}
                onChange={(e) => setValues({ ...values, term: e.target.value })}
                className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all px-4 pr-12"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-slate-400 hover:text-primary"
                onClick={handlePreviewAudio}
                disabled={!values.term.trim()}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phonetic" className="text-sm font-semibold text-slate-600 ml-1">
              Phonetic
            </Label>
            <Input
              id="phonetic"
              placeholder="Cách phát âm..."
              value={values.phonetic}
              onChange={(e) => setValues({ ...values, phonetic: e.target.value })}
              className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all px-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition" className="text-sm font-semibold text-slate-600 ml-1">
              Nghĩa của từ
            </Label>
            <Textarea
              id="definition"
              placeholder="Giải nghĩa..."
              value={values.definition}
              onChange={(e) => setValues({ ...values, definition: e.target.value })}
              className="min-h-[100px] rounded-2xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all p-4 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-semibold text-slate-600 ml-1">
              Thêm ghi chú
            </Label>
            <Input
              id="note"
              placeholder="Ghi chú thêm..."
              value={values.note}
              onChange={(e) => setValues({ ...values, note: e.target.value })}
              className="h-12 rounded-2xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all px-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-semibold text-slate-600 ml-1">
              Từ loại
            </Label>
            <Select
              value={values.type}
              onValueChange={(val) => setValues({ ...values, type: val })}
            >
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary px-4">
                <SelectValue placeholder="Chọn loại..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl p-1">
                <SelectItem value="Từ vựng" className="rounded-xl focus:bg-primary/5 cursor-pointer">Từ vựng</SelectItem>
                <SelectItem value="Ngữ pháp" className="rounded-xl focus:bg-primary/5 cursor-pointer">Ngữ pháp</SelectItem>
                <SelectItem value="Hán tự" className="rounded-xl focus:bg-primary/5 cursor-pointer">Hán tự</SelectItem>
                <SelectItem value="Mẫu câu" className="rounded-xl focus:bg-primary/5 cursor-pointer">Mẫu câu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 flex !justify-between gap-4 sm:gap-4 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all border-none"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !values.term.trim() || !values.definition.trim()}
              className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xong
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
