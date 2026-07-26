package com.pulkit.log_analytics_platform.entity;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "log", indexes = {
    @Index(name = "idx_log_timestamp", columnList = "timeStamp"),
    @Index(name = "idx_log_level_timestamp", columnList = "logLevel, timeStamp"),
    @Index(name = "idx_log_service_level", columnList = "serviceName, logLevel"),
    @Index(name = "idx_log_source", columnList = "source")
})
@AllArgsConstructor
@NoArgsConstructor
@Data
@EntityListeners(AuditingEntityListener.class)
public class Log {

  public enum LogLevel {
    DEBUG,
    INFO,
    WARNING,
    ERROR,
    FATAL;
  }

  @Id
  @GeneratedValue
  private UUID logId;

  @CreatedDate
  @Column(nullable = false)
  private Instant timeStamp;

  public Log(Instant timeStamp) {
    this.timeStamp = timeStamp;
  }

  private String serviceName;

  @Enumerated(EnumType.STRING)
  private LogLevel logLevel;
  private String message;
  private String source;
  private String metadata;

}
