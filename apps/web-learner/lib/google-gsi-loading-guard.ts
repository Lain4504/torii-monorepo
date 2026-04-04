/**
 * Google Identity Services: nếu user đóng UI chọn tài khoản mà không hoàn tất,
 * callback credential không được gọi → UI loading bị kẹt. Dùng timer dự phòng + (khi có)
 * listener moment của prompt() để luôn tắt loading.
 */

export type GooglePromptMoment = {
    isNotDisplayed?: () => boolean
    isSkippedMoment?: () => boolean
    isDismissedMoment?: () => boolean
}

export function createGoogleGsiLoadingGuard(
    setLoading: (v: boolean) => void,
    safetyMs = 90_000
): { disarm: () => void } {
    const timer = window.setTimeout(() => setLoading(false), safetyMs)
    return {
        disarm: () => window.clearTimeout(timer),
    }
}

/** Gọi sau google.accounts.id.initialize; khi dùng prompt() thay vì nút ẩn. */
export function shouldEndFlowFromPromptMoment(notification: unknown): boolean {
    const n = notification as GooglePromptMoment
    return (
        n?.isDismissedMoment?.() === true ||
        n?.isSkippedMoment?.() === true ||
        n?.isNotDisplayed?.() === true
    )
}
