import { useEffect, useState } from "react";
import { getSeverityDistribution, getTopServices, getLogTrend, getErrorRate } from "../api/logApi";

export function useAnalyticsData({ granularity, startTime, endTime }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const loading = data === null && error === null;

  useEffect(() => {
    let cancelled = false;
    const params = { granularity, startTime, endTime };

    Promise.all([
      getSeverityDistribution(),
      getTopServices({ limit: 10 }), // no `levels` filter → backend defaults to all levels
      getLogTrend(params),
      getErrorRate(params),
    ])
      .then(([severityDistribution, topServices, trendRaw, errorRateRaw]) => {
        if (cancelled) return;

        const errorRateByBucket = new Map(errorRateRaw.map((b) => [b.bucket, b]));
        const trend = trendRaw.map((b) => ({
          bucket: new Date(b.bucket).getTime(),
          total: b.count,
          errors: errorRateByBucket.get(b.bucket)?.errorCount ?? 0,
          errorRate: errorRateByBucket.get(b.bucket)?.errorRate ?? 0,
        }));

        setData({ severityDistribution, topServices, trend });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load analytics data");
      });

    return () => {
      cancelled = true;
    };
  }, [granularity, startTime, endTime]);

  return { data, loading, error };
}
