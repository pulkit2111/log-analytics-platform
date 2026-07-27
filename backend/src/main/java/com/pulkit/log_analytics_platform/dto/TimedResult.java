package com.pulkit.log_analytics_platform.dto;

public record TimedResult<T>(T data, CacheMetrics metrics) {
}