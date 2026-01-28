import type { EnrollmentSuccessEmailData } from '../../../infrastructure/events/email.event';

/**
 * Generate HTML for enrollment success email with course link (for free courses)
 */
export function generateEnrollmentSuccessEmailHtml(data: EnrollmentSuccessEmailData): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tham gia khóa học thành công</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0; font-size: 32px;">🎉 Tham gia thành công!</h1>
        </div>

        <!-- Greeting -->
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Xin chào <strong>${data.displayName}</strong>,
        </p>

        <!-- Gift Message (if applicable) -->
        ${data.isGift ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; color: #92400e; margin: 0; font-weight: bold;">
                Bạn nhận được một món quà từ ${data.senderName}! 🎁
            </p>
            ${data.giftMessage ? `
            <p style="font-size: 14px; color: #b45309; margin-top: 10px; font-style: italic;">
                "${data.giftMessage}"
            </p>
            ` : ''}
        </div>
        ` : ''}

        <!-- Success Message -->
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Bạn đã ghi danh thành công vào khóa học: 
            <strong style="color: #2563eb;">${data.courseName}</strong>
        </p>

        <!-- Enrollment Details Card -->
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Khóa học:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right; font-size: 14px;">
                        ${data.courseName}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trạng thái:</td>
                    <td style="padding: 8px 0; color: #10b981; font-weight: bold; text-align: right; font-size: 14px;">
                        Đã kích hoạt ✨
                    </td>
                </tr>
            </table>
        </div>

        <!-- Call to Action Button -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.courseUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                Bắt đầu học ngay 🚀
            </a>
        </div>

        <!-- Additional Info -->
        <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
            Khóa học của bạn đã được kích hoạt. Click vào nút trên để bắt đầu học ngay!
        </p>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Chúc bạn học tập hiệu quả! 📚
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                <strong>Torii Nihongo Team</strong>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}
