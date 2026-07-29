package com.pulkit.log_analytics_platform.service;

import java.time.Instant;
import java.util.List;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.pulkit.log_analytics_platform.dto.CacheMetrics;
import com.pulkit.log_analytics_platform.dto.LogPageResponse;
import com.pulkit.log_analytics_platform.dto.TimedResult;
import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.repository.LogRepository;
import com.pulkit.log_analytics_platform.repository.LogSpecification;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LogService {

  private LogRepository logRepository;
  private final CacheManager cacheManager;

  @CacheEvict(value = { "searchLogs", "severityDistribution", "topServices", "logTrend",
      "errorRate" }, allEntries = true)
  public void addLogs(List<Log> logs) {
    logRepository.saveAll(logs);
  }

  /**
   * Cache-aside search — whether this call was a hit or miss, how long it took,
   * and
   * (via bypassCache) force a fresh DB read for side-by-side comparison.
   */
  public TimedResult<LogPageResponse> searchLogs(
      String service,
      Log.LogLevel level,
      Instant startTime,
      Instant endTime,
      String keyword,
      int page,
      int size,
      boolean bypassCache) {

    String key = buildKey(service, level, startTime, endTime, keyword, page, size);
    Cache cache = cacheManager.getCache("searchLogs");

    long start = System.nanoTime();

    if (!bypassCache && cache != null) {
      Cache.ValueWrapper wrapper = cache.get(key);
      if (wrapper != null) {
        LogPageResponse cached = (LogPageResponse) wrapper.get();
        long elapsedMs = (System.nanoTime() - start) / 1_000_000;
        return new TimedResult<>(cached, new CacheMetrics(true, elapsedMs, "redis"));
      }
    }

    Specification<Log> spec = LogSpecification.filterBy(service, level, startTime, endTime, keyword);
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timeStamp"));
    Page<Log> result = logRepository.findAll(spec, pageable);
    LogPageResponse response = LogPageResponse.from(result);
    if (cache != null) {
      cache.put(key, response);
    }

    long elapsedMs = (System.nanoTime() - start) / 1_000_000;
    return new TimedResult<>(response, new CacheMetrics(false, elapsedMs, "postgres"));
  }

  private String buildKey(String service, Log.LogLevel level, Instant startTime, Instant endTime, String keyword,
      int page, int size) {
    return String.join("_",
        String.valueOf(service),
        String.valueOf(level),
        String.valueOf(startTime),
        String.valueOf(endTime),
        String.valueOf(keyword),
        String.valueOf(page),
        String.valueOf(size));
  }

}
