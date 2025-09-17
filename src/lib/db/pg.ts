export type NormalizeResult = {
  url: string;
  removedChannelBinding: boolean;
  hasSslRequire: boolean;
};

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
      void full;
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
      // ignore parsing errors here
    }
  }

  return { url, removedChannelBinding, hasSslRequire };
}
