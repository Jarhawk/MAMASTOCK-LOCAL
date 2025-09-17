import { getDb } from "./client";
import { migrations } from "./migrationsList";
import { getDataDir } from "@/lib/paths";
import { join } from "@tauri-apps/api/path";
import { isTauri } from "@/lib/tauriEnv";

/** Splitter SQL qui respecte CREATE TRIGGER ... BEGIN ... END; */
function splitSql(script: string): string[] {
  const lines = script.replace(/\r\n/g, "\n").split("\n");
  const chunks: string[] = [];
  let cur = "";
  let inTrigger = false;

  const pushIfNotEmpty = () => {
    const s = cur.trim();
    if (s) chunks.push(s);
    cur = "";
  };

  for (let raw of lines) {
    const line = raw.replace(/--.*$/, ""); // strip commentaires ligne
    if (!inTrigger && /^\s*CREATE\s+TRIGGER/i.test(line)) {
      inTrigger = true;
    }
    cur += line + "\n";

    if (inTrigger) {
      if (/END\s*;\s*$/i.test(line)) {
        pushIfNotEmpty();
        inTrigger = false;
      }
    } else {
      if (/;\s*$/.test(line)) {
        pushIfNotEmpty();
      }
    }
  }
  pushIfNotEmpty();
  return chunks;
}

type MigState = { applied: string[] };

async function readState(): Promise<MigState> {
  const root = await getDataDir();
  if (!isTauri()) return { applied: [] };
  // CODEREVIEW: store migration state under centralized AppData data directory
  const path = await join(root, "migrations.json");
  const { exists, readTextFile } = await import("@tauri-apps/plugin-fs");
  if (!(await exists(path))) return { applied: [] };
  try {
    const txt = await readTextFile(path);
    const json = JSON.parse(txt);
    return { applied: Array.isArray(json.applied) ? json.applied : [] };
  } catch {
    return { applied: [] };
  }
}

async function writeState(state: MigState) {
  const root = await getDataDir();
  if (!isTauri()) {
    console.warn("Cette action nécessite Tauri");
    return;
  }
  const path = await join(root, "migrations.json");
  const { writeTextFile } = await import("@tauri-apps/plugin-fs");
  await writeTextFile(path, JSON.stringify(state, null, 2));
}

export async function applyMigrations(): Promise<void> {
  if (!isTauri()) {
    console.warn("Cette action nécessite Tauri");
    return;
  }
  const db = await getDb();
  const state = await readState();

  for (const m of migrations) {
    if (state.applied.includes(m.id)) continue;

    const statements = splitSql(m.sql);
    // exécute en “transaction” best-effort
    try {
      await db.execute("BEGIN;");
      for (const stmt of statements) {
        await db.execute(stmt);
      }
      await db.execute("COMMIT;");
      state.applied.push(m.id);
      await writeState(state);
      console.info(`[migrate] applied ${m.id}`);
    } catch (e) {
      try { await db.execute("ROLLBACK;"); } catch {}
      console.error(`[migrate] failed ${m.id}:`, e);
      throw e;
    }
  }
}
