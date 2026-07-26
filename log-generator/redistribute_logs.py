"""
Redistributes existing log timestamps across the last N days so your
analytics charts (trend, error-rate, pulse strip) have realistic spread
instead of everything clustered at insert-time.

Why this works even though @CreatedDate overwrites timeStamp on insert:
@CreatedDate only fires when Hibernate/JPA performs the INSERT. This
script updates the time_stamp column directly via raw SQL, completely
bypassing Hibernate — so nothing overwrites it back.

Usage:
    pip install psycopg2-binary
    python redistribute_logs.py
"""

import psycopg2
import random

# ---- adjust to match your application.properties ----
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "LogAnalyticsPlatform",
    "user": "postgres",
    "password": "Pulkit@123",
}

DAYS_BACK = 7          # spread logs across the last N days
INCIDENT_COUNT = 3     # number of "incident spike" windows to create
INCIDENT_WINDOW_MINUTES = 45


def redistribute_baseline(cur):
    """Spread every row uniformly across the last DAYS_BACK days."""
    cur.execute(
        """
        UPDATE log
        SET time_stamp = NOW() - (random() * %s * INTERVAL '1 day')
        """,
        (DAYS_BACK,),
    )
    print(f"Spread {cur.rowcount} rows across the last {DAYS_BACK} days.")


def create_incident_spikes(cur):
    """
    Pick a few random windows within the range and cluster a batch of
    ERROR/FATAL rows into each one, so the trend/error-rate charts show
    a few realistic spikes instead of a flat line.
    """
    for i in range(INCIDENT_COUNT):
        days_ago = random.uniform(0.5, DAYS_BACK - 0.5)
        cur.execute(
            """
            WITH incident_start AS (
                SELECT NOW() - (%s * INTERVAL '1 day') AS start_ts
            ),
            candidates AS (
                SELECT log_id
                FROM log
                WHERE log_level IN ('ERROR', 'FATAL')
                ORDER BY random()
                LIMIT 40
            )
            UPDATE log
            SET time_stamp = (SELECT start_ts FROM incident_start)
                              + (random() * %s * INTERVAL '1 minute')
            WHERE log_id IN (SELECT log_id FROM candidates)
            """,
            (days_ago, INCIDENT_WINDOW_MINUTES),
        )
        print(f"Incident {i + 1}: clustered {cur.rowcount} error/fatal logs "
              f"around {days_ago:.1f} days ago.")


def print_summary(cur):
    cur.execute(
        """
        SELECT date_trunc('day', time_stamp) AS day, COUNT(*)
        FROM log
        GROUP BY day
        ORDER BY day
        """
    )
    print("\nLogs per day after redistribution:")
    for day, count in cur.fetchall():
        print(f"  {day.date()}  {count}")

    cur.execute("SELECT MIN(time_stamp), MAX(time_stamp) FROM log")
    min_ts, max_ts = cur.fetchone()
    print(f"\nTimestamp range: {min_ts} → {max_ts}")


def print_diagnostics(cur):
    cur.execute("SELECT current_database(), current_user")
    db, user = cur.fetchone()
    cur.execute("SELECT COUNT(*) FROM log")
    count = cur.fetchone()[0]
    print(f"Connected to database='{db}' as user='{user}'")
    print(f"log table currently has {count} row(s) visible from this connection.\n")


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            print_diagnostics(cur)
            redistribute_baseline(cur)
            create_incident_spikes(cur)
            print_summary(cur)
        conn.commit()
        print("\nDone. Flush your Redis cache before re-checking the dashboard:")
        print("  docker exec -it log-analytics-redis redis-cli FLUSHALL")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()