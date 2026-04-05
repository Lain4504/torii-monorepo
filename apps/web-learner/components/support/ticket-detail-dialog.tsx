"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  User,
  Calendar,
  XCircle,
  MessageSquare,
  Tag,
  Info,
  Building,
  Coins,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { TicketResponseDTO, TicketStatus, TicketType } from "@workspace/schemas";
import { formatDateTime } from "@/utils/format-utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { useCancelTicket } from "@/lib/api/services/ticket-api";
import { toast } from "sonner";
import { Spinner } from "@workspace/ui/components/spinner";
import { Separator } from "@workspace/ui/components/separator";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item";
import { cn } from "@workspace/ui/lib/utils";

interface TicketDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: TicketResponseDTO | null;
  isLoading: boolean;
}

const statusConfig: Record<
  TicketStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  [TicketStatus.PENDING]: {
    label: "Đang chờ",
    icon: AlertCircle,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  [TicketStatus.PROCESSING]: {
    label: "Đang xử lý",
    icon: Clock,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  [TicketStatus.RESOLVED]: {
    label: "Đã giải quyết",
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-700 border-green-500/20",
  },
  [TicketStatus.CANCELLED]: {
    label: "Đã hủy",
    icon: XCircle,
    className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  },
};

const typeLabelMap: Record<TicketType, string> = {
  [TicketType.REFUND]: "Hoàn tiền",
  [TicketType.SUPPORT]: "Hỗ trợ",
  [TicketType.ERROR_REPORT]: "Báo lỗi",
};

export function TicketDetailDialog({
  open,
  onOpenChange,
  ticket,
  isLoading,
}: TicketDetailDialogProps) {
  const [isConfirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const cancelTicket = useCancelTicket();

  const handleConfirmCancel = async () => {
    if (!ticket) return;
    try {
      await cancelTicket.mutateAsync(ticket.id);
      toast.success("Yêu cầu đã được hủy.");
      setConfirmCancelOpen(false);
      onOpenChange(false);
    } catch {
      toast.error("Hủy yêu cầu thất bại.");
    }
  };

  const renderMetadata = () => {
    if (!ticket?.metadata || Object.keys(ticket.metadata).length === 0)
      return null;
    return (
      <div className="space-y-2">
        <h4 className="text-xs uppercase text-muted-foreground font-semibold">
          Thông tin bổ sung
        </h4>
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-xs font-mono">
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(ticket.metadata, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[560px] h-full max-h-[90vh] p-0 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <Spinner className="w-8 h-8 text-primary" />
              <p className="text-sm text-muted-foreground mt-2">
                Đang tải thông tin...
              </p>
            </div>
          ) : ticket ? (
            <>
              <DialogHeader className="p-6 border-b shrink-0">
                <DialogTitle>
                  Chi tiết yêu cầu #{ticket.id.slice(0, 8).toUpperCase()}
                </DialogTitle>
                <DialogDescription>
                  Xem lại thông tin chi tiết yêu cầu hỗ trợ của bạn.
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-6 p-6">
                  {(() => {
                    const status = ticket.status as TicketStatus;
                    const cfg =
                      statusConfig[status] || statusConfig[TicketStatus.PENDING];
                    const Icon = cfg.icon;
                    return (
                      <Item variant="outline">
                        <ItemMedia>
                          <Icon className="size-4" />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>Trạng thái</ItemTitle>
                          <div className="mt-0.5 w-fit">
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1.5 px-2 py-0.5 font-semibold",
                                cfg.className,
                              )}
                            >
                              <Icon className="w-3 h-3 shrink-0" />
                              <span>{cfg.label}</span>
                            </Badge>
                          </div>
                        </ItemContent>
                      </Item>
                    );
                  })()}

                  <Item variant="outline">
                    <ItemMedia>
                      <User className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Người gửi</ItemTitle>
                      <ItemDescription>
                        {ticket.user?.displayName || "—"} (
                        {ticket.user?.email || "—"})
                      </ItemDescription>
                    </ItemContent>
                  </Item>

                  <Item variant="outline">
                    <ItemMedia>
                      <Tag className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Phân loại</ItemTitle>
                      <ItemDescription>
                        {typeLabelMap[ticket.type as TicketType] ||
                          ticket.type}
                      </ItemDescription>
                    </ItemContent>
                  </Item>

                  <Item variant="outline">
                    <ItemMedia>
                      <Info className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Tiêu đề</ItemTitle>
                      <ItemDescription>{ticket.subject}</ItemDescription>
                    </ItemContent>
                  </Item>

                  <Item variant="outline">
                    <ItemMedia>
                      <MessageSquare className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Nội dung</ItemTitle>
                      <ItemDescription className="whitespace-pre-wrap">
                        {ticket.description}
                      </ItemDescription>
                    </ItemContent>
                  </Item>

                  {ticket.refundAmount != null && ticket.refundAmount > 0 && (
                    <Item variant="outline">
                      <ItemMedia>
                        <Coins className="size-4 text-primary" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>Số tiền hoàn trả</ItemTitle>
                        <ItemDescription>
                          {ticket.refundAmount} Xu
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  )}

                  {ticket.response && (
                    <Item variant="outline">
                      <ItemMedia>
                        <Building className="size-4" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>Phản hồi từ hỗ trợ</ItemTitle>
                        <ItemDescription className="whitespace-pre-wrap">
                          {ticket.response}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  )}

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Item variant="outline">
                      <ItemMedia>
                        <Calendar className="size-4" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>Ngày tạo</ItemTitle>
                        <ItemDescription>
                          {formatDateTime(ticket.createdAt)}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                    <Item variant="outline">
                      <ItemMedia>
                        <Calendar className="size-4" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>Cập nhật lần cuối</ItemTitle>
                        <ItemDescription>
                          {formatDateTime(ticket.updatedAt)}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </div>

                  {renderMetadata()}
                </div>
              </ScrollArea>

              <DialogFooter className="m-0 p-6 border-t flex-row justify-between items-center w-full shrink-0 bg-muted/20">
                {ticket.status === TicketStatus.PENDING ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 -ml-2"
                    onClick={() => setConfirmCancelOpen(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Hủy yêu cầu
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <DialogTitle>Không tìm thấy thông tin</DialogTitle>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => onOpenChange(false)}
              >
                Quay lại
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể được hoàn tác. Yêu cầu hỗ trợ của bạn sẽ
              được đánh dấu là đã hủy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelTicket.isPending}>
              Quay lại
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelTicket.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelTicket.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận hủy"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
