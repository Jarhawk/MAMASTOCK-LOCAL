import React, { forwardRef, useCallback, useMemo } from "react";
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

const LinkPrefetch = forwardRef(function LinkPrefetch(
  { to, onMouseEnter, onFocus, ...rest },
  ref
) {
  const external = useMemo(() => isExternalLink(to), [to]);
  const resolved = useResolvedPath(external ? "/" : to);
  const targetPath = external ? null : resolved.pathname;

  const triggerPrefetch = useCallback(() => {
    if (!targetPath || PREFETCHED.has(targetPath)) return;
    PREFETCHED.add(targetPath);
    prefetchRoute(targetPath);
  }, [targetPath]);

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

  return (
    <Link
      ref={ref}
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...rest}
    />
  );
});

export default LinkPrefetch;
