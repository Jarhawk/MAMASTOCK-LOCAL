/// <reference types="vite/client" />
import React, { useEffect, useState } from "react";
import { steps, Step } from "@/onboarding/steps";

export default function Onboarding() {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const s: Record<string, boolean> = {};
    for (const st of steps) s[st.id] = await st.isDone();
    setStatus(s);
  }

  useEffect(() => { refresh(); }, []);

  const allDone = Object.values(status).every(Boolean);

  async function run(st: Step) {
    setBusy(true);
    try { await st.ensure(); }
    finally { setBusy(false); await refresh(); }
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-[620px] max-w-[90vw] rounded-2xl p-6 bg-slate-800/40 border border-slate-600/40">
        <h2 className="text-slate-100 text-xl mb-4">Onboarding</h2>
        <ul className="space-y-3">
          {steps.map(st => (
            <li key={st.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/40">
              <div>
                <div className="text-slate-100 font-medium">{st.title}</div>
                {st.description && <div className="text-slate-400 text-sm">{st.description}</div>}
              </div>
              <div className="flex items-center gap-2">
                {status[st.id] ? (
                  <span className="text-emerald-400 text-sm">✓ Fait</span>
                ) : (
                  <button disabled={busy}
                          onClick={() => run(st)}
                          className="px-3 py-1 rounded-md bg-amber-500/90 hover:bg-amber-500 text-black text-sm">
                    Faire
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <a href="#/" className="px-3 py-1 text-slate-300 text-sm">Passer</a>
          <a href="#/" className={"px-3 py-1 rounded-md text-sm " + (allDone ? "bg-lime-400 text-black" : "bg-slate-600/50 text-slate-300 pointer-events-none")}>
            Terminer
          </a>
        </div>
      </div>
    </div>
  );
}

