package com.pulkit.log_analytics_platform.controller;

import com.pulkit.log_analytics_platform.dto.CacheMetrics;
import com.pulkit.log_analytics_platform.dto.LogPageResponse;
import com.pulkit.log_analytics_platform.dto.TimedResult;
import com.pulkit.log_analytics_platform.service.LogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LogController.class)
class LogControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private LogService logService;

  @Test
  void searchLogs_returnsResultsAndCacheHeaders() throws Exception {
    LogPageResponse response = new LogPageResponse(List.of(), 0, 20, 0, 0, true);
    TimedResult<LogPageResponse> timed = new TimedResult<>(response, new CacheMetrics(true, 5, "redis"));

    when(logService.searchLogs(any(), any(), any(), any(), any(), anyInt(), anyInt(), anyBoolean()))
        .thenReturn(timed);

    mockMvc.perform(get("/api/searchLogs").param("page", "0").param("size", "20"))
        .andExpect(status().isOk())
        .andExpect(header().string("X-Cache-Status", "HIT"))
        .andExpect(header().string("X-Response-Time-Ms", "5"))
        .andExpect(header().string("X-Data-Source", "redis"));
  }

  @Test
  void addLogs_savesSubmittedLogsAndReturnsInsertedCount() throws Exception {
    String requestBody = """
        [
          {"serviceName":"auth-service","logLevel":"ERROR","message":"test","source":"unit-test","timeStamp":"2026-01-01T10:00:00Z"}
        ]
        """;

    mockMvc.perform(post("/api/addLogs")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.inserted").value(1));

    verify(logService).addLogs(anyList());
  }
}