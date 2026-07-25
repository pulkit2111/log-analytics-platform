package com.pulkit.log_analytics_platform.dto;

import java.util.List;

import org.springframework.data.domain.Page;

import com.pulkit.log_analytics_platform.entity.Log;

public record LogPageResponse(
    List<Log> content,
    int pageNumber,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean last) {
  public static LogPageResponse from(Page<Log> page) {
    return new LogPageResponse(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isLast());
  }
}
