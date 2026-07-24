package com.pulkit.log_analytics_platform.entity;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@EntityListeners(AuditingEntityListener.class)
public class Log {

  public enum LogLevel {
    DEBUG(1),
    INFO(2),
    WARNING(3),
    ERROR(4),
    FATAL(5);

    private final int priority;

    LogLevel(int priority) {
      this.priority = priority;
    }

    public int getPriority() {
      return priority;
    }

    public boolean isGreaterOrEqual(LogLevel other) {
      return this.priority >= other.priority;
    }
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
  private LogLevel logLevel;
  private String message;
  private String source;
  private String metadata;

}
