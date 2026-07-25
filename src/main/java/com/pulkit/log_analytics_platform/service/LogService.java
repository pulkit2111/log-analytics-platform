package com.pulkit.log_analytics_platform.service;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.repository.LogRepository;
import com.pulkit.log_analytics_platform.repository.LogSpecification;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LogService {

  private LogRepository logRepository;

  public Page<Log> searchLogs(
      String service,
      Log.LogLevel level,
      Instant startTime,
      Instant endTime,
      String keyword,
      int page,
      int size) {
    Specification<Log> spec = LogSpecification.filterBy(service, level, startTime, endTime, keyword);
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timeStamp"));
    return logRepository.findAll(spec, pageable);
  }

  public void addLogs(List<Log> logs) {
    logRepository.saveAll(logs);
  }

}
