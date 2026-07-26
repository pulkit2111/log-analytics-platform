package com.pulkit.log_analytics_platform.dto;

import java.time.Instant;

public record ErrorRateBucket(Instant bucket, long totalCount, long errorCount, double errorRate) {
}