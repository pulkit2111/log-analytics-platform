import { get, post, getWithMetrics } from "./client";

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

export function addLogs(logs) {
  return post(`/addLogs`, logs);
}

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

// Returns { data, metrics: { hit, responseTimeMs, dataSource } }
export function searchLogsWithMetrics({
  service,
  level,
  startTime,
  endTime,
  keyword,
  page = 0,
  size = 20,
  bypassCache = false,
} = {}) {
  const qs = toQueryString({
    service,
    level,
    startTime,
    endTime,
    keyword,
    page,
    size,
    bypassCache,
  });
  return getWithMetrics(`/searchLogs?${qs}`);
}

export function clearCache() {
  return post(`/cache/clear`, {});
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

// ---------- Analytics, with cache metrics ----------

export function getSeverityDistributionWithMetrics({
  bypassCache = false,
} = {}) {
  const qs = toQueryString({ bypassCache });
  return getWithMetrics(`/analytics/severity-distribution?${qs}`);
}

export function getTopServicesWithMetrics({
  limit = 5,
  levels,
  bypassCache = false,
} = {}) {
  const qs = toQueryString({ limit, levels, bypassCache });
  return getWithMetrics(`/analytics/top-services?${qs}`);
}

export function getLogTrendWithMetrics({
  granularity = "hour",
  startTime,
  endTime,
  bypassCache = false,
}) {
  const qs = toQueryString({ granularity, startTime, endTime, bypassCache });
  return getWithMetrics(`/analytics/trend?${qs}`);
}

export function getErrorRateWithMetrics({
  granularity = "hour",
  startTime,
  endTime,
  bypassCache = false,
}) {
  const qs = toQueryString({ granularity, startTime, endTime, bypassCache });
  return getWithMetrics(`/analytics/error-rate?${qs}`);
}
