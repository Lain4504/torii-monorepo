/**
 * OTP Email Template
 */
export const generateOtpEmailHtml = (data: { otp: string; displayName?: string }): string => {
    const { otp, displayName } = data;

    return `
      <h2>Mã OTP của bạn</h2>
      <p>Xin chào ${displayName || 'bạn'},</p>
      <p>Mã OTP của bạn là:</p>
      <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>Mã này có hiệu lực trong 5 phút.</p>
    `;
};
