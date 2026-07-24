package com.pulkit.log_analytics_platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pulkit.log_analytics_platform.entity.Log;
import com.pulkit.log_analytics_platform.service.LogService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class LogController {
  private LogService logService;

  @GetMapping("/getAllLogs")
  public ResponseEntity<?> getAllLogs() {
    return ResponseEntity.ok(logService.getAllLogs());
  }

  @GetMapping("/getLogs")
  public ResponseEntity<?> getLogsBySource(@RequestParam("source") String source) {
    return ResponseEntity.ok(logService.getLogsBySource(source));
  }

  @PostMapping("/addLog")
  public ResponseEntity<?> addLog(@RequestBody Log log) {
    logService.addLog(log);
    return ResponseEntity.ok(log);
  }

}
