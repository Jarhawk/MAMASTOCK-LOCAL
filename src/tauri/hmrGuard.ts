import { isTauri } from "@/lib/runtime/isTauri";export function registerAbortOnHMR(controller: AbortController) {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      try {controller.abort();} catch {}
    });
  }
}