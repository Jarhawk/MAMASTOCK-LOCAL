import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useResolvedPath } from "react-router-dom";

import { prefetchRoute } from "@/routerPrefetch";

const PREFETCHED = new Set();

function extractHref(to) {
  if (typeof to === "string") return to;
  if (to && typeof to === "object" && "pathname" in to && typeof to.pathname === "string") {
    return to.pathname;
  }
  return null;
}

function isExternalLink(to) {
  const href = extractHref(to);
  if (!href) return false;
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href);
}

function shouldSkipPrefetch() {
  if (typeof navigator === "undefined") return false;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return false;
  if (connection.saveData === true) return true;
  const type = typeof connection.effectiveType === "string"
    ? connection.effectiveType.toLowerCase()
    : "";
  return type === "2g" || type === "slow-2g";
}

const LinkPrefetch = forwardRef(function LinkPrefetch(
  { to, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest },
  ref
) {
  const external = useMemo(() => isExternalLink(to), [to]);
  const resolved = useResolvedPath(external ? "/" : to);
  const targetPath = external ? null : resolved.pathname;
  const abortRef = useRef(null);

  const cleanup = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const triggerPrefetch = useCallback(() => {
    if (!targetPath || PREFETCHED.has(targetPath) || shouldSkipPrefetch()) return;

    cleanup();
    const controller = new AbortController();
    abortRef.current = controller;

    prefetchRoute(targetPath, { signal: controller.signal })
      .then((completed) => {
        if (!controller.signal.aborted && completed) {
          PREFETCHED.add(targetPath);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted && import.meta.env?.DEV) {
          console.warn("[router] Prefetch failed", targetPath, error);
        }
      })
      .finally(() => {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      });
  }, [cleanup, targetPath]);

  useEffect(() => cleanup, [cleanup]);

  const handleMouseEnter = useCallback(
    (event) => {
      if (typeof onMouseEnter === "function") {
        onMouseEnter(event);
      }
      if (!event.defaultPrevented) {
        triggerPrefetch();
      }
    },
    [onMouseEnter, triggerPrefetch]
  );

  const handleMouseLeave = useCallback(
    (event) => {
      if (typeof onMouseLeave === "function") {
        onMouseLeave(event);
      }
      if (!event.defaultPrevented) {
        cleanup();
      }
    },
    [cleanup, onMouseLeave]
  );

  const handleFocus = useCallback(
    (event) => {
      if (typeof onFocus === "function") {
        onFocus(event);
      }
      if (!event.defaultPrevented) {
        triggerPrefetch();
      }
    },
    [onFocus, triggerPrefetch]
  );

  const handleBlur = useCallback(
    (event) => {
      if (typeof onBlur === "function") {
        onBlur(event);
      }
      if (!event.defaultPrevented) {
        cleanup();
      }
    },
    [cleanup, onBlur]
  );

  return (
    <Link
      ref={ref}
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  );
});

export default LinkPrefetch;
