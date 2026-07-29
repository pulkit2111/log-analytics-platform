const SERVICES = [
  "auth-service",
  "payment-service",
  "order-service",
  "inventory-service",
  "notification-service",
];
const LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "FATAL"];
const LEVEL_WEIGHTS = [30, 40, 15, 10, 5]; // INFO/DEBUG more common than errors, like real traffic
const MESSAGES = [
  "User login successful",
  "Payment processed",
  "Database connection timeout",
  "Order created",
  "Cache miss for key",
  "Null pointer exception in handler",
  "Retry attempt failed",
  "Request completed successfully",
];

function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomTimestamp(daysBack) {
  const offsetMs = Math.random() * daysBack * 24 * 3600 * 1000;
  return new Date(Date.now() - offsetMs);
}

function buildLog(timestamp, levelOverride) {
  return {
    timeStamp: timestamp.toISOString(),
    serviceName: SERVICES[Math.floor(Math.random() * SERVICES.length)],
    logLevel: levelOverride || weightedRandom(LEVELS, LEVEL_WEIGHTS),
    message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    source: "AppGenerator",
    metadata: JSON.stringify({ requestId: crypto.randomUUID() }),
  };
}

/**
 * Generates `count` logs spread over the last `daysBack` days, plus a
 * few injected "incident" windows (short bursts of ERROR/FATAL) so the
 * trend and error-rate charts have something visually interesting.
 */
export function generateLogs(count, { daysBack = 7, incidentCount = 3 } = {}) {
  const burstSize = Math.max(5, Math.round(count * 0.01));
  const reserved = burstSize * incidentCount;
  const baselineCount = Math.max(0, count - reserved);

  const logs = [];
  for (let i = 0; i < baselineCount; i++) {
    logs.push(buildLog(randomTimestamp(daysBack)));
  }

  for (let i = 0; i < incidentCount; i++) {
    const windowStart =
      Date.now() - Math.random() * daysBack * 24 * 3600 * 1000;
    const windowMs = 45 * 60 * 1000;
    for (let j = 0; j < burstSize; j++) {
      const ts = new Date(windowStart + Math.random() * windowMs);
      logs.push(buildLog(ts, Math.random() < 0.6 ? "ERROR" : "FATAL"));
    }
  }
  return logs;
}

export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
