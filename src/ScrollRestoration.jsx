import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_PREFIX = "__mscroll:";

/** Renvoie le conteneur scrollable s’il est marqué, sinon null (=> fallback fenêtre). */
function getScroller() {
  const el = document.querySelector("[data-router-scroll-container]");
  return el || null;
}

function getPositions() {
  const scroller = getScroller();
  const windowY = Math.round(window.scrollY || 0);
  const containerY = scroller ? Math.round(scroller.scrollTop || 0) : 0;
  return { windowY, containerY, any: Math.max(windowY, containerY) };
}

function applyPositions(pos) {
  const scroller = getScroller();
  if (scroller) {
    scroller.scrollTop = pos?.containerY ?? 0;
    // quand on scrolle le conteneur, on garde la fenêtre en haut
    window.scrollTo(0, 0);
  } else {
    window.scrollTo(0, pos?.windowY ?? 0);
  }
}

/** Restaure avec retries jusqu’à stabilisation, puis résout avec la position finale. */
function restoreWithRetry(target, maxAttempts = 8) {
  return new Promise((resolve) => {
    const step = (attempt) => {
      applyPositions(target);
      const now = getPositions();
      const ok = Math.abs(now.any - (target?.any ?? 0)) < 2;
      if (ok || attempt >= maxAttempts) {
        resolve(now);
      } else {
        requestAnimationFrame(() => step(attempt + 1));
      }
    };
    step(0);
  });
}

export default function ScrollRestorer() {
  const location = useLocation();
  const navType = useNavigationType(); // "POP" | "PUSH" | "REPLACE"
  const prevKeyRef = useRef(location.key);

  // Forcer le scrollRestoration natif en "manual"
  useEffect(() => {
    const prev = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {}
    return () => {
      try {
        window.history.scrollRestoration = prev || "auto";
      } catch {}
    };
  }, []);

  // Sauvegarde générique (quitte/reload)
  useEffect(() => {
    const save = () => {
      const prevKey = prevKeyRef.current;
      if (!prevKey) return;
      const pos = getPositions();
      sessionStorage.setItem(STORAGE_PREFIX + prevKey, JSON.stringify(pos));
    };
    const onBeforeUnload = () => save();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      save();
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  // Gestion à chaque navigation
  useEffect(() => {
    // sauvegarde l’ancienne position (page quittée)
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== location.key) {
      const pos = getPositions();
      sessionStorage.setItem(STORAGE_PREFIX + prevKey, JSON.stringify(pos));
    }
    prevKeyRef.current = location.key;

    const raw = sessionStorage.getItem(STORAGE_PREFIX + location.key);
    const saved = raw ? JSON.parse(raw) : null;

    if (navType === "POP" && saved) {
      // back/forward => restaurer
      setTimeout(() => {
        restoreWithRetry(saved).then((finalPos) => {
          console.log(
            "[NOTE] back/forward scroll restoration (final):",
            `windowY=${finalPos.windowY}, containerY=${finalPos.containerY}`
          );
        });
      }, 0);
    } else {
      // navigation "neuve" => top
      setTimeout(() => {
        const scroller = getScroller();
        if (scroller) scroller.scrollTop = 0;
        window.scrollTo(0, 0);
        const cur = getPositions();
        console.log(
          "[NOTE] reset scroll on navigation:",
          `windowY=${cur.windowY}, containerY=${cur.containerY}`
        );
      }, 0);
    }
  }, [location.key, navType]);

  return null;
}
