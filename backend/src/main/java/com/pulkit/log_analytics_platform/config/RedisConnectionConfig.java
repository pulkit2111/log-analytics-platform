package com.pulkit.log_analytics_platform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

@Configuration
public class RedisConnectionConfig {

  @Value("${spring.data.redis.host}")
  private String host;

  @Value("${spring.data.redis.port}")
  private int port;

  @Value("${spring.data.redis.username:}")
  private String username;

  @Value("${spring.data.redis.password:}")
  private String password;

  @Value("${spring.data.redis.ssl.enabled:false}")
  private boolean sslEnabled;

  @Bean
  public LettuceConnectionFactory redisConnectionFactory() {
    RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(host, port);
    if (!username.isBlank()) {
      config.setUsername(username);
    }
    if (!password.isBlank()) {
      config.setPassword(password);
    }

    LettuceClientConfiguration.LettuceClientConfigurationBuilder builder = LettuceClientConfiguration.builder();
    if (sslEnabled) {
      builder.useSsl();
    }

    return new LettuceConnectionFactory(config, builder.build());
  }
}