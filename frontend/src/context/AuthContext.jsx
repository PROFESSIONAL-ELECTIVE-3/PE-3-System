import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "eduforecaster_session";

const getStoredSession = () => {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const value = storage.getItem(STORAGE_KEY);
      if (value) return { session: JSON.parse(value), storage };
    } catch {
      storage.removeItem(STORAGE_KEY);
    }
  }
  return null;
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(
    () => getStoredSession()?.session ?? null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    const stored = getStoredSession();
    if (!stored?.session?.token) {
      setIsLoading(false);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${stored.session.token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Session expired");
        const { user } = await response.json();
        const updated = { ...stored.session, user };
        stored.storage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setSession(updated);
      })
      .catch(logout)
      .finally(() => setIsLoading(false));
  }, [logout]);

  const login = useCallback((data, remember = false) => {
    const nextSession = { token: data.token, user: data.user };
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    (remember ? localStorage : sessionStorage).setItem(
      STORAGE_KEY,
      JSON.stringify(nextSession),
    );
    setSession(nextSession);
  }, []);

  const apiFetch = useCallback(
    (url, options = {}) => {
      const headers = new Headers(options.headers);
      if (session?.token)
        headers.set("Authorization", `Bearer ${session.token}`);
      return fetch(url, { ...options, headers }).then((response) => {
        // An invalid/expired token cannot access protected data. Clear it so
        // the protected-route flow returns the user to sign in cleanly.
        if (response.status === 401) logout();
        return response;
      });
    },
    [logout, session?.token],
  );

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
      apiFetch,
    }),
    [apiFetch, isLoading, login, logout, session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
