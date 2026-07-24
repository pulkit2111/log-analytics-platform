package com.pulkit.log_analytics_platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.repository.LogRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LogService {

  private LogRepository logRepository;

  public List<Log> getAllLogs() {
    return logRepository.findAll();
  }

  public void addLog(Log log) {
    logRepository.save(log);
  }

  public List<Log> getLogsBySource(String source) {
    if (source == null) {
      return null;
    }
    return logRepository.findBySourceIgnoreCase(source.trim());
  }

}
