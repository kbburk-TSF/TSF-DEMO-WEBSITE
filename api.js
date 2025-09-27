// api.js
// Client-side API shim for Dashboard components.
// Uses NEXT_PUBLIC_API_BASE if set; otherwise falls back to current origin in browser.
// Works in SSR without assuming window is defined.

const API_BASE = (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_BASE)
  ? String(process.env.NEXT_PUBLIC_API_BASE)
  : "";

// Safe path join that avoids double slashes.
function joinUrl(base, path) {
  if (!base) return path;
  return base.replace(/\/+$/,"") + "/" + String(path || "").replace(/^\/+/, "");
}

function buildUrl(path, params = {}) {
  // Prefer explicit public base; else use browser origin if available.
  const origin = API_BASE || (typeof window !== "undefined" && window.location ? window.location.origin : "");
  const href = origin ? joinUrl(origin, path) : String(path || "");
  // Provide a fallback base for URL constructor in non-browser contexts.
  const url = new URL(href, origin || "http://localhost");
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined || v === "") return;
    url.searchParams.set(k, String(v));
  });
  return url;
}

// Returns an array of forecast ids, e.g., [{ forecast_id: 123 }, ...]
export async function listForecastIds({ scope = "global", model = "", series = "" } = {}) {
  const url = buildUrl("/views/forecast_ids", { scope, model, series });
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`listForecastIds failed: ${res.status}`);
  }
  return res.json();
}

// Queries a pre-baked view. Expected response: { rows: [...] }
export async function queryView({
  scope = "global",
  model = "",
  series = "",
  forecast_id,
  date_from = null,
  date_to = null,
  page = 1,
  page_size = 20000
} = {}) {
  const url = buildUrl("/views", {
    scope, model, series, forecast_id, date_from, date_to, page, page_size
  });
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    throw new Error(`queryView failed: ${res.status}`);
  }
  return res.json();
}
