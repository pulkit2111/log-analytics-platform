package com.pulkit.log_analytics_platform.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.support.SimpleValueWrapper;

import com.pulkit.log_analytics_platform.dto.LevelCount;
import com.pulkit.log_analytics_platform.dto.TimedResult;
import com.pulkit.log_analytics_platform.repository.LogRepository;
import com.pulkit.log_analytics_platform.entity.Log;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

  @Mock
  private LogRepository logRepository;
  @Mock
  private CacheManager cacheManager;
  @Mock
  private Cache cache;
  @InjectMocks
  private AnalyticsService analyticsService;

  @Test
  void countBySeverity_cacheHit_doesNotQueryRepository() {
    List<LevelCount> cached = List.of(new LevelCount(Log.LogLevel.ERROR, 42));
    when(cacheManager.getCache("severityDistribution")).thenReturn(cache);
    when(cache.get("all")).thenReturn(new SimpleValueWrapper(cached));

    TimedResult<List<LevelCount>> result = analyticsService.countBySeverity(false);

    assertThat(result.metrics().hit()).isTrue();
    assertThat(result.metrics().dataSource()).isEqualTo("redis");
    assertThat(result.data()).isEqualTo(cached);
    verify(logRepository, never()).countBySeverity();
  }

  @Test
  void countBySeverity_cacheMiss_queriesRepositoryAndPopulatesCache() {
    List<LevelCount> fresh = List.of(new LevelCount(Log.LogLevel.INFO, 100));
    when(cacheManager.getCache("severityDistribution")).thenReturn(cache);
    when(cache.get("all")).thenReturn(null);
    when(logRepository.countBySeverity()).thenReturn(fresh);

    TimedResult<List<LevelCount>> result = analyticsService.countBySeverity(false);

    assertThat(result.metrics().hit()).isFalse();
    assertThat(result.metrics().dataSource()).isEqualTo("postgres");
    assertThat(result.data()).isEqualTo(fresh);
    verify(cache).put("all", fresh);
  }
}