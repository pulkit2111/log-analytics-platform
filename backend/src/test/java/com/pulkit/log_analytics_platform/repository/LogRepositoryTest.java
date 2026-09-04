package com.pulkit.log_analytics_platform.repository;

import com.pulkit.log_analytics_platform.entity.Log;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class LogRepositoryTest {

  @TestConfiguration
  static class CacheTestConfig {
    @Bean
    public CacheManager cacheManager() {
      return new ConcurrentMapCacheManager();
    }
  }

  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  @Autowired
  private LogRepository logRepository;

  @Test
  void findBySourceIgnoreCase_matchesRegardlessOfCase() {
    logRepository.save(buildLog("auth-service", Log.LogLevel.INFO, Instant.now(), "Postman"));

    List<Log> found = logRepository.findBySourceIgnoreCase("POSTMAN");

    assertThat(found).hasSize(1);
  }

  @Test
  void errorRateByTimeBucketRaw_bucketsAndCountsErrorsCorrectly() {
    Instant base = Instant.parse("2026-01-01T10:00:00Z");
    logRepository.save(buildLog("svc", Log.LogLevel.INFO, base, null));
    logRepository.save(buildLog("svc", Log.LogLevel.ERROR, base.plusSeconds(60), null));
    logRepository.save(buildLog("svc", Log.LogLevel.FATAL, base.plusSeconds(120), null));
    List<Object[]> rows = logRepository.errorRateByTimeBucketRaw(
        "hour", base.minusSeconds(3600), base.plusSeconds(3600));

    assertThat(rows).hasSize(1);
    assertThat(((Number) rows.get(0)[1]).longValue()).isEqualTo(3); // total
    assertThat(((Number) rows.get(0)[2]).longValue()).isEqualTo(2); // ERROR + FATAL
  }

  @Test
  void filterBySpecification_combinesServiceAndLevelConditions() {
    logRepository.save(buildLog("auth-service", Log.LogLevel.ERROR, Instant.now(), null));
    logRepository.save(buildLog("auth-service", Log.LogLevel.INFO, Instant.now(), null));
    logRepository.save(buildLog("payment-service", Log.LogLevel.ERROR, Instant.now(), null));
    Specification<Log> spec = LogSpecification.filterBy("auth-service", Log.LogLevel.ERROR, null, null, null);
    Page<Log> result = logRepository.findAll(spec, PageRequest.of(0, 10));

    assertThat(result.getTotalElements()).isEqualTo(1);
  }

  private Log buildLog(String service, Log.LogLevel level, Instant ts, String source) {
    Log log = new Log(ts);
    log.setServiceName(service);
    log.setLogLevel(level);
    log.setMessage("test");
    log.setSource(source);
    return log;
  }
}