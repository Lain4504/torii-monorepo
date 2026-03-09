/**
 * Shared metadata definitions for Academy module
 * Used by web-admin for editor presets and web-learner for display labels
 */

export interface MetadataDefinition {
    key: string;
    label: string;
    description?: string;
    defaultValue?: string;
}

// 1. Course Offering Metadata
export const COURSE_OFFERING_METADATA: MetadataDefinition[] = [
    { key: "sale_price", label: "Giá khuyến mãi", description: "Giá sau giảm (để 0 nếu miễn phí)", defaultValue: "0" },
    { key: "discount_percentage", label: "Giảm giá (%)", description: "Hiển thị badge giảm giá", defaultValue: "0" },
    { key: "course_badge", label: "Badge khóa học", description: "Ví dụ: Hot, New, Best Seller", defaultValue: "Hot" },
    { key: "support_contact", label: "Thông tin hỗ trợ", description: "Zalo, Hotline hoặc Facebook link", defaultValue: "zalo.me/..." },
    { key: "video_demo_url", label: "Link Video Demo", description: "URL YouTube/Vimeo giới thiệu khóa học" },
    { key: "certificate_available", label: "Có chứng chỉ", description: "Hiển thị icon chứng chỉ (true/false)", defaultValue: "true" },
];

// 2. Class (VOD/Live) Metadata
export const CLASS_METADATA: MetadataDefinition[] = [
    { key: "requirement", label: "Yêu cầu đầu vào", description: "Kiến thức cần có trước khi học" },
    { key: "hours_count", label: "Tổng số giờ học", description: "Ví dụ: 40 giờ", defaultValue: "20" },
    { key: "lessons_count", label: "Tổng số bài học", description: "Tự động hiển thị nếu để trống", defaultValue: "50" },
    { key: "allow_trial", label: "Cho phép học thử", description: "true hoặc false", defaultValue: "false" },
    { key: "trial_sessions_count", label: "Số buổi học thử", description: "Ví dụ: 2 buổi", defaultValue: "2" },
    // Live specific
    { key: "zoom_link", label: "Link Zoom học trực tuyến", description: "Link phòng học chính" },
    { key: "zoom_password", label: "Mật khẩu Zoom", description: "Nếu có" },
    { key: "messenger_group", label: "Nhóm hỗ trợ", description: "Link Zalo/Telegram/Discord cho lớp" },
];

// 3. Question Pool Metadata
export const QUESTION_POOL_METADATA: MetadataDefinition[] = [
    { key: "tags", label: "Từ khóa (Tags)", description: "Dùng để phân loại nâng cao", defaultValue: "jlpt,exam" },
    { key: "difficulty", label: "Mức độ ước tính", description: "Easy, Medium, Hard", defaultValue: "Medium" },
    { key: "estimated_time", label: "Thời gian làm bài", description: "Ví dụ: 15 mins", defaultValue: "15 mins" },
    { key: "source", label: "Nguồn gốc bộ đề", description: "Tài liệu tham khảo", defaultValue: "JLPT Official" },
];

// 4. Course Profile Metadata
export const COURSE_PROFILE_METADATA: MetadataDefinition[] = [
    { key: "duration_label", label: "Label Thời lượng", description: "Hiển thị trên card (vd: 6 tháng)", defaultValue: "20 giờ" },
    { key: "total_lessons", label: "Tổng số bài học", defaultValue: "50" },
    { key: "target_audience", label: "Đối tượng mục tiêu", defaultValue: "Người mới bắt đầu" },
    { key: "prerequisites", label: "Điều kiện tiên quyết", defaultValue: "Không có" },
];

/**
 * Utility to get label from key across all definitions
 */
export const getMetadataLabel = (key: string): string => {
    const all = [
        ...COURSE_OFFERING_METADATA,
        ...CLASS_METADATA,
        ...QUESTION_POOL_METADATA,
        ...COURSE_PROFILE_METADATA
    ];
    return all.find(m => m.key === key)?.label || key;
};
