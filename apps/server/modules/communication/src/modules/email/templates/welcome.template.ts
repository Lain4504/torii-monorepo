/**
 * Welcome Email Template
 */
export const generateWelcomeEmailHtml = (data: { displayName?: string }): string => {
    const { displayName } = data;

    return `
      <h2>Chào mừng đến với Torii Nihongo!</h2>
      <p>Xin chào ${displayName || 'bạn'},</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Chúc bạn học tập hiệu quả!</p>
    `;
};
