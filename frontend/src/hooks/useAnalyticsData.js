import { useEffect, useState } from "react";
import {
  getSeverityDistributionWithMetrics,
  getTopServicesWithMetrics,
  getLogTrendWithMetrics,
  getErrorRateWithMetrics,
} from "../api/logApi";

export function useAnalyticsData({ granularity, startTime, endTime }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const loading = data === null && error === null;

  useEffect(() => {
    let cancelled = false;
    const params = { granularity, startTime, endTime };

    Promise.all([
      getSeverityDistributionWithMetrics(),
      getTopServicesWithMetrics({ limit: 10 }),
      getLogTrendWithMetrics(params),
      getErrorRateWithMetrics(params),
    ])
      .then(([severity, services, trendRes, errorRateRes]) => {
        if (cancelled) return;

        const errorRateByBucket = new Map(
          errorRateRes.data.map((b) => [b.bucket, b]),
        );
        const trend = trendRes.data.map((b) => ({
          bucket: new Date(b.bucket).getTime(),
          total: b.count,
          errors: errorRateByBucket.get(b.bucket)?.errorCount ?? 0,
          errorRate: errorRateByBucket.get(b.bucket)?.errorRate ?? 0,
        }));

        setData({
          severityDistribution: severity.data,
          topServices: services.data,
          trend,
          queryMetrics: [
            { label: "Severity Distribution", metrics: severity.metrics },
            { label: "Top Services", metrics: services.metrics },
            { label: "Volume Trend", metrics: trendRes.metrics },
            { label: "Error Rate", metrics: errorRateRes.metrics },
          ],
        });
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.message || "Failed to load analytics data");
      });

    return () => {
      cancelled = true;
    };
  }, [granularity, startTime, endTime]);

  return { data, loading, error };
}
