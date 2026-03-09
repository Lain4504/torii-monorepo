/**
 * Cấu trúc settings trong ClassAssessment kind=QUIZ
 */
export interface ClassQuizSettings {
    examId?: string;
    [key: string]: unknown;
}

/**
 * Trích xuất examId từ settings JSON (hỗ trợ cả dạng cũ {exam: {id: ...}} và mới {examId: ...})
 */
export function extractAssessmentExamId(settings: unknown): string | undefined {
    if (!settings || typeof settings !== "object") return undefined;
    const map = settings as Record<string, unknown>;

    if (typeof map.examId === "string" && map.examId.trim()) {
        return map.examId.trim();
    }

    if (map.exam && typeof map.exam === "object") {
        const nestedId = (map.exam as Record<string, unknown>).id;
        if (typeof nestedId === "string" && nestedId.trim()) {
            return nestedId.trim();
        }
    }

    return undefined;
}

/**
 * Chuẩn hóa settings trước khi gửi lên server
 */
export function normalizeAssessmentSettings(settings: unknown, examId?: string): ClassQuizSettings {
    const current = (settings as Record<string, unknown>) || {};
    return {
        ...current,
        examId: examId?.trim() || undefined,
    };
}

/**
 * Kiểm tra xem có cần ẩn/chặn deadline hay không (Dành cho VOD Quiz)
 */
export function shouldDisableDeadline(kind: string, classMode?: string): boolean {
    return kind.toUpperCase() === "QUIZ" && classMode === "VOD";
}
