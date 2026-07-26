import { useEffect, useState } from "react";
import {
  getSeverityDistribution,
  getTopServices,
  getLogTrend,
  getErrorRate,
  searchLogs,
} from "../api/logApi";

function granularityForRange(hours) {
  return hours <= 24 ? "hour" : "day";
}

// Fetches everything the dashboard needs and reshapes it into the
// same shape useMockData used to produce, so the component doesn't
// need to change how it reads `data`.
export function useDashboardData(rangeHours) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const loading = data === null && error === null;

  useEffect(() => {
    let cancelled = false;

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - rangeHours * 3600 * 1000);
    const timeParams = {
      granularity: granularityForRange(rangeHours),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    Promise.all([
      getSeverityDistribution(),
      getTopServices({ limit: 5, levels: ["ERROR", "FATAL"] }),
      getLogTrend(timeParams),
      getErrorRate(timeParams),
      searchLogs({ page: 0, size: 6 }),
    ])
      .then(
        ([
          severityDistribution,
          topServices,
          trendRaw,
          errorRateRaw,
          recent,
        ]) => {
          if (cancelled) return;

          // /trend gives volume per bucket, /error-rate gives error
          // counts per bucket — same bucket boundaries, so merge by
          // the bucket timestamp string into one array for the chart
          const errorRateByBucket = new Map(
            errorRateRaw.map((b) => [b.bucket, b]),
          );
          const trend = trendRaw.map((b) => ({
            bucket: new Date(b.bucket).getTime(),
            total: b.count,
            errors: errorRateByBucket.get(b.bucket)?.errorCount ?? 0,
            errorRate: errorRateByBucket.get(b.bucket)?.errorRate ?? 0,
          }));

          const totalLogs = severityDistribution.reduce(
            (sum, d) => sum + d.count,
            0,
          );
          const totalErrors = severityDistribution
            .filter((d) => d.level === "ERROR" || d.level === "FATAL")
            .reduce((sum, d) => sum + d.count, 0);

          setData({
            trend,
            severityDistribution,
            topServices,
            recentLogs: (recent?.content ?? []).map((log) => ({
              level: log.logLevel,
              serviceName: log.serviceName,
              message: log.message,
              ts: new Date(log.timeStamp).getTime(),
            })),
            kpis: {
              totalLogs,
              errorRate:
                totalLogs === 0
                  ? 0
                  : +((totalErrors / totalLogs) * 100).toFixed(2),
              activeServices: topServices.length,
              logsPerMin: Math.round(totalLogs / (rangeHours * 60)),
            },
          });
        },
      )
      .catch((err) => {
        if (!cancelled)
          setError(err.message || "Failed to load dashboard data");
      })
      .finally(() => {
        // if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rangeHours]);

  return { data, loading, error };
}
