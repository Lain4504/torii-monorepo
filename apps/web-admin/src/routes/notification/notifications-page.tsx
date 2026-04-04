import { useMemo, useState } from "react";
import { Bell, Check, Sparkles } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/lib/api/services/notifications.ts";
import type { NotificationResponseDTO } from "@workspace/schemas";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
}

function mapNotificationToUI(notification: NotificationResponseDTO): Notification {
  const createdAt = new Date(notification.createdAt);
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: formatDistanceToNow(createdAt, { addSuffix: true }),
    date: format(createdAt, "dd/MM/yyyy"),
    read: notification.isRead,
  };
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);

  const { data: notificationsData, isLoading } = useNotifications({
    limit: 50,
    page,
  });
  const { data: unreadCountData } = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = useMemo(() => {
    if (!notificationsData?.data) return [];
    return notificationsData.data.map(mapNotificationToUI);
  }, [notificationsData]);

  const unreadCount = unreadCountData?.count ?? 0;

  const handleItemClick = (n: Notification) => {
    if (!n.read) {
      markAsReadMutation.mutate(n.id);
    }
  };

  const totalPages = notificationsData?.totalPages ?? 1;

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl space-y-6 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500",
      )}
    >
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Thông báo</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Không có thông báo chưa đọc"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={markAllAsReadMutation.isPending || unreadCount === 0}
          className="shrink-0"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          {markAllAsReadMutation.isPending ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
        </Button>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 animate-pulse text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Đang tải thông báo...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <Card
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => handleItemClick(n)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(n);
                }
              }}
              className={cn(
                "w-full rounded-xl border p-4 text-left shadow-none transition-colors",
                "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !n.read ? "border-border bg-muted/30" : "border-border/60 bg-card opacity-90",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h2
                  className={cn(
                    "text-sm font-medium",
                    !n.read ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {n.title}
                </h2>
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                )}
              </div>
              {n.message ? (
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.message}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground/70">
                {n.date} · {n.time}
              </p>
            </Card>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/5 py-16 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <h3 className="text-sm font-medium text-foreground">Chưa có thông báo</h3>
            <p className="mt-1 text-xs text-muted-foreground">Các cập nhật sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>

      {notificationsData && totalPages > 1 ? (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Trang <span className="font-semibold text-foreground">{page}</span> / {totalPages}
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={cn(
                    "h-9 cursor-pointer rounded-lg px-3 text-xs",
                    page === 1 ? "pointer-events-none opacity-40" : "",
                  )}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={cn(
                    "h-9 cursor-pointer rounded-lg px-3 text-xs",
                    page === totalPages ? "pointer-events-none opacity-40" : "",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
