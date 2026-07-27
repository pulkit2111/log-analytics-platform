package com.pulkit.log_analytics_platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;

@Configuration
public class OpenApiConfig {
  @Bean
  public OpenAPI apiInfo() {
    return new OpenAPI()
        .info(new io.swagger.v3.oas.models.info.Info()
            .title("Log Analytics Platform API")
            .version("1.0.0")
            .description("REST API for ingesting and analyzing application logs"));
  }
}
