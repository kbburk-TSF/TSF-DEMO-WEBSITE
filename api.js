// Minimal client-side API shim used by Dashboard components.
// If you already have a real API module elsewhere, you can replace these
// exports with re-exports, e.g. `export * from "./lib/api.js"`.

function buildUrl(path, params = {}) {
  const base = (typeof window !== "undefined" && window.location)
    ? `${window.location.origin}${path}`
    : path; // during SSR we just return relative; calls should run client-side
  const url = new URL(base, typeof window !== "undefined" ? window.location.origin : "http://localhost");
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
    throw new Error(`listForecastIds failed: ${res.status} ${res.statusText}`);
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
    throw new Error(`queryView failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
