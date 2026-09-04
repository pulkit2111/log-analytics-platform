package com.pulkit.log_analytics_platform.service;

import com.pulkit.log_analytics_platform.dto.LogPageResponse;
import com.pulkit.log_analytics_platform.dto.TimedResult;
import com.pulkit.log_analytics_platform.entity.Log;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class LogServiceIntegrationTest {

  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  @SuppressWarnings("resource")
  @Container
  static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
      .withExposedPorts(6379);

  @DynamicPropertySource
  static void redisProps(DynamicPropertyRegistry registry) {
    registry.add("spring.data.redis.host", redis::getHost);
    registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
  }

  @Autowired
  private LogService logService;

  @Test
  void secondIdenticalSearchIsServedFromCache() {
    String service = "auth-service";
    logService.addLogs(List.of(buildLog(service, Log.LogLevel.INFO)));

    TimedResult<LogPageResponse> first = logService.searchLogs(service, null, null, null, null, 0, 20, false);
    TimedResult<LogPageResponse> second = logService.searchLogs(service, null, null, null, null, 0, 20, false);

    assertThat(first.metrics().hit()).isFalse();
    assertThat(second.metrics().hit()).isTrue();
  }

  @Test
  void addingLogsEvictsSearchCache() throws Exception {
    String service = "payment-service";
    logService.searchLogs(service, null, null, null, null, 0, 20, false); // populate cache

    logService.addLogs(List.of(buildLog(service, Log.LogLevel.ERROR)));
    Thread.sleep(200); // let async clear() complete
    TimedResult<LogPageResponse> afterWrite = logService.searchLogs(service, null, null, null, null, 0, 20, false);

    assertThat(afterWrite.metrics().hit()).isFalse();
  }

  private Log buildLog(String service, Log.LogLevel level) {
    Log log = new Log(Instant.now());
    log.setServiceName(service);
    log.setLogLevel(level);
    log.setMessage("integration test");
    log.setSource("test");
    return log;
  }
}