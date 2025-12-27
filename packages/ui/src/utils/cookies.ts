/**
 * Cookie utility functions with security best practices
 */

/**
 
 * @param name - Cookie name
 * @param value - Cookie value (will be encoded)
 * @param days - Expiration in days (optional)
 * @param secure - Use Secure flag (HTTPS only). Default: true in production, false in development
 */
export function setCookie(
  name: string, 
  value: string, 
  days?: number,
  secure: boolean = typeof window !== 'undefined' && window.location.protocol === 'https:'
): void {
  // Encode value to handle special characters safely
  const encodedValue = encodeURIComponent(value || '');
  
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  
  const secureFlag = secure ? '; Secure' : '';
  document.cookie = `${name}=${encodedValue}${expires}; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * Get a cookie by name
 * @param name - Cookie name to retrieve
 * @returns Cookie value (decoded) or null if not found
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i];
    if (c) {
      let trimmed = c.trim();
      if (trimmed.indexOf(nameEQ) === 0) {
        const value = trimmed.substring(nameEQ.length);
        // Decode the value (was encoded when set)
        try {
          return decodeURIComponent(value);
        } catch {
          // If decode fails, return original value (backward compatibility)
          return value;
        }
      }
    }
  }
  return null;
}

/**
 * Remove a cookie (set expiration to past date)
 * @param name - Cookie name to remove
 * @param secure - Match Secure flag used when setting. Default: true in production
 */
export function removeCookie(
  name: string,
  secure: boolean = typeof window !== 'undefined' && window.location.protocol === 'https:'
): void {
  // Set expiration to past date to delete cookie
  // Include SameSite flag to match when cookie was set
  const secureFlag = secure ? '; Secure' : '';
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${secureFlag}`;
}


