package com.pulkit.log_analytics_platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Deliberately touches no database or cache — used purely by an external
 * keep-alive pinger to prevent Render's free tier from spinning down,
 * without also waking (and burning CPU-hour quota on) Neon or Upstash.
 */
@RestController
public class PingController {

    @GetMapping("/api/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
