# to run : python log_generator.py 

import requests
import random
import uuid
from datetime import datetime, timedelta, timezone

BASE_URL = "http://localhost:8080/api/addLogs"

SERVICES = ["auth-service", "payment-service", "order-service", "inventory-service", "notification-service"]
LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "FATAL"]
MESSAGES = [
    "User login successful",
    "Payment processed",
    "Database connection timeout",
    "Order created",
    "Cache miss for key",
    "Null pointer exception in handler",
    "Retry attempt failed",
    "Request completed successfully",
]

def generate_log(base_time):
    ts = base_time - timedelta(seconds=random.randint(0, 60 * 60 * 24 * 7))  # spread over last 7 days
    return {
        "timeStamp": ts.isoformat().replace("+00:00", "Z"),
        "serviceName": random.choice(SERVICES),
        "logLevel": random.choices(LEVELS, weights=[30, 40, 15, 10, 5])[0],  # INFO/DEBUG more common
        "message": random.choice(MESSAGES),
        "source": random.choice(["Postman", "LoadGenerator", "InternalService"]),
        "metadata": f'{{"requestId":"{uuid.uuid4()}"}}'
    }

def generate_batch(size):
    now = datetime.now(timezone.utc)
    return [generate_log(now) for _ in range(size)]

def send_bulk(total=5000, batch_size=200):
    sent = 0
    while sent < total:
        current_batch = min(batch_size, total - sent)
        payload = generate_batch(current_batch)
        resp = requests.post(BASE_URL, json=payload)
        if resp.status_code == 200:
            sent += current_batch
            print(f"Sent {sent}/{total}")
        else:
            print(f"Failed batch: {resp.status_code} - {resp.text}")
            break

if __name__ == "__main__":
    send_bulk(total=10000, batch_size=200)