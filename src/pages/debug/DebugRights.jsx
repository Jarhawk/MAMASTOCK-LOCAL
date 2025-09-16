import React from 'react';
import { useAuth } from '@/context/AuthContext';import { isTauri } from "@/lib/tauriEnv";
export default function DebugRights() {
  const { userData } = useAuth();
  const rights = userData?.access_rights || {};
  return <pre style={{ padding: 16, background: '#111', color: '#0f0', overflow: 'auto' }}>{JSON.stringify(rights, null, 2)}</pre>;
}