package com.pulkit.log_analytics_platform.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.pulkit.log_analytics_platform.entity.Log;

public interface LogRepository extends JpaRepository<Log, UUID>, JpaSpecificationExecutor<Log> {

  List<Log> findBySourceIgnoreCase(String source);
}
