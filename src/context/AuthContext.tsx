/**
 * CareConnect AI — Auth Context
 *
 * Place this file at: src/context/AuthContext.tsx
 *
 * Wraps the app in <AuthProvider> in src/routes/__root.tsx (see instructions).
 * Provides useAuth() hook everywhere.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  authApi,
  getToken,
  getUser,
  setToken,
  setUser,
  removeToken,
  removeUser,
  type User,
} from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // const [user, setUserState] = useState<User | null>(getUser);
  // const [token, setTokenState] = useState<string | null>(getToken);
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verify token on mount (in case it expired)
  // useEffect(() => {
  //   const storedToken = getToken();
  //   if (!storedToken) return;
  //   authApi
  //     .me()
  //     .then(({ user: u }) => {
  //       setUserState(u);
  //       setUser(u);
  //     })
  //     .catch(() => {
  //       removeToken();
  //       removeUser();
  //       setUserState(null);
  //       setTokenState(null);
  //     });
  // }, []);
  useEffect(() => {
  setUserState(getUser());
  setTokenState(getToken());
}, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: t, user: u } = await authApi.login(email, password);
      setToken(t);
      setUser(u);
      setTokenState(t);
      setUserState(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      setIsLoading(true);
      try {
        const { token: t, user: u } = await authApi.register(data);
        setToken(t);
        setUser(u);
        setTokenState(t);
        setUserState(u);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { user: u } = await authApi.me();
    setUser(u);
    setUserState(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}