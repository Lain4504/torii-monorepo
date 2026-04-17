import * as React from "react"
import { useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"

import { apiClient } from "@/lib/api/api-client"
import { useAppDispatch, useAppSelector } from "@/hooks/hooks"
import { fetchProfile } from "@/store/slices/authSlice"

type JlptGoalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JlptGoalDialog({ open, onOpenChange }: JlptGoalDialogProps) {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const [jlptTarget, setJlptTarget] = useState<string>((user as any)?.jlptTarget || (user?.userMetadata as any)?.jlptTarget || "N3")
  const [currentLevel, setCurrentLevel] = useState<string>((user as any)?.currentLevel || "NEVER")
  const [saving, setSaving] = useState(false)

  // Keep dialog defaults in sync when user changes (profile refresh)
  useEffect(() => {
    setJlptTarget((user as any)?.jlptTarget || (user?.userMetadata as any)?.jlptTarget || "N3")
    setCurrentLevel((user as any)?.currentLevel || "NEVER")
  }, [user, open])

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      const res = await apiClient.post("/api/onboarding/survey", {
        jlptTarget,
        currentLevel,
      })
      if (res.data?.success) {
        toast.success("Đã cập nhật mục tiêu JLPT.")
        await dispatch(fetchProfile())
        onOpenChange(false)
      } else {
        toast.error(res.data?.message || "Không thể lưu mục tiêu.")
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không thể lưu mục tiêu.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Mục tiêu JLPT</DialogTitle>
          <DialogDescription>
            Dùng để gợi ý khóa học phù hợp trên dashboard. Bạn có thể thay đổi bất cứ lúc nào.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Mục tiêu JLPT</Label>
            <RadioGroup
              value={jlptTarget}
              onValueChange={setJlptTarget}
              className="grid grid-cols-2 gap-3 sm:grid-cols-5"
            >
              {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
                <Label
                  key={lvl}
                  htmlFor={`goal-${lvl}`}
                  className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium hover:bg-muted/40"
                >
                  <RadioGroupItem id={`goal-${lvl}`} value={lvl} />
                  {lvl}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Trình độ hiện tại (tuỳ chọn)</Label>
            <Select value={currentLevel} onValueChange={setCurrentLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trình độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEVER">Mới bắt đầu</SelectItem>
                <SelectItem value="N5">N5</SelectItem>
                <SelectItem value="N4">N4</SelectItem>
                <SelectItem value="N3">N3</SelectItem>
                <SelectItem value="N2">N2</SelectItem>
                <SelectItem value="N1">N1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={save} disabled={saving} className="font-bold">
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

