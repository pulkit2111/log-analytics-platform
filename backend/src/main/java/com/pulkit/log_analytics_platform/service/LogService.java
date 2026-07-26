package com.pulkit.log_analytics_platform.service;

import java.time.Instant;
import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.pulkit.log_analytics_platform.dto.LogPageResponse;
import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.repository.LogRepository;
import com.pulkit.log_analytics_platform.repository.LogSpecification;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LogService {

  private LogRepository logRepository;

  @Cacheable(value = "searchLogs", key = "#service + '_' + #level + '_' + #startTime + '_' + #endTime + '_' + #keyword + '_' + #page + '_' + #size")
  public LogPageResponse searchLogs(
      String service,
      Log.LogLevel level,
      Instant startTime,
      Instant endTime,
      String keyword,
      int page,
      int size) {
    Specification<Log> spec = LogSpecification.filterBy(service, level, startTime, endTime, keyword);
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timeStamp"));
    Page<Log> result = logRepository.findAll(spec, pageable);
    return LogPageResponse.from(result);
  }

  @CacheEvict(value = { "searchLogs", "severityDistribution", "topServices", "logTrend",
      "errorRate" }, allEntries = true)
  public void addLogs(List<Log> logs) {
    logRepository.saveAll(logs);
  }

}
