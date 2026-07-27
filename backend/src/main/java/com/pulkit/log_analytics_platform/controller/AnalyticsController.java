package com.pulkit.log_analytics_platform.controller;

import com.pulkit.log_analytics_platform.dto.TimedResult;
import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.service.AnalyticsService;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@AllArgsConstructor
public class AnalyticsController {

  private final AnalyticsService analyticsService;

  private ResponseEntity<?> withMetricsHeaders(TimedResult<?> result) {
    return ResponseEntity.ok()
        .header("X-Cache-Status", result.metrics().hit() ? "HIT" : "MISS")
        .header("X-Response-Time-Ms", String.valueOf(result.metrics().responseTimeMs()))
        .header("X-Data-Source", result.metrics().dataSource())
        .body(result.data());
  }

  @GetMapping("/severity-distribution")
  public ResponseEntity<?> severityDistribution(@RequestParam(defaultValue = "false") boolean bypassCache) {
    return withMetricsHeaders(analyticsService.countBySeverity(bypassCache));
  }

  @GetMapping("/top-services")
  public ResponseEntity<?> topServices(
      @RequestParam(defaultValue = "5") int limit,
      @RequestParam(required = false) List<Log.LogLevel> levels,
      @RequestParam(defaultValue = "false") boolean bypassCache) {
    return withMetricsHeaders(analyticsService.topServices(levels, limit, bypassCache));
  }

  @GetMapping("/trend")
  public ResponseEntity<?> trend(
      @RequestParam(defaultValue = "hour") String granularity,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime,
      @RequestParam(defaultValue = "false") boolean bypassCache) {
    return withMetricsHeaders(analyticsService.getLogTrend(granularity, startTime, endTime, bypassCache));
  }

  @GetMapping("/error-rate")
  public ResponseEntity<?> errorRate(
      @RequestParam(defaultValue = "hour") String granularity,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime,
      @RequestParam(defaultValue = "false") boolean bypassCache) {
    return withMetricsHeaders(analyticsService.getErrorRate(granularity, startTime, endTime, bypassCache));
  }
}