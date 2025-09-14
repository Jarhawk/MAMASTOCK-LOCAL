// src/debug/check-capabilities-runtime.ts
// Testeur runtime des permissions SQL (à exécuter DANS Tauri WebView)
import { isTauri } from "@/lib/db/sql";

type Step = { ok: boolean; error?: string };
type Report = {
  env: {
    tauri: boolean;
    platform?: string | null;
    appName?: string | null;
    appVersion?: string | null;
    windowLabel?: string | null;
  };
  tests: {
    load: Step;
    select: Step;
    execute: Step;
    transaction: Step;
    close: Step;
  };
  hints: string[];
};

function stringErr(e: unknown) {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  return String(e);
}

function permissionHintFrom(err: string): string[] {
  const hints: string[] = [];
  const s = err.toLowerCase();
  if (s.includes("sql.load not allowed") || s.includes("permission") && s.includes("load")) {
    hints.push('→ Ajouter "sql:allow-load" dans src-tauri/capabilities/sql.json');
  }
  if (s.includes("sql.select not allowed") || s.includes("select") && s.includes("not allowed")) {
    hints.push('→ Ajouter "sql:allow-select" dans src-tauri/capabilities/sql.json');
  }
  if (s.includes("sql.execute not allowed") || s.includes("execute") && s.includes("not allowed")) {
    hints.push('→ Ajouter "sql:allow-execute" dans src-tauri/capabilities/sql.json');
  }
  if (s.includes("deny") && s.includes("sql")) {
    hints.push("→ Supprimer tout `sql:deny-*` dans les capabilities visant la même fenêtre (les deny priment).");
  }
  if (s.includes("windows") && s.includes("label")) {
    hints.push("→ Vérifier que `windows` dans sql.json contient bien le label réel de la fenêtre (souvent \"main\").");
  }
  return hints;
}

export async function runCapCheck(): Promise<Report> {
  const report: Report = {
    env: {
      tauri: isTauri,
      platform: isTauri ? (import.meta as any).env.TAURI_PLATFORM ?? null : null,
      appName: null,
      appVersion: null,
      windowLabel: null,
    },
    tests: {
      load: { ok: false },
      select: { ok: false },
      execute: { ok: false },
      transaction: { ok: false },
      close: { ok: false },
    },
    hints: [],
  };

  if (!report.env.tauri) {
    report.hints.push("Lancer via `npx tauri dev` (les plugins ne marchent pas dans un navigateur pur).");
    console.group("%c[cap-check] ENV", "color:gray");
    console.info(report);
    console.groupEnd();
    return report;
  }

  try {
    const { getName, getVersion } = await import("@tauri-apps/api/app");
    report.env.appName = await getName();
    report.env.appVersion = await getVersion();
  } catch {}

  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    report.env.windowLabel = win.label;
  } catch {}

  let db: any | null = null;

  // 1) load
  try {
    const Database = (await import("@tauri-apps/plugin-sql")).default;
    db = await Database.load("sqlite:mamastock.db");
    report.tests.load.ok = true;
  } catch (e) {
    const err = stringErr(e);
    report.tests.load = { ok: false, error: err };
    report.hints.push(...permissionHintFrom(err));
    console.group("%c[cap-check]", "color:#e74c3c");
    console.error("load() KO:", err);
    console.info("HINTS:", report.hints);
    console.groupEnd();
    return report; // impossible d'aller plus loin sans load()
  }

  // 2) SELECT
  try {
    const r = await db.select("SELECT 1 as one");
    if (Array.isArray(r) && r.length && r[0]?.one === 1) {
      report.tests.select.ok = true;
    } else {
      report.tests.select = { ok: false, error: "SELECT 1 renvoie un résultat inattendu" };
    }
  } catch (e) {
    const err = stringErr(e);
    report.tests.select = { ok: false, error: err };
    report.hints.push(...permissionHintFrom(err));
  }

  // 3) EXECUTE (CREATE TABLE)
  try {
    await db.execute("CREATE TABLE IF NOT EXISTS _ping (id INTEGER PRIMARY KEY, ts TEXT)");
    report.tests.execute.ok = true;
  } catch (e) {
    const err = stringErr(e);
    report.tests.execute = { ok: false, error: err };
    report.hints.push(...permissionHintFrom(err));
  }

  // 4) TRANSACTION (BEGIN/INSERT/COMMIT)
  try {
    await db.execute("BEGIN");
    await db.execute("INSERT INTO _ping(ts) VALUES (CURRENT_TIMESTAMP)");
    await db.execute("COMMIT");
    report.tests.transaction.ok = true;
  } catch (e) {
    const err = stringErr(e);
    report.tests.transaction = { ok: false, error: err };
    report.hints.push(...permissionHintFrom(err));
    try { await db.execute("ROLLBACK"); } catch {}
  }

  // 5) close
  try {
    if (db?.close) await db.close();
    report.tests.close.ok = true;
  } catch (e) {
    const err = stringErr(e);
    report.tests.close = { ok: false, error: err };
  }

  // Affichage
  const okColor = "color:#2ecc71";
  const koColor = "color:#e74c3c";
  console.group("%c[cap-check] RUNTIME REPORT", "color:#3498db;font-weight:bold");
  console.log("ENV:", report.env);
  console.group("%cTests", "color:#555");
  console.log("%cload", report.tests.load.ok ? okColor : koColor, report.tests.load);
  console.log("%cselect", report.tests.select.ok ? okColor : koColor, report.tests.select);
  console.log("%cexecute", report.tests.execute.ok ? okColor : koColor, report.tests.execute);
  console.log("%ctransaction", report.tests.transaction.ok ? okColor : koColor, report.tests.transaction);
  console.log("%cclose", report.tests.close.ok ? okColor : koColor, report.tests.close);
  console.groupEnd();
  if (report.hints.length) {
    console.group("%cHints", "color:#f39c12");
    for (const h of report.hints) console.log("•", h);
    console.groupEnd();
  } else {
    console.log("%cOK: toutes les permissions testées semblent disponibles.", okColor);
  }
  console.groupEnd();

  // Expose aussi sur window pour relancer à la main
  (window as any).runCapCheck = () => runCapCheck();

  return report;
}

// Auto-run si "?capcheck=1" dans l'URL
declare const window: any;
const params = new URLSearchParams(window.location.search);
if (params.has("capcheck") || (import.meta as any).env.VITE_CHECK_CAP === "1") {
  runCapCheck();
}

