package com.pulkit.log_analytics_platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cache")
@AllArgsConstructor
public class CacheController {

  private static final List<String> CACHE_NAMES = List.of("searchLogs", "severityDistribution", "topServices",
      "logTrend", "errorRate");

  private final CacheManager cacheManager;

  @PostMapping("/clear")
  public ResponseEntity<?> clearCache() {
    CACHE_NAMES.forEach(name -> {
      Cache cache = cacheManager.getCache(name);
      if (cache != null) {
        cache.clear();
      }
    });
    return ResponseEntity.ok(Map.of("cleared", CACHE_NAMES));
  }
}