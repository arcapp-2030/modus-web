import Cookies from 'js-cookie';

const TOKEN_KEY = 'modus_auth_token';

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )modus_auth_token=([^;]+)'));
    return match ? match[2] : null;
  },
  setToken: (token: string) => {
    if (typeof window === 'undefined') return;
    const isHttps = window.location.protocol === 'https:';
    document.cookie = `modus_auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${isHttps ? '; Secure' : ''}`;
  },
  clearToken: () => {
    if (typeof window === 'undefined') return;
    document.cookie = 'modus_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'modus_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
    localStorage.removeItem('modus_user_name');
    sessionStorage.clear();
  },
};