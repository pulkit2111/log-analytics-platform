package com.pulkit.log_analytics_platform.dto;

public record CacheMetrics(boolean hit, long responseTimeMs, String dataSource) {
}