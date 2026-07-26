package com.pulkit.log_analytics_platform.dto;

import java.time.Instant;

public record TimeBucketCount(Instant bucket, long count) {
}