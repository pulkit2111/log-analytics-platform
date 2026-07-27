package com.pulkit.log_analytics_platform.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pulkit.log_analytics_platform.dto.LogPageResponse;
import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.service.LogService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class LogController {
  private LogService logService;

  @Operation(summary = "Search logs with optional filters", description = "Supports filtering by service, level, time range, and keyword, with pagination")

  @GetMapping("/searchLogs")
  public ResponseEntity<?> searchLogs(
      @RequestParam(required = false) String service,
      @RequestParam(required = false) Log.LogLevel level,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    LogPageResponse result = logService.searchLogs(service, level, startTime, endTime, keyword, page, size);
    return ResponseEntity.ok(result);
  }

  @PostMapping("/addLogs")
  public ResponseEntity<?> addLogs(@RequestBody List<Log> logs) {
    logService.addLogs(logs);
    return ResponseEntity.ok(Map.of("inserted", logs.size()));
  }

}
