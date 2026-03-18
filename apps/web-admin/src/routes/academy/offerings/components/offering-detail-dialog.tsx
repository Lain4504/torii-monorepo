import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@workspace/ui/components/field"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { useNavigate } from "react-router-dom"
import { useAvailableClassesForOffering, type AcademyCourseOffering } from "@/lib/api/services/academy-course-offerings"
import { ExternalLink } from "lucide-react"

interface OfferingDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offering: AcademyCourseOffering | null
}

export function OfferingDetailDialog({ open, onOpenChange, offering }: OfferingDetailDialogProps) {
  const navigate = useNavigate()
  const { data: availableClasses = [] } = useAvailableClassesForOffering({
    mode: (offering as any)?.mode,
  })

  if (!offering) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Chi tiết Gói bán</DialogTitle>
            <Badge 
                variant={offering.status === 'PUBLISHED' ? 'default' : 'secondary'}
                className="ml-2 uppercase text-[10px]"
            >
                {offering.status === 'PUBLISHED' ? 'Đang bán' : 'Bản nháp/Chờ duyệt'}
            </Badge>
          </div>
          <DialogDescription>
            Thông tin chi tiết về gói sản phẩm thương mại #{offering.code}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <div className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Thông tin gói bán</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Mã gói</FieldLabel>
                        <div className="text-sm font-mono font-bold">{offering.code}</div>
                      </Field>
                      <Field>
                        <FieldLabel>Tiêu đề</FieldLabel>
                        <div className="text-sm font-medium">{offering.title}</div>
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel>Mô tả</FieldLabel>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {offering.description || 'Không có mô tả'}
                      </div>
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Giá & Hình thức</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Giá bán</FieldLabel>
                        <div className="text-lg font-bold text-primary">
                          {Number(offering.price).toLocaleString()} {offering.currency}
                        </div>
                      </Field>
                      <Field>
                        <FieldLabel>Loại hình</FieldLabel>
                        <Badge variant="outline" className="w-fit uppercase">
                            {(offering as any).mode || 'N/A'}
                        </Badge>
                      </Field>
                    </div>
                    {offering.originalPrice && Number(offering.originalPrice) > Number(offering.price) && (
                      <Field>
                        <FieldLabel>Giá gốc</FieldLabel>
                        <div className="text-sm text-muted-foreground line-through">
                          {Number(offering.originalPrice).toLocaleString()} {offering.currency}
                        </div>
                      </Field>
                    )}
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Lớp học liên kết ({offering.classes?.length || 0})</FieldLegend>
                  <div className="mt-2 space-y-2">
                    {offering.classes?.map((item: any) => {
                      const classId = item.id || item.classId
                      const cls = availableClasses.find((c: any) => c.id === classId) || item
                      return (
                        <div key={classId} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{cls.name || cls.title || 'Lớp học'}</span>
                            <span className="text-xs text-muted-foreground font-mono">{cls.code}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{cls.mode || (offering as any).mode}</Badge>
                        </div>
                      )
                    })}
                    {(!offering.classes || offering.classes.length === 0) && (
                      <div className="text-sm text-muted-foreground italic">Không có lớp học liên kết.</div>
                    )}
                  </div>
                </FieldSet>
              </FieldGroup>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2 bg-muted/20 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button 
            onClick={() => {
                navigate(`/academy/course-offerings/${offering.id}/detail`);
                onOpenChange(false);
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Xem trang thống kê
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
