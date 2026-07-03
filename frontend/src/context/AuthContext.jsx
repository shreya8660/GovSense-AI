import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'govsense_token';
const ROLE_KEY = 'govsense_role';
const USER_KEY = 'govsense_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setRole(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedRole = localStorage.getItem(ROLE_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (token && storedRole && storedUser) {
      setRole(storedRole);
      setUser(JSON.parse(storedUser));
      // Refresh the profile in the background to catch server-side changes
      authService
        .getProfile()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  const persistSession = (token, sessionRole, sessionUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, sessionRole);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setRole(sessionRole);
    setUser(sessionUser);
  };

  const login = async (email, password, selectedRole) => {
    const res = await authService.login({ email, password, role: selectedRole });
    persistSession(res.data.token, res.data.role, res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    persistSession(res.data.token, res.data.role, res.data.user);
    return res.data;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, login, register, logout, updateUser, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
