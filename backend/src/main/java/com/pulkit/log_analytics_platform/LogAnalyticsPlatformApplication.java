package com.pulkit.log_analytics_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@CrossOrigin
public class LogAnalyticsPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(LogAnalyticsPlatformApplication.class, args);
	}

}
