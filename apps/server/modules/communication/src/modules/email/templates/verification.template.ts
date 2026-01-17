/**
 * Verification Email Template
 */
export const generateVerificationEmailHtml = (data: { verificationUrl: string; displayName?: string }): string => {
    const { verificationUrl, displayName } = data;

    return `
      <h2>Xác thực tài khoản</h2>
      <p>Xin chào ${displayName || 'bạn'},</p>
      <p>Vui lòng click vào link dưới đây để xác thực tài khoản:</p>
      <a href="${verificationUrl}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
        Xác thực tài khoản
      </a>
    `;
};
