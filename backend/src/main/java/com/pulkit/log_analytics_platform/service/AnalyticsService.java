package com.pulkit.log_analytics_platform.service;

import com.pulkit.log_analytics_platform.dto.*;
import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.repository.LogRepository;
import lombok.AllArgsConstructor;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class AnalyticsService {

  private static final Set<String> ALLOWED_GRANULARITIES = Set.of("minute", "hour", "day", "week", "month");

  private final LogRepository logRepository;
  private final CacheManager cacheManager;

  private String validateGranularity(String granularity) {
    if (!ALLOWED_GRANULARITIES.contains(granularity)) {
      throw new IllegalArgumentException("Invalid granularity: " + granularity);
    }
    return granularity;
  }

  // ---- generic cache-aside helper shared by all four analytics queries ----
  private <T> TimedResult<T> cacheAside(String cacheName, String key, boolean bypassCache,
      java.util.function.Supplier<T> compute) {
    Cache cache = cacheManager.getCache(cacheName);
    long start = System.nanoTime();

    if (!bypassCache && cache != null) {
      Cache.ValueWrapper wrapper = cache.get(key);
      if (wrapper != null) {
        @SuppressWarnings("unchecked")
        T cached = (T) wrapper.get();
        long elapsedMs = (System.nanoTime() - start) / 1_000_000;
        return new TimedResult<>(cached, new CacheMetrics(true, elapsedMs, "redis"));
      }
    }

    T result = compute.get();
    if (cache != null) {
      cache.put(key, result);
    }
    long elapsedMs = (System.nanoTime() - start) / 1_000_000;
    return new TimedResult<>(result, new CacheMetrics(false, elapsedMs, "postgres"));
  }

  public TimedResult<List<LevelCount>> countBySeverity(boolean bypassCache) {
    return cacheAside("severityDistribution", "all", bypassCache, logRepository::countBySeverity);
  }

  public TimedResult<List<ServiceCount>> topServices(List<Log.LogLevel> levels, int limit, boolean bypassCache) {
    List<Log.LogLevel> effectiveLevels = (levels == null || levels.isEmpty())
        ? List.of(Log.LogLevel.values())
        : levels;
    String key = effectiveLevels + "_" + limit;
    return cacheAside("topServices", key, bypassCache,
        () -> logRepository.topServicesByLevel(effectiveLevels, PageRequest.of(0, limit)));
  }

  public TimedResult<List<TimeBucketCount>> getLogTrend(String granularity, Instant startTime, Instant endTime,
      boolean bypassCache) {
    validateGranularity(granularity);
    String key = granularity + "_" + startTime + "_" + endTime;
    return cacheAside("logTrend", key, bypassCache, () -> {
      List<Object[]> rows = logRepository.countByTimeBucketRaw(granularity, startTime, endTime);
      return rows.stream()
          .map(row -> new TimeBucketCount(toInstant(row[0]), ((Number) row[1]).longValue()))
          .toList();
    });
  }

  public TimedResult<List<ErrorRateBucket>> getErrorRate(String granularity, Instant startTime, Instant endTime,
      boolean bypassCache) {
    validateGranularity(granularity);
    String key = granularity + "_" + startTime + "_" + endTime;
    return cacheAside("errorRate", key, bypassCache, () -> {
      List<Object[]> rows = logRepository.errorRateByTimeBucketRaw(granularity, startTime, endTime);
      return rows.stream()
          .map(row -> {
            Instant bucket = toInstant(row[0]);
            long total = ((Number) row[1]).longValue();
            long errors = ((Number) row[2]).longValue();
            double rate = total == 0 ? 0.0 : (errors * 100.0) / total;
            return new ErrorRateBucket(bucket, total, errors, rate);
          })
          .toList();
    });
  }

  public boolean isErrorSpike(Instant currentBucketStart, Instant currentBucketEnd, double thresholdMultiplier) {
    List<Log.LogLevel> errorLevels = List.of(Log.LogLevel.ERROR, Log.LogLevel.FATAL);

    long currentErrors = logRepository.countByLogLevelInAndTimeStampBetween(
        errorLevels, currentBucketStart, currentBucketEnd);

    Duration bucketSize = Duration.between(currentBucketStart, currentBucketEnd);
    Instant historyStart = currentBucketStart.minus(bucketSize.multipliedBy(5));
    long historicalErrors = logRepository.countByLogLevelInAndTimeStampBetween(
        errorLevels, historyStart, currentBucketStart);

    double avgHistorical = historicalErrors / 5.0;
    return currentErrors > avgHistorical * thresholdMultiplier;
  }

  private Instant toInstant(Object value) {
    if (value instanceof Instant instant) {
      return instant;
    } else if (value instanceof Timestamp timestamp) {
      return timestamp.toInstant();
    } else {
      throw new IllegalStateException("Unexpected timestamp type: " + value.getClass());
    }
  }
}