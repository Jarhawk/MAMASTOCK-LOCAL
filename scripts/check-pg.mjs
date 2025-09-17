#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

import pg from 'pg';

const { Client } = pg;

function maskUrl(raw) {
  try {
    const parsed = new URL(raw);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return raw;
  }
}

function normalizeUrl(input) {
  let url = input.trim().replace(/^postgresql:\/\//i, 'postgres://');
  let removedChannelBinding = false;
  let requiresSsl = false;

  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;
    for (const [key, value] of params.entries()) {
      const lowerKey = key.toLowerCase();
      const lowerValue = (value ?? '').toLowerCase();
      if (lowerKey === 'channel_binding' && lowerValue === 'require') {
        params.delete(key);
        removedChannelBinding = true;
      }
    }
    const sslMode = (params.get('sslmode') ?? '').toLowerCase();
    if (sslMode === 'require') {
      requiresSsl = true;
    }
    const serialized = params.toString();
    parsed.search = serialized ? `?${serialized}` : '';
    url = parsed.toString();
  } catch {
    const replaced = url.replace(/([?&])channel_binding=require(&|$)/i, (full, prefix, suffix) => {
      removedChannelBinding = true;
      if (prefix === '?' && suffix) return '?';
      if (prefix === '&' && suffix) return '&';
      return '';
    });
    url = replaced
      .replace(/\?&/, '?')
      .replace(/&&+/, '&')
      .replace(/&$/, '')
      .replace(/\?$/, '');
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const query = url.slice(queryIndex + 1);
      requiresSsl = /sslmode=require/i.test(query);
    }
  }

  return { url, removedChannelBinding, requiresSsl };
}

function resolveConfigPath() {
  if (process.env.MAMASTOCK_CONFIG) {
    return process.env.MAMASTOCK_CONFIG;
  }
  if (process.platform === 'win32' && process.env.APPDATA) {
    return join(process.env.APPDATA, 'MamaStock', 'config.json');
  }
  const home = homedir();
  if (!home) return null;
  if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'MamaStock', 'config.json');
  }
  return join(home, '.config', 'MamaStock', 'config.json');
}

async function readConfigUrl(path) {
  if (!path || !existsSync(path)) return null;
  try {
    const raw = await readFile(path, 'utf8');
    const parsed = JSON.parse(raw);
    if (typeof parsed?.db?.url === 'string') return parsed.db.url;
    if (typeof parsed?.dbUrl === 'string') return parsed.dbUrl;
  } catch (err) {
    console.warn(`[check-pg] Impossible de lire ${path}:`, err?.message ?? err);
  }
  return null;
}

async function main() {
  const cliUrl = process.argv[2];
  let url = cliUrl || process.env.DATABASE_URL || process.env.VITE_DB_URL;
  if (!url) {
    const path = resolveConfigPath();
    const fromConfig = await readConfigUrl(path);
    if (fromConfig) {
      url = fromConfig;
      console.log(`[check-pg] URL lue depuis ${path}`);
    }
  }

  if (!url) {
    console.error('[check-pg] Aucune URL PostgreSQL fournie.');
    process.exit(1);
  }

  const normalized = normalizeUrl(url);
  const masked = maskUrl(normalized.url);

  if (normalized.removedChannelBinding) {
    console.warn('[check-pg] channel_binding=require a été ignoré.');
  }
  if (!normalized.requiresSsl) {
    console.warn('[check-pg] Attention: sslmode=require est recommandé.');
  }

  const clientConfig = { connectionString: normalized.url };
  if (normalized.requiresSsl) {
    clientConfig.ssl = { rejectUnauthorized: false };
  }

  console.log(`[check-pg] Connexion à ${masked}`);
  const client = new Client(clientConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT now() AS now');
    console.log('[check-pg] SELECT now() →', result.rows?.[0]?.now ?? 'ok');
    await client.end();
    console.log('[check-pg] Connexion réussie.');
  } catch (err) {
    console.error('[check-pg] Erreur de connexion:', err?.message ?? err);
    try {
      await client.end();
    } catch {}
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[check-pg] Échec:', err?.message ?? err);
  process.exit(1);
});
