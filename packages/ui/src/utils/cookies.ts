/**
 * Cookie utility functions
 */

/**
 * Set a cookie
 */
export function setCookie(name: string, value: string, days?: number): void {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`;
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i];
    if (c) {
      let trimmed = c;
      while (trimmed.charAt(0) === ' ') trimmed = trimmed.substring(1, trimmed.length);
      if (trimmed.indexOf(nameEQ) === 0) return trimmed.substring(nameEQ.length, trimmed.length);
    }
  }
  return null;
}

/**
 * Remove a cookie
 */
export function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

