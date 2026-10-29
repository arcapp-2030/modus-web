import Cookies from 'js-cookie';

const TOKEN_KEY = 'modus_auth_token';

export const authStorage = {
  getToken: (): string | undefined => {
    if (typeof window === 'undefined') return undefined;
    return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || undefined;
  },

  setToken: (token: string) => {
    // Salva em cookie (válido por 7 dias) e localStorage para redundância no PWA
    Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken: () => {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};