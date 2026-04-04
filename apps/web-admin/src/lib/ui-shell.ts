import { cn } from "@workspace/ui/lib/utils"

/** Panel / card biểu đồ — nền phẳng, không gradient, không hover động */
export const elevatedPanelClass = cn(
    "overflow-hidden rounded-xl border bg-card shadow-sm",
    "py-0 gap-0",
)

export const elevatedPanelContentClass = "pb-5 pt-4"

/** Bọc bảng */
export const dataTableShellClass = cn("overflow-hidden rounded-xl border bg-card shadow-sm")

/**
 * Toolbar trang danh sách (mobile-first, theo mẫu blog):
 * - Hàng 1: ô tìm kiếm full width
 * - Hàng 2+: select / nút xếp chồng dọc trên mobile, hàng ngang từ md
 */
export const listPageToolbarRootClass = cn("flex w-full flex-col gap-4")
export const listPageSearchWrapClass = cn("relative w-full min-w-0")
export const listPageFiltersRowClass = cn(
  "flex w-full flex-col gap-3 md:flex-row md:flex-wrap md:items-center",
)

/** Hàng tiêu đề bảng */
export const dataTableHeaderClass = "bg-muted/50"

const panelHeaderBase =
    "space-y-1 border-b border-border bg-muted/40 pt-5 pb-4 rounded-t-xl"

export const elevatedCardHeaderPrimary = panelHeaderBase
export const elevatedCardHeaderInfo = panelHeaderBase
export const elevatedCardHeaderSuccess = panelHeaderBase
export const elevatedCardHeaderFinance = panelHeaderBase
export const elevatedCardHeaderOps = panelHeaderBase

/** Empty state trong chart */
export const emptyStateBoxClass =
    "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 py-12 text-xs text-muted-foreground"
