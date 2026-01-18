import type { OrderSuccessEmailData } from '../../../infrastructure/events/email.event';

/**
 * Generate HTML for order success email with course link
 */
export function generateOrderSuccessEmailHtml(data: OrderSuccessEmailData): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanh toán thành công</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0; font-size: 32px;">🎉 Thanh toán thành công!</h1>
        </div>

        <!-- Greeting -->
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Xin chào <strong>${data.displayName}</strong>,
        </p>

        <!-- Success Message -->
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Bạn đã thanh toán thành công khóa học: 
            <strong style="color: #2563eb;">${data.courseName}</strong>
        </p>

        <!-- Order Details -->
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Số tiền:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right; font-size: 16px;">
                        ${data.amount.toLocaleString('vi-VN')} ${data.currency}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Mã đơn hàng:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right; font-size: 14px;">
                        ${data.orderId}
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
