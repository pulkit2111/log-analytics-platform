import { get, post } from "./client";

// Builds a query string, skipping empty/undefined values and
// repeating the key for array values (?levels=ERROR&levels=FATAL),
// matching how Spring binds List<T> @RequestParam.
function toQueryString(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => usp.append(key, v));
    } else {
      usp.append(key, value);
    }
  });
  return usp.toString();
}

// ---------- CRUD ----------

export function searchLogs({
  service,
  level,
  startTime,
  endTime,
  keyword,
  page = 0,
  size = 20,
} = {}) {
  const qs = toQueryString({
    service,
    level,
    startTime,
    endTime,
    keyword,
    page,
    size,
  });
  return get(`/searchLogs?${qs}`);
}

export function getLogBySource(source) {
  return get(`/getLog?source=${encodeURIComponent(source)}`);
}

export function addLog(log) {
  return post(`/addLog`, log);
}

export function addLogs(logs) {
  return post(`/addLogs`, logs);
}

// ---------- Analytics ----------

export function getSeverityDistribution() {
  return get(`/analytics/severity-distribution`);
}

export function getTopServices({ limit = 5, levels } = {}) {
  const qs = toQueryString({ limit, levels });
  return get(`/analytics/top-services?${qs}`);
}

export function getLogTrend({ granularity = "hour", startTime, endTime }) {
  const qs = toQueryString({ granularity, startTime, endTime });
  return get(`/analytics/trend?${qs}`);
}

export function getErrorRate({ granularity = "hour", startTime, endTime }) {
  const qs = toQueryString({ granularity, startTime, endTime });
  return get(`/analytics/error-rate?${qs}`);
}
