// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { authenticator } from "otplib";
import { useAuth } from "@/hooks/useAuth";
import { getTwoFactor, setTwoFactor } from "@/local/twoFactor";import { isTauri } from "@/lib/runtime/isTauri";

export function useTwoFactorAuth() {
  const [secret, setSecret] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useAuth();

  async function refresh() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { enabled, secret } = await getTwoFactor(id);
      setEnabled(enabled);
      setSecret(secret);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }

  function startSetup() {
    const newSecret = authenticator.generateSecret();
    setSecret(newSecret);
    setEnabled(false);
    return newSecret;
  }

  async function finalizeSetup() {
    if (!secret || !id) return;
    setLoading(true);
    setError(null);
    try {
      await setTwoFactor(id, { secret, enabled: true });
      setEnabled(true);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }

  async function disable() {
    if (!id) return;
    setLoading(true);
    try {
      await setTwoFactor(id, { enabled: false, secret: null });
      setSecret(null);
      setEnabled(false);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }

  function verify(code) {
    if (!secret) return false;
    try {
      return authenticator.check(code, secret);
    } catch {
      return false;
    }
  }

  return {
    secret,
    enabled,
    loading,
    error,
    refresh,
    startSetup,
    finalizeSetup,
    disable,
    verify
  };
}