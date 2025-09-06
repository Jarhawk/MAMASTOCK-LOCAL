import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import bcrypt from 'bcryptjs';
import users from '@/db/users.json';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('session');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email, password) => {
    const found = users.find(u => u.email === email && u.actif);
    if (!found) throw new Error('Utilisateur introuvable');
    const ok = await bcrypt.compare(password, found.mot_de_passe_hash);
    if (!ok) throw new Error('Mot de passe incorrect');
    const sess = {
      email: found.email,
      role: found.role || 'admin',
      must_change_password: !!found.must_change_password,
    };
    setUser(sess);
    localStorage.setItem('session', JSON.stringify(sess));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('session');
  };

  const roleRights = {
    admin: { factures: { peut_modifier: true } },
    manager: { factures: { peut_modifier: true } },
    user: { factures: { peut_modifier: false } },
  };

  const hasAccess = useMemo(() => {
    return (module, perm) => {
      if (!user) return false;
      const rights = roleRights[user.role] || {};
      if (!module || !perm) return true;
      return !!rights[module]?.[perm];
    };
  }, [user]);

  const value = useMemo(
    () => ({ user, login, logout, hasAccess }),
    [user, hasAccess]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export default AuthProvider;
