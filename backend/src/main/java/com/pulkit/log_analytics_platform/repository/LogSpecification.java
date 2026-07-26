package com.pulkit.log_analytics_platform.repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.pulkit.log_analytics_platform.entity.Log;

import jakarta.persistence.criteria.Predicate;

public class LogSpecification { //builds the WHERE clause in the query based on the parameters in the request

  public static Specification<Log> filterBy(
      String service,
      Log.LogLevel level,
      Instant startTime,
      Instant endTime,
      String keyword) {
    return (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();
      if (service != null && !service.isBlank()) {
        predicates.add(cb.equal(cb.upper(root.get("serviceName")), service.trim().toUpperCase()));
      }

      if (level != null) {
        predicates.add(cb.equal(root.get("logLevel"), level));
      }

      if (startTime != null) {
        predicates.add(cb.greaterThanOrEqualTo(root.get("timeStamp"), startTime));
      }

      if (endTime != null) {
        predicates.add(cb.lessThanOrEqualTo(root.get("timeStamp"), endTime));
      }

      if (keyword != null && !keyword.isBlank()) {
        predicates.add(cb.like(cb.upper(root.get("message")), "%" + keyword.trim().toUpperCase() + "%"));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
