package com.pulkit.log_analytics_platform.repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pulkit.log_analytics_platform.dto.LevelCount;
import com.pulkit.log_analytics_platform.dto.ServiceCount;
import com.pulkit.log_analytics_platform.entity.Log;

public interface LogRepository extends JpaRepository<Log, UUID>, JpaSpecificationExecutor<Log> {

    // Derived method
    List<Log> findBySourceIgnoreCase(String source);

    // --- Analytics ---

    // JPQL Query
    @Query("SELECT new com.pulkit.log_analytics_platform.dto.LevelCount(l.logLevel, COUNT(l)) " +
            "FROM Log l GROUP BY l.logLevel")
    List<LevelCount> countBySeverity();

    @Query("SELECT new com.pulkit.log_analytics_platform.dto.ServiceCount(l.serviceName, COUNT(l)) " +
            "FROM Log l WHERE l.logLevel IN :levels " +
            "GROUP BY l.serviceName ORDER BY COUNT(l) DESC")
    List<ServiceCount> topServicesByLevel(@Param("levels") List<Log.LogLevel> levels, Pageable pageable);

    // Native SQL Query
    @Query(value = """
            SELECT date_trunc(:granularity, time_stamp) AS bucket, COUNT(*) AS count
            FROM log
            WHERE time_stamp BETWEEN :startTime AND :endTime
            GROUP BY bucket
            ORDER BY bucket
            """, nativeQuery = true)
    List<Object[]> countByTimeBucketRaw(
            @Param("granularity") String granularity,
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime);

    @Query(value = """
            SELECT date_trunc(:granularity, time_stamp) AS bucket,
                   COUNT(*) AS total,
                   COUNT(*) FILTER (WHERE log_level IN ('ERROR', 'FATAL')) AS errors
            FROM log
            WHERE time_stamp BETWEEN :startTime AND :endTime
            GROUP BY bucket
            ORDER BY bucket
            """, nativeQuery = true)
    List<Object[]> errorRateByTimeBucketRaw(
            @Param("granularity") String granularity,
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime);

    // Derived method
    long countByLogLevelInAndTimeStampBetween(List<Log.LogLevel> levels, Instant start, Instant end);

}
