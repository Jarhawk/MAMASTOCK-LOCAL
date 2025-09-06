// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import bcrypt from 'bcryptjs';
import { utilisateur_find_by_email } from '@/lib/db';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mamastock.session');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (_) {
        /* ignore */
      }
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    const u = await utilisateur_find_by_email(email);
    if (!u || !u.actif) {
      setLoading(false);
      throw new Error('Identifiants invalides');
    }
    const ok = await bcrypt.compare(password, u.mot_de_passe_hash || '');
    setLoading(false);
    if (!ok) throw new Error('Identifiants invalides');
    const sess = { id: u.id, email: u.email, role: u.role };
    setUser(sess);
    localStorage.setItem('mamastock.session', JSON.stringify(sess));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('mamastock.session');
  }, []);

  const hasAccess = useCallback((module, right = 'peut_voir') => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (module === 'factures' && right === 'peut_modifier') {
      return user.role === 'manager';
    }
    return true;
  }, [user]);

  const value = useMemo(() => ({
    session: user ? { user } : null,
    user,
    userData: user,
    role: user?.role,
    loading,
    login,
    logout,
    hasAccess,
    isAuthenticated: !!user,
  }), [user, loading, login, logout, hasAccess]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export default AuthProvider;
export { AuthProvider };
