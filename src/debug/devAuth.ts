import { registerLocal, loginLocal } from "@/auth/localAccount";import { isTauri } from "@/lib/runtime/isTauri";
declare global {interface Window {
    mamaRegister?: (email: string, password: string, role?: string) => Promise<any>;
    mamaLogin?: (email: string, password: string) => Promise<any>;
  }}
(async () => {
  window.mamaRegister = async (email, password, role) => await registerLocal(email, password, role);
  window.mamaLogin = async (email, password) => await loginLocal(email, password);
})();