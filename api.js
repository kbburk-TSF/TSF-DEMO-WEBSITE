// api.js
// Resilient client API shim. Fixes 404s by trying multiple known endpoint paths.
// Honors NEXT_PUBLIC_API_BASE and works in SSR.

const API_BASE = (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_BASE)
  ? String(process.env.NEXT_PUBLIC_API_BASE)
  : "";

// Helpers
function joinUrl(base, path) {
  if (!base) return path;
  return base.replace(/\/+$/,"") + "/" + String(path || "").replace(/^\/+/, "");
}

function originBase() {
  return (typeof window !== "undefined" && window.location?.origin) ? window.location.origin : "";
}

function buildUrl(path, params = {}) {
  const base = API_BASE || originBase();
  const href = base ? joinUrl(base, path) : String(path || "");
  const url = new URL(href, base || "http://localhost");
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined || v === "") return;
    url.searchParams.set(k, String(v));
  });
  return url;
}

async function fetchWithTimeout(input, init = {}, ms = 12000) {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const id = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
  try {
    const res = await fetch(input, { ...(init||{}), signal: ctrl?.signal });
    return res;
  } finally {
    if (id) clearTimeout(id);
  }
}

// Generic multi-path fetcher: tries candidates until one returns 2xx
async function tryPaths(candidates, params = {}, init = {}) {
  const errors = [];
  for (const path of candidates) {
    const url = buildUrl(path, params);
    try {
      const res = await fetchWithTimeout(url.toString(), { method: "GET", ...init });
      if (res.ok) {
        if (typeof window !== "undefined") {
          console.info("[api.js] OK", res.status, url.toString());
        }
        return res;
      } else {
        errors.push(`${res.status} ${url}`);
        if (typeof window !== "undefined") {
          console.warn("[api.js] Non-OK", res.status, url.toString());
        }
      }
    } catch (e) {
      errors.push(`ERR ${url} :: ${e?.message||e}`);
      if (typeof window !== "undefined") {
        console.warn("[api.js] Fetch error", url.toString(), e);
      }
    }
  }
  throw new Error(errors.join(" | "));
}

// API

// Returns an array of forecast ids
export async function listForecastIds({ scope = "global", model = "", series = "" } = {}) {
  const candidates = [
    "/views/forecast_ids",
    "/views/forecast-ids",
    "/views/ids",
    "/api/views/forecast_ids",
    "/api/views/forecast-ids",
    "/api/views/ids"
  ];
  const res = await tryPaths(candidates, { scope, model, series });
  return res.json();
}

// Queries a pre-baked view. Expected: { rows: [...] }
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
  const candidates = [
    "/views",
    "/views/query",
    "/api/views",
    "/api/views/query"
  ];
  const params = { scope, model, series, forecast_id, date_from, date_to, page, page_size };
  const res = await tryPaths(candidates, params);
  return res.json();
}
