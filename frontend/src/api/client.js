// Central place for the API base URL and the raw fetch logic.
// Every endpoint-specific function in logApi.js goes through here,
// so error handling and headers only need to be right in one place.

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Request failed (${res.status} ${res.statusText})${body ? `: ${body}` : ""}`,
    );
  }

  // addLog/addLogs may return a small JSON body or nothing — guard either way
  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : null;
}

export function get(path) {
  return request(path, { method: "GET" });
}

// Same as get(), but also surfaces the cache-metrics headers the backend
// sets on searchLogs/analytics endpoints — needed for the cache
// hit/miss/response-time/data-source visualization.
export async function getWithMetrics(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Request failed (${res.status} ${res.statusText})${body ? `: ${body}` : ""}`,
    );
  }
  const data = await res.json();
  const metrics = {
    hit: res.headers.get("X-Cache-Status") === "HIT",
    responseTimeMs: Number(res.headers.get("X-Response-Time-Ms") ?? 0),
    dataSource: res.headers.get("X-Data-Source") ?? "unknown",
  };
  return { data, metrics };
}

export function post(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
