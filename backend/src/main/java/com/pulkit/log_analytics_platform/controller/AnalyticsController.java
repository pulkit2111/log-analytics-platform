package com.pulkit.log_analytics_platform.controller;

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

  @GetMapping("/severity-distribution")
  public ResponseEntity<?> severityDistribution() {
    return ResponseEntity.ok(analyticsService.countBySeverity());
  }

  @GetMapping("/top-services")
  public ResponseEntity<?> topServices(
      @RequestParam(defaultValue = "5") int limit,
      @RequestParam(required = false) List<Log.LogLevel> levels) {
    return ResponseEntity.ok(analyticsService.topServices(levels, limit));
  }

  @GetMapping("/trend")
  public ResponseEntity<?> trend(
      @RequestParam(defaultValue = "hour") String granularity,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime) {
    return ResponseEntity.ok(analyticsService.getLogTrend(granularity, startTime, endTime));
  }

  @GetMapping("/error-rate")
  public ResponseEntity<?> errorRate(
      @RequestParam(defaultValue = "hour") String granularity,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime) {
    return ResponseEntity.ok(analyticsService.getErrorRate(granularity, startTime, endTime));
  }
}