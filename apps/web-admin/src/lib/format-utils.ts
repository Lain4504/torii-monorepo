import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function formatCurrency(amount: number | string | undefined | null): string {
    if (amount === undefined || amount === null) return "0 ₫"

    const value = typeof amount === "string" ? parseFloat(amount) : amount

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value)
}

export function formatDateTime(date: Date | string | number | undefined | null, formatStr: string = "HH:mm dd/MM/yyyy"): string {
    if (!date) return "--"
    try {
        const d = new Date(date)
        // Convert to Vietnam time (UTC+7) representation
        const vnDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))
        return format(vnDate, formatStr, { locale: vi })
    } catch (e) {
        return "--"
    }
}

export function formatDate(date: Date | string | number | undefined | null, formatStr: string = "dd/MM/yyyy"): string {
    if (!date) return "--"
    try {
        const d = new Date(date)
        // Convert to Vietnam time (UTC+7) representation
        const vnDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))
        return format(vnDate, formatStr, { locale: vi })
    } catch (e) {
        return "--"
    }
}
