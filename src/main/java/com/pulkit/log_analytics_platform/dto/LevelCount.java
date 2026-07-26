package com.pulkit.log_analytics_platform.dto;

import com.pulkit.log_analytics_platform.entity.Log;

public record LevelCount(Log.LogLevel level, long count) {
}
