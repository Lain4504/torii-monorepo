/**
 * Password Reset Email Template
 */
export const generatePasswordResetEmailHtml = (data: { resetUrl: string; displayName?: string }): string => {
    const { resetUrl, displayName } = data;

    return `
      <h2>Đặt lại mật khẩu</h2>
      <p>Xin chào ${displayName || 'bạn'},</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào link dưới đây:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
        Đặt lại mật khẩu
      </a>
    `;
};
