import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("sass_user") || "null"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("sass_token")));

  useEffect(() => {
    if (!localStorage.getItem("sass_token")) return;
    api("/auth/me")
      .then(({ user: me }) => {
        setUser(me);
        localStorage.setItem("sass_user", JSON.stringify(me));
      })
      .catch(() => {
        localStorage.removeItem("sass_token");
        localStorage.removeItem("sass_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    localStorage.setItem("sass_token", data.token);
    localStorage.setItem("sass_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api("/auth/register", { method: "POST", body: payload });
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("sass_token");
    localStorage.removeItem("sass_user");
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const data = await api("/auth/me", { method: "PATCH", body: payload });
    localStorage.setItem("sass_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, updateProfile }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
