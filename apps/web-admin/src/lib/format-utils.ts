import { format } from "date-fns"
import { vi } from "date-fns/locale"

export const generateSlug = (text: string | undefined): string => {
    if (!text) return '';

    return text.toString().toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ")
        .replace(/ + /g, " ")
        .trim()
        .replace(/ /g, "-")
        .replace(/--/g, "-");
};

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
}

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
