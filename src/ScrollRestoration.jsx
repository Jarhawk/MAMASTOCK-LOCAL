import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Restaure le scroll du conteneur marqué [data-scroll-container]
 * — ou du window s’il n’existe pas — pour HashRouter.
 * - POP (back/forward) : on restaure la position sauvegardée
 * - PUSH/REPLACE       : on va en haut, ou sur l’ancre si `#hash`
 */

const STORAGE_PREFIX = "scroll:";

function getScrollContainer() {
  // Ton conteneur scrollable doit être marqué data-scroll-container
  // sinon on tombe sur le document (window)
  return (
    document.querySelector("[data-scroll-container]") ||
    document.scrollingElement ||
    document.documentElement
  );
}

function readPos(el) {
  const isWindow = el === document.scrollingElement || el === document.documentElement;
  return isWindow
    ? { x: window.scrollX || 0, y: window.scrollY || 0 }
    : { x: el.scrollLeft || 0, y: el.scrollTop || 0 };
}

function doScroll(el, x, y) {
  const isWindow = el === document.scrollingElement || el === document.documentElement;
  if (isWindow) {
    window.scrollTo(x, y);
  } else {
    el.scrollTo({ left: x, top: y, behavior: "auto" });
  }
}

function keyFromLocation(loc) {
  // location.key n’existe pas toujours avec HashRouter → fallback stable
  return loc.key || `${loc.pathname}${loc.search}${loc.hash}`;
}

export default function ScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType(); // "POP" | "PUSH" | "REPLACE"
  const key = keyFromLocation(location);
  const containerRef = useRef(null);

  // 1) Sauvegarde en continu la position de scroll pour la clé courante
  useLayoutEffect(() => {
    const el = getScrollContainer();
    containerRef.current = el;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const { x, y } = readPos(el);
        sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify({ x, y }));
        ticking = false;
      });
    };

    const target = el === document.scrollingElement || el === document.documentElement ? window : el;
    target.addEventListener("scroll", onScroll, { passive: true });

    // sauve aussi quand on quitte la page (hard reload)
    const onPageHide = () => {
      const { x, y } = readPos(el);
      sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify({ x, y }));
    };
    window.addEventListener("pagehide", onPageHide);

    return () => {
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [key]);

  // 2) Sur changement d’emplacement : restaurer / aller à l’ancre / remonter en haut
  useLayoutEffect(() => {
    const el = getScrollContainer();
    const stored = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);

    // back/forward → restaurer si dispo
    if (navType === "POP" && stored) {
      try {
        const { x, y } = JSON.parse(stored);
        doScroll(el, x ?? 0, y ?? 0);
        return;
      } catch {
        // ignore JSON invalide
      }
    }

    // s’il y a un hash → scroll sur l’ancre + focus accessible
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const anchor = document.getElementById(id);
      if (anchor) {
        if (!anchor.hasAttribute("tabindex")) anchor.setAttribute("tabindex", "-1");
        anchor.focus({ preventScroll: true });
        anchor.scrollIntoView({ block: "start" });
        return;
      }
    }

    // sinon top
    doScroll(el, 0, 0);
  }, [key, navType, location.hash]);

  return null;
}
