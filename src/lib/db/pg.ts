import Database from "@tauri-apps/plugin-sql";

import { getPostgresUrl } from "@/lib/appConfig";
import { log } from "@/tauriLog";

let dbPromise: Promise<any> | null = null;

type NormalizeResult = {
  url: string;
  removedChannelBinding: boolean;
  hasSslRequire: boolean;
};

function maskDbUrl(raw: string): string {
  try {
    const parsed = new URL(raw);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return raw;
  }
}

export function normalizePgUrl(input: string): NormalizeResult {
  let url = input.trim();
  let removedChannelBinding = false;
  let hasSslRequire = false;

  url = url.replace(/^postgresql:\/\//i, "postgres://");

  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;
    for (const [key, value] of params.entries()) {
      const lowerKey = key.toLowerCase();
      const lowerValue = (value ?? "").toLowerCase();
      if (lowerKey === "channel_binding" && lowerValue === "require") {
        params.delete(key);
        removedChannelBinding = true;
      }
      if (lowerKey === "sslmode" && lowerValue === "require") {
        hasSslRequire = true;
      }
    }
    if (!hasSslRequire) {
      const sslMode = params.get("sslmode");
      if ((sslMode ?? "").toLowerCase() === "require") {
        hasSslRequire = true;
      }
    }
    const serialized = params.toString();
    parsed.search = serialized ? `?${serialized}` : "";
    url = parsed.toString();
  } catch {
    const withoutCb = url.replace(/([?&])channel_binding=require(&|$)/i, (full, prefix, suffix) => {
      removedChannelBinding = true;
      if (prefix === "?" && suffix) return "?";
      if (prefix === "&" && suffix) return "&";
      return "";
    });
    url = withoutCb
      .replace(/\?&/, "?")
      .replace(/&&+/, "&")
      .replace(/&$/, "")
      .replace(/\?$/, "");
    const queryIndex = url.indexOf("?");
    if (queryIndex !== -1) {
      const query = url.slice(queryIndex + 1);
      hasSslRequire = /sslmode=require/i.test(query);
    }
  }

  if (!hasSslRequire) {
    try {
      const parsed = new URL(url);
      const mode = parsed.searchParams.get("sslmode");
      if ((mode ?? "").toLowerCase() === "require") {
        hasSslRequire = true;
      }
    } catch {
      // ignore
    }
  }

  return { url, removedChannelBinding, hasSslRequire };
}

function describePgError(error: unknown, url: string) {
  const maskedUrl = maskDbUrl(url);
  const raw =
    typeof (error as any)?.message === "string"
      ? (error as any).message
      : String(error ?? "Erreur inconnue");
  let user = "Impossible de se connecter à la base de données.";
  if (/timeout/i.test(raw)) {
    user += " Délai dépassé — vérifiez votre connexion Internet.";
  } else if (/password|authentication|auth/i.test(raw)) {
    user += " Authentification refusée — vérifiez l’identifiant et le mot de passe.";
  } else if (/ssl|certificate/i.test(raw)) {
    user += " Erreur SSL — assurez-vous que le paramètre sslmode=require est présent.";
  } else if (/host|dns|resolve/i.test(raw)) {
    user += " Nom d’hôte introuvable — vérifiez l’URL Neon.";
  } else {
    user += " Vérifiez que l’URL contient sslmode=require.";
  }
  const userMessage = `${user} (${raw})`;
  const logMessage = `${raw} [url=${maskedUrl}]`;
  return { userMessage, logMessage };
}

export async function getPg() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const rawUrl = await getPostgresUrl();
      if (!rawUrl) {
        throw new Error(
          "DB URL manquante. Ouvrez Paramètres > Base de données."
        );
      }
      const normalized = normalizePgUrl(rawUrl);
      const masked = maskDbUrl(normalized.url);
      if (normalized.removedChannelBinding) {
        log.warn(
          `[db] Paramètre channel_binding=require ignoré pour ${masked}.`
        );
      }
      if (!normalized.hasSslRequire) {
        log.warn(
          `[db] sslmode=require absent de la chaîne de connexion (${masked}).`
        );
      }
      try {
        const db = await Database.load(normalized.url);
        log.info(`[db] Connexion PostgreSQL initialisée (${masked}).`);
        return db;
      } catch (err) {
        dbPromise = null;
        const { userMessage, logMessage } = describePgError(err, normalized.url);
        log.error(`[db] Connexion PostgreSQL échouée: ${logMessage}`);
        throw new Error(userMessage);
      }
    })();
  }
  return dbPromise;
}
