import { registerLocal, loginLocal } from "@/auth/sqlAuth";

declare global {
  interface Window {
    mamaRegister?: (email: string, password: string) => Promise<any>;
    mamaLogin?: (email: string, password: string) => Promise<any>;
  }
}

(() => {
  window.mamaRegister = async (email, password) => {
    const u = await registerLocal(email, password);
    console.info("[mamaRegister] OK:", u);
    return u;
  };
  window.mamaLogin = async (email, password) => {
    const u = await loginLocal(email, password);
    console.info("[mamaLogin] OK:", u);
    return u;
  };
})();
