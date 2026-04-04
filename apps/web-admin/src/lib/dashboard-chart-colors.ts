/**
 * Màu biểu đồ dashboard — theo nghĩa nghiệp vụ (không xoay palette chart cho trạng thái đơn hàng).
 */

function normKey(s: string): string {
  return s.trim().toUpperCase().replace(/\s+/g, '_')
}

/** Pie "Đơn hàng theo trạng thái" — `name` từ Prisma groupBy (OrderStatus) */
export function orderStatusPieFill(statusName: string): string {
  const k = normKey(statusName)

  if (k === 'PAID') return 'var(--success)'
  if (k === 'PENDING' || k === 'PROCESSING') return 'var(--warning)'
  if (k === 'CANCELLED' || k === 'CANCELED' || k.includes('CANCEL')) return 'var(--muted-foreground)'
  if (k === 'FAILED') return 'var(--destructive)'
  if (k === 'REFUNDED') return 'var(--info)'

  return 'var(--chart-2)'
}

/** Pie "Duyệt theo loại" — nhãn cố định từ API */
export function pendingApprovalTypePieFill(typeName: string): string {
  const k = normKey(typeName)
  if (k.includes('COURSE') && k.includes('PROFILE')) return 'var(--primary)'
  if (k.includes('COHORT')) return 'var(--info)'
  if (k.includes('VOD')) return 'var(--success)'
  return 'var(--chart-3)'
}

/** Bar "Pipeline theo status" — CourseProfile / Cohort / Vod status (Prisma enum) */
export function academyPipelineBarFill(statusName: string): string {
  const k = normKey(statusName)

  if (k === 'PENDING_APPROVAL') return 'var(--warning)'
  if (k === 'DRAFT') return 'var(--muted-foreground)'
  if (k === 'PUBLISHED') return 'var(--success)'
  if (k === 'ARCHIVED') return 'var(--muted-foreground)'
  if (k === 'OPENING') return 'var(--primary)'
  if (k === 'COMPLETED') return 'var(--success)'
  if (k === 'IN_PROGRESS') return 'var(--info)'

  return 'var(--chart-2)'
}

/** Cột doanh thu theo level — một metric, một màu brand */
export const revenueBarFill = 'var(--primary)'
