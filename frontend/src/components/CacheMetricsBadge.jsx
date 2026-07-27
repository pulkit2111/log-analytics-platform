export function CacheMetricsBadge({ metrics }) {
  if (!metrics) return null;
  const { hit, responseTimeMs, dataSource } = metrics;

  return (
    <div className={`cache-badge ${hit ? "cache-badge--hit" : "cache-badge--miss"}`}>
      <span className="cache-badge-dot" />
      {hit ? "CACHE HIT" : "CACHE MISS"}
      <span className="cache-badge-sep">·</span>
      {responseTimeMs}ms
      <span className="cache-badge-sep">·</span>
      {dataSource}
    </div>
  );
}
