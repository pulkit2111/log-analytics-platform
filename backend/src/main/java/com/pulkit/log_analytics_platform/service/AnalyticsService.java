package com.pulkit.log_analytics_platform.service;

import com.pulkit.log_analytics_platform.dto.*;
import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.repository.LogRepository;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class AnalyticsService {

  private static final Set<String> ALLOWED_GRANULARITIES = Set.of("minute", "hour", "day", "week", "month");

  private final LogRepository logRepository;

  private String validateGranularity(String granularity) {
    if (!ALLOWED_GRANULARITIES.contains(granularity)) {
      throw new IllegalArgumentException("Invalid granularity: " + granularity);
    }
    return granularity;
  }

  @Cacheable(value = "severityDistribution")
  public List<LevelCount> countBySeverity() {
    return logRepository.countBySeverity();
  }

  @Cacheable(value = "topServices", key = "#levels + '_' + #limit")
  public List<ServiceCount> topServices(List<Log.LogLevel> levels, int limit) {
    if (levels == null || levels.isEmpty()) {
      levels = List.of(Log.LogLevel.values());
    }
    return logRepository.topServicesByLevel(levels, PageRequest.of(0, limit));
  }

  @Cacheable(value = "logTrend", key = "#granularity + '_' + #startTime + '_' + #endTime")
  public List<TimeBucketCount> getLogTrend(String granularity, Instant startTime, Instant endTime) {
    validateGranularity(granularity);
    List<Object[]> rows = logRepository.countByTimeBucketRaw(granularity, startTime, endTime);
    return rows.stream()
        .map(row -> new TimeBucketCount(
            (Instant) row[0],
            ((Number) row[1]).longValue()))
        .toList();
  }

  @Cacheable(value = "errorRate", key = "#granularity + '_' + #startTime + '_' + #endTime")
  public List<ErrorRateBucket> getErrorRate(String granularity, Instant startTime, Instant endTime) {
    validateGranularity(granularity);
    List<Object[]> rows = logRepository.errorRateByTimeBucketRaw(granularity, startTime, endTime);
    return rows.stream()
        .map(row -> {
          Instant bucket = (Instant) row[0];
          long total = ((Number) row[1]).longValue();
          long errors = ((Number) row[2]).longValue();
          double rate = total == 0 ? 0.0 : (errors * 100.0) / total;
          return new ErrorRateBucket(bucket, total, errors, rate);
        })
        .toList();
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
}