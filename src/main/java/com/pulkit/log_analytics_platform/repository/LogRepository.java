package com.pulkit.log_analytics_platform.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pulkit.log_analytics_platform.entity.Log;

public interface LogRepository extends JpaRepository<Log, UUID> {

  List<Log> findBySourceIgnoreCase(String source);
}
